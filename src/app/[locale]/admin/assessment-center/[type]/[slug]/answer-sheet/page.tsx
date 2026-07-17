import React from 'react';
import { notFound } from 'next/navigation';
import { getAssessment } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { AssessmentCollectionType } from '@/lib/firebase/assessment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import PrintButton from './PrintButton';

export default async function AnswerSheetPage({
    params
}: {
    params: { type: string, slug: string }
}) {
    // 1. Map route type to collection name
    const typeToCollection: Record<string, AssessmentCollectionType> = {
        'mock-tests': 'mockTests',
        'quizzes': 'quizzes',
        'practice-sets': 'practiceSets',
        'daily-challenges': 'dailyChallenges',
        'exams': 'examPapers',
    };

    const collectionName = typeToCollection[params.type];
    if (!collectionName) {
        return notFound();
    }

    // 2. Fetch assessment
    const testDoc = await getAssessment(collectionName, params.slug);
    if (!testDoc) {
        return notFound();
    }
    const test = testDoc as any;

    // 3. Fetch all questions
    const questions = test.questionIds && test.questionIds.length > 0 
        ? await getQuestionsByIds(test.questionIds)
        : [];

    // Sort questions to match test.questionIds order
    const sortedQuestions = questions.sort((a, b) => {
        const aIdx = test.questionIds!.indexOf(a.id);
        const bIdx = test.questionIds!.indexOf(b.id);
        return aIdx - bIdx;
    });

    return (
        <div className="min-h-screen bg-white text-black p-8 font-sans print:p-0 print:bg-white print:text-black">
            
            {/* Header - Print Friendly */}
            <div className="border-b-2 border-black pb-6 mb-8">
                <h1 className="text-3xl font-bold mb-2 text-center">{test.title}</h1>
                <h2 className="text-xl text-center mb-6">Answer Key & Explanations</h2>
                
                <div className="flex justify-between items-center text-sm font-semibold border border-black p-4 bg-gray-50 print:bg-transparent">
                    <div>
                        <span>Test ID: </span><span className="font-normal">{test.id}</span>
                    </div>
                    <div>
                        <span>Total Questions: </span><span className="font-normal">{test.questionIds?.length || 0}</span>
                    </div>
                    <div>
                        <span>Marks: </span><span className="font-normal">{test.totalMarks || 0}</span>
                    </div>
                    <div>
                        <span>Duration: </span><span className="font-normal">{test.durationMin || 0} mins</span>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-12">
                {sortedQuestions.length === 0 ? (
                    <p className="text-center italic text-gray-500">No questions found for this assessment.</p>
                ) : (
                    sortedQuestions.map((q, index) => (
                        <div key={q.id} className="break-inside-avoid border border-gray-200 p-6 rounded-lg print:border-none print:p-0 print:border-b print:border-dashed print:pb-8">
                            
                            {/* Question Header */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg flex gap-2 w-full">
                                    <span className="shrink-0 text-black">Q{index + 1}.</span> 
                                    <div className="prose prose-sm prose-black max-w-none flex-1">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {q.questionText}
                                        </ReactMarkdown>
                                    </div>
                                </h3>
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 print:hidden">{q.id}</span>
                            </div>

                            {/* Options */}
                            <div className="ml-8 space-y-3 mt-4 mb-6">
                                {q.options && [
                                    { key: 'a', text: q.options.a },
                                    { key: 'b', text: q.options.b },
                                    { key: 'c', text: q.options.c },
                                    { key: 'd', text: q.options.d },
                                    ...(q.options.e ? [{ key: 'e', text: q.options.e }] : [])
                                ].map((opt, oIdx) => {
                                    const isCorrect = q.correctAnswer && q.correctAnswer.toLowerCase().includes(opt.key);

                                    return (
                                        <div 
                                            key={opt.key} 
                                            className={`flex gap-3 p-3 rounded-md border ${
                                                isCorrect 
                                                ? 'bg-emerald-50 border-emerald-300 print:bg-gray-100 print:border-black print:font-bold' 
                                                : 'border-gray-200 print:border-gray-300'
                                            }`}
                                        >
                                            <div className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium border uppercase ${
                                                isCorrect ? 'bg-emerald-200 border-emerald-400 text-emerald-900 print:bg-black print:text-white' : 'border-gray-300 text-gray-500'
                                            }`}>
                                                {opt.key}
                                            </div>
                                            <div className="prose prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                    {opt.text}
                                                </ReactMarkdown>
                                            </div>
                                            {isCorrect && (
                                                <div className="ml-auto flex items-center text-emerald-600 font-bold print:text-black">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="sr-only">Correct</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {q.explanation && (
                                <div className="ml-8 mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 print:bg-gray-50 print:border-gray-400">
                                    <h4 className="font-bold text-blue-900 mb-2 print:text-black">Explanation:</h4>
                                    <div className="prose prose-sm max-w-none text-blue-800 print:text-black">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {q.explanation}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                        </div>
                    ))
                )}
            </div>
            
            {/* Print Button Header for Screen only */}
            <PrintButton />
        </div>
    );
}
