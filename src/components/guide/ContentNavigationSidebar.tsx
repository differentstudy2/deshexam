'use client';

import React, { useState } from 'react';
import { Chapter } from '@/app/guide/guide-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
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
        {/* Search Header */}
        <div className="bg-slate-100 dark:bg-slate-800/50 border-l-4 border-[#107c41] dark:border-emerald-500 p-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search" 
              className="w-full pl-8 bg-transparent border-none focus-visible:ring-0 text-[14px] h-8 shadow-none"
            />
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col overflow-hidden min-h-0">
          {/* Subject Title */}
          <div className="px-4 py-3 border-b border-dotted border-slate-300 dark:border-slate-700 shrink-0">
            <h2 className="font-semibold text-[19px] text-slate-800 dark:text-slate-100">
              {subjectTitle}
            </h2>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar pb-4 min-h-0">
            {(curriculum[0]?.topics || []).map((chapter: any, chapterIndex: number) => {
              const isChapterActive = chapter.id === activeId;
              const isChapterGroupActive = isChapterActive || chapter.subtopics?.some((t: any) => t.id === activeId);
              const isClosed = closedTopics[chapter.id];

              return (
                <div key={`${chapter.id}-${chapterIndex}`} className="flex flex-col border-b border-slate-100 dark:border-slate-800">

                  {/* Chapter Row */}
                  <div className="flex items-center justify-between">
                    <Link href={`/guide/${chapter.id}`} className="flex-1 block">
                      <div
                        className={cn(
                          "px-4 py-2.5 text-[14px] font-semibold transition-colors",
                          isChapterActive
                            ? "bg-[#e2e8f0] dark:bg-slate-800 text-[#0ea5e9] dark:text-blue-400"
                            : isChapterGroupActive
                              ? "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                              : "bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                        )}
                      >
                        {chapter.title.split(' (')[0]}
                      </div>
                    </Link>
                    {chapter.subtopics && chapter.subtopics.length > 0 && (
                      <div
                        onClick={(e) => toggleTopic(chapter.id, e)}
                        className={cn(
                          "p-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded-sm transition-colors shrink-0",
                          isChapterGroupActive ? "bg-slate-100 dark:bg-slate-800/60" : "bg-slate-50 dark:bg-slate-900/50"
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
                                "px-5 py-2 text-[14px] border-b border-dotted border-slate-200 dark:border-slate-800 transition-colors",
                                isTopicActive
                                  ? "bg-[#e2e8f0] dark:bg-slate-800 text-[#0ea5e9] dark:text-blue-400 font-medium"
                                  : "bg-[#eaf5ef] dark:bg-emerald-900/20 text-slate-700 dark:text-slate-300 hover:bg-[#d1e8dc] dark:hover:bg-emerald-900/40"
                              )}
                            >
                              {topic.title}
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
