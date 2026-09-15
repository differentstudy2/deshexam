'use client';

import React, { useState } from 'react';
import QuestionCard from '@/components/question-bank/QuestionCard';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuestionListViewer({ questions }: { questions: QuestionBankEntry[] }) {
    const [isTestMode, setIsTestMode] = useState(false);

    return (
        <div className="relative pb-24">
            {/* Questions List */}
            <div className="space-y-6">
                {questions.map((q, i) => (
                    <QuestionCard key={q.id || `q-list-${i}`} question={q} index={i + 1} testMode={isTestMode} />
                ))}
            </div>

            {/* Sticky Bottom Floating Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 pointer-events-none">
                <div className="container max-w-4xl mx-auto flex justify-center">
                    <div className="bg-[#107c41] text-white p-1.5 rounded-full shadow-lg flex items-center gap-1 pointer-events-auto backdrop-blur-md">
                        <button
                            onClick={() => setIsTestMode(false)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                                !isTestMode 
                                    ? "bg-white text-[#107c41] shadow-sm" 
                                    : "text-white hover:bg-white/10"
                            )}
                        >
                            <BookOpen className="w-4 h-4" />
                            Reading Mode
                        </button>
                        <button
                            onClick={() => setIsTestMode(true)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                                isTestMode 
                                    ? "bg-white text-[#107c41] shadow-sm" 
                                    : "text-white hover:bg-white/10"
                            )}
                        >
                            <Target className="w-4 h-4" />
                            Test Mode
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
