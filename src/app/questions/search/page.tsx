import React from 'react';
import { getQuestions } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionSearch from '@/components/question-bank/QuestionSearch';

export const metadata = {
    title: 'Search Questions | DeshExam',
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const resolvedParams = await searchParams;
    const query = resolvedParams.q || '';

    // Phase 1 Fallback: Since native Firestore does not support full-text search,
    // and we are deferring Meilisearch, we will fetch a large pool of recent questions
    // and filter them in memory. In a production environment with >50,000 records, 
    // this logic will be swapped out for the Meilisearch client.
    
    let filteredQuestions: any[] = [];
    
    if (query) {
        const allQuestions = await getQuestions({}, 500); // Fetch up to 500 questions for local search
        const lowerQuery = query.toLowerCase();
        
        filteredQuestions = allQuestions.filter((q: any) => 
            q.questionText.toLowerCase().includes(lowerQuery) ||
            q.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery)) ||
            q.subjectId?.toLowerCase().includes(lowerQuery) ||
            q.boardId?.toLowerCase().includes(lowerQuery)
        );
    }

    const safeQuestions = JSON.parse(JSON.stringify(filteredQuestions));

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
                {query && <p className="text-slate-500">Showing results for: <span className="font-semibold text-slate-800">"{query}"</span></p>}
            </div>

            <div className="pb-4 border-b">
                <QuestionSearch />
            </div>

            <div className="space-y-6 mt-8">
                {!query ? (
                    <div className="text-center p-12 text-slate-500 border rounded-lg bg-slate-50">
                        Please enter a search term above to find questions.
                    </div>
                ) : safeQuestions.length === 0 ? (
                    <div className="text-center p-12 text-slate-500 border rounded-lg bg-slate-50">
                        No questions found matching "{query}". Try different keywords.
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 font-medium mb-4">Found {safeQuestions.length} matches</p>
                        {safeQuestions.map((q: any, i: number) => (
                            <QuestionCard key={q.id || `q-search-${q.slug || i}`} question={q} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
