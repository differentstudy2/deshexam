'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { getMediaItemById } from '@/lib/firestore'; // We'll create a tiny helper
import { DocumentMetadataCard } from '@/components/feature/document-reader/document-metadata-card';
import { PdfViewerDynamic } from '@/components/feature/document-reader/pdf-viewer-dynamic';
import { RelatedResources } from '@/components/feature/document-reader/related-resources';
import { DocumentSidebar } from '@/components/feature/document-reader/sidebar';
import { MobileToolbar } from '@/components/feature/document-reader/mobile-toolbar';
import { Breadcrumb } from '@/components/ui/breadcrumb';

// Server component that fetches a document by its Firestore ID
export default async function DocumentByIdPage({ params }: { params: { id: string } }) {
  // Fetch the document record – we’ll add a tiny helper in lib/firestore
  const item = await getMediaItemById('guide_documents', params.id);

  if (!item) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* Breadcrumb – using the same pattern as the slug page */}
      <Breadcrumb />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 md:p-12">
        {/* Left sidebar – similar to the slug page */}
        <DocumentSidebar document={item} />

        {/* Central reading area */}
        <section className="flex-1 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">
            {item.title}
          </h1>

          {/* PDF viewer – client‑only dynamic component */}
          <div className="mb-8">
            {item.fileUrl ? (
              <PdfViewerDynamic url={item.fileUrl} />
            ) : (
              <p className="p-4 text-center bg-slate-100 dark:bg-slate-800 rounded">No PDF URL provided.</p>
            )}
          </div>

          {/* Metadata card */}
          <DocumentMetadataCard document={item} />

          {/* Related resources – same component used elsewhere */}
          <RelatedResources documentId={item.id} />
        </section>

        {/* Mobile toolbar for small screens */}
        <MobileToolbar />
      </div>
    </main>
  );
}

/**
 * Simple Firestore helper – placed here to avoid a circular import.
 * In a real project you’d move this to `src/lib/firestore.ts`.
 */
async function getMediaItemById(collection: string, id: string) {
  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const ref = doc(db, collection, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  // Flatten the timestamp fields to plain numbers for client components
  return {
    id: snap.id,
    ...data,
    createdAt: (data.createdAt?.seconds ?? 0) * 1000,
    updatedAt: (data.updatedAt?.seconds ?? 0) * 1000,
  } as any;
}
