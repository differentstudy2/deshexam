import React from 'react';
import { SidebarSubject } from '@/app/guide/guide-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface GuideSidebarProps {
  subjects: SidebarSubject[];
  activeId?: string;
}

export function GuideSidebar({ subjects, activeId }: GuideSidebarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="font-bold text-[22px] text-slate-800 dark:text-slate-100">
          অষ্টম শ্রেণি
        </h3>
      </div>
      <div className="flex flex-col">
        {subjects.map((subject, idx) => {
          const isActive = subject.id === activeId;
          const isLast = idx === subjects.length - 1;
          
          return (
            <Link 
              href={`/guide/${subject.id}`} 
              key={subject.id}
            >
              <div 
                className={cn(
                  "flex items-center justify-between px-5 py-4 transition-colors cursor-pointer group",
                  !isLast && "border-b border-slate-100 dark:border-slate-800/50",
                  isActive 
                    ? "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-400" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                )}
              >
                <span className="font-medium text-[15px]">
                  {subject.title}
                </span>
                <span 
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-md font-bold transition-colors",
                    isActive 
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" 
                      : "bg-[#e2f5ea] text-[#2c8a5a] dark:bg-emerald-900/30 dark:text-emerald-400 group-hover:bg-emerald-100"
                  )}
                >
                  {subject.countStr}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
