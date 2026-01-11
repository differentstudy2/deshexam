
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { FileText, Loader2, Eye, BarChart, Book } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState, useMemo } from 'react';
import { getSubmissionsByUserId } from '@/lib/firebase/firestore';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type Submission = {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: any;
  testType: string;
  subject?: string;
  board?: string;
  class?: string;
  exam?: string;
};

export default function MyResultsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = getSubmissionsByUserId(
        user.uid, 
        (userSubmissions) => {
            setSubmissions(userSubmissions);
            setLoading(false);
        }, 
        (error) => {
            console.error("Error fetching submissions:", error);
            toast({
                variant: 'destructive',
                title: 'Error loading results',
                description: error.message,
            });
            setLoading(false);
        }
    );

    return () => unsubscribe();
    
  }, [user, toast]);

  const aggregatedResults = useMemo(() => {
    const resultsMap = new Map<string, { highestScore: number; bestSubmission: Submission; testTitle: string, subject?: string, testType: string, board?: string, class?: string }>();

    submissions.forEach(sub => {
      const score = sub.totalQuestions > 0 ? Math.round((sub.score / sub.totalQuestions) * 100) : 0;
      const existing = resultsMap.get(sub.testId);

      if (!existing || score > existing.highestScore) {
        resultsMap.set(sub.testId, {
          highestScore: score,
          bestSubmission: sub,
          testTitle: sub.testTitle,
          subject: sub.subject,
          testType: sub.testType,
          board: sub.board,
          class: sub.class
        });
      }
    });
    return Array.from(resultsMap.values());
  }, [submissions]);
  
  const getUrlForResults = (submission: Submission) => {
    const typeSlug = (submission.testType || 'content').toLowerCase().replace(/\s+/g, '-');
    if (submission.testType === 'Practice Set') {
        const test = (submission as any).test;
        return `/textbook-solutions/practice-set/${submission.testId}/results?submissionId=${submission.id}`;
    }
    return `/${typeSlug}/${submission.testId}/results?submissionId=${submission.id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Your Results...</p>
      </div>
    );
  }


  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">My Results</h1>
      <p className="text-muted-foreground mb-6">
        Review your performance on all the tests you have taken. Here's a summary of your best attempts.
      </p>
       {submissions.length === 0 ? (
            <Card className="min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground p-6">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">No Results Yet</h3>
                    <p>You have not completed any tests yet. Once you do, your best results will appear here.</p>
                </CardContent>
            </Card>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aggregatedResults.map(result => (
                <Card key={result.bestSubmission.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <CardTitle className="flex items-start gap-2">
                                <BarChart className="w-5 h-5 text-primary mt-1 flex-shrink-0"/>
                                {result.testTitle}
                             </CardTitle>
                        </div>
                         <div className="flex flex-wrap gap-1.5 pt-1">
                            <Badge variant="secondary">{result.testType}</Badge>
                            {result.subject && <Badge variant="outline">{result.subject}</Badge>}
                            {result.bestSubmission.board && <Badge variant="outline">{result.bestSubmission.board}</Badge>}
                            {result.bestSubmission.class && <Badge variant="outline">{result.bestSubmission.class}</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-4">
                        <ScoreCircle score={result.highestScore} size={80} strokeWidth={6} />
                        <p className="font-bold text-lg">Highest Score</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href={getUrlForResults(result.bestSubmission)}>
                                <Eye className="mr-2"/>
                                Review Best Attempt
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
       )}
    </div>
  );
}
