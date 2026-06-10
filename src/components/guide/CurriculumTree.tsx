'use client';

import React, { useState } from 'react';
import { ChevronsRight, CircleDot, MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Chapter } from '@/app/guide/[id]/guide-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface CurriculumTreeProps {
  curriculum: Chapter[];
}

export function CurriculumTree({ curriculum }: CurriculumTreeProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(curriculum.map(c => c.id))
  );

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full">
      {curriculum.map((chapter, cIdx) => {
        const isChapterExpanded = expandedChapters.has(chapter.id);

        return (
          <div key={chapter.id} className="flex flex-col mb-4 last:mb-0">
            {/* Chapter Row */}
            <div 
              className={cn(
                "flex items-center justify-between py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-100 dark:border-slate-800"
              )}
            >
              <div 
                onClick={() => toggleChapter(chapter.id)} 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <ChevronsRight className={cn(
                  "w-5 h-5 text-emerald-500 transition-transform duration-200",
                  isChapterExpanded && "rotate-90"
                )} />
                <span className="font-semibold text-[17px] text-emerald-600 dark:text-emerald-400">
                  {chapter.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 bg-blue-50/50 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-sm"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  {isChapterExpanded ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 bg-slate-50 dark:bg-slate-800 rounded-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1 shadow-lg border-slate-100 dark:border-slate-800">
                    <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Test Yourself</DropdownMenuItem>
                    <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Favorite</DropdownMenuItem>
                    <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Bookmark</DropdownMenuItem>
                    <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Show Video</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Topics & Subtopics */}
            {isChapterExpanded && (
              <div className="flex flex-col">
                {chapter.topics.map((topic) => {
                  return (
                    <div key={topic.id} className="flex flex-col">
                      
                      {/* Topic Row */}
                      <div 
                        className="flex items-center justify-between py-3 pl-8 pr-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-dashed border-slate-200 dark:border-slate-800 group"
                      >
                        {(!topic.subtopics || topic.subtopics.length === 0) ? (
                          <Link href={`/guide/topic/${topic.slug || topic.id}`} className="flex items-center gap-3 flex-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                            <CircleDot className="w-4 h-4 text-emerald-500 dark:text-emerald-400" strokeWidth={3} />
                            <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400">
                              {topic.title}
                            </span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 flex-1">
                            <CircleDot className="w-4 h-4 text-slate-400 dark:text-slate-500" strokeWidth={3} />
                            <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-200">
                              {topic.title}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-800">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1 shadow-lg border-slate-100 dark:border-slate-800">
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Test Yourself</DropdownMenuItem>
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Favorite</DropdownMenuItem>
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Bookmark</DropdownMenuItem>
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Show Video</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Subtopics List */}
                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <div className="flex flex-col">
                          {topic.subtopics.map((subtopic) => (
                            <div 
                              key={subtopic.id} 
                              className="flex items-center justify-between py-3 pl-16 pr-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-dashed border-slate-200 dark:border-slate-800 group"
                            >
                              <Link 
                                href={`/guide/topic/${subtopic.slug || subtopic.id}`} 
                                className="flex items-center gap-3 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              >
                                <CircleDot className="w-[14px] h-[14px] text-slate-600 dark:text-slate-400" strokeWidth={3} />
                                <span className="font-medium text-[15px] text-slate-600 dark:text-slate-300">
                                  {subtopic.title}
                                </span>
                              </Link>
                              <div className="flex items-center transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-800">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 p-1 shadow-lg border-slate-100 dark:border-slate-800">
                                    <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Test Yourself</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Favorite</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Bookmark</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Show Video</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
