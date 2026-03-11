
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="bg-orange-50 dark:bg-orange-900/20 min-h-screen">
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
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
           </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quizzes.map((quiz, index) => (
              <Card key={quiz.id} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center">
                <CardHeader className="items-center">
                  <div className={`p-4 rounded-full mb-4 bg-orange-100`}>
                    {quiz.featureImage ? 
                      <Image src={quiz.featureImage} alt={quiz.title} width={40} height={40} className="rounded-full" /> 
                      : <PawPrint className="w-10 h-10 text-orange-500" />
                    }
                  </div>
                  <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{quiz.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild>
                    <Link href={`/kids-zone/fun-quizzes/${quiz.id}`}>Start Quiz</Link>
                  </Button>
                </div>
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
