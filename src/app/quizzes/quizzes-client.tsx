
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, HelpCircle, BarChart, Loader2 } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MockTestFilters } from "@/components/mock-test-filters";

type Quiz = {
  id: string;
  title: string;
  subject: string;
  questions: any[];
  duration: number;
  difficulty: string;
  access: "free" | "premium" | "pro";
  testType: string;
  featureImage?: string;
  description?: string;
};

function getUrlForTest(testType: string, testId: string) {
  const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
  return `/${typeSlug}/${testId}`;
}

export default function QuizzesClientPage({ initialQuizzes }: { initialQuizzes: Quiz[] }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [loading, setLoading] = useState(false); // Data is pre-fetched
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialQuizzes) {
        const uniqueSubjects = Array.from(new Set(initialQuizzes.map((quiz) => quiz.subject))).filter(Boolean) as string[];
        setSubjects(uniqueSubjects);
    }
  }, [initialQuizzes]);


  return (
    <>
      <section className="relative w-full py-20 md:py-28 lg:py-36 text-white" style={{ background: 'linear-gradient(to right, #71B280, #134E5E)' }}>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg wave-text">
            <span>Fun</span> <span>&</span> <span>Engaging</span> <span>Quizzes</span>
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto drop-shadow-md">
            Test your knowledge and challenge yourself with our vast library of quizzes. Perfect for quick practice, reinforcing concepts, and making learning enjoyable.
          </p>
        </div>
      </section>

      <div className="bg-background">
        <div className="container py-12 md:py-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                 <Card key={i} className="flex flex-col overflow-hidden">
                  <CardHeader className="p-0 relative h-48">
                    <Skeleton className="w-full h-full rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-4 flex-grow space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-10 w-full" />
                  </CardFooter>
              </Card>
              ))}
            </div>
          ) : quizzes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow bg-card-gradient text-white">
                  <CardHeader className="p-0 relative h-48">
                    <Image
                      src={quiz.featureImage || `https://picsum.photos/seed/${quiz.id}/400/225`}
                      alt={quiz.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                      data-ai-hint={`${quiz.subject} abstract`}
                    />
                    <div className="absolute top-2 right-2">
                      <ContentBadge type={quiz.access} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <p className="text-sm font-medium text-primary-foreground/80">{quiz.subject}</p>
                    <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug">{quiz.title}</CardTitle>
                    <p className="text-sm text-primary-foreground/70 line-clamp-2">
                      {quiz.description || `A fun quiz about ${quiz.subject}.`}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full" variant="secondary">
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
      </div>
    </>
  );
}
