'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2, PawPrint } from "lucide-react";
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

export default function FunQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Kids Zone
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-orange-600">
            Fun Quizzes
          </h1>
          <p className="text-lg text-orange-700/80 mt-4 max-w-2xl mx-auto">
            Choose a topic and test your knowledge with these fun quizzes!
          </p>
        </header>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <CardHeader className="p-0 relative h-48">
                      <Image
                          src={quiz.featureImage || `https://picsum.photos/seed/${quiz.id}/400/300`}
                          alt={quiz.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <Button asChild className="w-full">
                          <Link href={`/kids-zone/fun-quizzes/${quiz.id}`}>Start Quiz</Link>
                      </Button>
                  </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No quizzes found. Create one in the admin panel to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
