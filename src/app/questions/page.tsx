import React from 'react';
import { getQuestions } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionsHeader from '@/components/question-bank/QuestionsHeader';
import QuestionsSidebar from '@/components/question-bank/QuestionsSidebar';

export default async function AllQuestionsPage() {
    // Fetch recent questions (limit 50)
    const questions = await getQuestions({}, 50);

    return (
        <div className="w-full flex flex-col items-center pb-20">
            <QuestionsHeader />
            
            <div className="container max-w-[1200px] mx-auto py-10 px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Main Content (Left) */}
                    <div className="w-full lg:w-[68%] space-y-5">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recently Added</h2>
                            <span className="text-sm text-slate-500 font-medium">{questions.length} Questions</span>
                        </div>
                        
                        {questions.length === 0 ? (
                            <div className="text-center p-12 text-slate-500 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">No questions available.</div>
                        ) : (
                            JSON.parse(JSON.stringify(questions)).map((q: any) => (
                                <QuestionCard key={q.id} question={q} />
                            ))
                        )}
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="w-full lg:w-[32%] lg:sticky lg:top-24">
                        <QuestionsSidebar />
                    </div>

                </div>
            </div>
        </div>
    );
}
