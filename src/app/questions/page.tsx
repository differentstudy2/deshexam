import React from 'react';
import { getQuestions, getTotalQuestionsCount } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionsHeader from '@/components/question-bank/QuestionsHeader';
import QuestionsSidebar from '@/components/question-bank/QuestionsSidebar';
import QuestionFeed from '@/components/question-bank/QuestionFeed';

export default async function AllQuestionsPage(props: { searchParams: Promise<{ page?: string }> }) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1', 10);
    const itemsPerPage = 20;
    
    // Total count for pagination
    const totalItems = await getTotalQuestionsCount({});
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Fetch questions up to current page, then slice the exact 20 we need
    const questions = await getQuestions({}, page * itemsPerPage);
    const paginatedQuestions = questions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="w-full flex flex-col items-center pb-20">
            <QuestionsHeader />
            
            <div className="container max-w-[1200px] mx-auto py-10 px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Main Content (Left) */}
                    <div className="w-full lg:w-[68%]">
                        <QuestionFeed 
                            initialQuestions={JSON.parse(JSON.stringify(paginatedQuestions))}
                            serverCurrentPage={page}
                            serverTotalPages={totalPages}
                            serverTotalItems={totalItems}
                            serverItemsPerPage={itemsPerPage}
                        />
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
