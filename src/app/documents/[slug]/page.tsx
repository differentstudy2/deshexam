import React from 'react';
import { getMediaItemBySlug, getTopicFullHierarchy } from '@/lib/firebase/guide';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home, BookOpen, Video, Headphones, Target } from 'lucide-react';
import { DocumentMetadataCardDynamic } from '@/components/feature/document-reader/document-metadata-card-dynamic';
import { PdfViewerDynamic } from '@/components/feature/document-reader/pdf-viewer-dynamic';
import { RelatedResources } from '@/components/feature/document-reader/related-resources';
import { DocumentSidebar } from '@/components/feature/document-reader/sidebar';
import { MobileToolbar } from '@/components/feature/document-reader/mobile-toolbar';
import { TableOfContents } from '@/components/feature/document-reader/table-of-contents';
import { FaqSection } from '@/components/feature/document-reader/faq-section';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getMediaItemBySlug('guide_documents', resolvedParams.slug);
  
  if (!item) return { title: 'Document Not Found' };

  const title = item.metaTitle || `${item.title} PDF – DeshExam`;
  const description = item.metaDescription || item.description || `Download and read ${item.title}. Comprehensive notes and materials for your exam preparation.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://deshexam.com/documents/${resolvedParams.slug}`,
      images: item.thumbnail ? [{ url: item.thumbnail }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: item.thumbnail ? [item.thumbnail] : [],
    },
    alternates: {
      canonical: `https://deshexam.com/documents/${resolvedParams.slug}`,
    }
  };
}

