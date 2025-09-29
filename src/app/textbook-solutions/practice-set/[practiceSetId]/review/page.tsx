
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
import { CheckCircle, XCircle, Loader2, ArrowLeft, GripVertical, User, Calendar, Book, Layers, BarChart, GraduationCap, Target, School, BadgeCheck, FileQuestion, Clock, Star, ThumbsUp, ThumbsDown, ExternalLink, Crown, Gem } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSubmissionById, getUserProfile, handleQuestionVote, getQuestionsByPracticeSet } from '@/lib/firebase/firestore';
import type { Textbook, Topic, Question } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';

type Submission = { 
    id: string; 
    practiceSetId: string; 
    practiceSetTitle: string;
    topicId: string;
    topicTitle: string;
    chapterId: string;
    textbookId: string;
    userId: string; 
    score: number; 
    totalQuestions: number; 
    answers: { [key: string]: any };
    submittedAt: any;
    timeTaken: number;
};

type UserProfile = { uid: string; displayName: string; photoURL?: string; school?: string; classGrade?: string; targetExam?: string; subscriptionPlan?: 'pro' | 'pass'; };

function ReviewDisplay() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const { toast } = useToast();
  const { user } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState<{[key: string]: boolean}>({});

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
          
          const textbookDocRef = doc(db, 'textbooks', submissionData.textbookId);
          const topicDocRef = doc(db, `textbooks/${submissionData.textbookId}/chapters/${submissionData.chapterId}/topics`, submissionData.topicId);
          
          const [textbookSnap, studentData, topicSnap, questionsData] = await Promise.all([
             getDoc(textbookDocRef),
             getUserProfile(submissionData.userId) as Promise<UserProfile>,
             getDoc(topicDocRef),
             getQuestionsByPracticeSet(submissionData.textbookId, submissionData.chapterId, submissionData.topicId, submissionData.practiceSetId)
           ]);
           
           if(textbookSnap.exists()) setTextbook({id: textbookSnap.id, ...textbookSnap.data()} as Textbook);
           if(topicSnap.exists()) setTopic({id: topicSnap.id, ...topicSnap.data()} as Topic);

           setStudent(studentData);
           setQuestions(questionsData as Question[]);
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

    const handleVote = async (questionId: string, voteType: 'like' | 'dislike') => {
        if (!user) {
            toast({ variant: "destructive", title: "Please log in to vote." });
            return;
        }
        if (isVoting[questionId] || !submission) return;

        setIsVoting(prev => ({...prev, [questionId]: true}));
        
        const originalQuestions = [...questions];
        const questionIndex = questions.findIndex(q => q.id === questionId);
        if (questionIndex === -1) {
            setIsVoting(prev => ({...prev, [questionId]: false}));
            return;
        }

        const questionToUpdate = { ...questions[questionIndex] };
        
        const hasLiked = questionToUpdate.likedBy?.includes(user.uid);
        const hasDisliked = questionToUpdate.dislikedBy?.includes(user.uid);
        let newLikedBy = [...(questionToUpdate.likedBy || [])];
        let newDislikedBy = [...(questionToUpdate.dislikedBy || [])];

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

        const updatedQuestion = {
            ...questionToUpdate,
            likedBy: newLikedBy,
            dislikedBy: newDislikedBy,
            likes: newLikedBy.length,
            dislikes: newDislikedBy.length
        };
        
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex] = updatedQuestion;
        setQuestions(updatedQuestions);

        try {
            // Note: handleQuestionVote expects a content ID, but here we don't have one for practice set questions.
            // This part of the logic might need a new firestore function if question voting is a feature.
            // For now, it will fail silently or throw error if not adapted.
            // await handleQuestionVote(questionId, voteType);
             console.warn("Voting on practice set questions is not fully implemented on the backend yet.");
        } catch (error) {
            setQuestions(originalQuestions);
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

  if (!submission || !student || !questions) {
    return (
      <div className="text-center min-h-[400px] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Review not found</h2>
        <p className="text-muted-foreground">We couldn't load the review for this submission.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline">
          <Link href="/textbook-solutions">Back to Textbooks</Link>
        </Button>
      </div>
    );
  }

  const { answers, score, totalQuestions, timeTaken } = submission;
  const percentage = Math.round((totalQuestions > 0 ? (score / totalQuestions) * 100 : 0));
  const submittedAtDate = submission.submittedAt ? new Date(submission.submittedAt) : null;
  
  const formatTimeTaken = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
      <>
        <Card className="max-w-4xl mx-auto mb-8 relative">
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
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
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
                    <div className="flex items-center gap-2 text-muted-foreground col-span-full lg:col-span-1"><FileQuestion className="w-4 h-4"/> <strong>Practice Set:</strong> <span className="text-foreground">{submission.practiceSetTitle}</span></div>
                    {topic?.title && <div className="flex items-center gap-2 text-muted-foreground col-span-full lg:col-span-2"><Layers className="w-4 h-4" /> <strong>Topic:</strong> <span className="text-foreground">{topic.title}</span></div>}
                    {textbook?.title && <div className="flex items-center gap-2 text-muted-foreground col-span-full"><Book className="w-4 h-4" /> <strong>Textbook:</strong> <span className="text-foreground">{textbook.title}</span></div>}
                    
                    {textbook?.subject && <div className="flex items-center gap-2 text-muted-foreground"><Book className="w-4 h-4"/> <strong>Subject:</strong> <span className="text-foreground">{textbook.subject}</span></div>}
                    {textbook?.board && <div className="flex items-center gap-2 text-muted-foreground"><Layers className="w-4 h-4"/> <strong>Board:</strong> <span className="text-foreground">{textbook.board}</span></div>}
                    {textbook?.class && <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="w-4 h-4"/> <strong>Class:</strong> <span className="text-foreground">{textbook.class}</span></div>}
                    
                    {totalQuestions > 0 && <div className="flex items-center gap-2 text-muted-foreground"><BarChart className="w-4 h-4"/> <strong>Full Marks:</strong> <span className="text-foreground">{totalQuestions}</span></div>}
                    
                    {timeTaken && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4"/> <strong>Time Taken:</strong> <span className="text-foreground">{formatTimeTaken(timeTaken)}</span></div>}

                    {submittedAtDate && submittedAtDate.toString() !== 'Invalid Date' && (
                        <>
                            <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4"/> <strong>Date:</strong> <span className="text-foreground">{submittedAtDate.toLocaleDateString()}</span></div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto">
            <CardHeader>
            <CardTitle>Detailed Answer Review</CardTitle>
            <CardDescription>Check your answers for "{submission.practiceSetTitle}" below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            {questions.map((question, index) => {
                const userAnswer = answers[question.id];
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
                    isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
                }
                
                const matchingPercentage = totalPairs > 0 ? (matchingScore / totalPairs) * 100 : 0;
                const userHasLiked = user && question.likedBy?.includes(user.uid);
                const userHasDisliked = user && question.dislikedBy?.includes(user.uid);
                
                return (
                <div key={index}>
                    <div className="flex items-start gap-4">
                    <div>
                        {question.type === 'Matching' ? (
                        <ScoreCircle score={matchingPercentage} size={36} strokeWidth={3} />
                        ) : isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                        <XCircle className="w-6 h-6 text-destructive" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{index + 1}. {question.text}</p>
                        <div className="mt-4 space-y-2">
                            {question.type === 'Multiple Choice' && question.options?.map((option, optIndex) => {
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
                                            : isUserAnswer 
                                                ? <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                                                : <div className="w-5 h-5 mt-0.5 shrink-0" /> 
                                        }
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{option.text}</span>
                                                {isUserAnswer && <Badge variant="secondary" className="ml-2">Your Answer</Badge>}
                                            </div>
                                            {option.explanation && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {option.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {question.type === 'True/False' && (
                                <div className="space-y-3">
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
                                                    <p className="text-sm text-muted-foreground mt-2 pl-7">
                                                        {option.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                                <div className="space-y-3">
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
                                <div className="space-y-2">
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
                        </div>
                        {question.explanation && (
                            <div className="mt-4 p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                            <h4 className="font-semibold text-sm mb-1">General Explanation</h4>
                            <p className="text-sm">{question.explanation}</p>
                            </div>
                        )}
                         <div className="mt-4 flex items-center gap-2">
                            <Button 
                                variant={userHasLiked ? "default" : "outline"}
                                size="sm" 
                                onClick={() => handleVote(question.id, 'like')} 
                                disabled={isVoting[question.id]}
                                className={cn(userHasLiked && "bg-green-500 hover:bg-green-600 text-white")}
                            >
                                <ThumbsUp className="mr-2 h-4 w-4" /> Like ({question.likes || 0})
                            </Button>
                            <Button 
                                variant={userHasDisliked ? "destructive" : "outline"} 
                                size="sm" 
                                onClick={() => handleVote(question.id, 'dislike')} 
                                disabled={isVoting[question.id]}
                            >
                                <ThumbsDown className="mr-2 h-4 w-4" /> Dislike ({question.dislikes || 0})
                            </Button>
                        </div>
                    </div>
                    </div>
                    {index < questions.length -1 && <Separator className="mt-6" />}
                </div>
                );
            })}
            </CardContent>
        </Card>
      </>
  );
}

export default function PracticeSetReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const practiceSetId = params.practiceSetId as string;
  const submissionId = searchParams.get('submissionId');

  return (
    <div className="container py-8 sm:py-12 md:max-w-4xl">
       <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center text-center md:text-left mb-8 px-4 sm:px-0">
        <div>
            <h1 className="font-headline text-4xl font-bold">Answer Review</h1>
            <p className="text-muted-foreground">Let's see how you did.</p>
        </div>
        <Button asChild variant="outline">
            <Link href={`/textbook-solutions/practice-set/${practiceSetId}/results?submissionId=${submissionId}`}>
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
