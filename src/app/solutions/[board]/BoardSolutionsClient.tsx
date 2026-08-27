'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { getAllTextbooks } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Textbook } from '@/lib/types';
import { TextbookStats } from '@/components/feature/textbook-stats';
import { Badge } from '@/components/ui/badge';
import { ContentBadge } from '@/components/content-badge';

const ITEMS_PER_PAGE = 12;

export default function BoardSolutionsClient({ board }: { board: string }) {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { toast } = useToast();

  const formattedBoard = board.toUpperCase();

  useEffect(() => {
    const fetchBoardTextbooks = async () => {
      try {
        setLoading(true);
        // Fetch all textbooks, then we filter by board client-side
        // Alternatively, if there's an API index, we can filter it there.
        const textbookData = await getAllTextbooks();
        setTextbooks(textbookData as Textbook[]);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error fetching data",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBoardTextbooks();
  }, [toast]);

  // Filter textbooks for this specific board
  const filteredTextbooks = useMemo(() => {
    return textbooks.filter(book => {
      if (!book.board) return false;
      return book.board.toLowerCase().replace(/\s+/g, '-') === board.toLowerCase() || 
             book.board.toLowerCase() === board.toLowerCase();
    });
  }, [textbooks, board]);

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
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-black opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 text-emerald-100 border-emerald-200/30 bg-emerald-800/30">
              Board Solutions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline tracking-tight">
              {formattedBoard} Textbook Solutions
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 mb-8 opacity-90 max-w-2xl leading-relaxed">
              Master your {formattedBoard} board exams with step-by-step, comprehensive solutions for all major textbooks. Find chapter-wise explanations and ace your preparation.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 mt-8 md:mt-12">
        {/* Results Header */}
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headline">Available Textbooks</h2>
                {!loading && <p className="text-muted-foreground mt-1 text-sm">Showing {visibleTextbooks.length} of {filteredTextbooks.length} solutions for {formattedBoard}</p>}
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
                <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow bg-textbook-card-gradient text-white border-none">
                  <CardHeader className="p-0 relative bg-black/20 flex items-center justify-center h-48 group">
                    <Link href={`/textbook-solutions/${book.id}`} className="block w-full h-full relative">
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
                          {book.subject && <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none font-medium">{book.subject}</Badge>}
                          {book.class && <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none font-medium">{book.class}</Badge>}
                      </div>
                      <Link href={`/textbook-solutions/${book.id}`} className="block group">
                          <CardTitle className="font-headline text-lg mt-1 leading-snug text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                              {book.title}
                          </CardTitle>
                      </Link>
                       <p className="text-sm text-emerald-100/70 font-medium">by {(book as any).authorName || 'DeshExam'}</p>
                      
                      <div className="pt-2 border-t border-white/10">
                        <TextbookStats textbookId={book.id} />
                      </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 shadow-sm border-none">
                          <Link href={`/textbook-solutions/${book.id}`}>
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
                We couldn't find any textbook solutions for the {formattedBoard} board at this time. We are constantly adding new materials, so check back soon!
            </p>
            <Button asChild className="mt-8">
                <Link href="/textbook-solutions">Browse All Solutions</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
