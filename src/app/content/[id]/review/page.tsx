

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
import { Check, X, Loader2, ArrowLeft, ExternalLink, GripVertical, User, Calendar, Book, Layers, BarChart, GraduationCap, Target, School, BadgeCheck, FileQuestion, Clock, Star, ThumbsUp, ThumbsDown, CornerDownRight, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSubmissionById, getContentById, getUserProfile, handleQuestionVote } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';


type Option = { text: string; explanation?: string; };
type MatchingItem = { text: string; image?: string; };
type MatchingOptions = { columnA: MatchingItem[]; columnB: MatchingItem[]; };
type Question = { 
  id: string; 
  text: string; 
  type: string; 
  options?: Option[]; 
  matchingOptions?: MatchingOptions; 
  correctAnswer: any; 
  explanation?: string; 
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
};
type Test = { id: string; title: string; questions: Question[]; testType: string; board: string; subject: string; exam: string; chapter: string; duration: number; difficulty: string;};
type Submission = { id: string; testId: string; userId: string; score: number; totalQuestions: number; answers: { [key: string]: any }, testType: string; submittedAt: any; };
type UserProfile = { uid: string; displayName: string; photoURL?: string; school?: string; classGrade?: string; targetExam?: string; subscriptionPlan?: 'pro' | 'pass'; };


