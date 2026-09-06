'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, BookMarked, GraduationCap,
  ChevronDown, ChevronRight, List, BookOpen, FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import hardcodedTextbooksJson from '@/data/hardcoded/taxonomy/textbooks.json';
import hardcodedChaptersJson from '@/data/hardcoded/taxonomy/chapters.json';
import hardcodedTopicsJson from '@/data/hardcoded/taxonomy/topics.json';

const bnBookTitles: Record<string, string> = {
  "Amader Paribesh": "আমাদের পরিবেশ",
  "Amar Ganit": "আমার গণিত",
  "Bhasha Path": "ভাষা পাঠ",
  "Health & Physical Education": "স্বাস্থ্য ও শারীরশিক্ষা",
  "Patabahar": "পাতাবাহার",
  "Amader Prithibi": "আমাদের পৃথিবী",
  "Atit O Aityaja": "অতীত ও ঐতিহ্য",
  "Bhasa Charcha": "ভাষাচর্চা",
  "Ganit Prabha": "গণিত প্রভা",
  "Ha Ja Ba Ra La": "হ য ব র ল",
  "Poribesh O Bigyan": "পরিবেশ ও বিজ্ঞান",
  "Sahityamela": "সাহিত্যমেলা",
  "Maku": "মাকু",
  "Pather Panchali Rapid": "পথের পাঁচালী র‍্যাপিড",
  "Ganit Prakash": "গণিত প্রকাশ",
  "Professor Shankur Dairy": "প্রফেসর শঙ্কুর ডায়েরি",
  "Sahitya Sanchayan": "সাহিত্য সঞ্চয়ন",
  "Koni Rapid Reader": "কোনি র‍্যাপিড রিডার",
  "Amar Boi": "আমার বই",
  "Sahaj Path Pratham Bhag": "সহজ পাঠ প্রথম ভাগ",
  "Sahaj Path Dwitiyo Bhag": "সহজ পাঠ দ্বিতীয় ভাগ",
  "Itihas O Poribesh": "ইতিহাস ও পরিবেশ",
  "Itihas o Paribesh": "ইতিহাস ও পরিবেশ",
  "Jibon Bigyan O Paribesh": "জীবন বিজ্ঞান ও পরিবেশ",
  "Bhugol o Paribesh": "ভূগোল ও পরিবেশ",
  "Physical Science": "ভৌতবিজ্ঞান",
  "Butterfly": "বাটারফ্লাই",
  "Blossoms": "ব্লসমস",
  "Bliss": "ব্লিস",
};

const bnSubjects: Record<string, string> = {
  "environmental-science": "পরিবেশ বিজ্ঞান",
  "mathematics": "গণিত",
  "bengali-language": "বাংলা",
  "english": "ইংরেজি",
  "history": "ইতিহাস",
  "geography": "ভূগোল",
  "physical-science": "ভৌত বিজ্ঞান",
  "life-science": "জীবন বিজ্ঞান",
  "bengali-literature": "বাংলা সাহিত্য",
  "bengali-grammar": "বাংলা ব্যাকরণ",
  "science": "বিজ্ঞান",
  "rapid-reader": "র‍্যাপিড রিডার",
  "health-physical-education": "স্বাস্থ্য ও শারীরশিক্ষা",
};

const bnClasses: Record<string, string> = {
  "class-1": "১ম শ্রেণী", "class-2": "২য় শ্রেণী", "class-3": "৩য় শ্রেণী",
  "class-4": "৪র্থ শ্রেণী", "class-5": "৫ম শ্রেণী", "class-6": "৬ষ্ঠ শ্রেণী",
  "class-7": "৭ম শ্রেণী", "class-8": "৮ম শ্রেণী", "class-9": "৯ম শ্রেণী",
  "class-10": "১০ম শ্রেণী", "class-11": "একাদশ শ্রেণী", "class-12": "দ্বাদশ শ্রেণী",
};

const BOARD_SLUG_MAP: Record<string, string[]> = {
  'wbbse': ['wb-board', 'wbbse'],
  'wbbpe': ['wbbpe-board', 'wbbpe'],
  'cbse': ['cbse-board', 'cbse'],
  'icse': ['icse-board', 'icse'],
  'wbchse': ['wbchse-board', 'wbchse'],
  'ncert': ['ncert', 'ncert-board'],
};

