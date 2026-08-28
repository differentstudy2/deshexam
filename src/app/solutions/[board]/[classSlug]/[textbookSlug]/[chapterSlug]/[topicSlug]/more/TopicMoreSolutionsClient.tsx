'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight, BookOpen, ArrowLeft, Lightbulb,
  HelpCircle, FileText, PenLine, CheckCircle2, Sparkles, ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import hardcodedChaptersJson from '@/data/hardcoded/taxonomy/chapters.json';
import hardcodedTopicsJson from '@/data/hardcoded/taxonomy/topics.json';
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

const TYPE_BADGE: Record<string, { label: string; class: string }> = {
  mcq:   { label: 'MCQ',          class: 'bg-emerald-500' },
  short: { label: 'সংক্ষিপ্ত',   class: 'bg-blue-500' },
  long:  { label: 'রচনামূলক',    class: 'bg-violet-500' },
  fill:  { label: 'শূন্যস্থান',  class: 'bg-amber-500' },
  tf:    { label: 'সত্য/মিথ্যা', class: 'bg-rose-500' },
};
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

interface Props {
  board: string;
  classSlug: string;
  textbookSlug: string;
  chapterSlug: string;
  topicSlug: string;
}

function McqQuestion({ q, idx, isOpen, toggle }: { q: any; idx: number; isOpen: boolean; toggle: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = q.options ? Object.entries(q.options) : [];
  const correct = q.correctAnswer || q.correctOptionId;

  const handleSelect = (key: string) => {
    if (!selected) {
      setSelected(key);
      if (!isOpen) toggle();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="flex items-start gap-4 px-5 py-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center mt-0.5">
          Q{idx + 1}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500 text-[10px] text-white border-none">MCQ</Badge>
            {q.marks && <span className="text-[10px] text-slate-400">{q.marks} mark</span>}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{q.questionText}</p>
        </div>
      </div>

      <div className="px-5 pb-4 pl-[3.25rem]">
        {options.length > 0 && (
          <div className="space-y-2">
            {options.map(([key, val], oi) => {
              const isSelected = selected === key;
              const isCorrect = key === correct;
              const showResult = selected !== null;

              let btnClass = 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300 hover:bg-emerald-50/50';
              let badgeClass = 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300';

              if (showResult) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-semibold';
                  badgeClass = 'bg-emerald-500 text-white';
                } else if (isSelected) {
                  btnClass = 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/50 text-rose-800 dark:text-rose-200';
                  badgeClass = 'bg-rose-500 text-white';
                } else {
                  btnClass = 'bg-slate-50 dark:bg-slate-800/20 border-slate-200/50 dark:border-slate-800 opacity-60';
                }
              }

              return (
                <button
                  key={key}
                  disabled={showResult}
                  onClick={() => handleSelect(key)}
                  className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm text-left transition-all', btnClass)}
                >
                  <span className={cn('flex-shrink-0 w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center transition-colors', badgeClass)}>
                    {OPTION_LABELS[oi] || key.toUpperCase()}
                  </span>
                  <span className="flex-1 leading-snug">{val as string}</span>
                  {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <button
          onClick={toggle}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          {isOpen ? 'Hide Explanation' : 'Show Answer & Explanation'}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-lg px-4 py-3">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">সঠিক উত্তর: {q.options?.[correct] || correct}</p>
            {q.explanation && (
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mt-1.5">{q.explanation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ShortQuestion({ q, idx }: { q: any; idx: number }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 px-5 py-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">
          Q{idx + 1}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500 text-[10px] text-white border-none">{q.questionType === 'fill' ? 'শূন্যস্থান' : 'সংক্ষিপ্ত'}</Badge>
            {q.marks && <span className="text-[10px] text-slate-400">{q.marks} mark</span>}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{q.questionText}</p>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            উত্তর দেখুন <ChevronDown className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg px-4 py-3 animate-in slide-in-from-top-1 fade-in duration-200">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">উত্তর</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{q.answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopicMoreSolutionsClient({ board, classSlug, textbookSlug, chapterSlug, topicSlug }: Props) {
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

  const topic = useMemo(() => {
    if (!chapter) return null;
    return (hardcodedTopicsJson as any[]).find(t =>
      t.parentId === chapter.id &&
      (t.topicSlug?.toLowerCase() === topicSlug.toLowerCase() ||
       t.slug?.toLowerCase() === topicSlug.toLowerCase())
    );
  }, [chapter, topicSlug]);

  // Read HARDCODED questions for this topic
  const questions = useMemo(() => {
    if (!topic) return [];
    return (hardcodedQuestionsJson as any[])
      .filter(q => q.topicId === topic.id)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [topic]);

  const mcqQuestions = questions.filter(q => q.questionType === 'mcq');
  const otherQuestions = questions.filter(q => q.questionType !== 'mcq');

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
  const topicTitle = topic?.title || topicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full px-4 md:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <Link href="/solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Solutions</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[80px]">{chapterTitle}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${topicSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[100px]">{topicTitle}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-violet-600 dark:text-violet-400 font-semibold">অতিরিক্ত প্রশ্নোত্তর</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6">
          <Link
            href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${topicSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to {topicTitle}
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
                {topicTitle} — অতিরিক্ত প্রশ্নোত্তর
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{chapterTitle} · {formattedTextbook}</p>
              {questions.length > 0 && (
                <p className="text-sm text-violet-600 dark:text-violet-400 mt-2 font-medium">
                  {questions.length}টি প্রশ্ন
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 py-6 space-y-8">

        {/* MCQs */}
        {mcqQuestions.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </span>
              বহুনির্বাচনী প্রশ্ন (MCQ)
            </h2>
            <div className="space-y-3">
              {mcqQuestions.map((q, idx) => (
                <McqQuestion
                  key={q.id}
                  q={q}
                  idx={idx}
                  isOpen={expandedQs.has(q.id)}
                  toggle={() => toggleQ(q.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Other Questions */}
        {otherQuestions.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                <HelpCircle className="h-3.5 w-3.5 text-white" />
              </span>
              অন্যান্য প্রশ্ন ও উত্তর
            </h2>
            <div className="space-y-3">
              {otherQuestions.map((q, idx) => (
                <ShortQuestion key={q.id} q={q} idx={idx} />
              ))}
            </div>
          </section>
        )}

        {questions.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Sparkles className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">কোনো অতিরিক্ত প্রশ্নোত্তর নেই</h3>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${topicSlug}`}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Topic এ ফিরে যান
              </Link>
            </Button>
          </div>
        )}

        {questions.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${topicSlug}`}
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Topic এর মূল page এ ফিরে যান
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
