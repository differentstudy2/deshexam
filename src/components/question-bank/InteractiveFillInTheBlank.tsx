'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Confetti from 'react-dom-confetti';

const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    perspective: "500px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

interface InteractiveFillInTheBlankProps {
    text: string;
    correctAnswers: string[];
    distractors: string[];
    testMode: boolean;
    showAnswer: boolean;
    onAttempt?: (isCorrect: boolean) => void;
}

export default function InteractiveFillInTheBlank({
    text,
    correctAnswers,
    distractors,
    testMode,
    showAnswer,
    onAttempt
}: InteractiveFillInTheBlankProps) {
    const [wordBank, setWordBank] = useState<{ id: string; word: string }[]>([]);
    const [filledBlanks, setFilledBlanks] = useState<(string | null)[]>([]);
    const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Parse text to find blanks
    const textSegments = text.split(/\[blank\]/i);
    const numberOfBlanks = textSegments.length - 1;

    // Initialize state
    useEffect(() => {
        if (!testMode) {
            // In reading mode, just fill the blanks with correct answers
            setFilledBlanks(correctAnswers.slice(0, numberOfBlanks));
            return;
        }

        const allWords = [...correctAnswers, ...distractors]
            .map(w => w.trim())
            .filter(w => w.length > 0);

        // Shuffle words
        const shuffled = [...allWords];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setWordBank(shuffled.map((word, index) => ({ id: `word-${index}`, word })));
        setFilledBlanks(new Array(numberOfBlanks).fill(null));
        setHasSubmitted(false);
    }, [correctAnswers, distractors, numberOfBlanks, testMode]);

    const handleWordClick = (id: string) => {
        if (!testMode || hasSubmitted || showAnswer) return;
        
        // If already selected, deselect
        if (selectedWordId === id) {
            setSelectedWordId(null);
            return;
        }

        // Auto-fill the first available empty blank
        const firstEmptyIndex = filledBlanks.findIndex(b => b === null);
        if (firstEmptyIndex !== -1) {
            const wordToFill = wordBank.find(w => w.id === id)?.word;
            if (wordToFill) {
                const newFilled = [...filledBlanks];
                newFilled[firstEmptyIndex] = wordToFill;
                setFilledBlanks(newFilled);
                setSelectedWordId(null);
                return;
            }
        }
        
        // If no empty blanks, just select the word to allow replacing
        setSelectedWordId(id);
    };

    const handleBlankClick = (index: number) => {
        if (!testMode || hasSubmitted || showAnswer) return;

        // If a word is selected, fill or replace this blank with the selected word
        if (selectedWordId) {
            const wordToFill = wordBank.find(w => w.id === selectedWordId)?.word;
            if (wordToFill) {
                const newFilled = [...filledBlanks];
                newFilled[index] = wordToFill;
                setFilledBlanks(newFilled);
                setSelectedWordId(null); // deselect after filling
                return;
            }
        }

        // If no word is selected and clicking a filled blank, return the word to the bank
        if (filledBlanks[index] !== null) {
            const newFilled = [...filledBlanks];
            newFilled[index] = null;
            setFilledBlanks(newFilled);
        }
    };

    const handleSubmit = () => {
        if (!testMode) return;
        setHasSubmitted(true);
        
        const isCorrect = filledBlanks.every((filled, idx) => {
            const correct = correctAnswers[idx]?.trim().toLowerCase();
            return filled?.trim().toLowerCase() === correct;
        });

        if (onAttempt) {
            onAttempt(isCorrect);
        }
    };

    const isWordUsed = (word: string) => filledBlanks.includes(word);

    // Determine correctness for UI coloring
    const isFullyCorrect = hasSubmitted && filledBlanks.every((filled, idx) => {
        const correct = correctAnswers[idx]?.trim().toLowerCase();
        return filled?.trim().toLowerCase() === correct;
    });

    return (
        <div className="flex flex-col gap-6 max-w-3xl">
            {/* The Text with Blanks */}
            <div className="text-lg leading-relaxed text-slate-800 dark:text-slate-200">
                {textSegments.map((segment, index) => (
                    <React.Fragment key={index}>
                        <span>{segment}</span>
                        {index < textSegments.length - 1 && (
                            <span 
                                onClick={() => handleBlankClick(index)}
                                className={cn(
                                    "inline-flex items-center justify-center min-w-[120px] h-10 px-4 mx-2 border-b-2 font-semibold transition-all select-none",
                                    !testMode ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400" :
                                    hasSubmitted ? (
                                        filledBlanks[index]?.trim().toLowerCase() === correctAnswers[index]?.trim().toLowerCase()
                                            ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                                            : "border-red-500 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                                    ) :
                                    showAnswer ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400" :
                                    selectedWordId && filledBlanks[index] === null ? "border-blue-400 bg-blue-50/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" :
                                    filledBlanks[index] !== null ? "border-slate-800 text-slate-800 cursor-pointer hover:bg-slate-50 dark:border-slate-200 dark:text-slate-200" :
                                    "border-slate-300 bg-slate-50 text-transparent cursor-pointer hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                                )}
                            >
                                {(!testMode || (showAnswer && !hasSubmitted)) ? correctAnswers[index] : (filledBlanks[index] || "____")}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Verification message */}
            {hasSubmitted && testMode && (
                <div className={cn("text-sm font-bold flex items-center gap-2 relative", isFullyCorrect ? "text-green-600" : "text-red-600")}>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Confetti active={isFullyCorrect} config={confettiConfig} />
                    </div>
                    {isFullyCorrect ? <><CheckCircle2 className="w-5 h-5"/> Perfect! All blanks are correct.</> : <><XCircle className="w-5 h-5"/> Incorrect. Check the explanation below for the right answers.</>}
                </div>
            )}

            {/* Word Bank (Only visible in test mode and if there are words) */}
            {testMode && wordBank.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Word Bank</div>
                    <div className="flex flex-wrap gap-3">
                        {wordBank.map((item) => {
                            const isUsed = isWordUsed(item.word);
                            const isSelected = selectedWordId === item.id;
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleWordClick(item.id)}
                                    disabled={isUsed || hasSubmitted || showAnswer}
                                    className={cn(
                                        "px-4 py-2 rounded-lg font-medium text-sm transition-all border-2 select-none",
                                        isUsed ? "opacity-30 cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900" :
                                        isSelected ? "border-blue-500 bg-blue-50 text-blue-700 scale-105 shadow-sm dark:bg-blue-900/30 dark:text-blue-300" :
                                        (hasSubmitted || showAnswer) ? "opacity-50 cursor-not-allowed border-slate-200 bg-white" :
                                        "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600"
                                    )}
                                >
                                    {item.word}
                                </button>
                            );
                        })}
                    </div>
                    
                    {!hasSubmitted && !showAnswer && (
                        <div className="mt-8 flex justify-end">
                            <Button 
                                onClick={handleSubmit} 
                                disabled={filledBlanks.some(b => b === null)}
                                className="px-8"
                            >
                                Submit Answer
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
