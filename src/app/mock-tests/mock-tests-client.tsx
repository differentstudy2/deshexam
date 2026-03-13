
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
import { Badge } from '@/components/ui/badge';
import type { Textbook } from '@/lib/types';

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
  description?: string;
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

export default function MockTestsClientPage({ initialTests }: { initialTests: Test[] }) {
  const [tests, setTests] = useState<Test[]>(initialTests);
  const [loading, setLoading] = useState(false); // Data is pre-fetched
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialTests) {
      const uniqueSubjects = Array.from(new Set(initialTests.map((exam) => exam.subject))).filter(Boolean) as string[];
      setSubjects(uniqueSubjects);
    }
  }, [initialTests]);
  
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
    <div className="bg-background">
      <div className="container py-12 md:py-16">
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
        ) : tests.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleTests.map((test) => (
                <Card key={test.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
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
                    <CardTitle className="font-headline text-xl mt-1 leading-snug">
                      {test.subtitle && <span className="text-primary block text-sm font-medium">{test.subtitle}</span>}
                      {test.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {test.description || (test.textbookTitle && `From: ${test.textbookTitle}`)}
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
