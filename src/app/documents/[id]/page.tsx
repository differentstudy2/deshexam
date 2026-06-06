import React from 'react';
import { getMediaItemById, getTopicFullHierarchy } from '@/lib/firebase/guide';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getMediaItemById('guide_documents', resolvedParams.id);
  return {
    title: item?.title ? `${item.title} | DeshExam` : 'Document Not Found',
    description: item?.description || 'View educational document on DeshExam.',
  };
}

export default async function DocumentSinglePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = await getMediaItemById('guide_documents', resolvedParams.id);

  if (!item) {
    notFound();
  }

  let hierarchy: any = null;
  if (item.topicId) {
    hierarchy = await getTopicFullHierarchy(item.topicId);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/documents">
        <Button variant="ghost" className="mb-6 -ml-4 text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Documents
        </Button>
      </Link>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {item.title}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Published on {item.createdAt ? new Date(item.createdAt.toMillis()).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <a 
            href={item.url} 
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#107c41] hover:bg-[#0b5c30] text-white font-medium rounded-md transition-colors shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
        <CardContent className="p-0 bg-slate-100 dark:bg-slate-950">
          <div className="w-full h-[80vh] min-h-[600px]">
            <iframe 
              src={`${item.url}#toolbar=0`} 
              className="w-full h-full border-0"
              title={item.title}
            />
          </div>
        </CardContent>
        {(item.description || item.tags || hierarchy?.topic) && (
          <div className="p-6 md:p-8 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
            {item.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            )}
            
            {item.tags && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.split(',').map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hierarchy?.topic && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Curriculum Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  {hierarchy.board && (
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Board</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{hierarchy.board.title}</span>
                    </div>
                  )}
                  {hierarchy.class && (
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Class</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{hierarchy.class.title}</span>
                    </div>
                  )}
                  {hierarchy.chapter && (
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Chapter</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{hierarchy.chapter.title}</span>
                    </div>
                  )}
                  {hierarchy.topic && (
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Topic</span>
                      <Link 
                        href={`/guide/${hierarchy.topic.id}`}
                        className="inline-flex items-center text-[#107c41] hover:text-[#0b5c30] font-medium transition-colors"
                      >
                        {hierarchy.topic.title}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
