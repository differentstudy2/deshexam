'use client';

import { useEffect, useState } from 'react';
import { getContentById, addPracticeSetSubmission, getPracticeSetById, getQuestionsByPracticeSet } from '@/lib/firebase/firestore';
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
import type { PracticeSet, Question, Topic, Textbook, Chapter } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Separator } from '@/components/ui/separator';

type Test = PracticeSet & { questions: Question[], testType: 'Practice Set' };

const shuffleArray = (array: any[]) => {
  if (!array) return [];
  // Attach original index before shuffling to ensure stable keys
  const indexedArray = array.map((item, index) => ({ ...item, originalIndex: index }));
  
  for (let i = indexedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexedArray[i], indexedArray[j]] = [indexedArray[j], indexedArray[i]];
  }
  return indexedArray;
};


export default function PracticeSetPage() {
  const [test, setTest] = useState<Test | null>(null);
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
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
  const topicId = params.topicId as string; // Can be null if practice set is at chapter level
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);

  useEffect(() => {
    const fetchTest = async () => {
      if (!practiceSetId || !textbookId || !chapterId) return;
      try {
        setLoading(true);

        const [practiceSetData, textbookData, chapterData] = await Promise.all([
            getPracticeSetById(textbookId, chapterId, topicId, practiceSetId),
            getDoc(doc(db, 'textbooks', textbookId)),
            getDoc(doc(db, `textbooks/${textbookId}/chapters`, chapterId)),
        ]);
        
        if(topicId) {
            const topicData = await getDoc(doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId));
            if(topicData.exists()) setTopic(topicData.data() as Topic);
        }

        if (textbookData.exists()) setTextbook(textbookData.data() as Textbook);
        if (chapterData.exists()) setChapter(chapterData.data() as Chapter);

        if (practiceSetData) {
            let questionsData = await getQuestionsByPracticeSet(textbookId, chapterId, topicId, practiceSetId);
            
            const groupedQuestions = questionsData.reduce((acc, q) => {
                const type = q.type || 'unknown';
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(q);
                return acc;
            }, {} as Record<string, typeof questionsData>);

            const shuffledQuestions = Object.values(groupedQuestions).flatMap(group => shuffleArray(group));

            const questionsWithMatchingOptions = shuffledQuestions.map((q: any) => {
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

            setTest({ 
                ...practiceSetData, 
                questions: questionsWithMatchingOptions,
                testType: 'Practice Set' 
            } as Test);
            
            const durationInSeconds = (practiceSetData.duration || calculatedTotalMarks) * 60;
            setTimeLeft(durationInSeconds);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching practice set',
          description: (error as Error).message,
        });
        router.push('/textbook-solutions');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [practiceSetId, textbookId, chapterId, topicId, toast, router]);
  
    useEffect(() => {
        if (test && textbook && chapter) {
            const title = `${test.title} | ${topic?.title || chapter.title} | DeshExam`;
            const description = `Practice set for ${topic?.title || chapter.title}, part of the ${textbook.title} textbook. Test your knowledge on ${chapter.title}.`;
            const keywords = `${test.title}, ${topic?.title || ''}, ${chapter.title}, ${textbook.subject}, practice questions, quiz`;
            
            document.title = title;
            document.querySelector('meta[name="description"]')?.setAttribute('content', description);
            document.querySelector('meta[name="keywords"]')?.setAttribute('content', keywords);

            const jsonLdScriptId = 'structured-data-practice-set';
            let jsonLdScript = document.getElementById(jsonLdScriptId);
            if (!jsonLdScript) {
                jsonLdScript = document.createElement('script');
                jsonLdScript.id = jsonLdScriptId;
                jsonLdScript.type = 'application/ld+json';
                document.head.appendChild(jsonLdScript);
            }

            const jsonLd = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": title,
                "url": window.location.href,
                "description": description,
                "image": textbook.featureImage || `https://picsum.photos/seed/${textbook.id}/800/400`,
                "author": { "@type": "Organization", "name": "DeshExam" },
                "publisher": { "@type": "Organization", "name": "DeshExam", "logo": { "@type": "ImageObject", "url": "/logo.png" } },
                "datePublished": new Date().toISOString(),
                "dateModified": new Date().toISOString(),
            };
            jsonLdScript.innerHTML = JSON.stringify(jsonLd);
        }
    }, [test, textbook, chapter, topic]);


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
  }, [timeLeft, isSubmitting]);


  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleMatchingAnswerChange = (questionId: string, columnAItem: string, columnBItem: string) => {
    const currentAnswer = answers[questionId] || {};
    const newAnswer = { ...currentAnswer, [columnAItem]: columnBItem };
    handleAnswerChange(questionId, newAnswer);
  }

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
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

        if (topicId) {
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
  };
  
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
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
  
  return (
    <div className="container py-8 max-w-4xl mx-auto">
        <div className="bg-background border rounded-lg shadow-sm">
            <header className="p-6 text-center border-b">
                <p className="font-semibold text-primary">{textbook?.subject || 'Practice'}</p>
                <h1 className="font-headline text-3xl font-bold tracking-tighter mt-1">{test.title}</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">{[textbook?.board, textbook?.class].filter(Boolean).join(' • ')}</p>
                <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground space-x-6">
                    <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>{test.questions.length} Questions</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>{totalMarks} Marks</span>
                    </div>
                    {timeLeft !== null && (
                        <div className="flex items-center gap-1.5 font-mono text-base font-semibold text-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>
            </header>

            <form onSubmit={handleSubmit} className="p-6">
                <fieldset disabled={timeUp || isSubmitting} className="space-y-8">
                {test.questions && test.questions.map((question, index) => {
                    const questionIndex = index;
                    return (
                        <Card key={question.id || question.originalIndex} className="p-6 shadow-none border">
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
                                                        {question.matchingOptions?.columnB.map((itemB, bIndex) => (
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
    </div>
  );
}
