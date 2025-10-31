

'use client';

import { useEffect, useState, Suspense, useMemo, useCallback, useRef } from 'react';
import { getContentById, addPracticeSetSubmission, getPracticeSetById, getQuestionsByPracticeSet, getUserProfile } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, HelpCircle, ArrowLeft, GripVertical, ChevronLeft, ChevronRight, BarChart, GraduationCap, Target, School, BadgeCheck, Crown, Gem, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import type { PracticeSet, Question, Topic, Textbook, Chapter } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Metadata, ResolvingMetadata } from 'next';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

type Option = {
  text: string;
};

type MatchingItem = {
    text: string;
    image?: string;
}

type MatchingOptions = {
    columnA: MatchingItem[];
    columnB: MatchingItem[];
}

type Test = PracticeSet & { questions: Question[], testType: 'Practice Set' };
type UserProfile = { uid: string; displayName: string; photoURL?: string; school?: string; classGrade?: string; targetExam?: string; subscriptionPlan?: 'pro' | 'pass'; };

const shuffleArray = (array: any[]) => {
  if (!array) return [];
  const indexedArray = array.map((item, index) => ({ ...item, originalIndex: index }));
  
  for (let i = indexedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexedArray[i], indexedArray[j]] = [indexedArray[j], indexedArray[i]];
  }
  return indexedArray;
};


