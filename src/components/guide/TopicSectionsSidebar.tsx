'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Type, Target, Info, User, Lightbulb, PenTool, HelpCircle, Brain, CheckSquare, FileArchive, FileImage, Video, ClipboardList, StickyNote, Key, Timer, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentSection } from '@/app/guide/guide-data';

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

export function TopicSectionsSidebar({ sections }: { sections: ContentSection[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id || ''));
      let currentActive = activeId;
      for (const el of sectionElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentActive = el.id;
            break;
          }
        }
      }
      if (currentActive !== activeId) {
        setActiveId(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, activeId]);

  const scrollToSection = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-fit p-3">
      <div className="space-y-1">
        {sections.map((sec) => {
          const secId = sec.id || '';
          const isActive = activeId === secId;
          const Icon = SECTION_ICONS[secId] || FileText;
          return (
            <button
              key={secId}
              onClick={() => scrollToSection(secId)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors",
                isActive 
                  ? "bg-[#107c41]/10 text-[#107c41] dark:bg-emerald-900/30 dark:text-emerald-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-[#107c41] dark:text-emerald-400" : "text-slate-400")} />
              {sec.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
