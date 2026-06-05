import React from 'react';
import { Chapter } from '@/app/guide/[id]/guide-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentNavigationSidebarProps {
  curriculum: Chapter[];
  activeId: string;
}

export function ContentNavigationSidebar({ curriculum, activeId }: ContentNavigationSidebarProps) {
  return (
    <div className="w-[280px] shrink-0 bg-white dark:bg-[#020817] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-[calc(100vh-56px)] sticky top-14">
      
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

      <ScrollArea className="flex-1 w-full">
        {/* Subject Title */}
        <div className="px-4 py-3 border-b border-dotted border-slate-300 dark:border-slate-700">
          <h2 className="font-semibold text-[19px] text-slate-800 dark:text-slate-100">
            সাহিত্য কণিকা
          </h2>
        </div>

        <div className="flex flex-col pb-4">
          {curriculum.map((chapter) => (
            <div key={chapter.id} className="flex flex-col">
              
              {/* Chapter Header (e.g. গদ্য) */}
              <div className="px-4 py-2 bg-[#eaf5ef] dark:bg-emerald-900/20 border-b border-white dark:border-slate-900">
                <span className="text-[15.5px] text-slate-800 dark:text-slate-200">
                  {chapter.title}
                </span>
              </div>

              {/* Topics under Chapter */}
              <div className="flex flex-col">
                {chapter.topics.map((topic) => {
                  const isTopicActive = topic.id === activeId || topic.subtopics.some(s => s.id === activeId);
                  const displayTitle = topic.title.split(' (')[0];
                  
                  return (
                    <div key={topic.id} className="flex flex-col border-b border-white dark:border-slate-900">
                      
                      {/* Topic Row */}
                      <Link href={`/guide/${topic.id}`}>
                        <div 
                          className={cn(
                            "px-4 py-2 text-[15.5px] transition-colors",
                            isTopicActive
                              ? "bg-[#e2e8f0] dark:bg-slate-800 text-[#0ea5e9] dark:text-blue-400"
                              : "bg-[#eaf5ef] dark:bg-emerald-900/20 text-slate-800 dark:text-slate-200 hover:bg-[#d1e8dc] dark:hover:bg-emerald-900/40"
                          )}
                        >
                          {displayTitle}
                        </div>
                      </Link>

                      {/* Subtopics */}
                      <div className="flex flex-col">
                        {topic.subtopics.map((subtopic) => {
                          const isSubActive = subtopic.id === activeId;
                          
                          return (
                            <Link href={`/guide/${subtopic.id}`} key={subtopic.id}>
                              <div 
                                className={cn(
                                  "px-4 py-2 text-[14.5px] border-b border-dotted border-slate-200 dark:border-slate-800 transition-colors",
                                  isSubActive
                                    ? "bg-slate-50 dark:bg-slate-800/50 text-[#0ea5e9] dark:text-blue-400"
                                    : "bg-white dark:bg-[#020817] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                              >
                                {subtopic.title}
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
    </div>
  );
}
