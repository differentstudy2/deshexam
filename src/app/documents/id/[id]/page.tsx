import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { getMediaItemById } from '@/lib/firebase/guide';
import { DocumentMetadataCardDynamic } from '@/components/feature/document-reader/document-metadata-card-dynamic';
import { PdfViewerDynamic } from '@/components/feature/document-reader/pdf-viewer-dynamic';
import { RelatedResources } from '@/components/feature/document-reader/related-resources';
import { DocumentSidebar } from '@/components/feature/document-reader/sidebar';
import { MobileToolbar } from '@/components/feature/document-reader/mobile-toolbar';

// Server component that fetches a document by its Firestore ID
export default async function DocumentByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch the document record
  const item = await getMediaItemById('guide_documents', resolvedParams.id);

  if (!item) {
    notFound();
  }

  // Flatten timestamps if any exist to avoid client boundary issues
  const flattenedItem = {
    ...item,
    createdAt: item.createdAt?.toMillis?.() || item.createdAt?.seconds ? item.createdAt.seconds * 1000 : Date.now(),
    updatedAt: item.updatedAt?.toMillis?.() || item.updatedAt?.seconds ? item.updatedAt.seconds * 1000 : Date.now(),
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 pt-4 md:pt-8 font-sans pb-20 lg:pb-10">
      {/* Main content wrapper */}
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs md:text-sm text-slate-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
          <Link href="/" className="hover:text-[#107c41] flex items-center shrink-0">
            <Home className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
          <Link href="/documents" className="hover:text-[#107c41] shrink-0">Documents</Link>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[150px] md:max-w-none">
            {flattenedItem.title}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Central reading area */}
          <section className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
              {flattenedItem.title}
            </h1>

            {/* Document Metadata Card */}
            <DocumentMetadataCardDynamic document={flattenedItem} />

            {/* PDF viewer – client-only dynamic component */}
            <div className="mb-12 mt-8 scroll-mt-24" id="pdf-viewer-section">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Document Viewer</h2>
              {flattenedItem.fileUrl ? (
                <PdfViewerDynamic url={flattenedItem.fileUrl} />
              ) : (
                <div className="p-8 text-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                  Document PDF URL not available.
                </div>
              )}
            </div>

            {/* Related resources */}
            <RelatedResources />
          </section>
          
          {/* Desktop sidebar */}
          <DocumentSidebar />
        </div>
      </div>
      
      {/* Mobile toolbar for small screens */}
      <MobileToolbar documentUrl={flattenedItem.fileUrl} documentTitle={flattenedItem.title} />
    </main>
  );
}
