
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

const NumberPad = ({ onNumberClick, onClear, onDelete }: { onNumberClick: (num: number) => void, onClear: () => void, onDelete: () => void }) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    return (
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {numbers.map(num => (
                <Button key={num} onClick={() => onNumberClick(num)} variant="outline" className="h-16 text-3xl font-bold rounded-xl shadow-md active:shadow-inner">
                    {num}
                </Button>
            ))}
             <Button onClick={onDelete} variant="outline" className="h-16 text-lg col-span-1 rounded-xl shadow-md active:shadow-inner flex items-center justify-center">
                <Delete className="w-8 h-8" />
            </Button>
            <Button onClick={onClear} variant="outline" className="h-16 text-lg col-span-2 rounded-xl shadow-md active:shadow-inner">
                Clear
            </Button>
        </div>
    );
};


export default function AdditionAdventurePage() {
    const [problem, setProblem] = useState(generateProblem());
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<{message: string, type: 'correct' | 'incorrect' | 'none'}>({message: '', type: 'none'});
    const [isCorrect, setIsCorrect] = useState(false);

    const handleNewProblem = () => {
        setProblem(generateProblem());
        setUserAnswer('');
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
    };
    
    useEffect(() => {
        if(feedback.type === 'correct') {
            setIsCorrect(true);
            const timer = setTimeout(() => {
                handleNewProblem();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [feedback.type]);

    const handleNumberClick = (num: number) => {
        setUserAnswer(prev => prev + num.toString());
    };

    const handleClear = () => {
        setUserAnswer('');
    };

    const handleDelete = () => {
        setUserAnswer(prev => prev.slice(0, -1));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAnswer) return;
        
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
    <div className="bg-blue-50 dark:bg-blue-900/20 min-h-screen p-4">
      <div className="container mx-auto py-8">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games/math-puzzles">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Math Puzzles
                </Link>
            </Button>
        </div>
        <header className="text-center mb-8">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            Addition Adventure
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            Add the numbers and type the correct answer!
          </p>
        </header>

        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold tracking-wider flex items-center justify-center gap-4 text-slate-700 dark:text-slate-200">
                <span>{problem.num1}</span>
                <span className="text-blue-500">+</span>
                <span>{problem.num2}</span>
                <span className="text-blue-500">=</span>
                <span className="inline-block w-24 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-5xl font-mono">
                    {userAnswer || '?'}
                </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <NumberPad 
                    onNumberClick={handleNumberClick}
                    onClear={handleClear}
                    onDelete={handleDelete}
                />
                <div className="text-center">
                    <Button type="submit" size="lg" className="h-16 w-full max-w-xs mx-auto">
                        <Check className="mr-2"/>
                        Check Answer
                    </Button>
                </div>
            </form>
            <div className="h-10 text-center relative flex justify-center">
                 <Confetti active={isCorrect} config={{
                    angle: 90,
                    spread: 360,
                    startVelocity: 40,
                    elementCount: 70,
                    decay: 0.9,
                 }}/>

              {feedback.type === 'correct' && (
                <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
                    <Sparkles className="w-6 h-6" /> {feedback.message}
                </div>
              )}
              {feedback.type === 'incorrect' && (
                 <div className="flex items-center gap-2 text-destructive font-semibold text-lg">
                    <X className="w-6 h-6" /> {feedback.message}
                </div>
              )}
            </div>
             <div className="text-center">
                <Button variant="outline" onClick={handleNewProblem}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New Problem
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
