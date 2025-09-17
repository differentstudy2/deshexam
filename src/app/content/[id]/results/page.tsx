
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Award, CheckCircle, XCircle, Loader2, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getSubmissionById, getTestById } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type Submission = { id: string; testId: string; score: number; totalQuestions: number; answers: { [key: string]: string }, testType: string };
type Test = { id: string; title: string; testType: string; };

function ResultsDisplay() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const { toast } = useToast();
  const pathname = usePathname();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No submission ID found in the URL.",
      });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const submissionData = await getSubmissionById(submissionId) as Submission;
        if (submissionData) {
          setSubmission(submissionData);
           const testData = await getTestById(submissionData.testId) as Test;
           setTest(testData);
        } else {
          throw new Error("Submission not found.");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading results",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Your Results...</p>
      </div>
    );
  }

  if (!submission || !test) {
    return (
      <div className="text-center min-h-[400px] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Results not found</h2>
        <p className="text-muted-foreground">We couldn't load the results for this test.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline">
          <Link href="/content">Back to Content</Link>
        </Button>
      </div>
    );
  }

  const { score, totalQuestions, testType } = submission;
  const percentage = Math.round((score / totalQuestions) * 100);
  const correctAnswers = score;
  const incorrectAnswers = totalQuestions - score;
  const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
  const contentBaseUrl = `/${typeSlug}`;

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl">Congratulations!</CardTitle>
          <CardDescription>You've completed the {test.title}.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <div>
            <p className="text-muted-foreground text-sm">Your Score</p>
            <p className="text-5xl font-bold">{percentage}%</p>
          </div>
          <Progress value={percentage} className="w-full h-3" />
          <div className="flex justify-around pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalQuestions}</p>
              <p className="text-muted-foreground">Total Questions</p>
            </div>
            <div className="text-center text-green-600">
              <p className="text-2xl font-bold flex items-center justify-center gap-2">
                <CheckCircle /> {correctAnswers}
              </p>
              <p className="text-muted-foreground">Correct</p>
            </div>
            <div className="text-center text-destructive">
              <p className="text-2xl font-bold flex items-center justify-center gap-2">
                <XCircle /> {incorrectAnswers}
              </p>
              <p className="text-muted-foreground">Incorrect</p>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-6">
            <Button asChild>
              <Link href={`${contentBaseUrl}/${test.id}/review?submissionId=${submissionId}`}>
                <FileQuestion className="mr-2"/>
                Review Answers
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`${contentBaseUrl}/${test.id}`}>Try Again</Link>
            </Button>
          </div>
           <div className="pt-4">
                <Button variant="link" asChild>
                    <Link href={contentBaseUrl}>Back to {test.testType}s</Link>
                </Button>
           </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function TestResultsPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const [testType, setTestType] = useState('Test');
  
  useEffect(() => {
    const getTestType = async () => {
        if(submissionId) {
            const sub = await getSubmissionById(submissionId);
            if(sub) {
                setTestType(sub.testType);
            }
        }
    }
    getTestType();
  }, [submissionId]);

  return (
    <div className="container py-12">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold">{testType} Results</h1>
        <p className="text-muted-foreground">Here's how you performed on the {testType.toLowerCase()}.</p>
      </header>
      <Suspense fallback={<div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>}>
        <ResultsDisplay />
      </Suspense>
    </div>
  );
}
