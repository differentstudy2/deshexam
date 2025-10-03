
'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, HelpCircle, BarChart, Loader2, ArrowLeft } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { getAllContent, getAllTextbooks } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type ContentItem = {
  id: string;
  title: string;
  subject: string;
  questions?: any[];
  duration?: number;
  difficulty?: string;
  access: "free" | "premium" | "pro";
  testType: string;
  classCategory?: string; // class maps to category ID
  class?: string; // grade
};

function getUrlForTest(testType: string, testId: string) {
    if (testType === 'Textbook') {
        return `/textbook-solutions/${testId}`;
    }
  const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
  return `/${typeSlug}/${testId}`;
}

export default function PrimaryClassPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const slug = 'Primary'; // Corresponds to the class name in Firestore
  const pageTitle = 'Primary Class';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const [testsAndQuizzes, textbooks] = await Promise.all([
            getAllContent(),
            getAllTextbooks()
        ]);

        const allContent = [...(testsAndQuizzes as ContentItem[]), ...(textbooks as ContentItem[])];
        
        const filteredContent = allContent.filter(item => 
            item.classCategory?.toLowerCase() === slug.toLowerCase() || item.class?.toLowerCase() === slug.toLowerCase()
        );
        setContent(filteredContent);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error fetching content",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchContent();

  }, [slug, toast]);

  return (
    <div className="container py-12 md:py-16">
        <div className="mb-8">
             <Button asChild variant="ghost">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">{pageTitle} Content</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Find all the mock tests, quizzes, and textbook solutions for your class.
        </p>
      </header>

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
      ) : content.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
              <CardHeader className="p-0 relative">
                <Image
                  src={(item as any).featureImage || `https://picsum.photos/seed/${item.id}/400/225`}
                  alt={item.title}
                  width={400}
                  height={225}
                  className="w-full h-auto object-cover"
                  data-ai-hint={`${item.subject} abstract`}
                />
                <div className="absolute top-2 right-2">
                  <ContentBadge type={item.access} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <p className="text-sm font-medium text-primary">{item.subject}</p>
                <CardTitle className="font-headline text-lg mt-1 mb-2 leading-snug">{item.title}</CardTitle>
                {item.testType !== 'Textbook' && (
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>{item.questions?.length || 0} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{item.duration || item.questions?.length || 0} min</span>
                      </div>
                       {item.difficulty && <div className="flex items-center gap-1.5">
                        <BarChart className="w-4 h-4" />
                        <span>{item.difficulty}</span>
                      </div>}
                    </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={getUrlForTest(item.testType, item.id)}>
                    {item.testType === 'Textbook' ? 'View Solutions' : 'Start'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No content found for the "{pageTitle}" class yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
