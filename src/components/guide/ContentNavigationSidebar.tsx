import React from 'react';
import { Chapter } from '@/app/guide/[id]/guide-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ContentNavigationSidebarProps {
  curriculum: Chapter[];
  activeId: string;
}

export function ContentNavigationSidebar({ curriculum, activeId }: ContentNavigationSidebarProps) {
  return (
    <div className="w-[280px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:block overflow-y-auto h-[calc(100vh-56px)] sticky top-14">
      <div className="flex flex-col pb-8">
        {curriculum.map((chapter) => (
          <div key={chapter.id} className="flex flex-col">
            {chapter.topics.map((topic, tIdx) => {
              // The screenshot shows topics as green headers, and subtopics as list items.
              // We will render topics as light green headers if they have subtopics, 
              // or just normal items if they are the topic being read.
              
              const isTopicActive = topic.id === activeId;
              
              return (
                <div key={topic.id} className="flex flex-col">
                  {/* Topic Header */}
                  <Link href={`/guide/${topic.id}`}>
                    <div 
                      className={cn(
                        "px-4 py-2 font-medium text-[15px] border-b border-white dark:border-slate-900 transition-colors",
                        isTopicActive
                          ? "bg-[#e5f0fa] dark:bg-blue-900/30 text-[#1a5c9e] dark:text-blue-400"
                          : "bg-[#e2f5ea] dark:bg-emerald-900/20 text-[#2c8a5a] dark:text-emerald-400 hover:bg-[#d5ecd] dark:hover:bg-emerald-900/40"
                      )}
                    >
                      {topic.title.split(' ')[0]} {/* Roughly trimming title for sidebar like "পড়ে পাওয়া" */}
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
                              "px-4 py-3 text-[14px] border-b border-slate-100 dark:border-slate-800 transition-colors",
                              isSubActive
                                ? "bg-[#e5f0fa] dark:bg-blue-900/30 text-[#1a5c9e] dark:text-blue-400 font-semibold border-l-4 border-l-[#1a5c9e]"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 pl-5" // pl-5 offsets the border-l-4 of active
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
        ))}
      </div>
    </div>
  );
}
