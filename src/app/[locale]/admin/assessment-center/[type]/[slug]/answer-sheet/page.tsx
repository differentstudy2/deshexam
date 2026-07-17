import React from 'react';
import { notFound } from 'next/navigation';
import { getAssessment } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { AssessmentCollectionType } from '@/lib/firebase/assessment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { Lightbulb, CheckCircle2, XCircle, Check } from 'lucide-react';
import PrintButton from './PrintButton';

const bnOptionsMap: Record<string, string> = {
    a: 'ক',
    b: 'খ',
    c: 'গ',
    d: 'ঘ',
    e: 'ঙ'
};

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
        <div className="min-h-screen bg-white text-black p-8 font-sans print:p-0 print:bg-white print:text-black print:min-h-0 print:block">
            
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
                        <div key={q.id} className={`border border-gray-200 p-6 rounded-lg print:border-none print:p-0 print:border-b print:border-dashed print:pb-8 ${index > 0 ? 'break-inside-avoid print:break-inside-avoid' : ''}`}>
                            
                            {/* Question Header */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg flex gap-2 w-full">
                                    <span className="shrink-0 text-black">Q{index + 1}.</span> 
                                    <div className="prose prose-sm prose-black max-w-none flex-1">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                            {q.questionText}
                                        </ReactMarkdown>
                                    </div>
                                </h3>
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 print:hidden">{q.id}</span>
                            </div>

                            {/* Options Grid */}
                            <div className="ml-8 space-y-3 md:space-y-0 md:grid md:grid-cols-2 print:space-y-0 print:grid print:grid-cols-2 gap-4 mt-4 mb-6">
                                {q.options && [
                                    { key: 'a', text: q.options.a },
                                    { key: 'b', text: q.options.b },
                                    { key: 'c', text: q.options.c },
                                    { key: 'd', text: q.options.d },
                                    ...(q.options.e ? [{ key: 'e', text: q.options.e }] : [])
                                ].map((opt, oIdx) => {
                                    const isCorrect = q.correctAnswer && q.correctAnswer.toLowerCase().includes(opt.key);
                                    const optLetter = q.language === 'Bangla' || !q.language ? bnOptionsMap[opt.key] : opt.key.toUpperCase();

                                    return (
                                        <div 
                                            key={opt.key} 
                                            className={`flex items-center gap-3 p-3 rounded-full border ${
                                                isCorrect 
                                                ? 'border-emerald-400 bg-emerald-50/50 print:border-black print:bg-gray-100 print:font-bold' 
                                                : 'border-gray-200 print:border-gray-300'
                                            }`}
                                        >
                                            <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium border ${
                                                isCorrect ? 'bg-emerald-500 border-emerald-500 text-white print:bg-black' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}>
                                                {isCorrect ? <Check className="w-5 h-5" /> : optLetter}
                                            </div>
                                            <div className="prose prose-sm max-w-none text-gray-700 [&>p]:m-0 w-full">
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                                    {opt.text}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {(q.explanation || q.optionExplanations) && (
                                <div className="ml-8 mt-4 bg-[#f8fbff] border border-blue-100 p-5 rounded-lg print:bg-gray-50 print:border-gray-400">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb className="w-5 h-5 text-yellow-500 print:text-black" />
                                        <h4 className="font-bold text-blue-900 print:text-black m-0">Explanation</h4>
                                    </div>
                                    
                                    {q.explanation && (
                                        <div className="prose prose-sm max-w-none text-gray-700 mb-5 print:text-black">
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                                {q.explanation}
                                            </ReactMarkdown>
                                        </div>
                                    )}

                                    {/* Option Explanations inside main Explanation block */}
                                    {q.optionExplanations && Object.keys(q.optionExplanations).length > 0 && (
                                        <div className="space-y-3">
                                            {q.options && [
                                                { key: 'a', text: q.options.a },
                                                { key: 'b', text: q.options.b },
                                                { key: 'c', text: q.options.c },
                                                { key: 'd', text: q.options.d },
                                                ...(q.options.e ? [{ key: 'e', text: q.options.e }] : [])
                                            ].map((opt, oIdx) => {
                                                const isCorrect = q.correctAnswer && q.correctAnswer.toLowerCase().includes(opt.key);
                                                const optLetter = q.language === 'Bangla' || !q.language ? bnOptionsMap[opt.key] : opt.key.toUpperCase();
                                                
                                                return (
                                                    <div key={opt.key} className="bg-white border border-gray-100 rounded-md p-3 print:border-gray-300 print:bg-transparent">
                                                        <div className="flex items-start gap-2 mb-1">
                                                            <span className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-sm font-medium shrink-0 print:border print:border-gray-300">
                                                                {optLetter}
                                                            </span>
                                                            <div className="font-semibold text-gray-800 prose prose-sm max-w-none [&>p]:m-0">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                                                    {opt.text}
                                                                </ReactMarkdown>
                                                            </div>
                                                            {isCorrect ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 ml-auto" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5 ml-auto" />
                                                            )}
                                                        </div>
                                                        {q.optionExplanations && (q.optionExplanations as any)[opt.key] && (
                                                            <div className="text-gray-600 text-sm ml-8 prose prose-sm max-w-none [&>p]:m-0 print:text-black">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                                                    {(q.optionExplanations as any)[opt.key]}
                                                                </ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
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
