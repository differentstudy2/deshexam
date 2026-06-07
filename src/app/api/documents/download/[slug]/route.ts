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
      updateDoc(doc(db, 'guide_documents', docId), {
        downloads: increment(1),
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
