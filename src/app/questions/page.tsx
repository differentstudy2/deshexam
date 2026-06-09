import React from 'react';
import { getQuestions } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionSearch from '@/components/question-bank/QuestionSearch';


export default async function AllQuestionsPage() {
    // Fetch recent questions (limit 50)
    const questions = await getQuestions({}, 50);

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Public Question Bank</h1>
                <p className="text-slate-500 max-w-2xl mx-auto">
                    Search and explore our entire database of questions, including detailed explanations and correct answers.
                </p>
            </div>

            <div className="pb-8">
                <QuestionSearch />
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Recently Added</h2>
                {questions.length === 0 ? (
                    <div className="text-center p-12 text-slate-500 border rounded-lg">No questions available.</div>
                ) : (
                    JSON.parse(JSON.stringify(questions)).map((q: any) => (
                        <QuestionCard key={q.id} question={q} />
                    ))
                )}
            </div>
        </div>
    );
}
