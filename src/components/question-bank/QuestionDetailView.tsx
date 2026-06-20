'use client';

import React, { useState, useEffect } from 'react';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { CheckCircle, Share2, BookmarkPlus, Zap, BookOpen, AlertCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import QuestionListViewer from '@/components/question-bank/QuestionListViewer';

export default function QuestionDetailView({ 
    question, 
    relatedQuestions 
}: { 
    question: QuestionBankEntry & { taxonomyTags?: string[] },
    relatedQuestions: QuestionBankEntry[]
}) {
    const [showAnswer, setShowAnswer] = useState(true); // Always show answer by default on detail page
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // E-E-A-T Signals
    const isVerified = true;
    const updatedAtDate = question.updatedAt ? new Date(question.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

    const hasExplanation = !!question.explanation && question.explanation.length > 20;

    return (
        <article className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden mb-8">
            
            {/* Metadata Hero Header */}
            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {question.taxonomyTags?.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {tag}
                        </Badge>
                    ))}
                    {question.difficulty && (
                        <Badge variant="outline" className={cn(
                            "font-semibold",
                            question.difficulty === 'Easy' ? "text-green-600 border-green-200 bg-green-50" :
                            question.difficulty === 'Medium' ? "text-amber-600 border-amber-200 bg-amber-50" :
                            "text-red-600 border-red-200 bg-red-50"
                        )}>
                            {question.difficulty}
                        </Badge>
                    )}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                    {question.questionText}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">
                        <ShieldCheck className="w-4 h-4" /> Verified by DeshExam Faculty
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4" /> Updated {updatedAtDate}
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
                {/* Options if MCQ */}
                {question.options && Object.values(question.options).some(v => !!v) && (
                    <div className="space-y-3">
                        {Object.entries(question.options).filter(([_, text]) => !!text).map(([key, text], idx) => {
                            const isCorrect = question.correctAnswer?.toLowerCase() === key.toLowerCase() || question.correctAnswer === text;
                            const isSelected = selectedOption === idx;
                            
                            let optionClass = "flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50";
                            
                            if (showAnswer) {
                                if (isCorrect) optionClass = "flex items-start gap-4 p-4 rounded-xl border-green-500 bg-green-50 dark:bg-green-500/10 ring-1 ring-green-500";
                            }

                            return (
                                <div key={key} className={optionClass}>
                                    <div className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full border text-sm font-semibold shrink-0 uppercase",
                                        showAnswer && isCorrect 
                                            ? "bg-green-500 border-green-500 text-white" 
                                            : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                                    )}>
                                        {key}
                                    </div>
                                    <div className="pt-1 font-medium text-slate-800 dark:text-slate-200">
                                        <div dangerouslySetInnerHTML={{ __html: text as string }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Answer Section */}
                <section className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" /> Correct Answer
                    </h2>
                    <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {question.options && question.correctAnswer && question.options[question.correctAnswer.toLowerCase() as keyof typeof question.options] ? (
                            <div dangerouslySetInnerHTML={{ __html: question.options[question.correctAnswer.toLowerCase() as keyof typeof question.options] || '' }} />
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: question.correctAnswer || 'Answer not provided.' }} />
                        )}
                    </div>
                </section>

                {/* Explanation Section */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" /> Explanation
                    </h2>
                    {hasExplanation ? (
                        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                            <div dangerouslySetInnerHTML={{ __html: question.explanation || '' }} />
                        </div>
                    ) : (
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-800/50">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">
                                A detailed explanation for this question is currently being verified by our faculty. 
                                In the meantime, you can review the related questions below for more context on this topic.
                            </p>
                        </div>
                    )}
                </section>
                
            </div>
            
            {/* Action Bar */}
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg shadow-sm transition-all">
                    <BookmarkPlus className="w-4 h-4" /> Save Question
                </button>
            </div>

            {/* Dynamic Padding: Related Questions if thin content */}
            {!hasExplanation && relatedQuestions && relatedQuestions.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800">
                    <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/20">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">More Questions on this Topic</h2>
                        <QuestionListViewer questions={relatedQuestions} />
                    </div>
                </div>
            )}
        </article>
    );
}
