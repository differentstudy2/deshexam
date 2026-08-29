'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, FileText, ChevronDown, List, ArrowLeft, PenLine, Sparkles, HelpCircle, Lightbulb } from 'lucide-react';
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

const PALETTE = [
  { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/40', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-500', num: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-500', num: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' },
  { bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-800/40', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-500', num: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600' },
  { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800/40', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-500', num: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600' },
  { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/40', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-500', num: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' },
  { bg: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-200 dark:border-teal-800/40', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-teal-500', num: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600' },
];

interface Props {
  board: string;
  classSlug: string;
  textbookSlug: string;
  chapterSlug: string;
}

function CustomQuestion({ q, idx }: { q: any; idx: number }) {
  const [showAnswer, setShowAnswer] = useState(true);
  const badge = TYPE_BADGE[q.questionType] || { label: q.questionType, class: 'bg-slate-500' };

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

export default function ChapterSolutionsClient({ board, classSlug, textbookSlug, chapterSlug }: Props) {
  const boardSlugs = BOARD_SLUG_MAP[board.toLowerCase()] || [board.toLowerCase()];

  const textbook = useMemo(() => {
    return (hardcodedTextbooksJson as any[]).find(b =>
      boardSlugs.includes(b.boardSlug?.toLowerCase()) &&
      b.classSlug?.toLowerCase() === classSlug.toLowerCase() &&
      b.textbookSlug?.toLowerCase() === textbookSlug.toLowerCase()
    );
  }, [board, classSlug, textbookSlug]);

  const chapter = useMemo(() => {
    return (hardcodedChaptersJson as any[]).find(ch =>
      boardSlugs.includes(ch.boardSlug?.toLowerCase()) &&
      ch.classSlug?.toLowerCase() === classSlug.toLowerCase() &&
      ch.textbookSlug?.toLowerCase() === textbookSlug.toLowerCase() &&
      (ch.chapterSlug?.toLowerCase() === chapterSlug.toLowerCase() ||
       ch.slug?.toLowerCase() === chapterSlug.toLowerCase())
    );
  }, [board, classSlug, textbookSlug, chapterSlug]);

  const topics = useMemo(() => {
    if (!chapter) return [];
    return (hardcodedTopicsJson as any[])
      .filter(t => t.parentId === chapter.id)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [chapter]);

  const allChaptersInBook = useMemo(() => {
    return (hardcodedChaptersJson as any[])
      .filter(ch =>
        boardSlugs.includes(ch.boardSlug?.toLowerCase()) &&
        ch.classSlug?.toLowerCase() === classSlug.toLowerCase() &&
        ch.textbookSlug?.toLowerCase() === textbookSlug.toLowerCase()
      )
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [boardSlugs, classSlug, textbookSlug]);

  const chapterIndex = useMemo(() => {
    return allChaptersInBook.findIndex(ch =>
      ch.chapterSlug?.toLowerCase() === chapterSlug.toLowerCase() ||
      ch.slug?.toLowerCase() === chapterSlug.toLowerCase()
    );
  }, [allChaptersInBook, chapterSlug]);

  const prevChapter = chapterIndex > 0 ? allChaptersInBook[chapterIndex - 1] : null;
  const nextChapter = chapterIndex !== -1 && chapterIndex < allChaptersInBook.length - 1 ? allChaptersInBook[chapterIndex + 1] : null;

  // Read CUSTOM content for this chapter (no topicSlug)
  const customContents = useMemo(() => {
    return (customSolutionsJson as any[]).filter(c =>
      boardSlugs.includes(c.boardSlug?.toLowerCase()) &&
      c.classSlug?.toLowerCase() === classSlug.toLowerCase() &&
      c.textbookSlug?.toLowerCase() === textbookSlug.toLowerCase() &&
      (c.chapterSlug?.toLowerCase() === chapterSlug.toLowerCase()) &&
      !c.topicSlug
    );
  }, [board, classSlug, textbookSlug, chapterSlug]);

  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedTextbook = textbook?.title || textbookSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const chapterTitle = chapter?.title || chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (!chapter) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center py-16">
          <BookOpen className="h-14 w-14 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Chapter Not Found</h2>
          <p className="text-slate-500 mb-6">This chapter doesn't exist yet.</p>
          <Button asChild variant="outline">
            <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}`}>← Back to Textbook</Link>
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
          <Link href={`/solutions/${board}/${classSlug}/${textbookSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[120px]">{formattedTextbook}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[150px]">{chapterTitle}</span>
        </div>
      </div>

      {/* Hero — Premium gradient banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-900">
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative w-full px-4 md:px-6 lg:px-8 py-6">
          <Link
            href={`/solutions/${board}/${classSlug}/${textbookSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-100 hover:text-white mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {formattedTextbook}
          </Link>

          <div className="flex items-start gap-4">
            {/* Cover avatar */}
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <List className="h-7 w-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">{formattedBoard}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">{formattedClass}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight drop-shadow-sm">{chapterTitle}</h1>
              <p className="text-sm text-emerald-100 mt-1 font-medium">{formattedTextbook}</p>
              <div className="flex items-center gap-3 mt-2.5">
                {topics.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80">
                    <FileText className="h-3.5 w-3.5" />
                    {topics.length} Topics
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80">
                    <BookOpen className="h-3.5 w-3.5" />
                    {allChaptersInBook.length} Chapters in Book
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: Left TOC + Content */}
      <div className="flex items-start gap-0">

        {/* Left TOC Sidebar */}
        <aside className="hidden lg:block w-[240px] xl:w-[260px] shrink-0 sticky top-0 max-h-screen overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {topics.length > 0 ? (
            <>
              {/* TOC Header for Topics */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">টপিকসমূহ</span>
                </div>
                <p className="text-[10px] text-emerald-200 mt-0.5 truncate">{chapterTitle}</p>
              </div>

              {/* Topic List */}
              <nav className="p-2 flex flex-col gap-0.5">
                {topics.map((topic, i) => {
                  const slug = topic.topicSlug || topic.slug;
                  return (
                    <Link
                      key={topic.id}
                      href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${slug}`}
                      className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      <span className="flex-shrink-0 w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center mt-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {i + 1}
                      </span>
                      <span className="leading-snug line-clamp-2">{topic.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </>
          ) : (
            <>
              {/* TOC Header for Chapters */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                    <BookOpen className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">অধ্যায়সূচি</span>
                </div>
                <p className="text-[10px] text-emerald-200 mt-0.5 truncate">{formattedTextbook}</p>
              </div>

              {/* Chapter List */}
              <nav className="p-2 flex flex-col gap-0.5">
                {allChaptersInBook.map((ch, i) => {
                  const slug = ch.chapterSlug || ch.slug;
                  const isActive = slug?.toLowerCase() === chapterSlug.toLowerCase();
                  return (
                    <Link
                      key={ch.id}
                      href={`/solutions/${board}/${classSlug}/${textbookSlug}/${slug}`}
                      className={cn(
                        'flex items-start gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150 group',
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/50'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                      )}
                    >
                      <span className={cn(
                        'flex-shrink-0 w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center mt-0.5',
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      )}>
                        {i + 1}
                      </span>
                      <span className="leading-snug line-clamp-2">{ch.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}

          {/* More link at bottom */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/more`}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:underline"
            >
              <FileText className="h-3 w-3" /> অতিরিক্ত প্রশ্নোত্তর
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full py-4 space-y-4">

          {/* Topics Grid */}
          {topics.length > 0 && (
            <div className="px-4 md:px-5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" /> Topics in this Chapter
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((topic, idx) => {
                  const pal = PALETTE[idx % PALETTE.length];
                  return (
                    <Link
                      key={topic.id}
                      href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/${topic.topicSlug || topic.slug}`}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group',
                        pal.bg, pal.border
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0', pal.badge)}>
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <span className={cn('font-semibold text-sm leading-snug flex-1', pal.text)}>{topic.title}</span>
                      <ChevronRight className={cn('h-4 w-4 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all', pal.text)} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Content Section */}
          {customContents.length > 0 && (
            <div className="px-4 md:px-5 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" /> Chapter Solutions
              </h2>
              {customContents.map((content, ci) => (
                <div key={content.id} className="space-y-4">
                  {content.title && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <PenLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{content.title}</h3>
                    </div>
                  )}

                  {content.content && (
                    <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-5 shadow-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                        {content.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {content.questions && content.questions.length > 0 && (
                    <div className="space-y-3">
                      {content.questions.map((q: any, qi: number) => (
                        <CustomQuestion key={q.id || qi} q={q} idx={qi} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Fallback to chapter.content (from chapters.json) if no custom solutions */}
          {customContents.length === 0 && chapter?.content && (
            <div className="px-4 md:px-5 space-y-6">
              <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-5 shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {chapter.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {topics.length === 0 && customContents.length === 0 && !chapter?.content && (
            <div className="mx-4 text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Content coming soon</h3>
              <p className="text-slate-500 text-sm">Solutions for this chapter will be added shortly.</p>
            </div>
          )}

          <div className="flex justify-center pt-6 pb-4 px-4">
            <Link
              href={`/solutions/${board}/${classSlug}/${textbookSlug}/${chapterSlug}/more`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-semibold hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors border border-violet-200 dark:border-violet-800/40 shadow-sm"
            >
              অতিরিক্ত প্রশ্ন ও উত্তর দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Prev / Next Chapter Navigation */}
          {(prevChapter || nextChapter) && (
            <div className="flex items-center justify-between gap-4 pt-4 mx-4 border-t border-slate-200 dark:border-slate-800">
              {prevChapter ? (
                <Link
                  href={`/solutions/${board}/${classSlug}/${textbookSlug}/${prevChapter.chapterSlug || prevChapter.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[45%]"
                >
                  <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{prevChapter.title}</span>
                </Link>
              ) : <div />}
              {nextChapter ? (
                <Link
                  href={`/solutions/${board}/${classSlug}/${textbookSlug}/${nextChapter.chapterSlug || nextChapter.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[45%] ml-auto"
                >
                  <span className="truncate">{nextChapter.title}</span>
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