// Color palette — badge bg, border accent, topic bg, topic text
const CHAPTER_PALETTE = [
  { badge: 'bg-blue-500',    border: 'border-l-blue-400',    topicBg: 'bg-blue-50/60 dark:bg-blue-950/20',   topicText: 'text-blue-700 dark:text-blue-300',   topicNum: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' },
  { badge: 'bg-emerald-500', border: 'border-l-emerald-400', topicBg: 'bg-emerald-50/60 dark:bg-emerald-950/20', topicText: 'text-emerald-700 dark:text-emerald-300', topicNum: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' },
  { badge: 'bg-orange-500',  border: 'border-l-orange-400',  topicBg: 'bg-orange-50/60 dark:bg-orange-950/20', topicText: 'text-orange-700 dark:text-orange-300',   topicNum: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300' },
  { badge: 'bg-violet-500',  border: 'border-l-violet-400',  topicBg: 'bg-violet-50/60 dark:bg-violet-950/20', topicText: 'text-violet-700 dark:text-violet-300',   topicNum: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300' },
  { badge: 'bg-rose-500',    border: 'border-l-rose-400',    topicBg: 'bg-rose-50/60 dark:bg-rose-950/20',   topicText: 'text-rose-700 dark:text-rose-300',       topicNum: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300' },
  { badge: 'bg-teal-500',    border: 'border-l-teal-400',    topicBg: 'bg-teal-50/60 dark:bg-teal-950/20',   topicText: 'text-teal-700 dark:text-teal-300',       topicNum: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300' },
  { badge: 'bg-amber-500',   border: 'border-l-amber-400',   topicBg: 'bg-amber-50/60 dark:bg-amber-950/20', topicText: 'text-amber-700 dark:text-amber-300',     topicNum: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300' },
  { badge: 'bg-cyan-500',    border: 'border-l-cyan-400',    topicBg: 'bg-cyan-50/60 dark:bg-cyan-950/20',   topicText: 'text-cyan-700 dark:text-cyan-300',       topicNum: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300' },
  { badge: 'bg-fuchsia-500', border: 'border-l-fuchsia-400', topicBg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/20', topicText: 'text-fuchsia-700 dark:text-fuchsia-300', topicNum: 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-300' },
  { badge: 'bg-lime-600',    border: 'border-l-lime-500',    topicBg: 'bg-lime-50/60 dark:bg-lime-950/20',   topicText: 'text-lime-700 dark:text-lime-300',       topicNum: 'bg-lime-100 dark:bg-lime-900/40 text-lime-600 dark:text-lime-300' },
  { badge: 'bg-indigo-500',  border: 'border-l-indigo-400',  topicBg: 'bg-indigo-50/60 dark:bg-indigo-950/20', topicText: 'text-indigo-700 dark:text-indigo-300',   topicNum: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300' },
  { badge: 'bg-pink-500',    border: 'border-l-pink-400',    topicBg: 'bg-pink-50/60 dark:bg-pink-950/20',   topicText: 'text-pink-700 dark:text-pink-300',       topicNum: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300' },
];

function isWBBoard(board: string) {
  return ['wbbse', 'wbbpe', 'wb-board', 'wbbpe-board'].includes(board.toLowerCase());
}

interface Props {
  board: string;
  classSlug: string;
  textbookSlug: string;
}

export default function TextbookSolutionsClient({ board, classSlug, textbookSlug }: Props) {
  const boardSlugs = BOARD_SLUG_MAP[board.toLowerCase()] || [board.toLowerCase()];
  const isWB = isWBBoard(board);

  const textbook = useMemo(() => {
    const books = hardcodedTextbooksJson as any[];
    return books.find(b =>
      boardSlugs.includes(b.boardSlug?.toLowerCase()) &&
      b.classSlug?.toLowerCase() === classSlug.toLowerCase() &&
      b.textbookSlug?.toLowerCase() === textbookSlug.toLowerCase()
    );
  }, [board, classSlug, textbookSlug]);

  const chapters = useMemo(() => {
    if (!textbook) return [];
    const allChapters = hardcodedChaptersJson as any[];
    return allChapters
      .filter(ch => ch.parentId === textbook.id)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [textbook]);

  const topicsByChapter = useMemo(() => {
    const allTopics = hardcodedTopicsJson as any[];
    const map: Record<string, any[]> = {};
    chapters.forEach(ch => {
      map[ch.id] = allTopics
        .filter(t => t.parentId === ch.id)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    });
    return map;
  }, [chapters]);

  // Default: all chapters with topics are expanded
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() =>
    new Set(chapters.filter(ch => (topicsByChapter[ch.id] || []).length > 0).map(ch => ch.id))
  );

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const expandAll = () => setExpandedChapters(new Set(
    chapters.filter(ch => (topicsByChapter[ch.id] || []).length > 0).map(ch => ch.id)
  ));
  const collapseAll = () => setExpandedChapters(new Set());

  const displayTitle = isWB && textbook ? (bnBookTitles[textbook.title] || textbook.title) : textbook?.title;
  const subjectDisplay = isWB && textbook
    ? (bnSubjects[textbook.subjectSlug] || textbook.subjectSlug?.replace(/-/g, ' '))
    : textbook?.subjectSlug?.replace(/-/g, ' ');
  const classDisplay = isWB
    ? (bnClasses[classSlug] || classSlug.replace(/-/g, ' '))
    : classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (!textbook) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center py-20">
          <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Textbook Not Found</h2>
          <p className="text-slate-500 mb-6">We couldn't find this textbook.</p>
          <Button asChild variant="outline">
            <Link href={`/solutions/${board}/${classSlug}`}>← Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">

      {/* ── Breadcrumb ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href={`/solutions/${board.toLowerCase()}/${classSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
            {classDisplay}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{displayTitle}</span>
        </div>
      </div>

      {/* ── Premium Hero Card ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Book cover */}
            <div className="flex-shrink-0 w-24 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-md">
              <BookMarked className="h-12 w-12 text-emerald-500 dark:text-emerald-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold font-headline text-slate-900 dark:text-white tracking-tight leading-tight mb-1">
                {displayTitle}
              </h1>
              {isWB && bnBookTitles[textbook.title] && (
                <p className="text-slate-400 dark:text-slate-500 text-sm italic mb-3">{textbook.title}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                <Badge variant="outline" className="text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600">
                  {board.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> {classDisplay}
                </Badge>
                {subjectDisplay && (
                  <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                    {subjectDisplay}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <List className="h-4 w-4 text-emerald-500" />
                  <strong className="text-slate-700 dark:text-slate-200">{chapters.length}</strong> অধ্যায়
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <strong className="text-slate-700 dark:text-slate-200">
                    {Object.values(topicsByChapter).reduce((s, t) => s + t.length, 0)}
                  </strong> বিষয়
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table of Contents ── */}
      <div className="container mx-auto max-w-5xl px-4 mt-10">

        {/* Professional centered heading */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-400 dark:text-slate-500 mb-3">
            {textbook.title}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 dark:text-white tracking-tight mb-3">
            সুচিপত্র
          </h2>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            মোট <strong className="text-slate-600 dark:text-slate-300">{chapters.length}</strong>টি অধ্যায়
          </p>
          {chapters.some(ch => (topicsByChapter[ch.id] || []).length > 0) && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={expandAll}
                className="text-xs h-8 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                সব খুলুন
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}
                className="text-xs h-8 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                সব বন্ধ করুন
              </Button>
            </div>
          )}
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="h-14 w-14 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">অধ্যায় পাওয়া যায়নি</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">শীঘ্রই আসছে!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter, index) => {
              const topics = topicsByChapter[chapter.id] || [];
              const hasTopics = topics.length > 0;
              const isExpanded = expandedChapters.has(chapter.id);
              const palette = CHAPTER_PALETTE[index % CHAPTER_PALETTE.length];
              const numStr = String(chapter.orderIndex || index + 1).padStart(2, '0');
              const chapterHref = `/solutions/${board.toLowerCase()}/${classSlug}/${textbookSlug}/${chapter.chapterSlug || chapter.slug}`;

              return (
                <div
                  key={chapter.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${palette.border}`}
                >
                  {/* Chapter row */}
                  <div className="flex items-center gap-4 px-5 py-4 group">
                    {/* Numbered badge */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${palette.badge} flex items-center justify-center shadow-sm`}>
                      <span className="text-xs font-bold text-white">{numStr}</span>
                    </div>

                    {/* Title */}
                    {hasTopics ? (
                      <button onClick={() => toggleChapter(chapter.id)} className="flex-1 min-w-0 text-left">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">
                          {chapter.title}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{topics.length}টি বিষয়</p>
                      </button>
                    ) : (
                      <Link href={chapterHref} className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">
                          {chapter.title}
                        </p>
                      </Link>
                    )}

                    {/* Page number */}
                    {(chapter as any).pageNo && (
                      <span className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 min-w-[64px] text-right">
                        পৃষ্ঠা {String((chapter as any).pageNo).padStart(2, '0')}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={chapterHref}
                        onClick={e => e.stopPropagation()}
                        className={`hidden sm:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${palette.topicText} ${palette.topicBg} border-current/20`}
                      >
                        সমাধান দেখুন <ChevronRight className="h-3 w-3" />
                      </Link>
                      {hasTopics ? (
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center sm:hidden">
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Topics — colored */}
                  {hasTopics && isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800">
                      {topics.map((topic, tIndex) => (
                        <Link
                          key={topic.id}
                          href={`${chapterHref}/${topic.topicSlug || topic.slug}`}
                          className={`flex items-center gap-3 px-5 py-3 border-b border-slate-100/80 dark:border-slate-800/50 last:border-b-0 ${palette.topicBg} hover:brightness-95 dark:hover:brightness-110 transition-all group/topic`}
                        >
                          {/* Topic number */}
                          <div className={`flex-shrink-0 w-6 h-6 rounded-md ${palette.topicNum} flex items-center justify-center ml-12 font-bold text-[10px]`}>
                            {tIndex + 1}
                          </div>
                          <p className={`flex-1 text-sm font-medium leading-snug ${palette.topicText}`}>
                            {topic.title}
                          </p>
                          <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 opacity-50 group-hover/topic:opacity-100 transition-opacity ${palette.topicText}`} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
