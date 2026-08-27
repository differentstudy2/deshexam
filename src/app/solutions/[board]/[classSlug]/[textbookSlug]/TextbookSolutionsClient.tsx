'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, BookMarked, GraduationCap, ChevronRight, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import hardcodedTextbooksJson from '@/data/hardcoded/taxonomy/textbooks.json';
import hardcodedChaptersJson from '@/data/hardcoded/taxonomy/chapters.json';

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
  "english-language": "ইংরেজি",
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
      .filter(ch => ch.parentId === textbook.id || ch.textbookSlug === textbook.textbookSlug)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [textbook]);

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
          <p className="text-slate-500 mb-6">We couldn't find this textbook. Please check the URL.</p>
          <Button asChild variant="outline">
            <Link href={`/solutions/${board}/${classSlug}`}>← Back to {classSlug.replace(/-/g, ' ')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-[-20%] right-[-5%] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] left-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <Link
            href={`/solutions/${board.toLowerCase()}/${classSlug}`}
            className="inline-flex items-center text-emerald-100 hover:text-white mb-6 text-sm font-medium transition-colors bg-emerald-800/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-emerald-500/30"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> {classDisplay} Books
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Book icon */}
            <div className="flex-shrink-0 w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
              <BookMarked className="h-10 w-10 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-emerald-100 border-emerald-300/30 bg-emerald-800/30 text-xs">
                  {board.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-emerald-100 border-emerald-300/30 bg-emerald-800/30 text-xs flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> {classDisplay}
                </Badge>
                {subjectDisplay && (
                  <Badge variant="outline" className="text-emerald-100 border-emerald-300/30 bg-emerald-800/30 text-xs">
                    {subjectDisplay}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight mb-1">
                {displayTitle}
              </h1>
              {isWB && bnBookTitles[textbook.title] && (
                <p className="text-emerald-200/70 text-sm italic">{textbook.title}</p>
              )}

              <p className="text-emerald-100/80 mt-3 text-base">
                {chapters.length} টি অধ্যায় — সম্পূর্ণ সমাধান সহ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="container mx-auto max-w-5xl px-4 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headline">
              সুচিপত্র
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {chapters.length === 0 ? 'কোনো অধ্যায় পাওয়া যায়নি' : `মোট ${chapters.length}টি অধ্যায়`}
            </p>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="h-14 w-14 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">অধ্যায় পাওয়া যায়নি</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              এই বইয়ের জন্য এখনও অধ্যায় যোগ করা হয়নি। শীঘ্রই আসছে!
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {chapters.map((chapter, index) => (
              <Link
                key={chapter.id}
                href={`/solutions/${board.toLowerCase()}/${classSlug}/${textbookSlug}/${chapter.chapterSlug || chapter.slug}`}
                className="group flex items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors duration-200"
              >
                {/* Chapter number */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {chapter.orderIndex || index + 1}
                  </span>
                </div>

                {/* Chapter title */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {chapter.title}
                  </p>
                  {chapter.slug && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <Hash className="h-3 w-3" />{chapter.slug}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
