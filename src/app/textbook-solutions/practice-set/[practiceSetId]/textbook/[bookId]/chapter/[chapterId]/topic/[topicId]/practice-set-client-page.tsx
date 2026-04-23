

'use client';

import { useEffect, useState, Suspense, useMemo, useCallback, useRef } from 'react';
import { getContentById, addPracticeSetSubmission, getPracticeSetById, getQuestionsByPracticeSet, getUserProfile } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, HelpCircle, ArrowLeft, GripVertical, ChevronLeft, ChevronRight, BarChart, GraduationCap, Target, School, BadgeCheck, Crown, Gem, AlertTriangle, BookOpen, FileDown, Rows, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import type { PracticeSet, Question, Topic, Textbook, Chapter } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Metadata, ResolvingMetadata } from 'next';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PracticeSetPDF } from '@/components/feature/practice-set-pdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

type Option = {
  text: string;
  image?: string;
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

const optionBgColors = [
    'bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200/80',
    'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200/80',
    'bg-lime-100 dark:bg-lime-900/30 hover:bg-lime-200/80',
    'bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200/80',
];


export default function PracticeSetClientPage({ initialTest, initialTextbook, initialChapter, initialTopic }: { initialTest: Test, initialTextbook: Textbook, initialChapter: Chapter, initialTopic: Topic | null }) {
  const [test, setTest] = useState<Test | null>(initialTest);
  const [textbook, setTextbook] = useState<Textbook | null>(initialTextbook);
  const [chapter, setChapter] = useState<Chapter | null>(initialChapter);
  const [topic, setTopic] = useState<Topic | null>(initialTopic);
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  
  const practiceSetId = params.practiceSetId as string;
  const mockTestId = params.mockTestId as string;
  const textbookId = params.bookId as string;
  const chapterId = params.chapterId as string;
  const topicId = params.topicId as string;
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'submit' | 'back' | 'new' | null>(null);
  
  const lastQuestionRef = useRef<HTMLDivElement>(null);

  const [pdfContent, setPdfContent] = useState<{ practiceSet: PracticeSet; questions: Question[] } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  const [clientDate, setClientDate] = useState('');


  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleQuestions, setVisibleQuestions] = useState(5);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');


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
            textbookId: textbookId,
            chapterId: chapterId,
            topicId: topicId,
            answers: answers,
            score,
            totalQuestions: totalMarks,
            timeTaken: timeTakenInSeconds,
            duration: test?.duration || totalMarks,
            testType: 'Practice Set'
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
  }, [isSubmitting, user, openAuthDialog, test, answers, totalMarks, timeLeft, chapterId, textbookId, topicId, toast, router, mockTestId]);
  
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
    
    const handleDownloadPdf = async (practiceSet: PracticeSet) => {
      setIsGeneratingPdf(practiceSet.id);
      try {
          const questions = await getQuestionsByPracticeSet(textbookId, chapterId, topicId === 'null' ? null : topicId, practiceSet.id);
          setPdfContent({ practiceSet, questions });
      } catch (error) {
          toast({
              variant: 'destructive',
              title: 'Error preparing PDF',
              description: (error as Error).message,
          });
          setIsGeneratingPdf(null);
      }
    };

    useEffect(() => {
        if (pdfContent) {
            const generate = async () => {
                const pdfElement = document.getElementById('pdf-content');
                if (pdfElement) {
                    const canvas = await html2canvas(pdfElement, { scale: 2, useCORS: true });
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    // ... PDF generation logic
                    pdf.save(`${pdfContent.practiceSet.title}.pdf`);
                }
                setPdfContent(null);
                setIsGeneratingPdf(null);
            };
            // setTimeout is a workaround to ensure the component has rendered before capture
            const timer = setTimeout(generate, 500); 
            return () => clearTimeout(timer);
        }
    }, [pdfContent]);


  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNext = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
    
  if (loading) {
      return (
        <div className="container py-8 max-w-4xl mx-auto">
            <div className="bg-background border rounded-lg shadow-sm">
                <header className="p-6 border-b space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                    </div>
                </header>
                <div className="p-6 text-center">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                </div>
                 <Card className="sticky top-[64px] z-40 border-x-0 border-b">
                    <CardContent className="p-3">
                         <div className="flex items-center justify-center gap-4 sm:gap-6">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-2 w-24" />
                            <Separator orientation="vertical" className="h-6" />
                            <Skeleton className="h-6 w-20" />
                            <Separator orientation="vertical" className="h-6" />
                             <Skeleton className="h-6 w-32" />
                        </div>
                    </CardContent>
                </Card>
                <div className="p-6 space-y-8 mt-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <Skeleton className="h-6 w-1/2 mb-4" />
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
      );
  }
  
  if (!test || !textbook || !chapter) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-destructive">Could not load test data. Please try again later.</p>
        </div>
    );
  }
  
  const totalDuration = (test.duration || totalMarks) * 60;
  const backToTopicUrl = topicId !== 'null' 
    ? `/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${topicId}`
    : `/admin/textbooks/${textbookId}/practice-sets`;

  const currentQuestion = test.questions[currentQuestionIndex];
  
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
                                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                                            {student?.school && <div className="flex items-center gap-1.5"><School className="w-4 h-4" />{student.school}</div>}
                                            {student?.classGrade && <div className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />{student.classGrade}</div>}
                                            {student?.targetExam && <div className="flex items-center gap-1.5"><Target className="w-4 h-4" />{student.targetExam}</div>}
                                        </div>
                                    </div>
                                </div>
                                 <div className="flex gap-2 w-full sm:w-auto self-start">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={backToTopicUrl}><BookOpen className="mr-2"/>Learn</Link>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDownloadPdf(test)} disabled={isGeneratingPdf !== null}>
                                        {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4"/>}
                                        Download as PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
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
                    <div><strong>Date:</strong> {clientDate}</div>
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
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-1">
                            <Button variant={viewMode === 'all' ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('all')}>
                                <Rows className="h-4 w-4" />
                            </Button>
                            <Button variant={viewMode === 'single' ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('single')}>
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={(e) => { e.preventDefault(); setConfirmAction('submit'); setIsConfirming(true); }} className="p-6 pt-0">
                <fieldset disabled={timeUp || isSubmitting} className="space-y-8 mt-6">
                
                {viewMode === 'single' && currentQuestion && (
                     <Card key={currentQuestion.id || currentQuestionIndex} className="p-6 shadow-none border scroll-m-24">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="flex items-baseline gap-2 text-xl font-semibold prose dark:prose-invert">
                                 <span className="self-start">{currentQuestionIndex + 1}.</span>
                                 <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{currentQuestion.text}</ReactMarkdown>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {currentQuestion.type === 'Multiple Choice' && currentQuestion.options && (
                                <RadioGroup onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)} value={answers[currentQuestion.id]} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQuestion.options.map((option, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className={cn(
                                                "p-3 border rounded-lg flex flex-col gap-3 transition-colors",
                                                optionBgColors[optIndex % optionBgColors.length]
                                            )}
                                        >
                                            {option.image && (
                                                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-secondary">
                                                    <Image src={option.image} alt={option.text || `Option image`} fill className="object-contain" />
                                                </div>
                                            )}
                                            <Label
                                                htmlFor={`q-single-${currentQuestion.id}-opt${optIndex}`}
                                                className="flex items-center gap-3 w-full cursor-pointer"
                                            >
                                                <RadioGroupItem value={option.text} id={`q-single-${currentQuestion.id}-opt${optIndex}`} />
                                                <div className="flex-1 text-base font-normal">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{option.text}</ReactMarkdown>
                                                </div>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                            {/* Other question types... */}
                        </CardContent>
                    </Card>
                )}

                {viewMode === 'all' && test.questions.slice(0, visibleQuestions).map((question, index) => {
                    const isLastQuestion = index === visibleQuestions - 1;
                    return (
                        <Card key={question.id || index} ref={el => {
                            questionRefs.current[index] = el;
                            if (isLastQuestion) {
                                (lastQuestionRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                            }
                        }} className="p-6 shadow-none border scroll-m-24">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="flex items-baseline gap-2 text-xl font-semibold prose dark:prose-invert">
                                    <span className="self-start">{index + 1}.</span>
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{question.text}</ReactMarkdown>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {question.type === 'Multiple Choice' && question.options && (
                                    <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id]} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {question.options.map((option, optIndex) => (
                                            <div
                                                key={optIndex}
                                                className={cn(
                                                    "p-3 border rounded-lg flex flex-col gap-3 transition-colors",
                                                    optionBgColors[optIndex % optionBgColors.length]
                                                )}
                                            >
                                                {option.image && (
                                                    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-secondary">
                                                        <Image src={option.image} alt={option.text || `Option image`} fill className="object-contain" />
                                                    </div>
                                                )}
                                                <Label
                                                    htmlFor={`q-all-${question.id}-opt${optIndex}`}
                                                    className="flex items-center gap-3 w-full cursor-pointer"
                                                >
                                                    <RadioGroupItem value={option.text} id={`q-all-${question.id}-opt${optIndex}`} />
                                                    <div className="flex-1 text-base font-normal">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{option.text}</ReactMarkdown>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                                {/* Other question types for 'all' mode */}
                            </CardContent>
                        </Card>
                    )})}
                </fieldset>

                {viewMode === 'single' && (
                    <div className="mt-8 flex justify-between items-center">
                        <Button type="button" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <span>Question {currentQuestionIndex + 1} of {test.questions.length}</span>
                        <Button type="button" onClick={handleNext} disabled={currentQuestionIndex === test.questions.length - 1}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                     <Button size="lg" type="submit" disabled={isSubmitting || timeUp}>
                        {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Submitting...</> : "Submit Test"}
                    </Button>
                </div>
            </form>
        </div>
        
        <AlertDialog open={timeUp}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Time's Up!</AlertDialogTitle>
                    <AlertDialogDescription>
                        The time limit for this mock test has been reached. Your answers will now be submitted.
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
                </AlertDialogHeader>
                    <AlertDialogDescription>
                        {getConfirmDialogContent().description}
                    </AlertDialogDescription>
                    {confirmAction === 'submit' && skippedQuestions.length > 0 && (
                        <div className="mt-4 rounded-md border bg-secondary p-4">
                            <div className="font-semibold">You have skipped the following questions:</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {skippedQuestions.map(qIndex => (
                                    <Button
                                        key={`confirm-skip-${qIndex}`}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleNavigateToQuestion(qIndex)}
                                    >
                                        {qIndex + 1}
                                    </Button>
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
        {pdfContent && (
            <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -10 }}>
                <div id="pdf-content">
                    <PracticeSetPDF 
                        practiceSet={pdfContent.practiceSet} 
                        questions={pdfContent.questions} 
                        textbookTitle={textbook?.title || ''} 
                        chapterTitle={chapter?.title || ''}
                        topicTitle={topic?.title || ''}
                        board={textbook?.board || ''}
                        className={textbook?.class || ''}
                        subject={textbook?.subject || ''}
                        totalMarks={totalMarks}
                    />
                </div>
            </div>
        )}
    </div>
  );
}
