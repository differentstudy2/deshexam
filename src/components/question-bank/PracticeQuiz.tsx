'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { saveQuizScore, recordMistake } from '@/lib/firebase/student-analytics';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Trophy, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function PracticeQuiz({ questions, taxonomyId }: { questions: QuestionBankEntry[], taxonomyId: string }) {
    const { user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (questions.length === 0) {
        return <div className="text-center p-12 text-slate-500">No questions available for this practice session.</div>;
    }

    const question = questions[currentIndex];
    const isCorrect = selectedAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();

    const handleSelectOption = (key: string) => {
        if (isAnswered) return;
        setSelectedAnswer(key);
    };

    const handleSubmit = async () => {
        setIsAnswered(true);
        if (isCorrect) {
            setScore(prev => prev + 1);
        } else if (user) {
            // Record mistake if wrong
            await recordMistake(user.uid, question.id, selectedAnswer || '');
        }
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
            if (user) {
                setIsSaving(true);
                // The current answer was just processed, so score is accurate
                await saveQuizScore(user.uid, taxonomyId, questions.length, score + (isCorrect ? 1 : 0));
                setIsSaving(false);
            }
        }
    };

    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <Card className="max-w-2xl mx-auto mt-12 text-center p-6 border-2 border-[#00a651]/20">
                <CardHeader>
                    <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                        <Trophy className="h-10 w-10 text-[#00a651]" />
                    </div>
                    <h2 className="text-3xl font-bold">Practice Complete!</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-5xl font-extrabold text-[#00a651] mb-2">{percentage}%</p>
                        <p className="text-slate-500">You scored {score} out of {questions.length} correctly.</p>
                    </div>
                    <Progress value={percentage} className="h-3" />
                </CardContent>
                <CardFooter className="flex justify-center mt-6">
                    <Button onClick={() => window.location.reload()} className="bg-[#00a651] hover:bg-[#009045] px-8 py-6 text-lg">
                        Practice Again
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>Score: {score}</span>
            </div>
            <Progress value={((currentIndex) / questions.length) * 100} className="h-2" />

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                <CardContent className="p-6 md:p-8">
                    <div className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 mb-8 leading-relaxed whitespace-pre-wrap">
                        {question.questionText}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {question.options && Object.entries(question.options).map(([key, value]) => {
                            if (!value) return null;
                            const isSelected = selectedAnswer === key;
                            const isActuallyCorrect = question.correctAnswer?.toLowerCase() === key.toLowerCase();
                            
                            let stateClass = "border-slate-200 hover:border-[#00a651]/50 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800";
                            if (isAnswered) {
                                if (isActuallyCorrect) {
                                    stateClass = "bg-green-50 border-green-500 text-green-900";
                                } else if (isSelected && !isActuallyCorrect) {
                                    stateClass = "bg-red-50 border-red-500 text-red-900";
                                } else {
                                    stateClass = "border-slate-200 opacity-50";
                                }
                            } else if (isSelected) {
                                stateClass = "border-[#00a651] ring-1 ring-[#00a651] bg-green-50/50";
                            }

                            return (
                                <div 
                                    key={key} 
                                    onClick={() => handleSelectOption(key)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between",
                                        stateClass
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                            isSelected ? "bg-[#00a651] text-white" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {key.toUpperCase()}
                                        </div>
                                        <span className="text-base font-medium">{value}</span>
                                    </div>
                                    {isAnswered && isActuallyCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                                    {isAnswered && isSelected && !isActuallyCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                                </div>
                            )
                        })}
                    </div>

                    {isAnswered && question.explanation && (
                        <div className="mt-8 p-5 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900">
                            <h4 className="font-semibold mb-2">Explanation</h4>
                            <p className="text-sm leading-relaxed">{question.explanation}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 border-t flex justify-end">
                    {!isAnswered ? (
                        <Button 
                            onClick={handleSubmit} 
                            disabled={!selectedAnswer} 
                            className="bg-[#00a651] hover:bg-[#009045] px-8"
                        >
                            Submit Answer
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleNext} 
                            disabled={isSaving}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-8"
                        >
                            {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : (currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question')}
                            {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
