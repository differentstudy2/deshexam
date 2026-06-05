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
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'c1': true, 
  });
  
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    't1': true,
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const toggleTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering other clicks if necessary
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-slate-900 rounded-lg">
      {curriculum.map((chapter, cIdx) => {
        const isChapterExpanded = !!expandedChapters[chapter.id];

        return (
          <div key={chapter.id} className="flex flex-col">
            {/* Chapter Row */}
            <div 
              className={cn(
                "flex items-center justify-between py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group",
                cIdx !== 0 && "border-t border-slate-100 dark:border-slate-800"
              )}
            >
              <Link href={`/guide/${chapter.id}`} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <ChevronsRight className={cn(
                  "w-5 h-5 text-emerald-500 transition-transform duration-200",
                  isChapterExpanded && "rotate-90"
                )} />
                <span className="font-semibold text-[17px] text-emerald-600 dark:text-emerald-400">
                  {chapter.title}
                </span>
              </Link>
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

            {/* Topics List */}
            {isChapterExpanded && (
              <div className="flex flex-col pl-4 sm:pl-8 pb-4">
                {chapter.topics.map((topic, tIdx) => {
                  const isTopicExpanded = !!expandedTopics[topic.id];

                  return (
                    <div key={topic.id} className="flex flex-col mt-2">
                      {/* Topic Row */}
                      <div 
                        className="flex items-center justify-between py-3 px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg cursor-pointer hover:shadow-sm transition-shadow group"
                        onClick={(e) => toggleTopic(topic.id, e)}
                      >
                        <Link 
                          href={`/guide/${topic.id}`} 
                          className="flex items-center gap-3 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CircleDot className="w-4 h-4 text-slate-700 dark:text-slate-300" strokeWidth={3} />
                          <span className="font-medium text-[15px] text-slate-700 dark:text-slate-200">
                            {topic.title}
                          </span>
                        </Link>
                        
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1 shadow-lg border-slate-100 dark:border-slate-800">
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Test Yourself</DropdownMenuItem>
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Favorite</DropdownMenuItem>
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Bookmark</DropdownMenuItem>
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Show Video</DropdownMenuItem>
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Add MCQ</DropdownMenuItem>
                              <DropdownMenuItem className="py-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">Add Written</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Subtopics List */}
                      {isTopicExpanded && (
                        <div className="flex flex-col pl-4 sm:pl-8 pt-2">
                          {topic.subtopics.map((subtopic) => (
                            <div 
                              key={subtopic.id} 
                              className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 group"
                            >
                              <Link href={`/guide/${subtopic.id}`} className="flex items-center gap-3 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                <CircleDot className="w-3.5 h-3.5 text-slate-500" strokeWidth={3} />
                                <span className="font-medium text-sm text-slate-600 dark:text-slate-300">
                                  {subtopic.title}
                                </span>
                              </Link>
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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
