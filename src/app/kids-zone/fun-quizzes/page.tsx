
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, PawPrint } from "lucide-react";
import Link from "next/link";
import { getAllContent } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

type Quiz = {
  id: string;
  title: string;
  description?: string;
  category: string;
  testType: string;
  featureImage?: string;
};

const ITEMS_PER_PAGE = 8;

export default function FunQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const allContent = await getAllContent();
        const funQuizzes = allContent.filter(
          item => item.testType === 'Quiz' && item.category === 'Fun Quizzes'
        ) as Quiz[];
        setQuizzes(funQuizzes);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching quizzes",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [toast]);

  const visibleQuizzes = useMemo(() => {
    return quizzes.slice(0, visibleCount);
  }, [quizzes, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 min-h-screen">
       <section className="relative w-full py-20 md:py-28 lg:py-36 bg-gradient-to-br from-black to-[#0f9b0f]">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/kids-quizzes/1920/1080"
            alt="Fun abstract background for quizzes"
            fill
            className="object-cover opacity-20"
            data-ai-hint="kids fun abstract"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
           <div className="inline-block bg-white/20 p-4 rounded-full mb-4">
             <PawPrint className="w-12 h-12" />
           </div>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg">
            Fun Quizzes
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-2xl mx-auto drop-shadow-md">
            Test your knowledge with exciting quizzes on animals, space, and much more!
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <Card key={i} className="flex flex-col overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 flex-grow space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
           </div>
        ) : quizzes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleQuizzes.map((quiz) => (
                <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group bg-white dark:bg-slate-900/50">
                    <CardHeader className="p-0 relative h-48">
                        <Image
                            src={quiz.featureImage || `https://picsum.photos/seed/${quiz.id}/400/300`}
                            alt={quiz.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint="quiz fun kids"
                        />
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <CardTitle className="font-headline text-lg mt-1 mb-2 leading-snug group-hover:text-primary transition-colors">
                            {quiz.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {quiz.description}
                        </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 mt-auto">
                        <Button asChild className="w-full bg-gradient-to-r from-black to-[#0f9b0f] text-white">
                            <Link href={`/kids-zone/fun-quizzes/${quiz.id}`}>Start Quiz</Link>
                        </Button>
                    </CardFooter>
                </Card>
              ))}
            </div>
            {visibleCount < quizzes.length && (
              <div className="mt-12 text-center">
                <Button onClick={handleLoadMore} size="lg">
                  Load More Quizzes
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No quizzes found. Create one in the admin panel to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
