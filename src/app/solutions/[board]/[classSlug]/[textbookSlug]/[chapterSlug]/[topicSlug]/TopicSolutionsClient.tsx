'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight, BookOpen, CheckCircle2, XCircle,
  ChevronDown, ArrowLeft, Lightbulb, HelpCircle, FileText, PenLine
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import hardcodedChaptersJson from '@/data/hardcoded/taxonomy/chapters.json';
import hardcodedTopicsJson from '@/data/hardcoded/taxonomy/topics.json';
import hardcodedTextbooksJson from '@/data/hardcoded/taxonomy/textbooks.json';
import customSolutionsJson from '@/data/hardcoded/taxonomy/solutions.json';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

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

interface Props {
  board: string;
  classSlug: string;
  textbookSlug: string;
  chapterSlug: string;
  topicSlug: string;
}

function CustomQuestion({ q, idx }: { q: any; idx: number }) {
  const [showAnswer, setShowAnswer] = useState(true);
  const badge = TYPE_BADGE[q.questionType] || { label: q.questionType || 'প্রশ্ন', class: 'bg-slate-500' };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 px-5 py-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center mt-0.5">
          {idx + 1}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn('text-[10px] text-white border-none', badge.class)}>{badge.label}</Badge>
            {q.marks && <span className="text-[10px] text-slate-400">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug whitespace-pre-line">{q.questionText}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5" /> উত্তর দেখুন
          </button>
        ) : (
          <div className="space-y-2">
            {q.answer && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">উত্তর</p>
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    লুকান
                  </button>
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed whitespace-pre-line">{q.answer}</p>
              </div>
            )}
            {q.explanation && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-lg px-4 py-3">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> ব্যাখ্যা
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-line">{q.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopicSolutionsClient({ board, classSlug, textbookSlug, chapterSlug, topicSlug }: Props) {
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

  const allTopicsInChapter = useMemo(() => {
    if (!chapter) return [];
    return (hardcodedTopicsJson as any[])
      .filter(t => t.parentId === chapter.id)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [chapter]);

  const topicIndex = useMemo(() =>
    allTopicsInChapter.findIndex(t => t.topicSlug?.toLowerCase() === topicSlug.toLowerCase() || t.slug?.toLowerCase() === topicSlug.toLowerCase()),
  [allTopicsInChapter, topicSlug]);

  const topic = topicIndex !== -1 ? allTopicsInChapter[topicIndex] : null;
  const prevTopic = topicIndex > 0 ? allTopicsInChapter[topicIndex - 1] : null;
  const nextTopic = topicIndex !== -1 && topicIndex < allTopicsInChapter.length - 1 ? allTopicsInChapter[topicIndex + 1] : null;

  const customContents = useMemo(() => {
    return (customSolutionsJson as any[]).filter(c =>
      boardSlugs.includes(c.boardSlug?.toLowerCase()) &&
      c.classSlug?.toLowerCase() === classSlug.toLowerCase() &&
      c.textbookSlug?.toLowerCase() === textbookSlug.toLowerCase() &&
      c.chapterSlug?.toLowerCase() === chapterSlug.toLowerCase() &&
      c.topicSlug?.toLowerCase() === topicSlug.toLowerCase()
    );
  }, [board, classSlug, textbookSlug, chapterSlug, topicSlug]);

  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedTextbook = textbook?.title || textbookSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const chapterTitle = chapter?.title || chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const topicTitle = topic?.title || topicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (!topic) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center py-16">
          <FileText className="h-14 w-14 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Topic Not Found</h2>
          <p className="text-slate-500 mb-6">This topic doesn't exist yet.</p>
          <Button asChild variant="outline">
            <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}`}>← Back to Chapter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full px-4 md:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <Link href="/solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Solutions</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link href={`/solutions/${board}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{formattedBoard}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link href={`/solutions/${board}/${classSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{formattedClass}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[100px]">{formattedTextbook}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[100px]">{chapterTitle}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[120px]">{topicTitle}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6">
          <Link
            href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Chapter
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 flex-shrink-0">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{formattedBoard}</Badge>
                <Badge variant="outline" className="text-xs">{formattedClass}</Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-bold font-headline text-slate-900 dark:text-white leading-tight">
                {topicTitle}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{chapterTitle} · {formattedTextbook}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: Left TOC + Content */}
      <div className="flex items-start gap-0">

        {/* Left TOC Sidebar */}
        {allTopicsInChapter.length > 0 && (
          <aside className="hidden lg:block w-[220px] xl:w-[240px] shrink-0 sticky top-0 max-h-screen overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* TOC Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                  <ChevronDown className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">বিষয়সূচি</span>
              </div>
              <p className="text-[10px] text-blue-200 mt-0.5 truncate">{chapterTitle}</p>
            </div>

            {/* Topic List */}
            <nav className="p-2 flex flex-col gap-0.5">
              {allTopicsInChapter.map((t, i) => {
                const slug = t.topicSlug || t.slug;
                const isActive = slug?.toLowerCase() === topicSlug.toLowerCase();
                return (
                  <Link
                    key={t.id}
                    href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${slug}`}
                    className={cn(
                      'flex items-start gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150 group',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/50'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                    )}
                  >
                    <span className={cn(
                      'flex-shrink-0 w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center mt-0.5',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    )}>
                      {i + 1}
                    </span>
                    <span className="leading-snug line-clamp-2">{t.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* More link at bottom */}
            <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${topicSlug}/more`}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:underline"
              >
                <FileText className="h-3 w-3" /> অতিরিক্ত প্রশ্নোত্তর
              </Link>
            </div>
          </aside>
        )}

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full px-0 md:px-0 lg:px-0 py-4 space-y-4">
          {customContents.length > 0 ? (
            customContents.map((content, ci) => (
              <div key={content.id} className="space-y-5 px-4 md:px-5">
                {content.title && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <PenLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{content.title}</h2>
                  </div>
                )}

                {content.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{content.description}</p>
                )}

                {content.content && (
                  <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-5 shadow-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                      {content.content}
                    </ReactMarkdown>
                  </div>
                )}

                {content.questions && content.questions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> প্রশ্নোত্তর
                    </h3>
                    <div className="space-y-3">
                      {content.questions.map((q: any, qi: number) => (
                        <CustomQuestion key={q.id || qi} q={q} idx={qi} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : topic?.content ? (
            <div className="space-y-5 px-4 md:px-5">
              <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-5 shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {topic.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="mx-4 text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Solutions coming soon</h3>
              <p className="text-slate-500 text-sm">Custom content for this topic will be added shortly.</p>
            </div>
          )}

          <div className="flex justify-center pt-4 pb-4 px-4">
            <Link
              href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${topicSlug}/more`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-semibold hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors border border-violet-200 dark:border-violet-800/40 shadow-sm"
            >
              অতিরিক্ত প্রশ্নোত্তর দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {(prevTopic || nextTopic) && (
            <div className="flex items-center justify-between gap-4 pt-4 mx-4 border-t border-slate-200 dark:border-slate-800">
              {prevTopic ? (
                <Link
                  href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${prevTopic.topicSlug || prevTopic.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[45%]"
                >
                  <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{prevTopic.title}</span>
                </Link>
              ) : <div />}
              {nextTopic ? (
                <Link
                  href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${nextTopic.topicSlug || nextTopic.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[45%] ml-auto"
                >
                  <span className="truncate">{nextTopic.title}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </Link>
              ) : <div />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

