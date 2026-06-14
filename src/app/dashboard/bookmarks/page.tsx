'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserBookmarkedQuestions } from '@/lib/firebase/question-bank';
import QuestionFeed from '@/components/question-bank/QuestionFeed';

export default function BookmarksPage() {
    const { user, loading } = useAuth();
    const [questions, setQuestions] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (user) {
                getUserBookmarkedQuestions(user.uid).then(qs => {
                    setQuestions(qs);
                    setFetching(false);
                }).catch(err => {
                    console.error(err);
                    setFetching(false);
                });
            } else {
                setFetching(false);
            }
        }
    }, [user, loading]);

    return (
        <div className="w-full flex flex-col items-center pb-20">
            <div className="container max-w-[800px] mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Saved Questions</h1>
                
                {loading || fetching ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#107c41]"></div>
                    </div>
                ) : !user ? (
                    <div className="text-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">Please log in to view your saved questions.</div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        No saved questions yet. Click the Save icon on questions to save them here!
                    </div>
                ) : (
                    <QuestionFeed initialQuestions={questions} title="Saved Questions" />
                )}
            </div>
        </div>
    );
}
