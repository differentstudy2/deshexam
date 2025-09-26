

'use client';

import { useEffect, useState } from 'react';
import { getContentById, addTestSubmission } from '@/lib/firebase/firestore';
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

export default function TestPage() {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const testId = params.id as string;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        const testData = await getContentById(testId);
        if (testData) {
            setTest(testData as Test);
            setTimeLeft(testData.duration * 60);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching test',
          description: (error as Error).message,
        });
        router.push('/content');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, toast, router]);
  
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


  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleMatchingAnswerChange = (questionIndex: number, columnAItem: string, columnBItem: string) => {
    setAnswers(prev => {
        const newAnswers = { ...prev };
        const currentMatchingAnswers = newAnswers[questionIndex] || {};
        currentMatchingAnswers[columnAItem] = columnBItem;
        newAnswers[questionIndex] = currentMatchingAnswers;
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
                const userAnswersForQuestion = answers[index];
                if (userAnswersForQuestion && Array.isArray(correctAnswers)) {
                    for (const pair of correctAnswers) {
                        if (userAnswersForQuestion[pair.a] === pair.b) {
                            score++; // Award 1 mark for each correct pair
                        }
                    }
                }
            } else {
                 if (answers[index] === question.correctAnswer) {
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
            testType: test?.testType
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Test...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center min-h-[calc(100vh-200px)] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Test not found</h2>
        <p className="text-muted-foreground">The test you are looking for does not exist.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline">
          <Link href="/content">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
          </Link>
        </Button>
      </div>
    );
  }

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
                            <Card key={questionIndex}>
                            <CardHeader>
                                <CardTitle>Question {questionIndex + 1}</CardTitle>
                                <CardDescription className="text-lg text-foreground pt-2">{question.text}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {question.type === 'Multiple Choice' && question.options && (
                                <RadioGroup onValueChange={(value) => handleAnswerChange(questionIndex, value)} value={answers[questionIndex]} className="space-y-2">
                                    {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.text} id={`q${questionIndex}-opt${optIndex}`} />
                                        <Label htmlFor={`q${questionIndex}-opt${optIndex}`} className="text-2xl">{option.text}</Label>
                                    </div>
                                    ))}
                                </RadioGroup>
                                )}
                                {question.type === 'True/False' && (
                                <RadioGroup onValueChange={(value) => handleAnswerChange(questionIndex, value)} value={answers[questionIndex]} className="flex space-x-4 true-false-group">
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="True" id={`q${questionIndex}-true`} />
                                    <Label htmlFor={`q${questionIndex}-true`} className="text-base">True</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="False" id={`q${questionIndex}-false`} />
                                    <Label htmlFor={`q${questionIndex}-false`} className="text-base">False</Label>
                                    </div>
                                </RadioGroup>
                                )}
                                {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                                <Input 
                                    placeholder="Your answer..." 
                                    onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                                    value={answers[questionIndex] || ''}
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
                                                    onValueChange={(value) => handleMatchingAnswerChange(questionIndex, itemA.text, value)} 
                                                    value={answers[questionIndex]?.[itemA.text] || ''}
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
                                {test.questions.map((_, qIndex) => (
                                    <Button
                                        key={qIndex}
                                        variant={answers[qIndex] !== undefined ? 'default' : 'outline'}
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




