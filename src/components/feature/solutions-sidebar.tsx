'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, ChevronDown, ChevronRight, LayoutGrid,
  GraduationCap, BookMarked, X, Menu, Layers,
  Target, FileText, Sparkles, TrendingUp, School
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BOARDS = [
  {
    id: 'wbbse',
    name: 'WBBSE',
    fullName: 'WB Secondary Education',
    gradient: 'from-[#22c55e] to-[#15803d]',
    iconBg: 'bg-white/90',
    iconColor: 'text-emerald-600',
    classes: ['class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
    classNames: ['Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'],
    cardBg: 'bg-emerald-50/40 hover:bg-emerald-50/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30',
    activeBorder: 'border-emerald-200 dark:border-emerald-800/60',
    activeText: 'text-emerald-600 dark:text-emerald-400',
    indicator: 'bg-emerald-500',
    dot: 'bg-emerald-500',
  },
  {
    id: 'wbchse',
    name: 'WBCHSE',
    fullName: 'WB Higher Secondary',
    gradient: 'from-[#3b82f6] to-[#1d4ed8]',
    iconBg: 'bg-white/90',
    iconColor: 'text-blue-600',
    classes: ['class-11', 'class-12'],
    classNames: ['Class XI', 'Class XII'],
    cardBg: 'bg-blue-50/40 hover:bg-blue-50/80 dark:bg-blue-950/20 dark:hover:bg-blue-900/30',
    activeBorder: 'border-blue-200 dark:border-blue-800/60',
    activeText: 'text-blue-600 dark:text-blue-400',
    indicator: 'bg-blue-500',
    dot: 'bg-blue-500',
  },
  {
    id: 'ncert',
    name: 'NCERT',
    fullName: 'National Council',
    gradient: 'from-[#8b5cf6] to-[#6d28d9]',
    iconBg: 'bg-white/90',
    iconColor: 'text-violet-600',
    classes: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'],
    classNames: ['Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
    cardBg: 'bg-violet-50/40 hover:bg-violet-50/80 dark:bg-violet-950/20 dark:hover:bg-violet-900/30',
    activeBorder: 'border-violet-200 dark:border-violet-800/60',
    activeText: 'text-violet-600 dark:text-violet-400',
    indicator: 'bg-violet-500',
    dot: 'bg-violet-500',
  },
  {
    id: 'cbse',
    name: 'CBSE',
    fullName: 'Central Board',
    gradient: 'from-[#f43f5e] to-[#be123c]',
    iconBg: 'bg-white/90',
    iconColor: 'text-rose-600',
    classes: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'],
    classNames: ['Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
    cardBg: 'bg-rose-50/40 hover:bg-rose-50/80 dark:bg-rose-950/20 dark:hover:bg-rose-900/30',
    activeBorder: 'border-rose-200 dark:border-rose-800/60',
    activeText: 'text-rose-600 dark:text-rose-400',
    indicator: 'bg-rose-500',
    dot: 'bg-rose-500',
  },
  {
    id: 'icse',
    name: 'ICSE',
    fullName: 'Indian Certificate',
    gradient: 'from-[#f59e0b] to-[#b45309]',
    iconBg: 'bg-white/90',
    iconColor: 'text-amber-600',
    classes: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
    classNames: ['Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'],
    cardBg: 'bg-amber-50/40 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:hover:bg-amber-900/30',
    activeBorder: 'border-amber-200 dark:border-amber-800/60',
    activeText: 'text-amber-600 dark:text-amber-400',
    indicator: 'bg-amber-500',
    dot: 'bg-amber-500',
  },
];

function parseSolutionsPath(pathname: string) {
  const parts = pathname.replace(/^\/solutions\/?/, '').split('/').filter(Boolean);
  return {
    board: parts[0] || null,
    classSlug: parts[1] || null,
  };
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const { board: activeBoard, classSlug: activeClass } = useMemo(
    () => parseSolutionsPath(pathname),
    [pathname]
  );

  const [expandedBoards, setExpandedBoards] = useState<Set<string>>(() => {
    const parts = pathname.replace(/^\/solutions\/?/, '').split('/').filter(Boolean);
    return parts[0] ? new Set([parts[0]]) : new Set();
  });

  const toggleBoard = (boardId: string) => {
    setExpandedBoards(prev => {
      const next = new Set(prev);
      if (next.has(boardId)) next.delete(boardId);
      else next.add(boardId);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">

      {/* === Card 1: Browse by Board === */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-[#1a7a4a] to-[#14b881] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/90 rounded-md shadow-sm">
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-[15px] text-white tracking-wide">
              সকল Solutions
            </h3>
          </div>
          <Link
            href="/solutions"
            onClick={onLinkClick}
            className="bg-emerald-800/40 hover:bg-emerald-800/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm transition-colors"
          >
            সব দেখুন
          </Link>
        </div>

        {/* Board Items */}
        <div className="flex flex-col gap-1 p-3">
          {BOARDS.map((board) => {
            const isActive = activeBoard === board.id;
            const isExpanded = expandedBoards.has(board.id);

            return (
              <div key={board.id}>
                {/* Board Row */}
                <div
                  className={cn(
                    'flex items-start justify-between py-2.5 px-3 transition-all duration-300 rounded-[0.15rem] border group relative overflow-hidden shrink-0',
                    board.cardBg,
                    isActive && !activeClass
                      ? cn('shadow-sm', board.activeBorder)
                      : 'border-black/5 dark:border-white/5 hover:shadow-sm'
                  )}
                >
                  {/* Active left indicator */}
                  {isActive && !activeClass && (
                    <div className={cn('absolute left-0 top-3 bottom-3 w-1 rounded-r-full', board.indicator)} />
                  )}

                  <div className="flex items-start gap-2.5 w-full relative z-10">
                    {/* Board icon */}
                    <Link
                      href={`/solutions/${board.id}`}
                      onClick={onLinkClick}
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-105 bg-white/70 dark:bg-slate-900/50 shadow-sm border border-black/5 dark:border-white/5',
                        board.iconColor
                      )}
                    >
                      <School className="w-4 h-4" />
                    </Link>

                    {/* Board name & classes */}
                    <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/solutions/${board.id}`}
                          onClick={onLinkClick}
                          className={cn(
                            'font-bold text-[13.5px] transition-colors tracking-tight leading-tight',
                            isActive ? board.activeText : 'text-slate-800 dark:text-slate-200 hover:opacity-80'
                          )}
                        >
                          {board.name}
                        </Link>
                        <button
                          onClick={() => toggleBoard(board.id)}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-1 shrink-0"
                        >
                          <ChevronDown className={cn('h-3 w-3 text-slate-400 transition-transform duration-200', isExpanded ? 'rotate-180' : '')} />
                        </button>
                      </div>

                      {/* Classes sub-list */}
                      {isExpanded ? (
                        <div className="flex flex-col mt-1 gap-0">
                          {board.classes.map((cls, i) => {
                            const isActiveClass = isActive && activeClass === cls;
                            return (
                              <Link
                                key={cls}
                                href={`/solutions/${board.id}/${cls}`}
                                onClick={onLinkClick}
                                className={cn(
                                  'text-[11.5px] transition-all duration-200 py-0.5 rounded-md line-clamp-1 flex items-center gap-1.5',
                                  isActiveClass
                                    ? cn('font-bold', board.activeText)
                                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
                                )}
                              >
                                <div className={cn('w-1 h-1 rounded-full shrink-0', isActiveClass ? board.indicator : 'bg-slate-300 dark:bg-slate-600')} />
                                {board.classNames[i]}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {board.classes.length} classes available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* === Card 2: Quick Study Tools === */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden">
        <div className="px-4 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 flex items-center gap-3">
          <div className="p-1.5 bg-white/90 rounded-md shadow-sm">
            <Target className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="font-bold text-[14px] text-white tracking-wide uppercase">
            Practice & Prep
          </h3>
        </div>

        <div className="flex flex-col p-3 gap-1.5">
          {[
            { href: '/mock-tests', label: 'Mock Tests', sub: 'Full length exams', icon: Target, bg: 'bg-orange-50/40 hover:bg-orange-50 dark:bg-orange-950/20 dark:hover:bg-orange-900/30', iconBg: 'bg-orange-100 dark:bg-orange-900/40', iconColor: 'text-orange-600 dark:text-orange-400', textColor: 'text-orange-700 dark:text-orange-400' },
            { href: '/practice-questions', label: 'Practice Questions', sub: 'Topic-wise MCQs', icon: FileText, bg: 'bg-blue-50/40 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-900/30', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400', textColor: 'text-blue-700 dark:text-blue-400' },
            { href: '/previous-year-papers', label: 'Previous Year Papers', sub: 'Year-wise solved', icon: Layers, bg: 'bg-violet-50/40 hover:bg-violet-50 dark:bg-violet-950/20 dark:hover:bg-violet-900/30', iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconColor: 'text-violet-600 dark:text-violet-400', textColor: 'text-violet-700 dark:text-violet-400' },
          ].map(({ href, label, sub, icon: Icon, bg, iconBg, iconColor, textColor }) => (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={cn('flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 group', bg)}
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5', iconBg)}>
                <Icon className={cn('w-4 h-4 group-hover:scale-110 transition-transform', iconColor)} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className={cn('font-bold text-[12.5px] leading-tight', textColor)}>{label}</span>
                <span className="text-[10.5px] text-slate-500 font-medium">{sub}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* === Card 3: Textbook Resources === */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden shrink-0">
        <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center gap-3">
          <div className="p-1 bg-white/90 rounded-md shadow-sm">
            <BookMarked className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="font-bold text-[14px] text-white tracking-wide uppercase">
            Textbook Resources
          </h3>
        </div>

        <div className="flex flex-col p-2.5 gap-1">
          {[
            { href: '/textbook-solutions', label: 'All Textbooks', sub: 'Browse all books', icon: BookOpen, bg: 'bg-teal-50/40 hover:bg-teal-50 dark:bg-teal-950/20 dark:hover:bg-teal-900/30', iconBg: 'bg-teal-100 dark:bg-teal-900/40', iconColor: 'text-teal-600 dark:text-teal-400', textColor: 'text-teal-700 dark:text-teal-400' },
            { href: '/documents', label: 'Study Materials', sub: 'Notes & PDFs', icon: FileText, bg: 'bg-sky-50/40 hover:bg-sky-50 dark:bg-sky-950/20 dark:hover:bg-sky-900/30', iconBg: 'bg-sky-100 dark:bg-sky-900/40', iconColor: 'text-sky-600 dark:text-sky-400', textColor: 'text-sky-700 dark:text-sky-400' },
          ].map(({ href, label, sub, icon: Icon, bg, iconBg, iconColor, textColor }) => (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={cn('flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 group', bg)}
            >
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5', iconBg)}>
                <Icon className={cn('w-3.5 h-3.5 group-hover:scale-110 transition-transform', iconColor)} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className={cn('font-bold text-[12.5px] leading-tight', textColor)}>{label}</span>
                <span className="text-[10px] text-slate-500 font-medium">{sub}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function SolutionsSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[240px] xl:w-[255px] shrink-0 pr-1 pb-6">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          'lg:hidden fixed bottom-20 left-4 z-40 w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center',
          'hover:bg-emerald-700 active:scale-95 transition-all duration-150'
        )}
        aria-label="Open solutions menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 right-0 z-50 w-80 bg-slate-50 dark:bg-slate-950 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Solutions</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Drawer content */}
        <div className="p-3">
          <SidebarContent onLinkClick={() => setMobileOpen(false)} />
        </div>
      </div>
    </>
  );
}
