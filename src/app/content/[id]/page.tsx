

'use client';

import { useEffect, useState } from 'react';
import { getContentById, addTestSubmission } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, HelpCircle, ArrowLeft, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

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

export default function TestPage() {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const testId = params.id as string;

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        const testData = await getContentById(testId);
        setTest(testData as Test);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to submit a test.",
        });
        return;
    }

    if (Object.keys(answers).length !== test?.questions.length) {
        toast({
            variant: "destructive",
            title: "Incomplete Test",
            description: "Please answer all questions before submitting.",
        });
        return;
    }

    setIsSubmitting(true);

    try {
        let score = 0;
        test?.questions.forEach((question, index) => {
            if (question.type === 'Matching') {
                const correctAnswers = question.correctAnswer;
                const userAnswers = answers[index];
                if (userAnswers && Array.isArray(correctAnswers)) {
                    for (const pair of correctAnswers) {
                        if (userAnswers[pair.a] === pair.b) {
                            score++;
                        }
                    }
                }
            } else {
                 if (answers[index] === question.correctAnswer) {
                    score++;
                }
            }
        });
        
        const totalQuestions = test?.questions.reduce((total, q) => {
            if (q.type === 'Matching') {
                return total + (q.correctAnswer?.length || 1);
            }
            return total + 1;
        }, 0) || 0;


        const submissionData = {
            testId: test?.id,
            testTitle: test?.title,
            answers,
            score,
            totalQuestions: totalQuestions,
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
       <header className="mb-8 p-4">
        <p className="text-primary font-semibold">{test.subject}</p>
        <h1 className="font-headline text-4xl font-bold tracking-tighter">{test.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">{test.description}</p>
        <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>{test.questions.length} Questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{test.duration} min</span>
            </div>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {test.questions.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Question {index + 1}</CardTitle>
                <CardDescription className="text-lg text-foreground pt-2">{question.text}</CardDescription>
              </CardHeader>
              <CardContent>
                {question.type === 'Multiple Choice' && question.options && (
                  <RadioGroup onValueChange={(value) => handleAnswerChange(index, value)} className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.text} id={`q${index}-opt${optIndex}`} />
                        <Label htmlFor={`q${index}-opt${optIndex}`} className="text-base">{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {question.type === 'True/False' && (
                  <RadioGroup onValueChange={(value) => handleAnswerChange(index, value)} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="True" id={`q${index}-true`} />
                      <Label htmlFor={`q${index}-true`}>True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="False" id={`q${index}-false`} />
                      <Label htmlFor={`q${index}-false`}>False</Label>
                    </div>
                  </RadioGroup>
                )}
                {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                  <Input 
                    placeholder="Your answer..." 
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
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
                                <Select onValueChange={(value) => handleMatchingAnswerChange(index, itemA.text, value)}>
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
          ))}
        </div>
        <div className="mt-8 flex justify-end">
            <Button size="lg" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Submitting...</> : "Submit Test"}
            </Button>
        </div>
      </form>
    </div>
  );
}
