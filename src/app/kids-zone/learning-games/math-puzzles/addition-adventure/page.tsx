
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Delete } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';

const generateProblem = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { num1, num2, answer: num1 + num2 };
};

const feedbackMessages = {
  correct: ["Great job!", "You got it!", "Awesome!", "Correct!", "Superstar!"],
  incorrect: ["Try again!", "Not quite!", "Keep trying!", "Almost there!"],
};

const NumberPad = ({ onNumberClick, onClear, onDelete, onSubmit, isSubmitting }: { onNumberClick: (num: number) => void, onClear: () => void, onDelete: () => void, onSubmit: () => void, isSubmitting: boolean }) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    return (
        <Card className="w-full max-w-sm mx-auto bg-blue-100/50 dark:bg-blue-900/30">
            <CardContent className="p-4">
                 <div className="grid grid-cols-3 gap-3">
                    {numbers.map(num => (
                        <Button key={num} onClick={() => onNumberClick(num)} variant="outline" className="h-20 text-4xl font-bold rounded-xl shadow-lg bg-white dark:bg-slate-800 hover:bg-slate-50 active:shadow-inner active:scale-95 transition-transform">
                            {num}
                        </Button>
                    ))}
                    <Button onClick={onDelete} variant="outline" className="h-20 text-lg rounded-xl shadow-lg bg-white dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
                        <Delete className="w-8 h-8 text-destructive" />
                    </Button>
                     <Button onClick={onClear} variant="outline" className="h-20 text-lg col-span-2 rounded-xl shadow-lg bg-white dark:bg-slate-800 active:scale-95 transition-transform">
                        Clear
                    </Button>
                </div>
                 <Button onClick={onSubmit} size="lg" className="w-full mt-4 h-20 text-2xl bg-green-500 hover:bg-green-600 shadow-lg" disabled={isSubmitting}>
                    <Check className="mr-2 h-8 w-8"/>
                    Check
                </Button>
            </CardContent>
        </Card>
    );
};


export default function AdditionAdventurePage() {
    const [problem, setProblem] = useState<{ num1: number, num2: number, answer: number } | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<{message: string, type: 'correct' | 'incorrect' | 'none'}>({message: '', type: 'none'});
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Generate the initial problem on the client side to avoid hydration errors
        setProblem(generateProblem());
    }, []);

    const handleNewProblem = () => {
        setProblem(generateProblem());
        setUserAnswer('');
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
        setIsSubmitting(false);
    };
    
    useEffect(() => {
        if(feedback.type === 'correct') {
            setIsCorrect(true);
            const timer = setTimeout(() => {
                handleNewProblem();
            }, 1500);
            return () => clearTimeout(timer);
        }
        if (feedback.type === 'incorrect') {
            const timer = setTimeout(() => {
                setIsSubmitting(false);
                setFeedback({message: '', type: 'none'});
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [feedback.type]);

    const handleNumberClick = (num: number) => {
        if (userAnswer.length < 3) {
             setUserAnswer(prev => prev + num.toString());
        }
    };

    const handleClear = () => {
        setUserAnswer('');
    };

    const handleDelete = () => {
        setUserAnswer(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        if (!userAnswer || isSubmitting || !problem) return;
        
        setIsSubmitting(true);
        const answerNum = parseInt(userAnswer, 10);
        if (answerNum === problem.answer) {
            const randomMsg = feedbackMessages.correct[Math.floor(Math.random() * feedbackMessages.correct.length)];
            setFeedback({ message: randomMsg, type: 'correct' });
        } else {
             const randomMsg = feedbackMessages.incorrect[Math.floor(Math.random() * feedbackMessages.incorrect.length)];
            setFeedback({ message: randomMsg, type: 'incorrect' });
        }
    };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 min-h-screen p-4">
      <div className="container mx-auto py-8">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games/math-puzzles">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Math Puzzles
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            Addition Adventure
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            Add the numbers and type the correct answer!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
            <Card className="w-full shadow-xl bg-white/60 dark:bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-center text-6xl md:text-7xl font-bold tracking-wider flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-slate-700 dark:text-slate-200" style={{fontFamily: "'Lexend', sans-serif"}}>
                        <span>{problem?.num1 ?? '?'}</span>
                        <span className="text-blue-500 font-normal">+</span>
                        <span>{problem?.num2 ?? '?'}</span>
                        <span className="text-blue-500 font-normal">=</span>
                        <span className="inline-block w-36 h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-7xl font-mono shadow-inner">
                            {userAnswer || '?'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-20 text-center relative flex justify-center items-center">
                    <Confetti active={isCorrect} config={{
                        angle: 90,
                        spread: 360,
                        startVelocity: 40,
                        elementCount: 100,
                        decay: 0.9,
                    }}/>

                {feedback.type === 'correct' && (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-2xl animate-pulse">
                        <Sparkles className="w-8 h-8" /> {feedback.message}
                    </div>
                )}
                {feedback.type === 'incorrect' && (
                    <div className="flex items-center gap-2 text-destructive font-bold text-2xl">
                        <X className="w-8 h-8" /> {feedback.message}
                    </div>
                )}
                </CardContent>
                 <CardContent className="flex justify-center">
                    <Button variant="outline" onClick={handleNewProblem} size="lg">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        New Problem
                    </Button>
                </CardContent>
            </Card>

             <NumberPad 
                onNumberClick={handleNumberClick}
                onClear={handleClear}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
      </div>
    </div>
  );
}