export default async function DocumentReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const item = await getMediaItemBySlug('guide_documents', resolvedParams.slug);

  if (!item) {
    notFound();
  }

  let hierarchy: any = null;
  if (item.topicId) {
    hierarchy = await getTopicFullHierarchy(item.topicId);
  }

  // Generate Breadcrumb Schema
  const breadcrumbItems = [
    { name: 'Home', item: 'https://deshexam.com' },
    { name: 'Documents', item: 'https://deshexam.com/documents' },
    ...(hierarchy?.board ? [{ name: hierarchy.board.title, item: `https://deshexam.com/board/${hierarchy.board.id}` }] : []),
    ...(hierarchy?.class ? [{ name: hierarchy.class.title, item: `https://deshexam.com/class/${hierarchy.class.id}` }] : []),
    ...(hierarchy?.subject ? [{ name: hierarchy.subject.title, item: `https://deshexam.com/subject/${hierarchy.subject.id}` }] : []),
    ...(hierarchy?.textbook ? [{ name: hierarchy.textbook.title, item: `https://deshexam.com/textbook/${hierarchy.textbook.id}` }] : []),
    ...(hierarchy?.chapter ? [{ name: hierarchy.chapter.title, item: `https://deshexam.com/chapter/${hierarchy.chapter.id}` }] : []),
    { name: item.title, item: `https://deshexam.com/documents/${resolvedParams.slug}` }
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((b, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": b.name,
      "item": b.item
    }))
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": item.title,
    "description": item.description,
    "image": item.thumbnail,
    "author": {
      "@type": "Organization",
      "name": "DeshExam"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeshExam",
      "logo": {
        "@type": "ImageObject",
        "url": "https://deshexam.com/image/logo.png"
      }
    },
    "datePublished": item.createdAt ? new Date(item.createdAt.toMillis?.() || Date.now()).toISOString() : new Date().toISOString(),
    "dateModified": item.updatedAt ? new Date(item.updatedAt.toMillis?.() || Date.now()).toISOString() : new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-20 lg:pb-10 pt-4 md:pt-8 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs md:text-sm text-slate-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
          <Link href="/" className="hover:text-[#107c41] flex items-center shrink-0">
            <Home className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
          <Link href="/documents" className="hover:text-[#107c41] shrink-0">Documents</Link>
          
          {hierarchy?.class && (
            <>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
              <Link href="#" className="hover:text-[#107c41] shrink-0">{hierarchy.class.title}</Link>
            </>
          )}
          {hierarchy?.subject && (
            <>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
              <Link href="#" className="hover:text-[#107c41] shrink-0">{hierarchy.subject.title}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[150px] md:max-w-none">
            {item.title}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* SEO Hero Section */}
            <div className="mb-8 md:mb-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                {item.title} PDF <span className="text-[#107c41]">– {hierarchy?.class?.title || 'Study Material'}</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                {item.description || `Comprehensive study material, chapter notes, and important questions for ${item.title}. Enhance your exam preparation with this premium document.`}
              </p>
            </div>

            {/* Document Metadata Card */}
            <DocumentMetadataCardDynamic document={{
              ...item,
              createdAt: item.createdAt?.toMillis?.() || item.createdAt?.seconds ? item.createdAt.seconds * 1000 : Date.now(),
              updatedAt: item.updatedAt?.toMillis?.() || item.updatedAt?.seconds ? item.updatedAt.seconds * 1000 : Date.now(),
            }} />

            {/* About & What You Will Learn (HTML Content for SEO) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 mb-10 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">About This Document</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                    This premium study material is designed to help students master the concepts of <strong>{item.title}</strong>. It provides detailed explanations, structured notes, and focused practice questions aligned with the latest curriculum. Whether you are revising for upcoming exams or building foundational knowledge, this document serves as a complete learning companion.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">What You Will Learn</h2>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                    <li className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-[#107c41] mt-2 mr-2 shrink-0"></div> Complete Chapter Summary</li>
                    <li className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-[#107c41] mt-2 mr-2 shrink-0"></div> Highly Expected Important Questions</li>
                    <li className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-[#107c41] mt-2 mr-2 shrink-0"></div> Step-by-step Exam Preparation Notes</li>
                    <li className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-[#107c41] mt-2 mr-2 shrink-0"></div> Quick Revision Materials</li>
                    <li className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-[#107c41] mt-2 mr-2 shrink-0"></div> Solved Practice Exercises</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <TableOfContents />

            {/* PDF Viewer */}
            <div className="mb-12 scroll-mt-24" id="pdf-viewer-section">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Document Viewer</h2>
              {item.url || item.fileUrl ? (
                <PdfViewerDynamic url={item.fileUrl || item.url} />
              ) : (
                <div className="p-8 text-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                  Document PDF URL not available.
                </div>
              )}
            </div>

            {/* Related Resources */}
            <RelatedResources />

            {/* Continue Learning */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Continue Learning</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="#" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-blue-600">
                  <BookOpen className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">Read Lesson</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-red-500 hover:shadow-md transition-all text-red-600">
                  <Video className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">Watch Video</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500 hover:shadow-md transition-all text-purple-600">
                  <Headphones className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">Listen Audio</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-green-500 hover:shadow-md transition-all text-green-600">
                  <Target className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">Practice MCQ</span>
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <FaqSection documentTitle={item.title} pages={item.pages} />

            {/* Internal Linking */}
            <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6 md:p-8 mt-12">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Explore More on DeshExam</h3>
              <div className="flex flex-wrap gap-3">
                <Link href="#" className="px-4 py-2 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hover:text-[#107c41] transition-colors">
                  More Documents From This Chapter
                </Link>
                <Link href="#" className="px-4 py-2 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hover:text-[#107c41] transition-colors">
                  More {hierarchy?.subject?.title || 'Subject'} Resources
                </Link>
                <Link href="#" className="px-4 py-2 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hover:text-[#107c41] transition-colors">
                  More {hierarchy?.class?.title || 'Class'} Notes
                </Link>
                <Link href="#" className="px-4 py-2 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hover:text-[#107c41] transition-colors">
                  More Study Materials
                </Link>
              </div>
            </div>

          </div>

          {/* Desktop Sidebar */}
          <DocumentSidebar />
        </div>
      </div>

      {/* Mobile Sticky Toolbar */}
      <MobileToolbar documentUrl={item.fileUrl || item.url} documentTitle={item.title} />

      {/* Trigger Analytics (Client side tracking) */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Client-side analytics trigger without blocking SSR
          if (typeof window !== 'undefined') {
             setTimeout(() => {
                fetch('/api/documents/${item.id}/analytics', { method: 'POST' }).catch(console.error);
             }, 3000);
          }
        `
      }} />
    </div>
  );
}
