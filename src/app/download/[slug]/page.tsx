import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getMediaItemBySlug } from '@/lib/firebase/guide';
import { DownloadPageClient } from './download-client';

// ─── No-index so waiting pages are never crawled ─────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getMediaItemBySlug('guide_documents', resolvedParams.slug);
  return {
    title: item ? `Downloading: ${item.title} – DeshExam` : 'Download – DeshExam',
    robots: { index: false, follow: false },
  };
}

export default async function DownloadWaitingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const item = await getMediaItemBySlug('guide_documents', resolvedParams.slug);

  if (!item || item.status === 'draft') {
    notFound();
  }

  // Fetch related docs from same chapter/topic
  let relatedDocs: any[] = [];
  try {
    const field = item.chapterId ? 'chapterId' : item.topicId ? 'topicId' : null;
    const val = item.chapterId || item.topicId;
    if (field && val) {
      const q = query(
        collection(db, 'guide_documents'),
        where(field, '==', val),
        where('status', '==', 'published'),
        limit(7)
      );
      const snap = await getDocs(q);
      relatedDocs = snap.docs
        .map(d => {
          const data = d.data();
          return {
            id: d.id,
            slug: data.slug || null,
            title: data.title || '',
            fileType: data.fileType || 'pdf',
            pages: data.pages || null,
            fileSize: data.fileSize || null,
            thumbnail: data.thumbnail || null,
          };
        })
        .filter((d: any) => d.id !== item.id)
        .slice(0, 6);
    }
  } catch {
    // silent — related docs are non-critical
  }

  // Serialize Firestore timestamps
  const serialized = {
    ...item,
    createdAt: item.createdAt?.seconds
      ? item.createdAt.seconds * 1000
      : typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
    updatedAt: item.updatedAt?.seconds
      ? item.updatedAt.seconds * 1000
      : typeof item.updatedAt === 'number' ? item.updatedAt : Date.now(),
  };

  return <DownloadPageClient document={serialized} relatedDocs={relatedDocs} />;
}
