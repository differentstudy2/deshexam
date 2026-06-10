import React from 'react';
import { getMediaItemById, getTopicFullHierarchy } from '@/lib/firebase/guide';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Headphones, Download } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getMediaItemById('guide_audios', resolvedParams.id);
  return {
    title: item?.title ? `${item.title} | DeshExam` : 'Audio Not Found',
    description: item?.description || 'Listen to educational audio on DeshExam.',
  };
}

export default async function AudioSinglePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = await getMediaItemById('guide_audios', resolvedParams.id);

  if (!item) {
    notFound();
  }

  let hierarchy: any = null;
  if (item.topicId) {
    hierarchy = await getTopicFullHierarchy(item.topicId);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/audio">
        <Button variant="ghost" className="mb-6 -ml-4 text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Audios
        </Button>
      </Link>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Headphones className="w-10 h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {item.title}
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Published on {item.createdAt ? new Date(item.createdAt.toMillis()).toLocaleDateString() : 'Unknown'}
          </p>
          
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <audio controls src={item.url} className="w-full outline-none"></audio>
          </div>
        </div>
        <CardContent className="p-6 bg-white dark:bg-slate-950 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex-1 w-full">
            {(item.description || item.tags || hierarchy?.topic) && (
              <div className="w-full text-left">
                {item.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {item.description}
                    </p>
                  </div>
                )}
                
                {item.tags && (
                  <div className="mb-4">
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
                            href={`/guide/topic/${hierarchy.topic.slug || hierarchy.topic.id}`}
                            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
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
          </div>
          
          <div className="shrink-0">
            <a 
              href={item.url} 
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-md transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Audio File
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
