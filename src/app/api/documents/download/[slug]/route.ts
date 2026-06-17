import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

// MIME type map — used when upstream Content-Type is missing
const MIME_MAP: Record<string, string> = {
  pdf:  'application/pdf',
  doc:  'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt:  'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls:  'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip:  'application/zip',
  rar:  'application/x-rar-compressed',
  mp3:  'audio/mpeg',
  mp4:  'video/mp4',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  // ── Hotlink / off-site direct-link protection ────────────────────────────
  // If someone copies this URL and puts it on their website, visitors clicking
  // that link should land on our /download/[slug] waiting page — not get a
  // bare file download bypassing our site entirely.
  //
  // How it works:
  //   • Browsers always send the Referer header when following a link.
  //   • We check if the referer origin matches our own host.
  //   • No referer  → treat as off-site (direct URL paste / external link).
  //   • Wrong site  → redirect to our waiting page.
  //   • Our site    → proceed with the actual file stream.
  const referer = request.headers.get('referer') || '';
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || '';
  const originalHost = request.headers.get('host') || '';
  
  const isOwnSite = (host !== '' && referer.includes(host)) || (originalHost !== '' && referer.includes(originalHost));

  if (!isOwnSite) {
    // Determine protocol (Vercel / reverse-proxy sets x-forwarded-proto)
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const waitingPageUrl = `${proto}://${host}/download/${slug}`;
    return NextResponse.redirect(waitingPageUrl, { status: 302 });
  }

  try {
    // 1. Look up document by slug field
    let item: any = null;
    let docId: string | null = null;

    const q = query(
      collection(db, 'guide_documents'),
      where('slug', '==', slug)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const d = snap.docs[0];
      item = d.data();
      docId = d.id;
    } else {
      // Fallback: treat slug as a Firestore document ID
      const docRef = doc(db, 'guide_documents', slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        item = docSnap.data();
        docId = docSnap.id;
      }
    }

    if (!item) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (item.status === 'draft') {
      return NextResponse.json({ error: 'Document not available' }, { status: 403 });
    }

    const fileUrl: string = item.fileUrl || item.url || '';
    if (!fileUrl) {
      return NextResponse.json({ error: 'No downloadable file attached' }, { status: 404 });
    }

    // 2. Increment download counter — fire-and-forget, never blocks the download
    if (docId) {
      import('@/lib/firebase/admin').then(({ adminDb }) => {
        import('firebase-admin').then((admin) => {
          adminDb.collection('guide_documents').doc(docId).set({
            downloads: admin.firestore.FieldValue.increment(1),
          }, { merge: true }).catch(() => { /* non-critical */ });
        });
      }).catch(() => { /* non-critical */ });
    }

    // 3. Build a filesystem-safe filename
    const ext = (item.fileType || 'pdf').toLowerCase();
    const safeName = item.title
      ? `${item.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}.${ext}`
      : `download.${ext}`;

    // 4. Fetch the file bytes server-side.
    //
    //    KEY REASON: If we do a 302 redirect the browser follows it to Firebase's URL.
    //    Firebase returns Content-Type: application/pdf with NO Content-Disposition,
    //    so the browser opens the file inline. By fetching here and piping the bytes
    //    back ourselves, WE control the headers — specifically:
    //      Content-Disposition: attachment  →  always triggers Save-As / download
    //    The real Firebase URL never reaches the browser.
    const fetchHeaders: HeadersInit = {};
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) fetchHeaders['range'] = rangeHeader; // support resumable downloads

    const upstream = await fetch(fileUrl, { headers: fetchHeaders });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'Failed to retrieve file from storage' }, { status: 502 });
    }

    // Determine MIME — prefer upstream, fall back to extension map, then binary fallback
    const contentType =
      upstream.headers.get('content-type')?.split(';')[0].trim() ||
      MIME_MAP[ext] ||
      'application/octet-stream';

    const responseHeaders = new Headers({
      // ← This single header is what forces the browser to download instead of opening
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Content-Type':        contentType,
      'Cache-Control':       'no-store',
      'X-Content-Type-Options': 'nosniff',
    });

    // Pass through Content-Length so the browser can show download progress
    const upstreamLength = upstream.headers.get('content-length');
    if (upstreamLength) responseHeaders.set('Content-Length', upstreamLength);

    // Auto-update fileSize if missing
    if (docId && (!item.fileSize || item.fileSize === 0) && upstreamLength) {
      const parsedSize = parseInt(upstreamLength, 10);
      if (!isNaN(parsedSize) && parsedSize > 0) {
        import('@/lib/firebase/admin').then(({ adminDb }) => {
          adminDb.collection('guide_documents').doc(docId).set({
            fileSize: parsedSize
          }, { merge: true }).catch(() => { /* non-critical */ });
        }).catch(() => { /* non-critical */ });
      }
    }

    return new Response(upstream.body, {
      // 206 Partial Content if upstream honoured a Range request
      status: upstream.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('[download route]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
