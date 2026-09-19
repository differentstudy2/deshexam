'use client';

import React from 'react';
import { BookOpen, FileText, Type, Target, Info, User, Lightbulb, PenTool, HelpCircle, Brain, CheckSquare, FileArchive, FileImage, Video, ClipboardList, StickyNote, Key, Timer, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentSection } from '@/app/guide/guide-data';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const SECTION_ICONS: Record<string, any> = {
  'lesson': BookOpen,
  'guide_content': FileText,
  'word_meaning': Type,
  'objective': Target,
  'introduction': Info,
  'author': User,
  'explanation': Lightbulb,
  'exercise': PenTool,
  'mcq': HelpCircle,
  'creative_question': PenTool,
  'descriptive': CheckSquare,
  'model_test': ClipboardList,
  'pdf': FileImage,
  'video': Video,
  'q_a': HelpCircle,
  'cq': FileArchive,
  'board_question': FileImage,
  'video_classes': Video,
  'practice_sets': ClipboardList,
  'notes': StickyNote,
  'solutions': Key,
  'quizzes': HelpCircle,
  'mock_tests': Timer,
  'exams_papers': Award
};

export function TopicSectionsSidebar({ sections = [], node, currentContentType }: { sections?: ContentSection[], node?: any, currentContentType?: string | null }) {
  const pathname = usePathname();
  
  // Convert DB section ID to URL-friendly format (e.g. word_meaning -> word-meaning)
  const getUrlSegment = (id: string) => id.replace(/_/g, '-');
  
  // Default to first section if no query param is set and no content type
  const activeId = currentContentType ? currentContentType.replace(/-/g, '_') : (sections?.length > 0 ? sections[0].id : '');

  // Base URL for the topic
  const baseUrl = node ? `/guide/${node.fullSlug || node.id}` : pathname.replace(/\/[^\/]+$/, '');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-700 dark:to-green-600 p-3 flex items-center gap-2 shrink-0">
        <div className="p-1.5 bg-white/20 rounded-lg">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-white text-[15px] leading-tight">বিষয়বস্তু</h3>
      </div>
      <div className="space-y-1 p-3">
        {sections.map((sec) => {
          const secId = sec.id || '';
          const isActive = activeId === secId;
          const Icon = SECTION_ICONS[secId] || FileText;
          
          const urlSegment = getUrlSegment(secId);
          const href = `${baseUrl}/${urlSegment}`;

          return (
            <Link
              key={secId}
              href={href}
              scroll={true}
              className={cn(
                "flex items-start justify-between py-2.5 px-3 transition-all duration-300 rounded-[0.120rem] border group relative overflow-hidden w-full",
                isActive 
                  ? "bg-green-50/80 border-green-200 shadow-sm dark:bg-green-900/20 dark:border-green-800/50" 
                  : "bg-white border-black/5 hover:shadow-sm hover:border-slate-200 hover:bg-slate-50 dark:bg-slate-900/50 dark:border-white/5 dark:hover:border-slate-700"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-green-500"></div>
              )}
              <div className="flex items-center gap-2.5 w-full relative z-10">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm border",
                  isActive
                    ? "bg-white border-green-200 text-green-600 dark:bg-slate-800 dark:border-green-800 dark:text-green-400"
                    : "bg-white/70 border-black/5 text-slate-500 dark:bg-slate-900/50 dark:border-white/5 dark:text-slate-400"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn(
                  "font-bold text-[13.5px] transition-colors tracking-tight leading-tight truncate",
                  isActive ? "text-green-700 dark:text-green-400" : "text-slate-800 dark:text-slate-200 group-hover:text-green-600"
                )}>
                  {sec.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
