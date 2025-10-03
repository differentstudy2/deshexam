
'use client';

import { useEffect, useState } from 'react';
import { addTestSubmission } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, HelpCircle, ArrowLeft, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


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

const QUESTIONS_PER_PAGE = 5;

export default function TestClientPage({ test }: { test: Test }) {
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const [timeLeft, setTimeLeft] = useState<number | null>(test.duration * 60);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) {
        setTimeUp(true);
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);


  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleMatchingAnswerChange = (questionId: string, columnAItem: string, columnBItem: string) => {
    setAnswers(prev => {
        const newAnswers = { ...prev };
        const currentMatchingAnswers = newAnswers[questionId] || {};
        currentMatchingAnswers[columnAItem] = columnBItem;
        newAnswers[questionId] = currentMatchingAnswers;
        return newAnswers;
    });
  }

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!user) {
        openAuthDialog('sign-in');
        return;
    }

    setIsSubmitting(true);

    try {
        let score = 0;
        test?.questions.forEach((question, index) => {
            if (question.type === 'Matching') {
                const correctAnswers = question.correctAnswer;
                const userAnswersForQuestion = answers[question.id];
                if (userAnswersForQuestion && Array.isArray(correctAnswers)) {
                    for (const pair of correctAnswers) {
                        if (userAnswersForQuestion[pair.a] === pair.b) {
                            score++; // Award 1 mark for each correct pair
                        }
                    }
                }
            } else {
                 if (answers[question.id] === question.correctAnswer) {
                    score += question.marks || 1;
                }
            }
        });
        
        const totalMarks = test?.questions.reduce((total, q) => {
            if (q.type === 'Matching') {
                // Total marks for a matching question is the number of pairs
                return total + (q.correctAnswer?.length || 0);
            }
            return total + (q.marks || 1);
        }, 0) || 0;


        const submissionData = {
            testId: test?.id,
            testTitle: test?.title,
            answers,
            score,
            totalQuestions: totalMarks,
            testType: test?.testType,
            duration: test?.duration,
        };

        const submissionId = await addTestSubmission(submissionData);

        toast({
            title: "Test Submitted!",
            description: "Your results have been recorded.",
        });
        
        const currentPath = pathname.split('/').slice(0,2).join('/');
        router.push(`${currentPath}/${test?.id}/results?submissionId=${submissionId}`);

    } catch (error) {
        toast({
            variant: "destructive",
            title: 'Error submitting test',
            description: (error as Error).message,
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    };

  const totalPages = test ? Math.ceil(test.questions.length / QUESTIONS_PER_PAGE) : 0;
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentQuestions = test?.questions.slice(startIndex, endIndex);

  return (
    <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
            <div className="md:col-span-1">
                <header className="mb-8 p-4">
                    <p className="text-primary font-semibold">{test.subject}</p>
                    <h1 className="font-headline text-4xl font-bold tracking-tighter">{test.title}</h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl">{test.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-2">
                        <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>{test.questions.length} Questions</span>
                        </div>
                        {timeLeft !== null && (
                            <div className="flex items-center gap-1.5 font-mono text-lg font-semibold text-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>
                </header>

                <form onSubmit={handleSubmit}>
                    <fieldset disabled={timeUp} className="space-y-8">
                    {currentQuestions && currentQuestions.map((question, index) => {
                        const questionIndex = startIndex + index;
                        return (
                            <Card key={question.id || questionIndex}>
                            <CardHeader>
                                <CardTitle>Question {questionIndex + 1}</CardTitle>
                                <CardDescription className="text-lg text-foreground pt-2">{question.text}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {question.type === 'Multiple Choice' && question.options && (
                                <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id]} className="space-y-2">
                                    {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.text} id={`q${question.id}-opt${optIndex}`} />
                                        <Label htmlFor={`q${question.id}-opt${optIndex}`} className="text-2xl">{option.text}</Label>
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
                                                        {question.matchingOptions?.columnB.map((itemB, bIndex) => (
                                                            <SelectItem key={bIndex} value={itemB.text}>
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
                            disabled={currentPage === 0}
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
                            disabled={currentPage === totalPages - 1}
                        >
                        Next
                        <ChevronRight className="ml-2"/>
                        </Button>
                    </div>


                    <div className="mt-8 flex justify-center">
                        <Button size="lg" type="submit" disabled={isSubmitting || timeUp}>
                            {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Submitting...</> : "Submit Test"}
                        </Button>
                    </div>
                </form>
            </div>
            
            <aside className="md:col-span-1">
                <div className="sticky top-24">
                     <Card>
                        <CardHeader>
                            <CardTitle>Question Navigator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {test.questions.map((q, qIndex) => (
                                    <Button
                                        key={q.id || qIndex}
                                        variant={answers[q.id] !== undefined ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage(Math.floor(qIndex / QUESTIONS_PER_PAGE))}
                                    >
                                        {qIndex + 1}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </aside>
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
    </div>
  );
}
