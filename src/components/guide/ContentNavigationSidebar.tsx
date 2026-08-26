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
            {(curriculum[0]?.topics || []).map((chapter: any, chapterIndex: number) => {
              const isChapterActive = chapter.id === activeId;
              const isChapterGroupActive = isChapterActive || chapter.subtopics?.some((t: any) => t.id === activeId);
              const isClosed = closedTopics[chapter.id];

              return (
                <div key={`${chapter.id}-${chapterIndex}`} className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 last:border-0">

                  {/* Chapter Row */}
                  <div className="flex items-center justify-between">
                    <Link href={`/guide/${chapter.id}`} className="flex-1 block">
                      <div
                        className={cn(
                          "px-4 py-3 text-[14px] font-bold transition-all border-l-2",
                          isChapterGroupActive
                            ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border-blue-500"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        {translateToBengali(chapter.title.split(' (')[0])}
                      </div>
                    </Link>
                    {chapter.subtopics && chapter.subtopics.length > 0 && (
                      <div
                        onClick={(e) => toggleTopic(chapter.id, e)}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0",
                          isChapterGroupActive ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-white dark:bg-slate-900"
                        )}
                      >
                        {isClosed ? (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Topics under this chapter */}
                  {!isClosed && (
                    <div className="flex flex-col">
                      {chapter.subtopics?.map((topic: any, topicIndex: number) => {
                        const isTopicActive = topic.id === activeId;
                        return (
                          <Link href={`/guide/${topic.id}`} key={`${topic.id}-${topicIndex}`}>
                            <div
                              className={cn(
                                "px-5 py-2.5 text-[13.5px] border-b border-slate-50 dark:border-slate-800/50 transition-colors relative flex items-center gap-2",
                                isTopicActive
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-bold"
                                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
                              )}
                            >
                              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isTopicActive ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600")} />
                              {translateToBengali(topic.title)}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
