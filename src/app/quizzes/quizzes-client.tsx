
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
  testType: string | string[];
  featureImage?: string;
  description?: string;
};

function getUrlForTest(testType: string | string[], testId: string) {
  const primaryType = Array.isArray(testType) ? testType[0] : testType;
  if (!primaryType) return `/content/${testId}`; // Fallback in case of empty array
  const typeSlug = primaryType.toLowerCase().replace(/\s+/g, '-');
  return `/${typeSlug}/${testId}`;
}

const ITEMS_PER_PAGE = 8;

export default function QuizzesClientPage({ initialQuizzes }: { initialQuizzes: Quiz[] }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    if (initialQuizzes) {
        const uniqueSubjects = Array.from(new Set(initialQuizzes.map((quiz) => quiz.subject))).filter(Boolean) as string[];
        setSubjects(uniqueSubjects.map(s => ({ id: s, name: s })));
    }
  }, [initialQuizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
        if (!quiz.title) return false;
        const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = selectedSubject === 'all' || quiz.subject === selectedSubject;
        return matchesSearch && matchesSubject;
    });
  }, [quizzes, searchQuery, selectedSubject]);

  const visibleQuizzes = useMemo(() => {
    return filteredQuizzes.slice(0, visibleCount);
  }, [filteredQuizzes, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };
  
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedSubject]);

  return (
    <>
      <section className="relative w-full py-20 md:py-28 lg:py-36 text-white bg-hero-gradient">
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
          <MockTestFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
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
          ) : filteredQuizzes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
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
                      <p className="text-sm font-medium text-primary">{quiz.subject}</p>
                      <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug">{quiz.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {quiz.description || `A fun quiz about ${quiz.subject}.`}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full">
                        <Link href={getUrlForTest(quiz.testType, quiz.id)}>Start Quiz</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              {visibleCount < filteredQuizzes.length && (
                <div className="mt-12 text-center">
                  <Button onClick={handleLoadMore} size="lg">
                    Load More Quizzes
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No quizzes found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
