
'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, HelpCircle, BarChart, Loader2 } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { MockTestFilters } from "@/components/mock-test-filters";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAllContent } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

type Test = {
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

export default function MockTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchInitialTests = async () => {
      try {
        const fetchedTests = (await getAllContent("Mock Test")) as Test[];
        setTests(fetchedTests);
        const uniqueSubjects = Array.from(new Set(fetchedTests.map((test) => test.subject))).filter(Boolean) as string[];
        setSubjects(uniqueSubjects);
        setLoading(false);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error fetching tests",
          description: (error as Error).message,
        });
        setLoading(false);
      }
    }
    
    fetchInitialTests();

  }, [toast]);

  useEffect(() => {
    if(!user) return; // Don't attach listener if user is not logged in
    
    const q = query(collection(db, "content"), where("testType", "==", "Mock Test"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Test[];
      
      setTests(fetchedTests);
      const uniqueSubjects = Array.from(new Set(fetchedTests.map((test: any) => test.subject))).filter(Boolean) as string[];
      setSubjects(uniqueSubjects);
    }, (error) => {
      console.error("Error fetching mock tests in real-time: ", error);
      toast({
        variant: "destructive",
        title: "Error fetching real-time data",
        description: (error as Error).message,
      });
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [toast, user]);

  return (
    <div className="container py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Mock Tests</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Challenge yourself with our extensive library of mock tests designed to simulate the real exam experience.
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
      ) : tests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
              <CardHeader className="p-0 relative">
                <Image
                  src={`https://picsum.photos/seed/${test.id}/400/225`}
                  alt={test.title}
                  width={400}
                  height={225}
                  className="w-full h-auto object-cover"
                  data-ai-hint={`${test.subject} abstract`}
                />
                <div className="absolute top-2 right-2">
                  <ContentBadge type={test.access} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <p className="text-sm font-medium text-primary">{test.subject}</p>
                <CardTitle className="font-headline text-lg mt-1 mb-2 leading-tight">{test.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{test.questions.length} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{test.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart className="w-4 h-4" />
                    <span>{test.difficulty}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={getUrlForTest(test.testType, test.id)}>Start Test</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No mock tests found.</p>
        </div>
      )}
    </div>
  );
}
