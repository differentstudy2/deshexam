'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, ChevronLeft } from "lucide-react";
import { getAllTextbooks } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Textbook } from '@/lib/types';
import { TextbookStats } from '@/components/feature/textbook-stats';
import { Badge } from '@/components/ui/badge';
import { ContentBadge } from '@/components/content-badge';
import hardcodedTextbooksJson from '@/data/hardcoded/taxonomy/textbooks.json';

const ITEMS_PER_PAGE = 12;

const bnTranslations: Record<string, string> = {
  // Subjects
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
  // Classes
  "class-1": "১ম শ্রেণী",
  "class-2": "২য় শ্রেণী",
  "class-3": "৩য় শ্রেণী",
  "class-4": "৪র্থ শ্রেণী",
  "class-5": "৫ম শ্রেণী",
  "class-6": "৬ষ্ঠ শ্রেণী",
  "class-7": "৭ম শ্রেণী",
  "class-8": "৮ম শ্রেণী",
  "class-9": "৯ম শ্রেণী",
  "class-10": "১০ম শ্রেণী",
  "class-11": "একাদশ শ্রেণী",
  "class-12": "দ্বাদশ শ্রেণী",
};

const bnBookTitles: Record<string, string> = {
  // WBBSE / WBBPE textbook titles in Bengali script
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
};

