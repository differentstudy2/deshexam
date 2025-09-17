
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSubmissionById, getTestById } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type Option = { text: string; };
type Question = { text: string; type: string; options?: Option[]; correctAnswer: string; };
type Test = { id: string; title: string; questions: Question[]; };
type Submission = { id: string; testId: string; score: number; totalQuestions: number; answers: { [key: string]: string } };

function ReviewDisplay() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const { toast } = useToast();

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
          title: "Error loading review",
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
        <p className="ml-4 text-lg">Loading Review...</p>
      </div>
    );
  }

  if (!submission || !test) {
    return (
      <div className="text-center min-h-[400px] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Review not found</h2>
        <p className="text-muted-foreground">We couldn't load the review for this test submission.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline">
          <Link href="/mock-tests">Back to Tests</Link>
        </Button>
      </div>
    );
  }

  const { answers } = submission;

  return (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Review Your Answers</CardTitle>
          <CardDescription>Check your answers for "{test.title}" below to see where you can improve.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {test.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            return (
              <div key={index}>
                <div className="flex items-start gap-4">
                  <div>
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{index + 1}. {question.text}</p>
                    <div className="mt-2 text-sm space-y-2">
                      <div className={cn("p-2 rounded-md", isCorrect ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20")}>
                        <span className="font-medium">Your Answer: </span>
                        <span>{userAnswer || "No answer"}</span>
                      </div>
                      {!isCorrect && (
                         <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                           <span className="font-medium">Correct Answer: </span>
                           <span>{question.correctAnswer}</span>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < test.questions.length -1 && <Separator className="mt-6" />}
              </div>
            );
          })}
        </CardContent>
      </Card>
  );
}

export default function TestReviewPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const testId = params.id;

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="font-headline text-4xl font-bold">Answer Review</h1>
            <p className="text-muted-foreground">Let's see how you did.</p>
        </div>
        <Button asChild variant="outline">
            <Link href={`/mock-tests/${testId}/results?submissionId=${submissionId}`}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Results
            </Link>
        </Button>
      </div>
      <Suspense fallback={<div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>}>
        <ReviewDisplay />
      </Suspense>
    </div>
  );
}


