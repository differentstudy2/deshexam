
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

type Submission = {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: any;
  testType: string;
  subject?: string;
};

export default function MyResultsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getSubmissionsByUserId(user.uid)
        .then(setSubmissions)
        .finally(() => setLoading(false));
    } else if (!loading) {
      setLoading(false);
    }
  }, [user, loading]);

  const aggregatedResults = useMemo(() => {
    const resultsMap = new Map<string, { highestScore: number; bestSubmission: Submission; testTitle: string, subject?: string, testType: string }>();

    submissions.forEach(sub => {
      const score = Math.round((sub.score / sub.totalQuestions) * 100);
      const existing = resultsMap.get(sub.testId);

      if (!existing || score > existing.highestScore) {
        resultsMap.set(sub.testId, {
          highestScore: score,
          bestSubmission: sub,
          testTitle: sub.testTitle,
          subject: (sub as any).test?.subject || sub.subject,
          testType: sub.testType,
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
                        <CardTitle className="flex items-center gap-2">
                           <BarChart className="w-5 h-5 text-primary"/>
                           {result.testTitle}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                           <Book className="w-4 h-4"/>
                           {result.subject || 'General'}
                        </CardDescription>
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