const formatLabel = (slug: string, board: string) => {
  if (!slug) return '';
  const isWB = board.toLowerCase() === 'wbbse' || board.toLowerCase() === 'wb-board';
  if (isWB && bnTranslations[slug.toLowerCase()]) {
    return bnTranslations[slug.toLowerCase()];
  }
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const translateTitle = (title: string, board: string) => {
  const isWB = board.toLowerCase() === 'wbbse' || board.toLowerCase() === 'wb-board' || board.toLowerCase() === 'wbbpe' || board.toLowerCase() === 'wbbpe-board';
  if (isWB && bnBookTitles[title]) {
    return { original: title, translated: bnBookTitles[title] };
  }
  return { original: title, translated: null };
};

export default function ClassSolutionsClient({ board, classSlug }: { board: string; classSlug: string }) {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { toast } = useToast();

  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    const fetchTextbooks = async () => {
      try {
        setLoading(true);
        const firebaseBooks = await getAllTextbooks().catch(() => []);
        
        let hardcodedTextbooks: any[] = [];
        if (Array.isArray(hardcodedTextbooksJson)) {
          hardcodedTextbooks = hardcodedTextbooksJson;
        } else if (hardcodedTextbooksJson && typeof hardcodedTextbooksJson === 'object') {
          if (Array.isArray((hardcodedTextbooksJson as any).default)) {
            hardcodedTextbooks = (hardcodedTextbooksJson as any).default;
          } else {
            hardcodedTextbooks = Object.values(hardcodedTextbooksJson);
          }
        }

        const formattedHardcoded = hardcodedTextbooks.map(book => ({
          id: book.id,
          title: book.title,
          description: book.description || `Comprehensive textbook solutions for ${book.title}`,
          board: book.boardSlug, // We'll map this in the filter
          class: book.classSlug,
          subject: book.subjectSlug || 'General',
          featureImage: book.coverImage || book.featureImage || null,
          totalChapters: book.totalChapters || 0,
          totalSolutions: book.totalSolutions || 0,
          boardSlug: book.boardSlug,
          classSlug: book.classSlug,
        })) as unknown as Textbook[];

        setTextbooks([...formattedHardcoded, ...firebaseBooks] as unknown as Textbook[]);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching textbooks",
          description: "Could not load textbook data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTextbooks();
  }, [toast]);

  // Filter textbooks for this specific board and class
  const filteredTextbooks = useMemo(() => {
    return textbooks.filter(book => {
      // 1. Board Match
      const bookBoard = (book as any).boardSlug || book.board || '';
      if (!bookBoard) return false;
      const matchesBoard = bookBoard.toLowerCase().replace(/\s+/g, '-') === board.toLowerCase() || 
                           bookBoard.toLowerCase() === board.toLowerCase() ||
                           (board.toLowerCase() === 'wbbse' && ['wb-board', 'wbbme', 'wbbse'].includes(bookBoard.toLowerCase())); // specific fix for wbbse taxonomy mapping
      if (!matchesBoard) return false;

      // 2. Class Match
      const bookClass = (book as any).classSlug || book.class || '';
      if (!bookClass) return false;
      const bookClassSlug = bookClass.toLowerCase().replace(/\s+/g, '-');
      // Special fallback for kg classes just in case
      const matchesClass = bookClassSlug === classSlug.toLowerCase() || 
                           bookClass.toLowerCase() === classSlug.toLowerCase().replace(/-/g, ' ');
      
      return matchesClass;
    });
  }, [textbooks, board, classSlug]);

  const visibleTextbooks = useMemo(() => {
    return filteredTextbooks.slice(0, visibleCount);
  }, [filteredTextbooks, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-black opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <Link 
              href={`/solutions/${board.toLowerCase()}`}
              className="inline-flex items-center text-emerald-100 hover:text-white mb-6 text-sm font-medium transition-colors bg-emerald-800/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-emerald-500/30"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to {formattedBoard} Classes
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="text-emerald-100 border-emerald-200/30 bg-emerald-800/30">
                {formattedBoard}
              </Badge>
              <Badge variant="outline" className="text-emerald-100 border-emerald-200/30 bg-emerald-800/30 flex items-center">
                <GraduationCap className="h-3 w-3 mr-1" /> {formattedClass}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline tracking-tight">
              {formattedBoard} {formattedClass} Solutions
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 mb-8 opacity-90 max-w-2xl leading-relaxed">
              Master your {formattedClass} exams with step-by-step, comprehensive solutions for all major textbooks. Find chapter-wise explanations and ace your preparation.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 mt-8 md:mt-12">
        {/* Results Header */}
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headline">Available Textbooks</h2>
                {!loading && <p className="text-muted-foreground mt-1 text-sm">Showing {visibleTextbooks.length} of {filteredTextbooks.length} solutions for {formattedClass}</p>}
            </div>
        </div>

        {/* Textbooks Grid */}
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="p-0 relative h-48">
                            <Skeleton className="w-full h-full rounded-t-lg" />
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                             <Skeleton className="h-4 w-1/3" />
                             <Skeleton className="h-6 w-full" />
                             <Skeleton className="h-16 w-full" />
                        </CardContent>
                        <CardFooter className="p-4">
                             <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : filteredTextbooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleTextbooks.map((book) => (
                <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                  <CardHeader className="p-0 relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center h-48 group">
                    <Link href={`/solutions/${board.toLowerCase()}/${classSlug}/${(book as any).textbookSlug || book.id}`} className="block w-full h-full relative">
                        <Image
                          src={book.featureImage || `https://picsum.photos/seed/${book.id}/200/280`}
                          alt={book.title}
                          width={200}
                          height={280}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </Link>
                     <div className="absolute top-3 right-3">
                        <ContentBadge type={book.access} />
                      </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                          {book.subject && <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium">{formatLabel(book.subject, board)}</Badge>}
                          {book.class && <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium">{formatLabel(book.class, board)}</Badge>}
                          {((book as any).version || (book as any).medium || (book as any).language) && (
                            <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 font-medium">
                              {((book as any).version || (book as any).medium || (book as any).language)}
                            </Badge>
                          )}
                      </div>
                      <Link href={`/solutions/${board.toLowerCase()}/${classSlug}/${(book as any).textbookSlug || book.id}`} className="block group">
                          {(() => {
                            const { original, translated } = translateTitle(book.title, board);
                            return translated ? (
                              <div>
                                <CardTitle className="font-headline text-lg mt-1 leading-snug text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                  {translated}
                                </CardTitle>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">{original}</p>
                              </div>
                            ) : (
                              <CardTitle className="font-headline text-lg mt-1 leading-snug text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                {original}
                              </CardTitle>
                            );
                          })()}
                      </Link>
                      
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <TextbookStats textbookId={book.id} />
                      </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-none border border-emerald-100 dark:border-emerald-800/50">
                          <Link href={`/solutions/${board.toLowerCase()}/${classSlug}/${(book as any).textbookSlug || book.id}`}>
                            <BookOpen className="mr-2 h-4 w-4"/> View Solutions
                          </Link>
                      </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
             {visibleCount < filteredTextbooks.length && (
              <div className="mt-12 text-center">
                <Button onClick={handleLoadMore} size="lg" variant="outline" className="border-emerald-200 text-emerald-800 hover:bg-emerald-50">
                  Load More Solutions
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">No textbooks found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any textbook solutions for {formattedClass} at this time. We are constantly adding new materials, so check back soon!
            </p>
            <Button asChild className="mt-8">
                <Link href={`/solutions/${board.toLowerCase()}`}>Back to Classes</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
