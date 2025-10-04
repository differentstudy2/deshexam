
'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, HelpCircle, BarChart } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { MockTestFilters } from "@/components/mock-test-filters";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAllContent } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

type Quiz = {
  id: string;
  title: string;
  subject: string;
  questions: any[];
  duration: number;
  difficulty: string;
  access: "free" | "premium" | "pro";
  testType: string;
};

function getUrlForTest(testType: string, testId: string) {
  const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
  return `/${typeSlug}/${testId}`;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Quizzes | DeshExam";
    const descriptionMeta = document.querySelector('meta[name="description"]');
    descriptionMeta?.setAttribute('content', 'Test your knowledge with fun and challenging quizzes on a variety of subjects. Perfect for quick practice sessions and learning on the go.');
  }, []);

  useEffect(() => {
    const fetchInitialQuizzes = async () => {
      try {
        const fetchedQuizzes = (await getAllContent("Quiz")) as Quiz[];
        setQuizzes(fetchedQuizzes);
        const uniqueSubjects = Array.from(new Set(fetchedQuizzes.map((quiz) => quiz.subject))).filter(Boolean) as string[];
        setSubjects(uniqueSubjects);
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
    fetchInitialQuizzes();
  }, [toast]);
  
  useEffect(() => {
    let unsubscribe: () => void;
    if (user) {
        const q = query(collection(db, "content"), where("testType", "==", "Quiz"));
        
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedQuizzes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Quiz[];
          
          setQuizzes(fetchedQuizzes);
          const uniqueSubjects = Array.from(new Set(fetchedQuizzes.map((quiz: any) => quiz.subject))).filter(Boolean) as string[];
          setSubjects(uniqueSubjects);
        }, (error) => {
          console.error("Error fetching quizzes in real-time: ", error);
           if (error.code !== 'permission-denied') {
              toast({
                variant: "destructive",
                title: "Error fetching real-time data",
                description: (error as Error).message,
              });
            }
        });
    }
    // Cleanup subscription on component unmount
    return () => {
      if(unsubscribe) {
        unsubscribe();
      }
    }
  }, [toast, user]);

  return (
    <div className="container py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Quizzes</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Test your knowledge with our fun and challenging quizzes on various subjects.
        </p>
      </header>

      <MockTestFilters subjects={subjects} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col overflow-hidden">
                <Skeleton className="w-full h-[225px]" />
                <CardContent className="flex-grow p-4 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center space-x-4 pt-2">
                       <Skeleton className="h-4 w-1/3" />
                       <Skeleton className="h-4 w-1/3" />
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
          ))}
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
              <CardHeader className="p-0 relative">
                <Image
                  src={`https://picsum.photos/seed/${quiz.id}/400/225`}
                  alt={quiz.title}
                  width={400}
                  height={225}
                  className="w-full h-auto object-cover"
                  data-ai-hint={`${quiz.subject} abstract`}
                />
                <div className="absolute top-2 right-2">
                  <ContentBadge type={quiz.access as "free" | "premium" | "pro"} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                {quiz.subject && <p className="text-sm font-medium text-primary">{quiz.subject}</p>}
                <CardTitle className="font-headline text-lg mt-1 mb-2 leading-snug">{quiz.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  {quiz.questions?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>{quiz.questions.length} Questions</span>
                    </div>
                  )}
                  {quiz.duration > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.duration} min</span>
                    </div>
                  )}
                  {quiz.difficulty && (
                    <div className="flex items-center gap-1.5">
                      <BarChart className="w-4 h-4" />
                      <span>{quiz.difficulty}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={getUrlForTest(quiz.testType, quiz.id)}>Start Quiz</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No quizzes found.</p>
        </div>
      )}
    </div>
  );
}
