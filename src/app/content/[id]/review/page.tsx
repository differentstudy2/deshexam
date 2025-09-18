

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
import { CheckCircle, XCircle, Loader2, ArrowLeft, ExternalLink, GripVertical, User, Calendar, Book, Layers, BarChart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSubmissionById, getContentById, getUserProfile } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';


type Option = { text: string; explanation?: string; };
type MatchingOptions = { columnA: string[]; columnB: string[]; };
type Question = { id: string; text: string; type: string; options?: Option[]; matchingOptions?: MatchingOptions; correctAnswer: any; explanation?: string; };
type Test = { id: string; title: string; questions: Question[]; testType: string; board: string; subject: string; chapter: string; exam: string; };
type Submission = { id: string; testId: string; userId: string; score: number; totalQuestions: number; answers: { [key: string]: any }, testType: string; submittedAt: any; };
type UserProfile = { uid: string; displayName: string; photoURL?: string; };

function ReviewDisplay() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const { toast } = useToast();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [student, setStudent] = useState<UserProfile | null>(null);
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
          const [testData, studentData] = await Promise.all([
             getContentById(submissionData.testId) as Promise<Test>,
             getUserProfile(submissionData.userId) as Promise<UserProfile>
          ]);
          setTest(testData);
          setStudent(studentData);
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

  const { answers, score, totalQuestions, submittedAt } = submission;
  const percentage = Math.round((score / totalQuestions) * 100);
  const submissionDate = submittedAt ? format(submittedAt.toDate(), "PPP") : 'N/A';

  return (
      <>
        <Card className="max-w-4xl mx-auto mb-8">
            <CardHeader>
                <CardTitle>Review Summary</CardTitle>
                <CardDescription>A summary of the test submission and student details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={student?.photoURL || `https://picsum.photos/seed/${student?.uid}/64/64`} />
                        <AvatarFallback>{student?.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-semibold">{student?.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{test.title}</p>
                    </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {test.subject && <div className="flex items-center gap-2 text-muted-foreground"><Book className="w-4 h-4"/> <strong>Subject:</strong> <span className="text-foreground">{test.subject}</span></div>}
                    {test.board && <div className="flex items-center gap-2 text-muted-foreground"><Layers className="w-4 h-4"/> <strong>Board:</strong> <span className="text-foreground">{test.board}</span></div>}
                    {test.chapter && <div className="flex items-center gap-2 text-muted-foreground"><Layers className="w-4 h-4"/> <strong>Chapter:</strong> <span className="text-foreground">{test.chapter}</span></div>}
                    {test.exam && <div className="flex items-center gap-2 text-muted-foreground"><Layers className="w-4 h-4"/> <strong>Exam:</strong> <span className="text-foreground">{test.exam}</span></div>}
                    <div className="flex items-center gap-2 text-muted-foreground"><BarChart className="w-4 h-4"/> <strong>Score:</strong> <span className="text-foreground">{score}/{totalQuestions} ({percentage}%)</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4"/> <strong>Date:</strong> <span className="text-foreground">{submissionDate}</span></div>
                </div>
            </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto">
            <CardHeader>
            <CardTitle>Detailed Answer Review</CardTitle>
            <CardDescription>Check your answers for "{test.title}" below to see where you can improve.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            {test.questions.map((question, index) => {
                const userAnswer = answers[index];
                let isCorrect = false;
                let matchingScore = 0;
                let totalPairs = 0;

                if (question.type === 'Matching') {
                    totalPairs = question.correctAnswer.length;
                    if (userAnswer && totalPairs > 0) {
                        for(const pair of question.correctAnswer) {
                            if (userAnswer[pair.a] === pair.b) {
                                matchingScore++;
                            }
                        }
                    }
                    isCorrect = matchingScore === totalPairs;
                } else {
                    isCorrect = userAnswer === question.correctAnswer;
                }
                
                const matchingPercentage = totalPairs > 0 ? (matchingScore / totalPairs) * 100 : 0;
                
                return (
                <div key={index}>
                    <div className="flex items-start gap-4">
                    <div>
                        {question.type === 'Matching' ? (
                        <ScoreCircle score={matchingPercentage} size={36} />
                        ) : isCorrect ? (
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
                            {question.type === 'Matching' && question.correctAnswer && (
                                <div className="space-y-2">
                                    {question.correctAnswer.map((pair: {a: string, b: string}, pairIndex: number) => {
                                        const userMatchedB = userAnswer?.[pair.a];
                                        const isPairCorrect = userMatchedB === pair.b;
                                        return (
                                            <div key={pairIndex} className={cn("p-3 border rounded-lg", isPairCorrect ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20')}>
                                                <div className="flex items-center gap-2">
                                                    {isPairCorrect ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                                                    <span className="font-semibold">{pair.a}</span>
                                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                    <span>{userMatchedB || <i className="text-muted-foreground">No answer</i>}</span>
                                                    {isPairCorrect ? <Badge variant="outline" className="bg-white">Correct</Badge> : <Badge variant="destructive">Incorrect</Badge>}
                                                </div>
                                                {!isPairCorrect && (
                                                    <div className="mt-2 pl-7 text-sm">
                                                        <span className="font-semibold">Correct Answer: </span>
                                                        <span className="text-green-700 dark:text-green-400 font-medium">{pair.b}</span>
                                                    </div>
                                                )}
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
      </>
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





