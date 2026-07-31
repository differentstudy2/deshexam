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

export function TopicSectionsSidebar({ sections, node, currentContentType }: { sections: ContentSection[], node?: any, currentContentType?: string | null }) {
  const pathname = usePathname();
  
  // Convert DB section ID to URL-friendly format (e.g. word_meaning -> word-meaning)
  const getUrlSegment = (id: string) => id.replace(/_/g, '-');
  
  // Default to first section if no query param is set and no content type
  const activeId = currentContentType ? currentContentType.replace(/-/g, '_') : (sections.length > 0 ? sections[0].id : '');

  // Base URL for the topic
  const baseUrl = node ? `/guide/${node.fullSlug || node.id}` : pathname.replace(/\/[^\/]+$/, '');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-fit p-3">
      <div className="space-y-1">
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
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors",
                isActive 
                  ? "bg-[#107c41]/10 text-[#107c41] dark:bg-emerald-900/30 dark:text-emerald-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#107c41] dark:text-emerald-400" : "text-slate-400")} />
              <span className="truncate">{sec.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
