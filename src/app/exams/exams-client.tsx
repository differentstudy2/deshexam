
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, HelpCircle, BarChart, Loader2 } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { useToast } from '@/hooks/use-toast';
import { getAllContent } from '@/lib/firebase/firestore';
import { MockTestFilters } from "@/components/mock-test-filters";
import { Skeleton } from '@/components/ui/skeleton';

type Exam = {
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

export default function ExamsClientPage({ initialExams }: { initialExams: Exam[] }) {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialExams) {
        const uniqueSubjects = Array.from(new Set(initialExams.map((exam) => exam.subject))).filter(Boolean) as string[];
        setSubjects(uniqueSubjects);
    }
  }, [initialExams]);


  return (
    <>
      <section className="relative w-full py-20 md:py-28 lg:py-36 text-white" style={{ background: 'linear-gradient(to right, #71B280, #134E5E)' }}>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg wave-text">
            <span>Official</span> <span>Exam</span> <span>Papers</span>
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto drop-shadow-md">
            Challenge yourself with our extensive library of official exams and previous year papers designed to simulate the real exam experience and boost your preparation.
          </p>
        </div>
      </section>

      <div className="bg-secondary/30">
        <div className="container py-12 md:py-16">

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
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
          ) : exams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <Card key={exam.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow bg-card-gradient text-white">
                  <CardHeader className="p-0 relative h-48">
                    <Image
                      src={exam.featureImage || `https://picsum.photos/seed/${exam.id}/400/225`}
                      alt={exam.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                      data-ai-hint={`${exam.subject} abstract`}
                    />
                    <div className="absolute top-2 right-2">
                      <ContentBadge type={exam.access} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <p className="text-sm font-medium text-primary">{exam.subject}</p>
                    <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug">{exam.title}</CardTitle>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {exam.description || `A comprehensive exam covering ${exam.subject}.`}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                      <Link href={getUrlForTest(exam.testType, exam.id)}>Start Exam</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No exams found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
