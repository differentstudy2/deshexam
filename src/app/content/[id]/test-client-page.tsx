
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Trophy, Clock, ImageDown, Video, Play, Pause, Volume2, FileQuestion, HelpCircle, CheckCircle, XCircle, GripVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { addTestSubmission } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

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

const playSound = (type: 'correct' | 'incorrect' | 'win') => {
    if (typeof window !== 'undefined') {
      let soundUrl = '';
      if (type === 'correct') soundUrl = '/audio/correct-83487.mp3';
      else if (type === 'incorrect') soundUrl = '/audio/incorrect-293358.mp3';
      else if (type === 'win') soundUrl = '/audio/win-fanfare.mp3';
      
      if(soundUrl) {
          const audio = new Audio(soundUrl);
          audio.play().catch(error => console.error(`Error playing sound:`, error));
      }
    }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function TestClientPage({ test }: { test: Test }) {
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: any }>({});
    const [feedback, setFeedback] = useState<{ [key: string]: 'correct' | 'incorrect' | 'partial' | '' }>({});
    const [showFeedback, setShowFeedback] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(test.duration > 0 ? test.duration * 60 : null);
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const { openAuthDialog } = useAuthDialog();
    const quizCardRef = useRef<HTMLDivElement>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startQuiz = useCallback(() => {
        setShuffledQuestions(shuffleArray(test.questions));
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFeedback({});
        setShowFeedback(null);
        setScore(0);
        setQuizFinished(false);
        if (test.duration > 0) {
            setTimeLeft(test.duration * 60);
        }
    }, [test]);

    useEffect(() => {
        startQuiz();
    }, [startQuiz]);
    
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const totalMarks = useMemo(() => test.questions.reduce((sum, q) => sum + (q.marks || 1), 0), [test.questions]);

    const nextQuestion = useCallback(() => {
        setShowFeedback(null);
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizFinished(true);
            playSound('win');
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            // Auto-submit when the last question is answered
            if(user) {
                // We need to do this in a timeout to get the final state of answers
                setTimeout(() => {
                    // This is a bit of a hack, but we need to ensure the final answer is in the state
                    // before we submit. A better solution would use a state callback.
                     addTestSubmission({
                        testId: test?.id,
                        testTitle: test?.title,
                        answers: userAnswers,
                        score,
                        totalQuestions: totalMarks,
                        testType: test?.testType,
                        duration: test?.duration,
                    }).then(submissionId => {
                        router.push(`/content/${test.id}/results?submissionId=${submissionId}`);
                    }).catch(error => {
                         toast({
                            variant: "destructive",
                            title: 'Error submitting test',
                            description: (error as Error).message,
                        });
                    });
                }, 100);
            }
        }
    }, [currentQuestionIndex, shuffledQuestions.length, user, test, score, totalMarks, userAnswers, router, toast]);

    const handleAnswer = (questionId: string, answer: any) => {
        if (showFeedback) return;

        let isCorrect = false;
        let points = 0;
        const question = shuffledQuestions.find(q => q.id === questionId);
        if (!question) return;

        if (question.type === 'Matching') {
            let correctPairs = 0;
            const totalPairs = question.correctAnswer.length;
            if (answer && totalPairs > 0) {
                for (const pair of question.correctAnswer) {
                    if (answer[pair.a] === pair.b) {
                        correctPairs++;
                    }
                }
            }
            points = (correctPairs / totalPairs) * (question.marks || 1);
            isCorrect = correctPairs === totalPairs;
            setFeedback(prev => ({...prev, [questionId]: correctPairs === 0 ? 'incorrect' : isCorrect ? 'correct' : 'partial' }));
        } else {
            isCorrect = answer === question.correctAnswer;
            if (isCorrect) {
                points = question.marks || 1;
            }
            setFeedback(prev => ({...prev, [questionId]: isCorrect ? 'correct' : 'incorrect' }));
        }
        
        if (isCorrect || question.type === 'Matching') {
           setScore(prev => prev + points);
        }
        
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
        setShowFeedback(questionId);
        playSound(isCorrect ? 'correct' : 'incorrect');

        setTimeout(nextQuestion, 2000);
    };
    
    useEffect(() => {
        if (quizFinished || timeLeft === null) return;
        
        timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev !== null && prev <= 1) {
                    clearInterval(timerIntervalRef.current!);
                    setQuizFinished(true); // End the quiz
                    return 0;
                }
                return prev! - 1;
            });
        }, 1000);
        return () => clearInterval(timerIntervalRef.current!);
    }, [quizFinished, timeLeft]);


    const drawWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.font = "bold 32px 'Lexend', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 4);
        
        const text = "DeshExam";
        const textWidth = ctx.measureText(text).width;
        const patternWidth = textWidth + 150;
        const patternHeight = 150;

        for (let x = -width * 1.5; x < width * 1.5; x += patternWidth) {
            for (let y = -height * 1.5; y < height * 1.5; y += patternHeight) {
                ctx.fillText(text, x, y);
            }
        }
        ctx.restore();
    };

    const handleSaveAsImage = (aspectRatio: 'default' | '9:16' | '16:9' | '1:1' | '4:5' = 'default') => {
        if (quizCardRef.current) {
            html2canvas(quizCardRef.current, {
                useCORS: true,
                backgroundColor: null,
            }).then(sourceCanvas => {
                let targetCanvas: HTMLCanvasElement;
                const questionText = currentQuestion?.text ? currentQuestion.text.replace(/[?]/g, '').replace(/\s+/g, '_').slice(0, 50) : quiz.title.replace(/\s+/g, '_').slice(0, 50);
                const fileName = `${questionText}.png`;

                const target = document.createElement('canvas');
                const targetCtx = target.getContext('2d');
                if (!targetCtx) return;
                
                if (aspectRatio === 'default') {
                    target.width = sourceCanvas.width;
                    target.height = sourceCanvas.height;
                    targetCtx.drawImage(sourceCanvas, 0, 0);
                    drawWatermark(targetCtx, target.width, target.height);
                    targetCanvas = target;
                } else {
                    let targetWidth, targetHeight;
                    if (aspectRatio === '9:16') {
                        targetHeight = 1920;
                        targetWidth = 1080;
                    } else if (aspectRatio === '16:9') {
                        targetWidth = 1920;
                        targetHeight = 1080;
                    } else if (aspectRatio === '4:5') {
                        targetWidth = 1080;
                        targetHeight = 1350;
                    } else { // 1:1 for Instagram
                        targetWidth = 1080;
                        targetHeight = 1080;
                    }
                    
                    target.width = targetWidth;
                    target.height = targetHeight;

                    const gradients = [
                        { from: '#DA22FF', to: '#9733EE' },
                        { from: '#09203F', to: '#537895' },
                        { from: '#868F96', to: '#596164' },
                        { from: '#93A5CF', to: '#E4EfE9' },
                        { from: '#11998E', to: '#38EF7D' }
                    ];
                    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
                    const gradient = targetCtx.createLinearGradient(0, 0, targetWidth, targetHeight);
                    gradient.addColorStop(0, randomGradient.from);
                    gradient.addColorStop(1, randomGradient.to);
                    targetCtx.fillStyle = gradient;
                    targetCtx.fillRect(0, 0, targetWidth, targetHeight);
                    
                    drawWatermark(targetCtx, targetWidth, targetHeight);

                    const padding = 100;
                    const scale = Math.min(
                        (targetWidth - padding * 2) / sourceCanvas.width, 
                        (targetHeight - padding * 2) / sourceCanvas.height
                    );
                    const scaledWidth = sourceCanvas.width * scale;
                    const scaledHeight = sourceCanvas.height * scale;
                    const dx = (targetWidth - scaledWidth) / 2;
                    const dy = (targetHeight - scaledHeight) / 2;
                    
                    targetCtx.drawImage(sourceCanvas, dx, dy, scaledWidth, scaledHeight);
                    targetCanvas = target;
                }

                const link = document.createElement('a');
                link.download = fileName;
                link.href = targetCanvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    if (!currentQuestion) {
        return (
             <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
             </div>
        );
    }

    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    };

    return (
        <div className="relative min-h-screen">
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                opacity: 0.05,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-green-50/90 dark:from-blue-900/80 dark:to-green-900/90" />
            <div className="relative z-10 container mx-auto px-4 py-8">
                
                {quizFinished ? (
                    <Card ref={quizCardRef} className="w-full max-w-xl mx-auto text-center shadow-2xl p-8 bg-card/80 backdrop-blur-sm">
                        <Confetti active={quizFinished} />
                        <CardHeader>
                            <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
                            <CardTitle className="text-4xl font-bold font-headline mt-4">Quiz Complete!</CardTitle>
                            <CardDescription className="text-lg">You did an amazing job!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl font-bold">{score} <span className="text-3xl text-muted-foreground">/ {totalMarks}</span></p>
                            <p className="text-xl mt-2 font-semibold">Your Score</p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={startQuiz} size="lg">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Play Again
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href="/quizzes">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Quizzes
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="w-full max-w-4xl mx-auto">
                        <Card className="bg-card/60 backdrop-blur-sm">
                             <CardContent className="p-3">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                     <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <FileQuestion className="w-5 h-5" />
                                        <span className="font-bold text-foreground">{currentQuestionIndex + 1}</span>
                                        <span>/</span>
                                        <span>{shuffledQuestions.length}</span>
                                    </div>
                                    <div className="flex-grow max-w-lg">
                                        <Progress value={progress} className="w-full h-2"/>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {timeLeft !== null && (
                                            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                                                <Clock className="w-5 h-5" />
                                                <span>{formatTime(timeLeft)}</span>
                                            </div>
                                        )}
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <ImageDown className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('default')}>Save as Default</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('16:9')}><Video className="mr-2 h-4 w-4" />Save for Landscape Video (16:9)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('9:16')}><Video className="mr-2 h-4 w-4 rotate-90" />Save for Short Video (9:16)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('1:1')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>Save for Instagram (1:1)</DropdownMenuItem>
                                                 <DropdownMenuItem onClick={() => handleSaveAsImage('4:5')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /></svg>Save for Facebook Post (4:5)</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div ref={quizCardRef}>
                             <Card className="shadow-2xl bg-card/60 backdrop-blur-sm overflow-hidden mt-2">
                                <CardHeader className="p-6 pb-2">
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>{test.subject}</span>
                                        <span>{currentQuestion.marks || 1} Mark{currentQuestion.marks > 1 ? 's' : ''}</span>
                                    </div>
                                     <CardTitle className="text-left text-2xl md:text-3xl font-semibold !mt-4 prose dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {currentQuestion.text}
                                        </ReactMarkdown>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center gap-4 p-6">
                                    {currentQuestion.type === 'Multiple Choice' && currentQuestion.options && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                            {currentQuestion.options.map((option, index) => {
                                                const isSelected = userAnswers[currentQuestion.id] === option.text; // Fixed: Use userAnswers[currentQuestion.id]
                                                const isCorrectAnswer = currentQuestion.correctAnswer === option.text;
                                                const isShown = showFeedback === currentQuestion.id;
                                                return(
                                                    <Card key={index} onClick={() => handleAnswer(currentQuestion.id, option.text)} className={cn(
                                                        "rounded-xl border-2 p-4 cursor-pointer transition-all duration-300",
                                                        !isShown && "hover:scale-105 hover:border-primary",
                                                        isShown && isCorrectAnswer && "border-green-500 ring-4 ring-green-500/50 bg-green-100 dark:bg-green-900/30",
                                                        isShown && isSelected && !isCorrectAnswer && "border-destructive ring-4 ring-destructive/50 bg-red-100 dark:bg-red-900/30"
                                                    )}>
                                                        <div className="flex items-center gap-4">
                                                             <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0", isSelected ? 'border-primary bg-primary' : 'border-muted-foreground')}>
                                                                {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                                                             </div>
                                                             <div className="prose-sm dark:prose-invert max-w-none">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{option.text}</ReactMarkdown>
                                                             </div>
                                                        </div>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    )}
                                     {(currentQuestion.type === 'Short Answer' || currentQuestion.type === 'Fill in the Blank') && (
                                        <div className="w-full space-y-4">
                                            <Input 
                                                placeholder="Type your answer here..."
                                                value={userAnswers[currentQuestion.id] || ''}
                                                onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                                disabled={showFeedback === currentQuestion.id}
                                                className="h-12 text-lg"
                                            />
                                            <Button onClick={() => handleAnswer(currentQuestion.id, userAnswers[currentQuestion.id])} disabled={showFeedback === currentQuestion.id || !userAnswers[currentQuestion.id]}>Check Answer</Button>
                                        </div>
                                    )}
                                    {feedback[currentQuestion.id] && showFeedback === currentQuestion.id && (
                                        <div className={`mt-4 font-bold text-xl ${feedback[currentQuestion.id] === 'correct' ? 'text-green-600' : 'text-destructive'}`}>
                                            {feedback[currentQuestion.id] === 'correct' ? 'Correct!' : 'Incorrect!'}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

