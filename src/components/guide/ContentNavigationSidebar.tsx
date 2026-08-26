'use client';

import React, { useState } from 'react';
import { Chapter } from '@/app/guide/guide-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { translateToBengali } from '@/components/guide/GuideSidebar';
import { Search, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ContentNavigationSidebarProps {
  curriculum: Chapter[];
  activeId: string;
  subjectTitle: string;
}

export function ContentNavigationSidebar({ curriculum, activeId, subjectTitle }: ContentNavigationSidebarProps) {
  // By default, topics should be open, so we keep track of closed ones.
  const [closedTopics, setClosedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topicId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setClosedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <div className="w-full h-full shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-0">
      <div className="flex flex-col pt-0 h-full min-h-0">
        
        {/* Subject Title Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-indigo-700 dark:to-blue-800 flex items-center gap-3 shrink-0">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-bold text-[16px] text-white tracking-wide truncate">
            {translateToBengali(subjectTitle)}
          </h2>
        </div>

        {/* Search Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search chapters..." 
              className="w-full pl-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-1 focus-visible:ring-blue-500 text-[13px] h-9 shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col overflow-hidden min-h-0">
          <div className="flex flex-col flex-1 overflow-y-auto show-scrollbar pb-4 min-h-0">
            {(() => {
              const allChapters = [...(curriculum[0]?.topics || [])];
              const sortedChapters = allChapters.sort((a: any, b: any) => {
                const aIsActive = a.id === activeId || a.subtopics?.some((t: any) => t.id === activeId);
                const bIsActive = b.id === activeId || b.subtopics?.some((t: any) => t.id === activeId);
                if (aIsActive && !bIsActive) return -1;
                if (!aIsActive && bIsActive) return 1;
                return 0;
              });

              return sortedChapters.map((chapter: any, chapterIndex: number) => {
                const isChapterActive = chapter.id === activeId;
                const isChapterGroupActive = isChapterActive || chapter.subtopics?.some((t: any) => t.id === activeId);
                const isClosed = closedTopics[chapter.id];

                return (
                  <div key={`${chapter.id}-${chapterIndex}`} className="flex flex-col border-b border-slate-200 dark:border-slate-800 last:border-0">

                    {/* Chapter Row */}
                    <div className="flex items-center justify-between">
                      <Link href={`/guide/${chapter.id}`} className="flex-1 block">
                        <div
                          className={cn(
                            "px-4 py-3 text-[14px] font-bold transition-all border-l-4",
                            isChapterGroupActive
                              ? "bg-indigo-50/80 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-500"
                              : "bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70"
                          )}
                        >
                          {translateToBengali(chapter.title.split(' (')[0])}
                        </div>
                      </Link>
                      {chapter.subtopics && chapter.subtopics.length > 0 && (
                        <div
                          onClick={(e) => toggleTopic(chapter.id, e)}
                          className={cn(
                            "p-3 cursor-pointer transition-colors shrink-0 flex items-center justify-center",
                            isChapterGroupActive 
                              ? "bg-indigo-50/80 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40" 
                              : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                          )}
                        >
                          {isClosed ? (
                            <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Topics under this chapter */}
                    {!isClosed && (
                      <div className="flex flex-col">
                        {(() => {
                          const allTopics = [...(chapter.subtopics || [])];
                          const sortedTopics = allTopics.sort((a: any, b: any) => {
                            const aIsActive = a.id === activeId;
                            const bIsActive = b.id === activeId;
                            if (aIsActive && !bIsActive) return -1;
                            if (!aIsActive && bIsActive) return 1;
                            return 0;
                          });

                          return sortedTopics.map((topic: any, topicIndex: number) => {
                            const isTopicActive = topic.id === activeId;
                            return (
                              <Link href={`/guide/${topic.id}`} key={`${topic.id}-${topicIndex}`}>
                                <div
                                  className={cn(
                                    "px-5 py-2.5 text-[13.5px] border-b border-slate-100 dark:border-slate-800/50 transition-colors relative flex items-center gap-2",
                                    isTopicActive
                                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold"
                                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
                                  )}
                                >
                                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isTopicActive ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600")} />
                                  {translateToBengali(topic.title)}
                                </div>
                              </Link>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
