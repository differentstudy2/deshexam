
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';

const playSound = (type: 'correct' | 'incorrect') => {
  const soundUrl = type === 'correct' 
    ? '/audio/correct-83487.mp3' 
    : '/audio/incorrect-293358.mp3';
  const audio = new Audio(soundUrl);
  audio.play();
};

const generateNumber = () => Math.floor(Math.random() * 10);

const generateOptions = (correctAnswer: number) => {
    const options = new Set<number>([correctAnswer]);
    while (options.size < 4) {
        const option = generateNumber();
        if (option !== correctAnswer) {
            options.add(option);
        }
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
};

export default function NumberRecognitionPage() {
    const [numberToGuess, setNumberToGuess] = useState(generateNumber());
    const [options, setOptions] = useState<number[]>([]);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const startNewRound = useCallback(() => {
        const newNumber = generateNumber();
        setNumberToGuess(newNumber);
        setOptions(generateOptions(newNumber));
        setFeedback('');
        setIsCorrect(false);
        setIsSubmitting(false);
    }, []);

    useEffect(() => {
        startNewRound();
    }, [startNewRound]);

    const handleAnswer = (selectedNumber: number) => {
        setIsSubmitting(true);
        if (selectedNumber === numberToGuess) {
            setFeedback('Correct!');
            setIsCorrect(true);
            playSound('correct');
            setTimeout(() => {
                startNewRound();
            }, 1500);
        } else {
            setFeedback('Try again!');
            playSound('incorrect');
            setTimeout(() => {
                setIsSubmitting(false);
                setFeedback('');
            }, 1000);
        }
    };

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Games
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-red-600">
            Number Recognition
          </h1>
          <p className="text-lg text-red-700/80 mt-4 max-w-2xl mx-auto">
            Look at the big number and click the matching button below!
          </p>
        </header>

        <div className="relative flex flex-col items-center justify-center">
            <Card className="w-full max-w-md shadow-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-center text-9xl font-bold text-slate-800" style={{fontFamily: "'Lexend', sans-serif"}}>
                        {numberToGuess}
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
                    {feedback && (
                        <div className={`flex items-center gap-2 font-bold text-2xl ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                            {isCorrect ? <Sparkles className="w-8 h-8" /> : <X className="w-8 h-8" />}
                            {feedback}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              {options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={isSubmitting}
                  className="h-24 md:h-32 text-5xl font-bold rounded-2xl shadow-lg transform transition-transform hover:scale-105"
                  variant="outline"
                >
                  {option}
                </Button>
              ))}
            </div>

             <div className="mt-12">
                <Button variant="outline" onClick={startNewRound} size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New Number
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
