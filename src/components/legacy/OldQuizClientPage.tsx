'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Trophy, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
type Question = {
    id: string;
    text: string;
    image?: string;
    options: { text: string; image?: string; }[];
    correctAnswer: any;
    type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Fill in the Blank';
};

type Quiz = {
    id: string;
    title: string;
    questions: Question[];
    isPremium?: boolean;
};

const PremiumLock = () => (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white p-8 text-center">
        <Lock className="w-16 h-16 text-yellow-400 mb-4" />
        <h2 className="text-3xl font-bold mb-2">Premium Quiz</h2>
        <p className="text-lg text-slate-300 mb-6">You need to upgrade to a premium account to access this quiz.</p>
        <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black">
            Upgrade to Premium
        </Button>
    </div>
);


export default function QuizClientPage({ quiz }: { quiz: Quiz }) {
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
    const [feedback, setFeedback] = useState<{message: string, type: 'correct' | 'incorrect' | 'none'}>({message: '', type: 'none'});
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [textAnswer, setTextAnswer] = useState('');
    
    // Let's assume a hook `useAuth` provides user's premium status
    const isUserPremium = false; // Replace with actual check, e.g. `useAuth().isPremium;`
    
    const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    
    const playSystemSound = useCallback((type: 'correct' | 'incorrect' | 'win') => {
        if (typeof window === 'undefined') return;
        let soundUrl = '';
        if (type === 'correct') soundUrl = '/audio/correct.wav';
        else if (type === 'incorrect') soundUrl = '/audio/incorrect.wav';
        else if (type === 'win') soundUrl = '/audio/win.mp3';
        
        if(soundUrl) {
            const audio = new Audio(soundUrl);
            audio.play().catch(error => console.error(`Error playing sound:`, error));
        }
    }, []);

    const nextQuestion = useCallback(() => {
        setIsSubmitting(false);
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setFeedback({ message: '', type: 'none' });
            setTextAnswer('');
        } else {
            setQuizFinished(true);
            playSystemSound('win');
        }
    }, [currentQuestionIndex, shuffledQuestions.length, playSystemSound]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswer = useCallback((answer: any) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSelectedAnswer(answer);
        
        const correctAnswer = currentQuestion.correctAnswer;
        const isCorrect = answer === correctAnswer;

        if (isCorrect) {
            setFeedback({ message: 'Correct!', type: 'correct' });
            setScore(prev => prev + 1);
            playSystemSound('correct');
        } else {
            setFeedback({ message: 'Incorrect!', type: 'incorrect' });
            playSystemSound('incorrect');
        }

        nextQuestionTimeoutRef.current = setTimeout(nextQuestion, 2000);
    }, [isSubmitting, currentQuestion, playSystemSound, nextQuestion]);
    
    const restartQuiz = () => {
        setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setFeedback({ message: '', type: 'none' });
        setScore(0);
        setQuizFinished(false);
        setIsSubmitting(false);
        setTextAnswer('');
    };
    
    useEffect(() => {
      if (quiz && quiz.questions) {
          setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
      }
      setIsLoading(false);
    }, [quiz]);

    useEffect(() => {
        return () => {
            if (nextQuestionTimeoutRef.current) {
              clearTimeout(nextQuestionTimeoutRef.current);
            }
        }
    }, []);

    if (isLoading) {
        return (
             <div className="w-full max-w-xl mx-auto py-12 px-4">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!quiz || !shuffledQuestions || shuffledQuestions.length === 0) {
        return (
             <div className="container mx-auto px-4 py-12 text-center">
                 <h1 className="text-2xl font-bold">Quiz not found.</h1>
                 <Button asChild className="mt-4"><Link href="/quizzes">Back to Quizzes</Link></Button>
             </div>
        );
    }

    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

    const showPremiumLock = quiz.isPremium && !isUserPremium;
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl">
                 {showPremiumLock && <PremiumLock />}
                 <div className={cn("transition-opacity", showPremiumLock && "opacity-20 blur-sm pointer-events-none")}>
                    {quizFinished ? (
                        <Card className="text-center p-8">
                            <Confetti active={quizFinished} />
                            <CardHeader>
                                <Trophy className="w-20 h-20 text-yellow-400 mx-auto" />
                                <CardTitle className="text-3xl font-bold mt-4">Quiz Complete!</CardTitle>
                                <CardDescription className="text-lg">You did an amazing job!</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold">{score} <span className="text-2xl text-muted-foreground">/ {shuffledQuestions.length}</span></p>
                                <p className="text-xl mt-2 font-semibold">Your Score</p>
                                <div className="mt-8 flex gap-4 justify-center">
                                    <Button onClick={restartQuiz} size="lg"><RefreshCw className="mr-2 h-4 w-4" />Play Again</Button>
                                    <Button asChild variant="outline" size="lg"><Link href="/quizzes"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <Progress value={progress} className="h-2" />
                                <CardTitle className="text-2xl font-bold pt-4 text-center">{currentQuestion?.text}</CardTitle>
                                {currentQuestion?.image && (
                                    <div className="pt-4">
                                        <div className="relative h-48 w-full">
                                            <Image src={currentQuestion.image} alt={currentQuestion.text || 'Question Image'} layout="fill" objectFit="contain" className="rounded-lg" />
                                        </div>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-6">
                                {currentQuestion?.type === 'Multiple Choice' ? (
                                    <RadioGroup onValueChange={handleAnswer} value={selectedAnswer || ''} disabled={!!selectedAnswer}>
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentQuestion.options.map((option, index) => {
                                                const isSelected = selectedAnswer === option.text;
                                                const isCorrect = currentQuestion.correctAnswer === option.text;
                                                
                                                return (
                                                    <Label key={index} className={cn("rounded-lg border-2 p-4 flex items-center gap-4 transition-all",
                                                        !!selectedAnswer ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800",
                                                        isSelected && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-500",
                                                        isSelected && !isCorrect && "bg-red-100 dark:bg-red-900/30 border-red-500",
                                                        !!selectedAnswer && !isSelected && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-500",
                                                    )}>
                                                        <RadioGroupItem value={option.text} id={`opt-${index}`} className="shrink-0"/>
                                                        <span className="font-semibold text-lg">{option.text}</span>
                                                        {!!selectedAnswer && isCorrect && <Check className="w-6 h-6 text-green-500 ml-auto" />}
                                                        {!!selectedAnswer && isSelected && !isCorrect && <X className="w-6 h-6 text-red-500 ml-auto" />}
                                                    </Label>
                                                );
                                            })}
                                        </div>
                                    </RadioGroup>
                                ) : currentQuestion?.type === 'True/False' ? (
                                    <RadioGroup onValueChange={handleAnswer} value={selectedAnswer || ''} disabled={!!selectedAnswer} className="grid grid-cols-2 gap-4">
                                         {['True', 'False'].map((option, index) => {
                                            const isSelected = selectedAnswer === option;
                                            const isCorrect = currentQuestion.correctAnswer === option;
                                            return (
                                                <Label key={index} className={cn("rounded-lg border-2 p-4 flex justify-center items-center gap-4 text-xl font-bold",
                                                    !!selectedAnswer ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800",
                                                    isSelected && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-500",
                                                    isSelected && !isCorrect && "bg-red-100 dark:bg-red-900/30 border-red-500",
                                                    !!selectedAnswer && !isSelected && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-500",
                                                )}>
                                                    <RadioGroupItem value={option} id={`opt-${index}`} className="sr-only" />
                                                    {option}
                                                </Label>
                                            );
                                        })}
                                    </RadioGroup>
                                ) : ( // Short Answer or Fill in the Blank
                                    <form onSubmit={(e) => { e.preventDefault(); handleAnswer(textAnswer); }} className="flex w-full items-center space-x-2">
                                        <Input type="text" placeholder="Your answer" value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} disabled={!!selectedAnswer} className="text-lg h-12" />
                                        <Button type="submit" disabled={!!selectedAnswer || !textAnswer.trim()} size="lg">Submit</Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}
                 </div>
            </div>
        </div>
    );
}
