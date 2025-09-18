

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, ArrowLeft, ExternalLink, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSubmissionById, getContentById } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type Option = { text: string; explanation?: string; };
type MatchingOptions = { columnA: string[]; columnB: string[]; };
type Question = { id: string; text: string; type: string; options?: Option[]; matchingOptions?: MatchingOptions; correctAnswer: any; explanation?: string; };
type Test = { id: string; title: string; questions: Question[]; testType: string; };
type Submission = { id: string; testId: string; score: number; totalQuestions: number; answers: { [key: string]: any }, testType: string; };

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
          const testData = await getContentById(submissionData.testId) as Test;
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
          <Link href="/content">Back to Content</Link>
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
            let isCorrect = false;

            if (question.type === 'Matching') {
                const correctAnswers = question.correctAnswer;
                const userAnswers = userAnswer;
                let allMatch = true;
                if(!userAnswers || Object.keys(userAnswers).length !== correctAnswers.length) {
                    allMatch = false;
                } else {
                    for(const pair of correctAnswers) {
                        if (userAnswers[pair.a] !== pair.b) {
                            allMatch = false;
                            break;
                        }
                    }
                }
                isCorrect = allMatch;
            } else {
                isCorrect = userAnswer === question.correctAnswer;
            }
            
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
                    <div className="flex justify-between items-start">
                        <p className="font-semibold">{index + 1}. {question.text}</p>
                        {question.id && (
                             <Button asChild variant="ghost" size="sm">
                                <Link href={`/question/${question.id}`} target="_blank">
                                    <ExternalLink className="h-4 w-4 mr-2" /> View
                                </Link>
                            </Button>
                        )}
                    </div>
                     <div className="mt-4 space-y-2">
                        {question.type === 'Multiple Choice' && question.options?.map((option, optIndex) => {
                            const isUserAnswer = userAnswer === option.text;
                            const isCorrectAnswer = question.correctAnswer === option.text;

                            return (
                                <div key={optIndex} className={cn(
                                    "p-3 rounded-lg border",
                                    isUserAnswer && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                                    isCorrectAnswer && "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                )}>
                                    <div className="flex items-center">
                                       <span className="font-medium">{option.text}</span>
                                       {isUserAnswer && <Badge variant="secondary" className="ml-2">Your Answer</Badge>}
                                       {isCorrectAnswer && !isUserAnswer && <Badge variant="outline" className="ml-2">Correct Answer</Badge>}
                                    </div>
                                    {option.explanation && (
                                        <p className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 ml-1">
                                            {option.explanation}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                         {question.type === 'True/False' && (
                             <>
                                {['True', 'False'].map((tf, tfIndex) => {
                                    const isUserAnswer = userAnswer === tf;
                                    const isCorrectAnswer = question.correctAnswer === tf;
                                    const option = question.options?.find(o => o.text === tf) ?? { text: tf, explanation: (question.options as any)?.[tfIndex]?.explanation };
                                    
                                    return (
                                        <div key={tfIndex} className={cn(
                                            "p-3 rounded-lg border",
                                            isUserAnswer && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                                            isCorrectAnswer && "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                        )}>
                                            <div className="flex items-center">
                                                <span className="font-medium">{option.text}</span>
                                                {isUserAnswer && <Badge variant="secondary" className="ml-2">Your Answer</Badge>}
                                                {isCorrectAnswer && !isUserAnswer && <Badge variant="outline" className="ml-2">Correct Answer</Badge>}
                                            </div>
                                            {option.explanation && (
                                                <p className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 ml-1">
                                                    {option.explanation}
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                            </>
                         )}
                         {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                            <>
                               <div className="p-3 rounded-lg border bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                   <div className="flex items-center">
                                      <span className="font-medium">{userAnswer}</span>
                                      <Badge variant="secondary" className="ml-2">Your Answer</Badge>
                                   </div>
                               </div>
                                <div className="p-3 rounded-lg border bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                   <div className="flex items-center">
                                      <span className="font-medium">{question.correctAnswer}</span>
                                      <Badge variant="outline" className="ml-2">Correct Answer</Badge>
                                   </div>
                               </div>
                            </>
                         )}
                         {question.type === 'Matching' && (
                             <div className="space-y-2">
                                <div className="grid grid-cols-[1fr_1fr] gap-4 font-semibold">
                                    <div className="text-center">Your Answer</div>
                                    <div className="text-center">Correct Answer</div>
                                </div>
                                {question.correctAnswer.map((pair: {a: string, b: string}, pairIndex: number) => {
                                    const userMatch = userAnswer ? userAnswer[pair.a] : '';
                                    const isPairCorrect = userMatch === pair.b;
                                    return (
                                        <div key={pairIndex} className="grid grid-cols-[1fr_1fr] gap-4">
                                            <div className="flex items-center justify-center p-2 border rounded-md">
                                                <span>{pair.a}</span>
                                                <GripVertical className="h-4 w-4 mx-2 text-muted-foreground" />
                                                <span>{userMatch}</span>
                                            </div>
                                            <div className="flex items-center justify-center p-2 border rounded-md bg-green-100/60 dark:bg-green-900/20">
                                                <span>{pair.a}</span>
                                                 <GripVertical className="h-4 w-4 mx-2 text-muted-foreground" />
                                                <span>{pair.b}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                             </div>
                         )}
                     </div>
                      {question.explanation && (
                         <div className="mt-4 p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                           <h4 className="font-semibold text-sm mb-1">General Explanation</h4>
                           <p className="text-sm">{question.explanation}</p>
                         </div>
                      )}
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

export default function TestReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const testId = params.id as string;
  const [testType, setTestType] = useState('');

  useEffect(() => {
      const getTestType = async () => {
          if (submissionId) {
              const sub = await getSubmissionById(submissionId);
              if (sub) {
                setTestType(sub.testType.toLowerCase().replace(/\s+/g, '-'));
              }
          }
      }
      getTestType();
  }, [submissionId]);


  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="font-headline text-4xl font-bold">Answer Review</h1>
            <p className="text-muted-foreground">Let's see how you did.</p>
        </div>
        <Button asChild variant="outline">
            <Link href={`/${testType}/${testId}/results?submissionId=${submissionId}`}>
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
