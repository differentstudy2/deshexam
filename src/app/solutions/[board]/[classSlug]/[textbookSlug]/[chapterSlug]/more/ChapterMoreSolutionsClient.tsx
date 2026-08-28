'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, CheckCircle2, ChevronDown, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import hardcodedChaptersJson from '@/data/hardcoded/taxonomy/chapters.json';
import hardcodedTextbooksJson from '@/data/hardcoded/taxonomy/textbooks.json';
import hardcodedQuestionsJson from '@/data/hardcoded/taxonomy/questions.json';

const BOARD_SLUG_MAP: Record<string, string[]> = {
  'wbbse': ['wb-board', 'wbbse'],
  'wbbpe': ['wbbpe-board', 'wbbpe'],
  'cbse': ['cbse-board', 'cbse'],
  'icse': ['icse-board', 'icse'],
  'wbchse': ['wbchse-board', 'wbchse'],
  'ncert': ['ncert', 'ncert-board'],
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

interface Props {
  board: string;
  classSlug: string;
  textbookSlug: string;
  chapterSlug: string;
}

export default function ChapterMoreSolutionsClient({ board, classSlug, textbookSlug, chapterSlug }: Props) {
  const boardSlugs = BOARD_SLUG_MAP[board.toLowerCase()] || [board.toLowerCase()];

  const textbook = useMemo(() =>
    (hardcodedTextbooksJson as any[]).find(b =>
      boardSlugs.includes(b.boardSlug?.toLowerCase()) &&
      b.classSlug?.toLowerCase() === classSlug.toLowerCase() &&
      b.textbookSlug?.toLowerCase() === textbookSlug.toLowerCase()
    ), [board, classSlug, textbookSlug]);

  const chapter = useMemo(() =>
    (hardcodedChaptersJson as any[]).find(ch =>
      boardSlugs.includes(ch.boardSlug?.toLowerCase()) &&
      ch.classSlug?.toLowerCase() === classSlug.toLowerCase() &&
      ch.textbookSlug?.toLowerCase() === textbookSlug.toLowerCase() &&
      (ch.chapterSlug?.toLowerCase() === chapterSlug.toLowerCase() ||
       ch.slug?.toLowerCase() === chapterSlug.toLowerCase())
    ), [board, classSlug, textbookSlug, chapterSlug]);

  // Read HARDCODED questions for this chapter
  const chapterQuestions = useMemo(() => {
    if (!chapter) return [];
    return (hardcodedQuestionsJson as any[])
      .filter(q => q.chapterId === chapter.id && !q.topicId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [chapter]);

  const [expandedQs, setExpandedQs] = useState<Set<string>>(new Set());
  const toggleQ = (id: string) => {
    setExpandedQs(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedTextbook = textbook?.title || textbookSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const chapterTitle = chapter?.title || chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full px-4 md:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <Link href="/solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Solutions</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link href={`/solutions/${board}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{formattedBoard}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[120px]">{chapterTitle}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-violet-600 dark:text-violet-400 font-semibold">অতিরিক্ত প্রশ্নোত্তর</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6">
          <Link
            href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to {chapterTitle}
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center border border-violet-200 dark:border-violet-800/50 flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{formattedBoard}</Badge>
                <Badge variant="outline" className="text-xs">{formattedClass}</Badge>
                <Badge className="text-xs bg-violet-500 hover:bg-violet-600 text-white border-none">অতিরিক্ত প্রশ্নোত্তর</Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-bold font-headline text-slate-900 dark:text-white leading-tight">
                {chapterTitle} — অতিরিক্ত প্রশ্নোত্তর
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{formattedTextbook}</p>
              {chapterQuestions.length > 0 && (
                <p className="text-sm text-violet-600 dark:text-violet-400 mt-2 font-medium">
                  {chapterQuestions.length}টি প্রশ্ন
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-0 md:px-0 lg:px-0 py-4 space-y-4">

        {chapterQuestions.length > 0 ? (
          <div className="space-y-3">
            {chapterQuestions.map((q, idx) => {
              const isOpen = expandedQs.has(q.id);
              const options = q.options ? Object.entries(q.options) : [];
              const correct = q.correctAnswer || q.correctOptionId;
              return (
                <div key={q.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleQ(q.id)}
                    className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{q.questionText}</p>
                    <ChevronDown className={cn('h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 space-y-3">
                      {options.length > 0 && (
                        <div className="space-y-1.5">
                          {options.map(([key, val], oi) => {
                            const isCorrect = key === correct;
                            return (
                              <div key={key} className={cn(
                                'flex items-start gap-2.5 px-3 py-2 rounded-lg border text-sm',
                                isCorrect
                                  ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700'
                                  : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
                              )}>
                                <span className={cn(
                                  'flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5',
                                  isCorrect ? 'bg-violet-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                )}>
                                  {OPTION_LABELS[oi] || key.toUpperCase()}
                                </span>
                                <span className={cn('flex-1 leading-snug', isCorrect ? 'text-violet-800 dark:text-violet-200 font-semibold' : 'text-slate-600 dark:text-slate-400')}>
                                  {val as string}
                                </span>
                                {isCorrect && <CheckCircle2 className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {q.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-lg px-4 py-3">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">ব্যাখ্যা</p>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">কোনো অতিরিক্ত প্রশ্নোত্তর নেই</h3>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}`}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Chapter এ ফিরে যান
              </Link>
            </Button>
          </div>
        )}

        {/* Back link */}
        {chapterQuestions.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}`}
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Chapter এর মূল page এ ফিরে যান
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
