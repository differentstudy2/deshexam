
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, PawPrint } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import type { Quiz } from '@/lib/types';
import { collection, query, where, getDocs, limit, orderBy, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

const ITEMS_PER_PAGE = 8;

export default function FunQuizzesClientPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchQuizzes = useCallback(async (loadMore = false) => {
    if (!loadMore) {
        setLoading(true);
    } else {
        setLoadingMore(true);
    }

    try {
        const baseQuery = query(
            collection(db, "content"),
            where("testType", "==", "Quiz"),
            where("category", "==", "Fun Quizzes"),
            orderBy("createdAt", "desc"),
            limit(ITEMS_PER_PAGE)
        );

        const q = loadMore && lastVisible ? query(baseQuery, startAfter(lastVisible)) : baseQuery;

        const querySnapshot = await getDocs(q);
        const fetchedQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Quiz);
        
        setHasMore(fetchedQuizzes.length === ITEMS_PER_PAGE);

        if(querySnapshot.docs.length > 0) {
             setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }

        setQuizzes(prev => loadMore ? [...prev, ...fetchedQuizzes] : fetchedQuizzes);

    } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast({
            variant: "destructive",
            title: "Failed to load quizzes",
            description: "Could not fetch quizzes. Please try refreshing the page.",
        });
    } finally {
        setLoading(false);
        setLoadingMore(false);
    }
  }, [toast]);

  useEffect(() => {
      fetchQuizzes();
  }, [fetchQuizzes]);


  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
        fetchQuizzes(true);
    }
  };

  return (
    <div>
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
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg wave-text">
            <span>Fun</span> <span>Quizzes</span> <span>for</span> <span>Kids</span>
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-2xl mx-auto drop-shadow-md">
            Boost your child's knowledge with fun and educational quizzes! Explore exciting topics like general knowledge (GK), animals, science, and more. Perfect for kids to learn and play.
          </p>
        </div>
      </section>

      <div className="bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
            {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quizzes.map((quiz) => (
                    <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group bg-card-gradient text-white">
                        <CardHeader className="p-0 relative h-48">
                            <Image
                                src={quiz.featureImage || `https://picsum.photos/seed/${quiz.id}/400/300`}
                                alt={quiz.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                data-ai-hint="quiz fun kids"
                            />
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug group-hover:text-primary transition-colors">
                                {quiz.title}
                            </CardTitle>
                            <p className="text-sm text-slate-300 line-clamp-2">
                                {quiz.description}
                            </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 mt-auto">
                            <Button asChild className="w-full bg-quiz-button-gradient text-white">
                                <Link href={`/kids-zone/fun-quizzes/${quiz.id}`}>Start Quiz</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                </div>
                {hasMore && (
                <div className="mt-12 text-center">
                    <Button onClick={handleLoadMore} size="lg" disabled={loadingMore}>
                        {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Load More Quizzes'}
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
    </div>
  );
}
