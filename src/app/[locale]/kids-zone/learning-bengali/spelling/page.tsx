
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Lightbulb, Check, X } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { cn } from '@/lib/utils';

const words = [
  { word: 'বিড়াল', hint: 'একটি পোষা প্রাণী (A pet animal)' },
  { word: 'কুকুর', hint: 'একটি বিশ্বস্ত প্রাণী (A loyal animal)' },
  { word: 'মাছ', hint: 'জলে থাকে (Lives in water)' },
  { word: 'পাখি', hint: 'আকাশে ওড়ে (Flies in the sky)' },
  { word: 'ফল', hint: 'আমরা খাই (We eat this)' },
  { word: 'ফুল', hint: 'সুন্দর গন্ধ ছড়ায় (Spreads a nice smell)' },
  { word: 'বই', hint: 'আমরা পড়ি (We read this)' },
  { word: 'ঘর', hint: 'আমরা থাকি (We live here)' },
  { word: 'স্কুল', hint: 'আমরা পড়তে যাই (We go here to study)' },
  { word: 'কলম', hint: 'আমরা লিখি (We write with this)' },
  { word: 'জল', hint: 'আমরা পান করি (We drink this)' },
  { word: 'ভাত', hint: 'প্রধান খাদ্য (A staple food)' },
];

const playSound = (type: 'correct' | 'incorrect') => {
  if (typeof window !== 'undefined') {
    const soundUrl = type === 'correct'
      ? '/audio/correct-83487.mp3'
      : '/audio/incorrect-293358.mp3';
      
    const audio = new Audio(soundUrl);
    audio.play().catch(error => console.error(`Error playing ${type} sound:`, error));
  }
};


export default function BengaliSpellingPage() {
  const [currentWord, setCurrentWord] = useState<{ word: string, hint: string } | null>(null);
  const [jumbledLetters, setJumbledLetters] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string, type: 'correct' | 'incorrect' | 'none' }>({ message: '', type: 'none' });
  const [isCorrect, setIsCorrect] = useState(false);

  const startNewRound = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const newWord = words[randomIndex];
    setCurrentWord(newWord);
    
    const shuffled = newWord.word.split('').sort(() => Math.random() - 0.5);
    setJumbledLetters(shuffled);
    
    setUserAnswer([]);
    setFeedback({ message: '', type: 'none' });
    setIsCorrect(false);
  }, []);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const handleLetterClick = (letter: string, index: number) => {
    setUserAnswer(prev => [...prev, letter]);
    setJumbledLetters(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnswerLetterClick = (letter: string, index: number) => {
    setUserAnswer(prev => prev.filter((_, i) => i !== index));
    setJumbledLetters(prev => [...prev, letter]);
  };
  
  const checkAnswer = () => {
    if (!currentWord) return;

    if (userAnswer.join('') === currentWord.word) {
      setFeedback({ message: 'Correct!', type: 'correct' });
      setIsCorrect(true);
      playSound('correct');
      setTimeout(startNewRound, 2000);
    } else {
      setFeedback({ message: 'Try Again!', type: 'incorrect' });
      playSound('incorrect');
      setTimeout(() => setFeedback({ message: '', type: 'none' }), 1500);
    }
  };


  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-bengali">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Bengali
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-indigo-600">
            বানান কৌশল (Spelling)
          </h1>
          <p className="text-lg text-indigo-700/80 mt-4 max-w-2xl mx-auto">
            Arrange the letters to spell the word correctly.
          </p>
        </header>

        <div className="relative flex flex-col items-center justify-center">
            <Card className="w-full max-w-lg shadow-2xl bg-white/70 backdrop-blur-sm">
                 <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Hint: {currentWord?.hint}</span>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    {/* Answer Area */}
                    <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center gap-2 p-2 border-2 border-dashed">
                        {userAnswer.map((letter, index) => (
                             <Button
                                key={index}
                                onClick={() => handleAnswerLetterClick(letter, index)}
                                className="h-16 w-16 text-4xl font-bold rounded-lg shadow-inner bg-white"
                                variant="outline"
                            >
                                {letter}
                            </Button>
                        ))}
                         {userAnswer.length === 0 && <span className="text-muted-foreground">Click letters below...</span>}
                    </div>

                    {/* Feedback Area */}
                    <div className="h-10 relative flex justify-center items-center">
                       <Confetti active={isCorrect} />
                        {feedback.message && (
                            <div className={`flex items-center justify-center gap-2 font-bold text-2xl ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                                {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                                {feedback.message}
                            </div>
                        )}
                    </div>
                    
                    {/* Jumbled Letters Area */}
                    <div className="w-full flex items-center justify-center flex-wrap gap-2 p-2 min-h-[80px]">
                        {jumbledLetters.map((letter, index) => (
                            <Button
                                key={index}
                                onClick={() => handleLetterClick(letter, index)}
                                disabled={isCorrect}
                                className="h-16 w-16 text-4xl font-bold rounded-lg shadow-lg transform transition-transform hover:scale-105"
                                variant="outline"
                            >
                                {letter}
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-4">
                         <Button onClick={checkAnswer} disabled={userAnswer.length !== currentWord?.word.length || isCorrect} size="lg">
                            <Check className="mr-2 h-5 w-5"/>
                            Check Answer
                        </Button>
                         <Button variant="outline" onClick={startNewRound} size="lg">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Next Word
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
