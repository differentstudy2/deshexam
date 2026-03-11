
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Trophy, Volume2 } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

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

    useEffect(() => {
        if(quiz && quiz.questions) {
             setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        }
    }, [quiz]);

    if (!quiz || !shuffledQuestions || shuffledQuestions.length === 0) {
        return (
             <div className="container mx-auto px-4 py-12 text-center">
                 <h1 className="text-2xl font-bold">Quiz not found or has no questions.</h1>
                 <Button asChild className="mt-4">
                     <Link href="/kids-zone/fun-quizzes">Back to Quizzes</Link>
                 </Button>
             </div>
        );
    }
    
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const progress = (currentQuestionIndex / shuffledQuestions.length) * 100;

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;

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

        setTimeout(() => {
            if (currentQuestionIndex < shuffledQuestions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setFeedback('');
                setIsCorrect(false);
            } else {
                setQuizFinished(true);
                playSound('win');
            }
        }, 1500);
    };

    const restartQuiz = () => {
        setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setFeedback('');
        setIsCorrect(false);
        setScore(0);
        setQuizFinished(false);
    };
    
    return (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/10 min-h-screen">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <Button asChild variant="ghost">
                    <Link href="/kids-zone/fun-quizzes">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Fun Quizzes
                    </Link>
                </Button>
            </div>
            
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
                        <Button onClick={restartQuiz} className="mt-8" size="lg">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Play Again
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-white/70 backdrop-blur-sm">
                     <CardHeader className="relative">
                        <Progress value={progress} className="w-full h-2 mb-4" />
                        {currentQuestion.image && (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                 <Image src={currentQuestion.image} alt={currentQuestion.text} layout="fill" objectFit="cover" />
                            </div>
                        )}
                        <div className="absolute top-10 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {currentQuestionIndex + 1} / {shuffledQuestions.length}
                        </div>
                        <CardTitle className="text-center text-2xl md:text-3xl font-bold text-slate-800 pt-4 flex items-center justify-center gap-2">
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
                    </CardContent>
                </Card>
            )}
          </div>
        </div>
    );
}
