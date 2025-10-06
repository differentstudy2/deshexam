
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';

const questions = [
  {
    question: "Which animal is known as the 'King of the Jungle'?",
    options: ["Tiger", "Lion", "Elephant", "Bear"],
    answer: "Lion",
    image: "https://picsum.photos/seed/lion-q/400/200",
    imageHint: "lion face"
  },
  {
    question: "What is the tallest animal in the world?",
    options: ["Elephant", "Whale", "Giraffe", "Rhino"],
    answer: "Giraffe",
    image: "https://picsum.photos/seed/giraffe-q/400/200",
    imageHint: "giraffe neck"
  },
  {
    question: "Which animal has black and white stripes?",
    options: ["Tiger", "Leopard", "Zebra", "Cheetah"],
    answer: "Zebra",
    image: "https://picsum.photos/seed/zebra-q/400/200",
    imageHint: "zebra stripes"
  },
  {
    question: "What sweet food do bees make?",
    options: ["Wax", "Pollen", "Nectar", "Honey"],
    answer: "Honey",
    image: "https://picsum.photos/seed/honey-q/400/200",
    imageHint: "honey jar"
  },
  {
    question: "Which of these birds cannot fly?",
    options: ["Eagle", "Penguin", "Parrot", "Sparrow"],
    answer: "Penguin",
    image: "https://picsum.photos/seed/penguin-q/400/200",
    imageHint: "penguin cute"
  },
  {
    question: "What is a baby cat called?",
    options: ["Puppy", "Kitten", "Calf", "Joey"],
    answer: "Kitten",
    image: "https://picsum.photos/seed/kitten-q/400/200",
    imageHint: "kitten playful"
  },
   {
    question: "How many legs does a spider have?",
    options: ["6", "8", "10", "4"],
    answer: "8",
    image: "https://picsum.photos/seed/spider-q/400/200",
    imageHint: "spider web"
  },
  {
    question: "Which is the largest land animal?",
    options: ["Hippopotamus", "Rhinoceros", "Elephant", "Giraffe"],
    answer: "Elephant",
    image: "https://picsum.photos/seed/elephant-q/400/200",
    imageHint: "elephant large"
  },
];

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

export default function AmazingAnimalsQuizPage() {
    const [shuffledQuestions, setShuffledQuestions] = useState(questions.sort(() => Math.random() - 0.5));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [isWrong, setIsWrong] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const progress = (currentQuestionIndex / shuffledQuestions.length) * 100;

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;

        setSelectedAnswer(answer);
        if (answer === currentQuestion.answer) {
            setFeedback('Correct!');
            setIsCorrect(true);
            setScore(prev => prev + 1);
            playSound('correct');
        } else {
            setFeedback('Not quite!');
            setIsWrong(true);
            playSound('incorrect');
        }

        setTimeout(() => {
            if (currentQuestionIndex < shuffledQuestions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setFeedback('');
                setIsCorrect(false);
                setIsWrong(false);
            } else {
                setQuizFinished(true);
                playSound('win');
            }
        }, 1500);
    };

    const restartQuiz = () => {
        setShuffledQuestions(questions.sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setFeedback('');
        setIsCorrect(false);
        setIsWrong(false);
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
                    <div className="relative h-48 w-full rounded-lg overflow-hidden">
                         <img src={currentQuestion.image} alt={currentQuestion.question} className="object-cover w-full h-full" data-ai-hint={currentQuestion.imageHint} />
                         <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {currentQuestionIndex + 1} / {shuffledQuestions.length}
                         </div>
                    </div>
                    <CardTitle className="text-center text-2xl md:text-3xl font-bold text-slate-800 pt-4">
                        {currentQuestion.question}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectAnswer = currentQuestion.answer === option;

                            return (
                                <Button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!selectedAnswer}
                                    className={`h-auto py-4 text-lg justify-start gap-4 transition-all duration-300 transform
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
                                    {option}
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