function QuestionReview({ question, userAnswer, questionIndex, onVote }: { question: Question, userAnswer: any, questionIndex: number, onVote: (questionId: string, voteType: 'like' | 'dislike') => void }) {
    const { user } = useAuth();
    const [isVoting, setIsVoting] = useState(false);

    let isCorrect = false;
    let matchingScore = 0;
    let totalPairs = 0;

    if (question.type === 'Matching') {
        totalPairs = question.correctAnswer.length;
        if (userAnswer && totalPairs > 0 && Array.isArray(question.correctAnswer)) {
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
    const userHasLiked = user && question.likedBy?.includes(user.uid);
    const userHasDisliked = user && question.dislikedBy?.includes(user.uid);

    return (
        <Card className="bg-card/60 backdrop-blur-sm px-6 pb-6 pt-0 shadow-none border scroll-m-24">
            <CardHeader className="p-0 pb-2">
                 <CardTitle className="flex items-baseline gap-2 text-xl font-semibold">
                    <span className="self-start">{questionIndex + 1}.</span>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                        {question.text}
                    </ReactMarkdown>
                </CardTitle>
                 <div className="flex justify-between items-center text-sm text-muted-foreground">
                     <div className="flex items-center gap-2">
                        {isCorrect ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Correct</Badge>
                        ) : (
                            <Badge variant="destructive">Incorrect</Badge>
                        )}
                        {question.id && <Button asChild variant="ghost" size="sm"><Link href={`/question/${question.id}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> View Discussion</Link></Button>}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                 {question.type === 'Multiple Choice' && question.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {question.options.map((option, optIndex) => {
                            const isUserAnswer = userAnswer === option.text;
                            const isCorrectAnswer = question.correctAnswer === option.text;

                            return (
                                <div key={optIndex} className={cn(
                                    "p-3 rounded-lg border flex items-start gap-3",
                                    isCorrectAnswer 
                                        ? "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                        : isUserAnswer 
                                            ? "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                            : "bg-secondary/30"
                                )}>
                                    {isCorrectAnswer 
                                        ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" /> 
                                        : <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                                    }
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p>{option.text}</p>
                                            {isUserAnswer && <Badge variant={isCorrectAnswer ? "default" : "destructive"} className="ml-2">Your Answer</Badge>}
                                        </div>
                                         {option.explanation && (
                                            <p className="text-xs text-muted-foreground mt-1">{option.explanation}</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
                 {question.type === 'True/False' && (
                    <div className="space-y-3 mt-4">
                        {['True', 'False'].map((tf, tfIndex) => {
                            const isUserAnswer = userAnswer === tf;
                            const isCorrectAnswer = question.correctAnswer === tf;
                            const option = question.options?.find(o => o.text === tf) ?? { text: tf, explanation: (question.options as any)?.[tfIndex]?.explanation };
                            
                            return (
                                <div key={tfIndex} className={cn(
                                    "p-3 rounded-lg border",
                                    isCorrectAnswer ? "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
                                    isUserAnswer ? "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800" : ""
                                )}>
                                    <div className="flex items-center gap-2">
                                        {isCorrectAnswer ? <CheckCircle className="w-5 h-5 text-green-600" /> : isUserAnswer ? <XCircle className="w-5 h-5 text-red-600" /> : <div className="w-5 h-5"/>}
                                        <span className="font-medium">{option.text}</span>
                                        {isUserAnswer && <Badge variant="secondary" className="ml-auto">Your Answer</Badge>}
                                        {isCorrectAnswer && !isUserAnswer && <Badge variant="outline" className="ml-auto">Correct</Badge>}
                                    </div>
                                    {option.explanation && (
                                        <div className="text-sm text-muted-foreground mt-2 pl-7 prose dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{option.explanation}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                 {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                    <div className="space-y-3 mt-4">
                       <div className="p-3 rounded-lg border bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="font-medium">{userAnswer || "No Answer"}</span>
                            <Badge variant="destructive" className="ml-auto">Your Answer</Badge>
                        </div>
                       </div>
                        <div className="p-3 rounded-lg border bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium">{question.correctAnswer}</span>
                            <Badge variant="outline" className="ml-auto">Correct Answer</Badge>
                        </div>
                       </div>
                    </div>
                )}
                 {question.type === 'Matching' && question.correctAnswer && (
                    <div className="space-y-2 mt-4">
                        {Array.isArray(question.correctAnswer) && question.correctAnswer.map((pair: {a: string, aImage?: string, b: string, bImage?: string}, pairIndex: number) => {
                            const userMatchedB = userAnswer?.[pair.a];
                            const correctBItem = question.matchingOptions?.columnB.find(item => item.text === pair.b);
                            const userMatchedItem = question.matchingOptions?.columnB.find(item => item.text === userMatchedB);
                            const isPairCorrect = userMatchedB === pair.b;
                            
                            return (
                                <div key={pairIndex} className={cn("p-3 border rounded-lg", isPairCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20')}>
                                    <div className="flex items-center gap-2">
                                        {isPairCorrect ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                                        <div className="flex flex-col items-center">
                                            {pair.aImage && <Image src={pair.aImage} alt={pair.a} width={40} height={40} className="rounded-md object-cover mb-1" />}
                                            <span className="font-semibold">{pair.a}</span>
                                        </div>
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex flex-col items-center">
                                             {userMatchedItem?.image && <Image src={userMatchedItem.image} alt={userMatchedItem.text} width={40} height={40} className="rounded-md object-cover mb-1" />}
                                            <span>{userMatchedB || <i className="text-muted-foreground">No answer</i>}</span>
                                        </div>
                                        {isPairCorrect ? <Badge variant="outline" className="bg-white">Correct</Badge> : <Badge variant="destructive">Incorrect</Badge>}
                                    </div>
                                    {!isPairCorrect && (
                                        <div className="mt-2 pl-7 text-sm flex items-center gap-2">
                                            <span className="font-semibold">Correct Answer: </span> 
                                            <div className="flex flex-col items-center text-green-700 dark:text-green-400">
                                                {correctBItem?.image && <Image src={correctBItem.image} alt={correctBItem.text} width={40} height={40} className="rounded-md object-cover mb-1" />}
                                                <span className="font-medium">{pair.b}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                 {question.explanation && (
                    <Card className="mt-4 bg-secondary/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Explanation</CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                {question.explanation}
                            </ReactMarkdown>
                        </CardContent>
                    </Card>
                )}
                 <div className="mt-4 flex items-center gap-2">
                    <Button 
                        variant={userHasLiked ? "default" : "outline"}
                        size="sm" 
                        onClick={() => onVote(question.id, 'like')} 
                        disabled={isVoting}
                        className={cn(userHasLiked && "bg-green-500 hover:bg-green-600 text-white")}
                    >
                        <ThumbsUp className="mr-2 h-4 w-4" /> Like ({question.likes || 0})
                    </Button>
                    <Button 
                        variant={userHasDisliked ? "destructive" : "outline"} 
                        size="sm" 
                        onClick={() => onVote(question.id, 'dislike')} 
                        disabled={isVoting}
                    >
                        <ThumbsDown className="mr-2 h-4 w-4" /> Dislike ({question.dislikes || 0})
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};


function ReviewDisplay() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const { toast } = useToast();
  const { user } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState<{[key: string]: boolean}>({});

  const fetchReviewData = useCallback(async () => {
    if (!submissionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No submission ID found in the URL.",
      });
      setLoading(false);
      return;
    }

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
  }, [submissionId, toast]);

  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);


    const handleVote = async (questionId: string, voteType: 'like' | 'dislike') => {
        if (!user || !test) {
            toast({ variant: "destructive", title: "Please log in to vote." });
            return;
        }
        if (isVoting[questionId]) return;

        setIsVoting(prev => ({...prev, [questionId]: true}));
        
        const originalQuestions = test.questions;
        const updatedQuestions = test.questions.map(q => {
            if (q.id === questionId) {
                const hasLiked = q.likedBy?.includes(user.uid);
                const hasDisliked = q.dislikedBy?.includes(user.uid);
                let newLikedBy = [...(q.likedBy || [])];
                let newDislikedBy = [...(q.dislikedBy || [])];

                if (voteType === 'like') {
                    if (hasLiked) {
                        newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
                    } else {
                        newLikedBy.push(user.uid);
                        if (hasDisliked) {
                            newDislikedBy = newDislikedBy.filter(uid => uid !== user.uid);
                        }
                    }
                } else {
                    if (hasDisliked) {
                        newDislikedBy = newDislikedBy.filter(uid => uid !== user.uid);
                    } else {
                        newDislikedBy.push(user.uid);
                        if (hasLiked) {
                            newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
                        }
                    }
                }
                return {
                    ...q,
                    likedBy: newLikedBy,
                    dislikedBy: newDislikedBy,
                    likes: newLikedBy.length,
                    dislikes: newDislikedBy.length
                };
            }
            return q;
        });

        setTest(prevTest => prevTest ? { ...prevTest, questions: updatedQuestions } : null);

        try {
            await handleQuestionVote(questionId, voteType);
        } catch (error) {
            setTest(prevTest => prevTest ? { ...prevTest, questions: originalQuestions } : null);
            toast({
              variant: "destructive",
              title: 'Error submitting vote',
              description: (error as Error).message,
            });
        } finally {
            setIsVoting(prev => ({...prev, [questionId]: false}));
        }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Review...</p>
      </div>
    );
  }

  if (!submission || !test || !student) {
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

  const { answers, score, totalQuestions, testType } = submission;
  const percentage = Math.round((totalQuestions > 0 ? (score / totalQuestions) * 100 : 0));
  const submittedAtDate = submission.submittedAt ? new Date(submission.submittedAt) : null;


  return (
    <>
      <Card className="max-w-4xl mx-auto mb-8">
         <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4">
                     <Avatar className="h-16 w-16">
                        <AvatarImage src={student?.photoURL || `https://picsum.photos/seed/${student?.uid}/64/64`} />
                        <AvatarFallback>{student?.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                        <h3 className="text-lg font-semibold">{student?.displayName}</h3>
                        <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-600"><BadgeCheck className="w-3.5 h-3.5 mr-1"/>Verified</Badge>
                         {student.subscriptionPlan === 'pro' && (
                            <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-600">
                                <Crown className="w-3.5 h-3.5 mr-1" /> Pass Pro
                            </Badge>
                        )}
                        {student.subscriptionPlan === 'pass' && (
                            <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-600">
                                <Gem className="w-3.5 h-3.5 mr-1" /> Pass
                            </Badge>
                        )}
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 pt-1">
                            {student?.school && <div className="flex items-center gap-1.5"><School className="w-4 h-4" />{student.school}</div>}
                            {student?.classGrade && <div className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />{student.classGrade}</div>}
                            {student?.targetExam && <div className="flex items-center gap-1.5"><Target className="w-4 h-4" />{student.targetExam}</div>}
                        </div>
                    </div>
                </div>
                <div className="flex items-end gap-6 mt-4 md:mt-0">
                    <div className="text-center md:text-right">
                        <div className="text-3xl font-bold">{score}/{totalQuestions}</div>
                        <div className="text-xs font-semibold text-muted-foreground">Marks Obtained</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <ScoreCircle score={percentage} size={60} strokeWidth={5}/>
                        <span className="text-xs font-semibold text-muted-foreground mt-1">Your Score</span>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground col-span-full lg:col-span-1"><FileQuestion className="w-4 h-4"/> <strong>Test:</strong> <span className="text-foreground">{test.title}</span></div>
                {test.chapter && <div className="flex items-center gap-2 text-muted-foreground col-span-full lg:col-span-2"><Layers className="w-4 h-4" /> <strong>Chapter:</strong> <span className="text-foreground">{test.chapter}</span></div>}

                {test.subject && <div className="flex items-center gap-2 text-muted-foreground"><Book className="w-4 h-4"/> <strong>Subject:</strong> <span className="text-foreground">{test.subject}</span></div>}
                {test.board && <div className="flex items-center gap-2 text-muted-foreground"><Layers className="w-4 h-4"/> <strong>Board:</strong> <span className="text-foreground">{test.board}</span></div>}
                {test.exam && <div className="flex items-center gap-2 text-muted-foreground"><Layers className="w-4 h-4"/> <strong>Exam:</strong> <span className="text-foreground">{test.exam}</span></div>}
                
                {totalQuestions > 0 && <div className="flex items-center gap-2 text-muted-foreground"><BarChart className="w-4 h-4"/> <strong>Full Marks:</strong> <span className="text-foreground">{totalQuestions}</span></div>}
                
                {test.duration > 0 && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4"/> <strong>Duration:</strong> <span className="text-foreground">{test.duration} min</span></div>}
                {test.difficulty && <div className="flex items-center gap-2 text-muted-foreground"><BarChart className="w-4 h-4"/> <strong>Difficulty:</strong> <span className="text-foreground">{test.difficulty}</span></div>}
                {test.testType && <div className="flex items-center gap-2 text-muted-foreground"><Star className="w-4 h-4"/> <strong>Type:</strong> <span className="text-foreground">{test.testType}</span></div>}
                
                {submittedAtDate && submittedAtDate.toString() !== 'Invalid Date' && (
                    <>
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4"/> <strong>Date:</strong> <span className="text-foreground">{submittedAtDate.toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4"/> <strong>Time:</strong> <span className="text-foreground">{submittedAtDate.toLocaleTimeString()}</span></div>
                    </>
                )}
            </div>
        </CardContent>
      </Card>

        <Card className="max-w-4xl mx-auto">
            <CardHeader>
            <CardTitle>Detailed Answer Review</CardTitle>
            <CardDescription>Check your answers for "{test.title}" below to see where you can improve.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            {test.questions.map((question, index) => (
                <QuestionReview
                    key={question.id}
                    question={question}
                    userAnswer={answers[question.id]}
                    questionIndex={index}
                    onVote={handleVote}
                />
            ))}
            </CardContent>
        </Card>
      </>
    );
}

export default function TestReviewPage() {
  const [testType, setTestType] = useState('Test');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const getTestType = async () => {
        const submissionId = searchParams.get('submissionId');
        if(submissionId) {
            const sub = await getSubmissionById(submissionId);
            if(sub) {
                setTestType(sub.testType);
            }
        }
    }
    getTestType();
  }, [searchParams]);

  return (
    <div className="container py-8 sm:py-12 md:max-w-4xl">
       <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center text-center md:text-left mb-8 px-4 sm:px-0">
        <div>
            <h1 className="font-headline text-4xl font-bold">Answer Review</h1>
            <p className="text-muted-foreground">Let's see how you did.</p>
        </div>
        <Button asChild variant="outline">
            <Link href={`/${testType.toLowerCase().replace(/\\s+/g, '-')}/${useParams().id}/results?submissionId=${searchParams.get('submissionId')}`}>
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
