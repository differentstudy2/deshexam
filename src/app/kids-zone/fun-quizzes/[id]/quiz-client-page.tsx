
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Trophy, Volume2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from "@/lib/utils";

const playSound = (type: 'correct' | 'incorrect' | 'win' | 'url', url?: string) => {
  if (typeof window !== 'undefined') {
    let soundUrl = '';
    if (type === 'correct') soundUrl = '/audio/correct-83487.mp3';
    else if (type === 'incorrect') soundUrl = '/audio/incorrect-293358.mp3';
    else if (type === 'win') soundUrl = '/audio/win-fanfare.mp3';
    else if (type === 'url' && url) soundUrl = url;
    
    if(soundUrl) {
        const audio = new Audio(soundUrl);
        audio.play().catch(error => console.error(`Error playing sound:`, error));
    }
  }
};

type Question = {
    text: string;
    image?: string;
    audio?: string;
    options: { text: string; image?: string; audio?: string; }[];
    correctAnswer: string;
};

type Quiz = {
    id: string;
    title: string;
    questions: Question[];
};

export default function QuizClientPage({ quiz }: { quiz: Quiz }) {
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [timerDuration, setTimerDuration] = useState(30);
    const [timeLeft, setTimeLeft] = useState(30);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const nextQuestion = useCallback(() => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setFeedback('');
            setIsCorrect(false);
            if (timerDuration > 0) {
                setTimeLeft(timerDuration);
            }
        } else {
            setQuizFinished(true);
            playSound('win');
        }
    }, [currentQuestionIndex, shuffledQuestions.length, timerDuration]);
    
    useEffect(() => {
        if(quiz && quiz.questions) {
             setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        }
    }, [quiz]);

    useEffect(() => {
        if (quizFinished || selectedAnswer || timerDuration === 0) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                    playSound('incorrect');
                    setFeedback("Time's up!");
                    setTimeout(nextQuestion, 1500); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [quizFinished, selectedAnswer, nextQuestion, timerDuration, currentQuestionIndex]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        setSelectedAnswer(answer);
        if (answer === currentQuestion.correctAnswer) {
            setFeedback('Correct!');
            setIsCorrect(true);
            setScore(prev => prev + 1);
            playSound('correct');
        } else {
            setFeedback('Not quite!');
            playSound('incorrect');
        }

        setTimeout(nextQuestion, 1500);
    };

    const restartQuiz = () => {
        setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setFeedback('');
        setIsCorrect(false);
        setScore(0);
        setQuizFinished(false);
        setTimeLeft(timerDuration);
    };
    
    const handleTimerChange = (value: string) => {
        const newDuration = parseInt(value, 10);
        setTimerDuration(newDuration);
        setTimeLeft(newDuration);
    };

    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    if (!quiz || !shuffledQuestions || shuffledQuestions.length === 0 || !currentQuestion) {
        return (
             <div className="container mx-auto px-4 py-12 text-center">
                 <h1 className="text-2xl font-bold">Quiz not found or has no questions.</h1>
                 <Button asChild className="mt-4">
                     <Link href="/kids-zone/fun-quizzes">Back to Fun Quizzes</Link>
                 </Button>
             </div>
        );
    }
    
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    
    return (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/10 min-h-screen">
          <div className="container mx-auto px-4 py-12">
            
            {quizFinished ? (
                <Card className="w-full max-w-xl mx-auto text-center shadow-2xl p-8">
                    <Confetti active={quizFinished} />
                    <CardHeader>
                        <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
                        <CardTitle className="text-4xl font-bold font-headline mt-4">Quiz Complete!</CardTitle>
                        <CardDescription className="text-lg">You did an amazing job!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold">{score} <span className="text-3xl text-muted-foreground">/ {shuffledQuestions.length}</span></p>
                        <p className="text-xl mt-2 font-semibold">Your Score</p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={restartQuiz} size="lg">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Play Again
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/kids-zone/fun-quizzes">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Fun Quizzes
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-card/70 dark:bg-card/60 backdrop-blur-sm">
                     <CardHeader className="relative">
                        <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-muted-foreground">
                                Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                            </div>
                            <div className="flex items-center gap-4">
                                {timerDuration > 0 && (
                                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                                        <Clock className="w-5 h-5" />
                                        <span>{timeLeft}s</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="timer-select" className="text-sm font-medium">Timer</Label>
                                    <Select value={timerDuration.toString()} onValueChange={handleTimerChange} disabled={selectedAnswer !== null}>
                                        <SelectTrigger id="timer-select" className="w-[120px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 seconds</SelectItem>
                                            <SelectItem value="30">30 seconds</SelectItem>
                                            <SelectItem value="60">60 seconds</SelectItem>
                                            <SelectItem value="0">Off</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {currentQuestion.image && (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden mt-4">
                                 <Image src={currentQuestion.image} alt={currentQuestion.text} layout="fill" objectFit="cover" />
                            </div>
                        )}
                        
                        <CardTitle className="text-center text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 pt-4 flex items-center justify-center gap-2">
                            <span>{currentQuestion.text}</span>
                            {currentQuestion.audio && (
                                <Button variant="ghost" size="icon" onClick={() => playSound('url', currentQuestion.audio)}>
                                    <Volume2 />
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === option.text;
                                const isCorrectAnswer = currentQuestion.correctAnswer === option.text;

                                return (
                                    <Button
                                        key={index}
                                        onClick={() => handleAnswer(option.text)}
                                        disabled={!!selectedAnswer}
                                        className={`h-auto p-4 text-lg justify-start gap-4 transition-all duration-300 transform
                                            ${isSelected && isCorrectAnswer ? 'bg-green-500 hover:bg-green-600 scale-105' : ''}
                                            ${isSelected && !isCorrectAnswer ? 'bg-destructive hover:bg-destructive/90 scale-105' : ''}
                                            ${!isSelected && selectedAnswer && isCorrectAnswer ? 'bg-green-500 hover:bg-green-600' : ''}
                                        `}
                                        variant="outline"
                                    >
                                         {isSelected && isCorrectAnswer && <Check />}
                                         {isSelected && !isCorrectAnswer && <X />}
                                         {!isSelected && selectedAnswer && isCorrectAnswer && <Check />}
                                         {!selectedAnswer && <Sparkles className="w-4 h-4 text-yellow-500" />}

                                        {option.image && <Image src={option.image} alt={option.text} width={40} height={40} className="rounded-md" />}
                                        <span className="flex-grow text-left">{option.text}</span>
                                         {option.audio && (
                                            <div onClick={(e) => { e.stopPropagation(); playSound('url', option.audio); }}>
                                                <Volume2 className="w-5 h-5 text-muted-foreground hover:text-foreground"/>
                                            </div>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                         {feedback && <div className={`mt-4 font-bold text-xl ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>{feedback}</div>}
                    </CardContent>
                </Card>
            )}
          </div>
        </div>
    );
}
