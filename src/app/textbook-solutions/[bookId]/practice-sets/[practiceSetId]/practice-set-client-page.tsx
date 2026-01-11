
'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { addTestSubmission, getUserProfile } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, HelpCircle, ArrowLeft, GripVertical, ChevronLeft, ChevronRight, BarChart, GraduationCap, Target, School, BadgeCheck, Crown, Gem, AlertTriangle, BookOpen, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { PracticeSet, Question, Textbook } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

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


export default function PracticeSetClientPage({ initialTest, initialTextbook }: { initialTest: Test, initialTextbook: Textbook }) {
  const [test, setTest] = useState<Test | null>(initialTest);
  const [textbook, setTextbook] = useState<Textbook | null>(initialTextbook);
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  
  const practiceSetId = params.practiceSetId as string;
  const textbookId = params.bookId as string;
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'submit' | 'back' | 'new' | null>(null);
  
  const lastQuestionRef = useRef<HTMLDivElement>(null);

  const [clientDate, setClientDate] = useState('');


  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleQuestions, setVisibleQuestions] = useState(5);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  
  const highestAttemptedIndex = useMemo(() => {
    if (!test) return -1;
    return test.questions.reduce((maxIndex, q, index) => {
        return answers[q.id] !== undefined ? Math.max(maxIndex, index) : maxIndex;
    }, -1);
  }, [answers, test]);
  
  const skippedQuestions = useMemo(() => {
    if (!test) return [];
    return test.questions
      .map((q, index) => ({ q, index }))
      .filter(({ q, index }) => index < highestAttemptedIndex && answers[q.id] === undefined)
      .map(({ index }) => index);
  }, [answers, test, highestAttemptedIndex]);

  useEffect(() => {
    // This will only run on the client, after hydration
    setClientDate(new Date().toLocaleDateString());

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
  }, [initialTest, user]);

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
            testId: test?.id,
            testTitle: test?.title,
            testType: test?.testType,
            textbookId: textbookId,
            answers: answers,
            score,
            totalQuestions: totalMarks,
            timeTaken: timeTakenInSeconds,
            duration: test?.duration || totalMarks,
        };

        const submissionId = await addTestSubmission(submissionData);

        toast({
            title: "Practice Set Submitted!",
            description: "Your results have been recorded.",
        });
        
        router.push(`/content/${test?.id}/results?submissionId=${submissionId}`);

    } catch (error) {
        toast({
            variant: "destructive",
            title: 'Error submitting practice set',
            description: (error as Error).message,
        });
        setIsSubmitting(false);
    }
  }, [isSubmitting, user, openAuthDialog, test, answers, totalMarks, timeLeft, textbookId, toast, router]);
  
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && test && visibleQuestions < test.questions.length) {
                    setVisibleQuestions(prev => prev + 5);
                }
            },
            { threshold: 1.0 }
        );

        const currentRef = lastQuestionRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [lastQuestionRef, test, visibleQuestions]);

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

    const handleNavigateToQuestion = (qIndex: number) => {
        setIsConfirming(false);
        questionRefs.current[qIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const getConfirmDialogContent = () => {
        switch (confirmAction) {
            case 'submit':
                return { 
                    title: 'Submit Your Answers?', 
                    description: 'You cannot change your answers after this.'
                };
            case 'back':
                return { title: 'Go Back?', description: 'Your current progress will be lost.' };
            case 'new':
                 return { title: 'Start a New Problem?', description: 'Your current progress will be lost.' };
            default:
                return { title: '', description: '' };
        }
    };

  
  if (!test || !textbook) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );
  }
  
  const totalDuration = (test.duration || totalMarks) * 60;
  const backToTopicUrl = `/admin/textbooks/${textbookId}/practice-sets`;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
        <div className="bg-background border rounded-lg shadow-sm">
            <header className="p-6 border-b space-y-6">
                {student && (
                    <Card className="shadow-none border-0 p-0">
                        <CardHeader className="p-0">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={student?.photoURL || `https://picsum.photos/seed/${student?.uid}/64/64`} />
                                        <AvatarFallback>{student?.displayName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="name text-lg font-semibold">{student?.displayName}</h3>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-600"><BadgeCheck className="w-3.5 h-3.5 mr-1"/>Verified</Badge>
                                            {student?.subscriptionPlan === 'pro' && ( <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-600"><Crown className="w-3.5 h-3.5 mr-1" /> Pass Pro</Badge>)}
                                            {student?.subscriptionPlan === 'pass' && (<Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-600"><Gem className="w-3.5 h-3.5 mr-1" /> Pass</Badge> )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                )}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div><strong>Book Name:</strong> {textbook?.title}</div>
                    <div><strong>Subject:</strong> {textbook?.subject}</div>
                    <div><strong>Full Marks:</strong> {totalMarks}</div>
                    <div><strong>Date:</strong> {clientDate}</div>
                    <div><strong>Duration:</strong> {test.duration || totalMarks} minutes</div>
                </div>
            </header>
            <div className="p-6 text-center">
                 <h1 className="font-headline text-2xl font-bold tracking-tighter">{test.title}</h1>
            </div>

            <Card className={cn("sticky top-[64px] z-40 border-x-0 border-b", timeLeft !== null && timeLeft <= 60 && "bg-red-50 dark:bg-red-900/20 border-red-200")}>
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
                     </div>
                </CardContent>
            </Card>

            <form onSubmit={(e) => { e.preventDefault(); setConfirmAction('submit'); setIsConfirming(true); }} className="p-6 pt-0">
                <fieldset disabled={timeUp || isSubmitting} className="space-y-8 mt-6">
                
                {test.questions.slice(0, visibleQuestions).map((question, index) => {
                        const isLastQuestion = index === visibleQuestions - 1;
                        return (
                            <Card key={question.id || index} ref={el => { questionRefs.current[index] = el; if (isLastQuestion) { (lastQuestionRef as React.MutableRefObject<HTMLDivElement | null>).current = el; } }} className="p-6 shadow-none border scroll-m-24">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="flex items-baseline gap-2 text-xl font-semibold prose dark:prose-invert">
                                     <span className="self-start">{index + 1}.</span>
                                     <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{question.text}</ReactMarkdown>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {question.type === 'Multiple Choice' && question.options && (
                                <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id]} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                        <RadioGroupItem value={option.text} id={`q${question.id}-opt${optIndex}`} />
                                        <Label htmlFor={`q${question.id}-opt${optIndex}`} className="text-base font-normal flex-1 cursor-pointer">
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{option.text}</ReactMarkdown>
                                        </Label>
                                    </div>
                                    ))}
                                </RadioGroup>
                                )}
                                {question.type === 'True/False' && (
                                <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id]} className="flex space-x-4 true-false-group">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="True" id={`q${question.id}-true`} /><Label htmlFor={`q${question.id}-true`} className="text-lg">True</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="False" id={`q${question.id}-false`} /><Label htmlFor={`q${question.id}-false`} className="text-lg">False</Label></div>
                                </RadioGroup>
                                )}
                                {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (<Input placeholder="Your answer..." onChange={(e) => handleAnswerChange(question.id, e.target.value)} value={answers[question.id] || ''}/> )}
                                {question.type === 'Matching' && question.matchingOptions && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center"><div className="font-bold text-center">Column A</div><div></div><div className="font-bold text-center">Column B</div></div>
                                        {question.matchingOptions.columnA.map((itemA, itemIndex) => (
                                            <div key={itemIndex} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                                <div className="p-3 border rounded-md text-center bg-secondary">
                                                    {itemA.image && <Image src={itemA.image} alt={itemA.text} width={100} height={100} className="mx-auto mb-2 rounded-md" />}
                                                    {itemA.text}
                                                </div>
                                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                <Select onValueChange={(value) => handleMatchingAnswerChange(question.id, itemA.text, value)} value={answers[question.id]?.[itemA.text] || ''}>
                                                    <SelectTrigger><SelectValue placeholder="Select a match" /></SelectTrigger>
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
                    )})}
                </fieldset>

                <div className="mt-8 flex justify-center">
                     <Button size="lg" type="submit" disabled={isSubmitting || timeUp}>
                        {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Submitting...</> : "Submit Practice Set"}
                    </Button>
                </div>
            </form>
        </div>
        
        <AlertDialog open={timeUp}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Time's Up!</AlertDialogTitle><AlertDialogDescription>The time limit for this practice set has been reached. Your answers will now be submitted.</AlertDialogDescription></AlertDialogHeader><AlertDialogAction onClick={() => handleSubmit()}>View Results</AlertDialogAction></AlertDialogContent></AlertDialog>

         <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-yellow-500" />{getConfirmDialogContent().title}</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>{getConfirmDialogContent().description}</AlertDialogDescription>
                    {confirmAction === 'submit' && skippedQuestions.length > 0 && (
                        <div className="mt-4 rounded-md border bg-secondary p-4">
                            <div className="font-semibold">You have skipped the following questions:</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {skippedQuestions.map(qIndex => (
                                    <Button key={`confirm-skip-${qIndex}`} variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleNavigateToQuestion(qIndex)}>{qIndex + 1}</Button>
                                ))}
                            </div>
                        </div>
                    )}
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmAction(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmAction}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
