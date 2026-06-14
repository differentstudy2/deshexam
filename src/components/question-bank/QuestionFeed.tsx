'use client';

import React, { useState } from 'react';
import QuestionCard from '@/components/question-bank/QuestionCard';
import { BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuestionFeed({ initialQuestions }: { initialQuestions: any[] }) {
    const [isTestMode, setIsTestMode] = useState(true);

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recently Added</h2>
                <span className="text-sm text-slate-500 font-medium">{initialQuestions.length} Questions</span>
            </div>
            
            {initialQuestions.length === 0 ? (
                <div className="text-center p-12 text-slate-500 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">No questions available.</div>
            ) : (
                initialQuestions.map((q: any) => (
                    <QuestionCard key={q.id} question={q} isListView={true} testMode={isTestMode} />
                ))
            )}
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
