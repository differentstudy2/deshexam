
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, HelpCircle, BarChart, Loader2 } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { useToast } from '@/hooks/use-toast';
import { getAllContent, getAllTextbooks } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Textbook } from '@/lib/types';
import { MockTestFilters } from "@/components/mock-test-filters";


type Test = {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  questions: any[];
  duration: number;
  difficulty: string | string[];
  questionSource?: string | string[];
  access: "free" | "premium" | "pro";
  testType: string;
  textbookId?: string;
  textbookTitle?: string;
  chapterId?: string;
  topicId?: string;
  board?: string;
  classCategory?: string;
  class?: string;
  featureImage?: string;
};

const ITEMS_PER_PAGE = 12;

function getUrlForTest(test: Test) {
    if (test.textbookId && test.chapterId) {
        const topicSegment = test.topicId || 'null';
        return `/textbook-solutions/mock-test/${test.id}/textbook/${test.textbookId}/chapter/${test.chapterId}/topic/${topicSegment}`;
    }
    if (test.textbookId) {
        return `/textbook-solutions/mock-test/${test.id}/textbook/${test.textbookId}`;
    }
    const typeSlug = test.testType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${test.id}`;
}

export default function MockTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Mock Tests | DeshExam";
    const descriptionMeta = document.querySelector('meta[name="description"]');
    descriptionMeta?.setAttribute('content', 'Practice with our extensive library of mock tests for NEET, JEE, UPSC and more. Simulate real exam conditions and get detailed performance analysis.');
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fetchedTests, allTextbooks] = await Promise.all([
          getAllContent("Mock Test"),
          getAllTextbooks(),
        ]);
        
        const textbooksMap = new Map((allTextbooks as Textbook[]).map(book => [book.id, book]));

        const testsWithTextbookMeta = (fetchedTests as Test[]).map(test => {
            if (test.textbookId && textbooksMap.has(test.textbookId)) {
                const textbook = textbooksMap.get(test.textbookId);
                return {
                    ...test,
                    textbookTitle: textbook?.title,
                    subject: test.subject || textbook?.subject,
                    board: test.board || textbook?.board,
                    classCategory: test.classCategory || textbook?.classCategory,
                    class: test.class || textbook?.class,
                    featureImage: test.featureImage || textbook?.featureImage,
                };
            }
            return test;
        });

        setTests(testsWithTextbookMeta);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error fetching data",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchInitialData();
  }, [toast]);
  
  const visibleTests = useMemo(() => {
    return tests.slice(0, visibleCount);
  }, [tests, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  return (
    <>
    <section className="relative w-full py-20 md:py-28 lg:py-36 text-white" style={{ background: 'linear-gradient(to right, #71B280, #134E5E)'}}>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg wave-text">
            <span>Mock</span> <span>Tests</span>
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto drop-shadow-md">
            Challenge yourself with our extensive library of mock tests designed to simulate the real exam experience. Get ready to ace your exams with realistic practice and detailed performance analysis.
          </p>
        </div>
    </section>
    <div className="bg-secondary/30">
      <div className="container py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="flex flex-col overflow-hidden bg-card-gradient text-white">
                  <CardHeader className="p-0 relative h-48">
                    <Skeleton className="w-full h-full rounded-t-lg bg-slate-700" />
                  </CardHeader>
                  <CardContent className="p-4 flex-grow space-y-2">
                      <Skeleton className="h-4 w-1/3 bg-slate-600" />
                      <Skeleton className="h-6 w-full bg-slate-600" />
                      <Skeleton className="h-10 w-full bg-slate-600" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-10 w-full bg-slate-600" />
                  </CardFooter>
              </Card>
            ))}
          </div>
        ) : tests.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleTests.map((test) => (
                <Card key={test.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow bg-card-gradient text-white">
                  <CardHeader className="p-0 relative h-48">
                    <Image
                      src={test.featureImage || `https://picsum.photos/seed/${test.id}/400/225`}
                      alt={test.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                      data-ai-hint={`${test.subject} abstract`}
                    />
                    <div className="absolute top-2 right-2">
                      <ContentBadge type={test.access} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                        {test.subject && <Badge variant="secondary">{test.subject}</Badge>}
                        {test.board && <Badge variant="outline">{test.board}</Badge>}
                        {test.class && <Badge variant="outline">{test.class}</Badge>}
                    </div>
                    <CardTitle className="font-headline text-lg mt-1 leading-snug">
                      {test.subtitle && <span className="text-primary block text-sm font-medium">{test.subtitle}</span>}
                      {test.title}
                    </CardTitle>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                      {test.textbookTitle && `From: ${test.textbookTitle}`}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                      <Link href={getUrlForTest(test)}>Start Test</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {visibleCount < tests.length && (
              <div className="mt-12 text-center">
                <Button onClick={handleLoadMore} size="lg">
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No mock tests found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
