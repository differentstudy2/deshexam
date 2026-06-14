import React from 'react';
import { getQuestions } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionsHeader from '@/components/question-bank/QuestionsHeader';
import QuestionsSidebar from '@/components/question-bank/QuestionsSidebar';
import QuestionFeed from '@/components/question-bank/QuestionFeed';

export default async function AllQuestionsPage() {
    // Fetch recent questions (limit 50)
    const questions = await getQuestions({}, 50);

    return (
        <div className="w-full flex flex-col items-center pb-20">
            <QuestionsHeader />
            
            <div className="container max-w-[1200px] mx-auto py-10 px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Main Content (Left) */}
                    <div className="w-full lg:w-[68%]">
                        <QuestionFeed initialQuestions={JSON.parse(JSON.stringify(questions))} />
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
