
'use client';

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, HelpCircle, ArrowLeft, GripVertical, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { addTestSubmission, getUserProfile } from '@/lib/firebase/firestore';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

type Option = {
  text: string;
  image?: string;
};

type MatchingItem = {
    text: string;
    image?: string;
    originalIndex?: number;
}

type MatchingOptions = {
    columnA: MatchingItem[];
    columnB: MatchingItem[];
}

type Question = {
  id: string;
  text: string;
  type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Fill in the Blank' | 'Matching';
  options?: Option[];
  matchingOptions?: MatchingOptions;
  correctAnswer: any;
  marks: number;
};

type Test = {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  questions: Question[];
  testType: string;
};

const shuffleArray = (array: any[]) => {
  if (!array) return [];
  const indexedArray = array.map((item, index) => ({ ...item, originalIndex: index }));
  
  for (let i = indexedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexedArray[i], indexedArray[j]] = [indexedArray[j], indexedArray[i]];
  }
  return indexedArray;
};


export default function TestClientPage({ test }: { test: Test }) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  const [testWithShuffledOptions, setTestWithShuffledOptions] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(test.duration > 0 ? test.duration * 60 : null);
  const [timeUp, setTimeUp] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'submit' | 'back' | 'new' | null>(null);
  
  const lastQuestionRef = useRef<HTMLDivElement>(null);

  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleQuestions, setVisibleQuestions] = useState(5);

  const highestAttemptedIndex = useMemo(() => {
    if (!testWithShuffledOptions) return -1;
    return testWithShuffledOptions.questions.reduce((maxIndex, q, index) => {
        return answers[q.id] !== undefined ? Math.max(maxIndex, index) : maxIndex;
    }, -1);
  }, [answers, testWithShuffledOptions]);

  const skippedQuestions = useMemo(() => {
    if (!testWithShuffledOptions) return [];
    return testWithShuffledOptions.questions
      .map((q, index) => ({ q, index }))
      .filter(({ q, index }) => index < highestAttemptedIndex && answers[q.id] === undefined)
      .map(({ index }) => index);
  }, [answers, testWithShuffledOptions, highestAttemptedIndex]);

  useEffect(() => {
    if (test && test.questions) {
      const questionsWithMatchingOptions = test.questions.map(q => {
        if (q.type === 'Matching' && q.correctAnswer) {
          const pairs = q.correctAnswer as { a: string, b: string }[];
          const columnA = pairs.map(p => ({ text: p.a, image: '' })); // Assuming no images for now
          let columnB = pairs.map(p => ({ text: p.b, image: '' }));
          return { ...q, matchingOptions: { columnA, columnB: shuffleArray(columnB) } };
        }
        return q;
      });
      setTestWithShuffledOptions({ ...test, questions: questionsWithMatchingOptions });
    }
    questionRefs.current = Array(test.questions.length).fill(null);
  }, [test]);

   useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && testWithShuffledOptions && visibleQuestions < testWithShuffledOptions.questions.length) {
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
  }, [lastQuestionRef, testWithShuffledOptions, visibleQuestions]);

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (isSubmitting) return;

    if (!user) {
      openAuthDialog('sign-in');
      return;
    }

    setIsSubmitting(true);

    let calculatedScore = 0;
    testWithShuffledOptions?.questions.forEach((question) => {
        const userAnswer = answers[question.id];
        if (question.type === 'Matching') {
            const correctAnswers = question.correctAnswer;
            if (userAnswer && Array.isArray(correctAnswers)) {
                for(const pair of correctAnswers) {
                    if(userAnswer[pair.a] === pair.b) {
                        calculatedScore++;
                    }
                }
            }
        } else {
            if (userAnswer === question.correctAnswer) {
                calculatedScore += question.marks || 1;
            }
        }
    });

    setScore(calculatedScore);

    const totalDurationInSeconds = test.duration > 0 ? test.duration * 60 : 0;
    const timeTakenInSeconds = totalDurationInSeconds - (timeLeft || 0);

    try {
      const submissionId = await addTestSubmission({
        testId: test.id,
        testTitle: test.title,
        answers,
        score: calculatedScore,
        totalQuestions: totalMarks,
        testType: test.testType,
        timeTaken: timeTakenInSeconds,
        duration: test.duration,
      });

      toast({
        title: "Test Submitted!",
        description: "Your results have been recorded.",
      });
      setShowResults(true);
      router.push(`/content/${test.id}/results?submissionId=${submissionId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error submitting test",
        description: (error as Error).message,
      });
      setIsSubmitting(false);
    }
  }, [isSubmitting, user, openAuthDialog, test, answers, totalMarks, router, toast, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) {
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
  }, [timeLeft, showResults, isSubmitting, handleSubmit]);
  
  const handleAnswerChange = (questionId: string, answer: string) => {
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

  const totalMarks = useMemo(() => {
    return testWithShuffledOptions?.questions.reduce((total, q) => {
        if (q.type === 'Matching') {
            return total + (q.correctAnswer?.length || 0);
        }
        return total + (q.marks || 1);
    }, 0) || 0;
  }, [testWithShuffledOptions]);


  const handleConfirmAction = () => {
    setIsConfirming(false);
    if(confirmAction === 'submit') {
        handleSubmit();
    } else if (confirmAction === 'back') {
        router.back();
    }
    setConfirmAction(null);
  };
  
  const handleNavigateToQuestion = (qIndex: number) => {
    setIsConfirming(false);
    questionRefs.current[qIndex]?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }

  const getConfirmDialogContent = () => {
      switch(confirmAction) {
          case 'submit':
            return { title: 'Submit Your Answers?', description: 'You cannot change your answers after this.' };
          case 'back':
             return { title: 'Go Back?', description: 'Your current progress will be lost.'};
          case 'new':
             return { title: 'Start a New Test?', description: 'Your current progress will be lost.'};
          default:
             return { title: '', description: '' };
      }
  }


  if (!testWithShuffledOptions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const { title, subject, description, questions } = testWithShuffledOptions;
  const totalDuration = test.duration * 60;
  const progress = timeLeft !== null ? 100 - (timeLeft / totalDuration) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <div className="bg-secondary/30">
        <div className="container py-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => {setConfirmAction('back'); setIsConfirming(true);}}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
          </div>
          <header className="mb-8 text-center">
            <h1 className="font-headline text-4xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </header>
          
          <form onSubmit={(e) => { e.preventDefault(); setConfirmAction('submit'); setIsConfirming(true); }} className="p-6 pt-0">
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
                        <Progress value={progress} className="w-24 h-2" />

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
                                <div>({skippedQuestions.length})</div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <fieldset disabled={timeUp || isSubmitting} className="space-y-8 mt-6">
              {questions.slice(0, visibleQuestions).map((question, index) => {
                 const isLastQuestion = index === visibleQuestions - 1;
                 const userAnswer = answers[question.id];
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
                        <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id] || ''} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.options.map((option, optIndex) => {
                            const isCorrectAnswer = question.correctAnswer === option.text;
                            return (
                              <div key={optIndex}>
                                <Label htmlFor={`q-${question.id}-opt${optIndex}`} className={cn(
                                    "flex flex-col p-4 border rounded-lg cursor-pointer transition-all",
                                    isAnswerRevealed && isCorrectAnswer && "border-green-500 ring-2 ring-green-500/50 bg-green-100 dark:bg-green-900/30",
                                    isAnswerRevealed && userAnswer === option.text && !isCorrectAnswer && "border-destructive ring-2 ring-destructive/50 bg-red-100 dark:bg-red-900/30",
                                    !isAnswerRevealed && "hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                                )}>
                                  {option.image && (
                                      <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden">
                                          <Image src={option.image} alt={option.text || `Option image`} fill className="object-contain" />
                                      </div>
                                  )}
                                  <div className="flex items-center space-x-3 w-full">
                                    <RadioGroupItem value={option.text} id={`q-${question.id}-opt${optIndex}`} />
                                    <div className="text-base font-normal flex-1">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{option.text}</ReactMarkdown>
                                    </div>
                                    {isAnswerRevealed && (
                                        isCorrectAnswer ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                                        userAnswer === option.text ? <XCircle className="w-5 h-5 text-destructive" /> : null
                                    )}
                                  </div>
                                </Label>
                              </div>
                            )
                          })}
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

             <div className="mt-8 flex justify-center">
                 <Button size="lg" type="submit" disabled={isSubmitting || timeUp}>
                    {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Submitting...</> : "Submit Test"}
                </Button>
            </div>
          </form>
          
        </div>
      </div>
       <AlertDialog open={timeUp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's Up!</AlertDialogTitle>
            <AlertDialogDescription>
              The time limit for this test has been reached. Your answers will now be submitted.
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
    </>
  );
}