export default function PracticeSetClientPage({ initialTest, initialTextbook, initialChapter, initialTopic }: { initialTest: Test, initialTextbook: Textbook, initialChapter: Chapter, initialTopic: Topic | null }) {
  const [test, setTest] = useState<Test | null>(initialTest);
  const [textbook, setTextbook] = useState<Textbook | null>(initialTextbook);
  const [chapter, setChapter] = useState<Chapter | null>(initialChapter);
  const [topic, setTopic] = useState<Topic | null>(initialTopic);
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  
  const practiceSetId = params.practiceSetId as string;
  const textbookId = params.bookId as string;
  const chapterId = params.chapterId as string;
  const topicId = params.topicId as string;
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'submit' | 'back' | 'new' | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const QUESTIONS_PER_PAGE = 5;

  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const answeredCount = Object.keys(answers).length;
  
  const highestAttemptedIndex = useMemo(() => {
    if (!test) return -1;
    return test.questions.reduce((maxIndex, q, index) => {
        return answers[q.id] !== undefined ? Math.max(maxIndex, index) : maxIndex;
    }, -1);
  }, [answers, test]);
  
  const skippedQuestions = useMemo(() => {
    if (!test || highestAttemptedIndex < 0) return [];
    return test.questions
      .map((q, index) => ({ q, index }))
      .filter(({ q, index }) => index < highestAttemptedIndex && answers[q.id] === undefined)
      .map(({ index }) => index);
  }, [answers, test, highestAttemptedIndex]);

  const totalPages = test ? Math.ceil(test.questions.length / QUESTIONS_PER_PAGE) : 0;
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentQuestions = test?.questions.slice(startIndex, endIndex);

  useEffect(() => {
    const processInitialData = () => {
        if (user) {
            getUserProfile(user.uid).then(setStudent);
        }
        
        if (initialTest) {
            questionRefs.current = Array(initialTest.questions.length).fill(null);
            const questionsWithMatchingOptions = initialTest.questions.map((q: any) => {
                if (q.type === 'Matching' && q.correctAnswer) {
                    const pairs = q.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
                    const columnA = pairs.map(p => ({ text: p.a, image: p.aImage }));
                    let columnB = pairs.map(p => ({ text: p.b, image: p.bImage }));
                    return {
                        ...q,
                        matchingOptions: {
                            columnA,
                            columnB: shuffleArray(columnB)
                        }
                    }
                }
                return q;
            });
            
            const calculatedTotalMarks = questionsWithMatchingOptions.reduce((total, q) => {
                if (q.type === 'Matching') {
                    return total + (q.correctAnswer?.length || 0);
                }
                return total + (q.marks || 1);
            }, 0);

            setTotalMarks(calculatedTotalMarks);
            setTest({ ...initialTest, questions: questionsWithMatchingOptions });
            const durationInSeconds = (initialTest.duration || calculatedTotalMarks) * 60;
            setTimeLeft(durationInSeconds);
        }
        
        setLoading(false);
    };

    processInitialData();

  }, [initialTest, user]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = ''; // Required for legacy browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (isSubmitting) return;

    if (!user) {
        openAuthDialog('sign-in');
        return;
    }

    setIsSubmitting(true);

    try {
        let score = 0;
        test?.questions.forEach((question) => {
            const userAnswer = answers[question.id];
            if (question.type === 'Matching') {
                const correctAnswers = question.correctAnswer;
                if (userAnswer && Array.isArray(correctAnswers)) {
                    for (const pair of correctAnswers) {
                        if (userAnswer[pair.a] === pair.b) {
                            score++;
                        }
                    }
                }
            } else {
                 if (userAnswer === question.correctAnswer) {
                    score += question.marks || 1;
                }
            }
        });

        const totalDurationInSeconds = (test?.duration || totalMarks) * 60;
        const timeTakenInSeconds = totalDurationInSeconds - (timeLeft || 0);
        
        const submissionData: any = {
            practiceSetId: test?.id,
            practiceSetTitle: test?.title,
            chapterId: chapterId,
            textbookId: textbookId,
            answers: answers,
            score,
            totalQuestions: totalMarks,
            timeTaken: timeTakenInSeconds,
            duration: test?.duration || totalMarks,
        };

        if (topicId !== 'null') {
            submissionData.topicId = topicId;
        }

        const submissionId = await addPracticeSetSubmission(submissionData);

        toast({
            title: "Practice Set Submitted!",
            description: "Your results have been recorded.",
        });
        
        router.push(`/textbook-solutions/practice-set/${test?.id}/results?submissionId=${submissionId}`);

    } catch (error) {
        toast({
            variant: "destructive",
            title: 'Error submitting practice set',
            description: (error as Error).message,
        });
        setIsSubmitting(false);
    }
  }, [isSubmitting, user, openAuthDialog, test, answers, totalMarks, timeLeft, chapterId, textbookId, topicId, toast, router]);
  
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) {
        setTimeUp(true);
        if(!isSubmitting) handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, handleSubmit]);


  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleMatchingAnswerChange = (questionId: string, columnAItem: string, columnBItem: string) => {
    const currentAnswer = answers[questionId] || {};
    const newAnswer = { ...currentAnswer, [columnAItem]: columnBItem };
    handleAnswerChange(questionId, newAnswer);
  }
    
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    };

    const handleConfirmAction = () => {
        setIsConfirming(false);
        if (confirmAction === 'submit') {
            handleSubmit();
        } else if (confirmAction === 'back') {
            router.back();
        }
        setConfirmAction(null);
    };

    const getConfirmDialogContent = () => {
        switch (confirmAction) {
            case 'submit':
                return { title: 'Submit Your Answers?', description: 'Are you sure you want to submit? You cannot change your answers after this.' };
            case 'back':
                return { title: 'Go Back?', description: 'Are you sure you want to go back? Your current progress will be lost.' };
            case 'new':
                 return { title: 'Start a New Problem?', description: 'Are you sure? Your current progress will be lost.' };
            default:
                return { title: '', description: '' };
        }
    };
    
    const handleNavigateToQuestion = (qIndex: number) => {
        setCurrentPage(Math.floor(qIndex / QUESTIONS_PER_PAGE));
        setTimeout(() => {
            questionRefs.current[qIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Practice Set...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center min-h-[calc(100vh-200px)] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Practice Set not found</h2>
        <p className="text-muted-foreground">The practice set you are looking for does not exist.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline">
          <Link href="/textbook-solutions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Textbooks
          </Link>
        </Button>
      </div>
    );
  }
  
  const totalDuration = (test.duration || totalMarks) * 60;


  return (
    <div className="container py-8 max-w-4xl mx-auto">
        <div className="bg-background border rounded-lg shadow-sm">
            <header className="p-6 border-b space-y-6">
                {student && (
                     <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={student?.photoURL || `https://picsum.photos/seed/${student?.uid}/64/64`} />
                            <AvatarFallback>{student?.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                            <h3 className="text-lg font-semibold">{student?.displayName}</h3>
                            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-600"><BadgeCheck className="w-3.5 h-3.5 mr-1"/>Verified</Badge>
                            {student?.subscriptionPlan === 'pro' && (
                                <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-600">
                                    <Crown className="w-3.5 h-3.5 mr-1" /> Pass Pro
                                </Badge>
                            )}
                            {student?.subscriptionPlan === 'pass' && (
                                <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-600">
                                    <Gem className="w-3.5 h-3.5 mr-1" /> Pass
                                </Badge>
                            )}
                            </div>
                            <div className="text-sm text-muted-foreground flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 pt-1">
                                {student?.school && <div className="flex items-center gap-1.5"><School className="w-4 h-4" />{student.school}</div>}
                                {student?.classGrade && <div className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />{student.classGrade}</div>}
                                {student?.targetExam && <div className="flex items-center gap-1.5"><Target className="w-4 h-4" />{student.targetExam}</div>}
                            </div>
                        </div>
                    </div>
                )}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div><strong>Institute Name:</strong> DeshExam.com</div>
                    <div><strong>Book Name:</strong> {textbook?.title}</div>
                    <div><strong>Board:</strong> {textbook?.board}</div>
                    <div><strong>Subject:</strong> {textbook?.subject}</div>
                    <div><strong>Class:</strong> {textbook?.class}</div>
                    {topic?.title && <div><strong>Topic:</strong> {topic?.title}</div>}
                    <div><strong>Chapter:</strong> {chapter?.title}</div>
                    <div><strong>Full Marks:</strong> {totalMarks}</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                    <div><strong>Duration:</strong> {test.duration || totalMarks} minutes</div>
                </div>
            </header>
            <div className="p-6 text-center">
                 <h1 className="font-headline text-2xl font-bold tracking-tighter">{test.title}</h1>
            </div>

            <Card className={cn(
                "sticky top-[64px] z-40 border-x-0 border-b",
                timeLeft !== null && timeLeft <= 60 && "bg-red-50 dark:bg-red-900/20 border-red-200"
            )}>
                <CardContent className="p-3">
                     <div className="flex items-center justify-center gap-4 sm:gap-6">
                        {timeLeft !== null && totalDuration > 0 && (
                            <div className="flex items-center gap-2 font-mono text-xl font-semibold text-foreground">
                                <Clock className="w-5 h-5" />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        )}
                        <Progress value={(timeLeft || 0) / totalDuration * 100} className="w-24 h-2" />

                        <Separator orientation="vertical" className="h-6" />

                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="text-green-600">Ans: {answeredCount}</div>
                        </div>
                        
                        <Separator orientation="vertical" className="h-6" />

                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span>Skipped:</span>
                             {skippedQuestions.length <= 5 ? (
                                <div className="flex items-center gap-1.5">
                                    {skippedQuestions.map((qIndex) => (
                                        <Button
                                            key={`skipped-${qIndex}`}
                                            variant="destructive"
                                            size="sm"
                                            className="h-7 w-7 rounded-full p-0 text-xs"
                                            onClick={() => handleNavigateToQuestion(qIndex)}
                                        >
                                            {qIndex + 1}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-48">
                                    <Carousel opts={{ align: "start", loop: false }}>
                                        <CarouselContent className="-ml-2">
                                            {skippedQuestions.map((qIndex) => (
                                                <CarouselItem key={`skipped-carousel-${qIndex}`} className="pl-2 basis-auto">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-7 w-7 rounded-full p-0 text-xs"
                                                        onClick={() => handleNavigateToQuestion(qIndex)}
                                                    >
                                                        {qIndex + 1}
                                                    </Button>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                    </Carousel>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={(e) => { e.preventDefault(); setConfirmAction('submit'); setIsConfirming(true); }} className="p-6 pt-0">
                <fieldset disabled={timeUp || isSubmitting} className="space-y-8 mt-6">
                {currentQuestions && currentQuestions.map((question, index) => {
                    const questionIndex = startIndex + index;
                    return (
                        <Card key={question.id || questionIndex} ref={el => questionRefs.current[questionIndex] = el} className="p-6 shadow-none border scroll-m-24">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="flex items-baseline gap-2 text-xl font-semibold">
                                    <span>{questionIndex + 1}.</span> <span>{question.text}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {question.type === 'Multiple Choice' && question.options && (
                                <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id]} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                        <RadioGroupItem value={option.text} id={`q${question.id}-opt${optIndex}`} />
                                        <Label htmlFor={`q${question.id}-opt${optIndex}`} className="text-base font-normal flex-1 cursor-pointer">{option.text}</Label>
                                    </div>
                                    ))}
                                </RadioGroup>
                                )}
                                {question.type === 'True/False' && (
                                <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id]} className="flex space-x-4 true-false-group">
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="True" id={`q${question.id}-true`} />
                                    <Label htmlFor={`q${question.id}-true`} className="text-lg">True</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="False" id={`q${question.id}-false`} />
                                    <Label htmlFor={`q${question.id}-false`} className="text-lg">False</Label>
                                    </div>
                                </RadioGroup>
                                )}
                                {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                                <Input 
                                    placeholder="Your answer..." 
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    value={answers[question.id] || ''}
                                />
                                )}
                                {question.type === 'Matching' && question.matchingOptions && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                            <div className="font-bold text-center">Column A</div>
                                            <div></div>
                                            <div className="font-bold text-center">Column B</div>
                                        </div>
                                        {question.matchingOptions.columnA.map((itemA, itemIndex) => (
                                            <div key={itemIndex} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                                <div className="p-3 border rounded-md text-center bg-secondary">
                                                    {itemA.image && <Image src={itemA.image} alt={itemA.text} width={100} height={100} className="mx-auto mb-2 rounded-md" />}
                                                    {itemA.text}
                                                </div>
                                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                <Select 
                                                    onValueChange={(value) => handleMatchingAnswerChange(question.id, itemA.text, value)} 
                                                    value={answers[question.id]?.[itemA.text] || ''}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a match" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {question.matchingOptions?.columnB.map((itemB: any, bIndex: number) => (
                                                            <SelectItem key={`${question.id}-${itemA.text}-${itemB.originalIndex}`} value={itemB.text}>
                                                                <div className="flex items-center gap-2">
                                                                    {itemB.image && <Image src={itemB.image} alt={itemB.text} width={24} height={24} className="rounded-sm" />}
                                                                    <span>{itemB.text}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
                </fieldset>

                 <div className="mt-8 flex justify-between items-center">
                        <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => setCurrentPage(p => p - 1)} 
                            disabled={currentPage === 0 || isSubmitting}
                        >
                        <ChevronLeft className="mr-2"/>
                        Previous
                        </Button>
                        
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage + 1} of {totalPages}
                        </span>

                        <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => setCurrentPage(p => p + 1)} 
                            disabled={currentPage === totalPages - 1 || isSubmitting}
                        >
                        Next
                        <ChevronRight className="ml-2"/>
                        </Button>
                    </div>


                <div className="mt-8 flex justify-center">
                     <Button size="lg" type="submit" disabled={isSubmitting || timeUp}>
                        {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Submitting...</> : "Submit Practice Set"}
                    </Button>
                </div>
            </form>
        </div>
        
        <AlertDialog open={timeUp}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Time's Up!</AlertDialogTitle>
                    <AlertDialogDescription>
                        The time limit for this practice set has been reached. Your answers will now be submitted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={() => handleSubmit()}>
                    View Results
                </AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" />
                        {getConfirmDialogContent().title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {getConfirmDialogContent().description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmAction(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmAction}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
