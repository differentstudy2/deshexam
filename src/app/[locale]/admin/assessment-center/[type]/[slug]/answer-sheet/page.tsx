import React from 'react';
import { notFound } from 'next/navigation';
import { getAssessment } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { AssessmentCollectionType } from '@/lib/firebase/assessment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { Lightbulb, CheckCircle2, XCircle, Check, Edit, Eye } from 'lucide-react';
import Link from 'next/link';
import PrintButton from './PrintButton';
import { QRCodeSVG } from 'qrcode.react';

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
    params: { locale: string, type: string, slug: string }
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

    // Fetch Taxonomy Nodes
    const getTaxonomyNode = async (id: string | undefined) => {
        if (!id) return null;
        try {
            const d = await getDoc(doc(db, 'taxonomy_nodes', id));
            return d.exists() ? d.data() : null;
        } catch (e) { return null; }
    }

    const boardNode = await getTaxonomyNode(test.boardId);
    const classNode = await getTaxonomyNode(test.classId);
    const subjectNode = await getTaxonomyNode(test.subjectId);
    const chapterNode = await getTaxonomyNode(test.chapterId);
    const topicNode = await getTaxonomyNode(test.topicId);

    const boardName = boardNode?.acronym || boardNode?.title;
    const className = classNode?.title;
    const subjectName = subjectNode?.title;
    const chapterName = chapterNode?.title;
    const topicName = topicNode?.title;

    const currentYear = new Date().getFullYear();
    let classLine = test.title;
    if (boardName || className) {
        classLine = `${[boardName, className].filter(Boolean).join(' | ')} - ${currentYear}`;
    }

    return (
        <div className="min-h-screen bg-white text-black p-8 font-sans print:p-0 print:bg-white print:text-black print:min-h-0 print:block">
            <title>{test.title} - Answer Sheet</title>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                }
            `}} />
            {/* Watermark for Print */}
            <div className="fixed inset-0 pointer-events-none z-0 hidden print:flex items-center justify-center opacity-10 print:opacity-10">
                <div className="text-7xl font-bold text-gray-400 -rotate-45 whitespace-nowrap">
                    DeshExam
                </div>
            </div>

            {/* Header - Print Friendly */}
            <div className="mb-8 print:pt-12 print:px-12">
                {/* Top Row: QR, Title, Set Info */}
                <div className="flex justify-between items-start mb-4">
                    {/* Left: QR and Marks */}
                    <div className="flex flex-col gap-2">
                        <div className="border border-gray-300 p-1 w-fit bg-white">
                            <QRCodeSVG value={`https://deshexam.com/${params.type}/${params.slug}`} size={64} />
                        </div>
                        <div className="flex border border-black w-fit h-6">
                            <div className="bg-black text-white text-xs px-2 py-1 font-bold flex items-center">Marks</div>
                            <div className="w-12 bg-white"></div>
                        </div>
                    </div>

                    {/* Center: Title & Address */}
                    <div className="flex flex-col items-center text-center flex-1 px-4">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">DeshExam Academy</h1>
                        <p className="text-[13px] text-gray-600 mb-2">Dwarikamari, Petla, Dinhata, Cooch Behar, WB, 736135</p>

                        <h2 className="text-[15px] font-bold text-gray-900">{classLine}</h2>

                        {subjectName ? <h3 className="text-[15px] font-bold text-gray-900">Subject: {subjectName}</h3> : (test.subject && <h3 className="text-[15px] font-bold text-gray-900">Subject: {test.subject}</h3>)}

                        {chapterName && <p className="text-sm text-gray-700 font-semibold mt-1">Chapter: {chapterName}</p>}
                        {topicName && <p className="text-sm text-gray-600">Topic: {topicName}</p>}
                        {!chapterName && !topicName && <p className="text-sm text-gray-600 mt-1">Answer Key & Explanations</p>}
                    </div>

                    {/* Right: Set and Sub Code */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex border border-black h-7">
                            <div className="px-3 flex items-center justify-center font-bold border-r border-black text-sm">Set</div>
                            <div className="px-4 flex items-center justify-center font-bold text-sm">A</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold mt-1">
                            <span className="text-gray-700">Sub. Code :</span>
                            <div className="flex border border-black">
                                {((subjectNode as any)?.subjectCode || "ooo").split('').map((char: string, idx: number, arr: string[]) => (
                                    <div key={idx} className={`w-5 h-5 flex items-center justify-center text-[11px] font-bold uppercase ${idx !== arr.length - 1 ? 'border-r border-black' : ''}`}>
                                        {char}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time and Marks row */}
                <div className="flex justify-between items-center font-bold text-[15px] border-t-2 border-black pt-2 pb-2">
                    <div>Time— {test.durationMin || 0} Mins</div>
                    <div>Total Marks— {test.totalMarks || 0}</div>
                </div>

                <div className="border-b-2 border-black mb-3"></div>

                {/* Instructions */}
                <div className="text-center text-[13px] mb-4 space-y-1 px-8 text-gray-800">
                    <p>Note: Fully darken the circle ⬤ corresponding to the correct answer with a ballpoint pen on the provided OMR sheet. Each question carries 1 mark.</p>
                    <p className="font-bold">Do not make any marks on the question paper.</p>
                </div>

                {/* Student Info */}
                <div className="flex justify-between items-end text-sm font-bold mt-8 mb-2">
                    <div className="flex items-end gap-2 flex-1">
                        <span className="text-gray-700">Student Name:</span>
                        <div className="flex-1 border-b border-dashed border-gray-400 mr-8"></div>
                    </div>
                    <div className="flex items-end gap-2 w-1/3">
                        <span className="text-gray-700">Roll:</span>
                        <div className="flex-1 border-b border-dashed border-gray-400"></div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-12 print:space-y-0 print:break-before-page">
                {sortedQuestions.length === 0 ? (
                    <p className="text-center italic text-gray-500">No questions found for this assessment.</p>
                ) : (
                    sortedQuestions.map((q, index) => {
                        const premiumColors = [
                            'bg-blue-50/50 print:bg-[#f0f7ff]',
                            'bg-emerald-50/50 print:bg-[#f0fdf4]',
                            'bg-purple-50/50 print:bg-[#faf5ff]',
                            'bg-rose-50/50 print:bg-[#fff1f2]',
                            'bg-amber-50/50 print:bg-[#fffbeb]',
                        ];
                        const bgColor = premiumColors[index % premiumColors.length];

                        return (
                            <div key={q.id} className={`${bgColor} border border-gray-200 p-6 rounded-lg print:border-none print:p-6 print:pt-8 print:pb-6 print:break-after-page print:min-h-screen print:[print-color-adjust:exact] break-inside-avoid print:break-inside-avoid`}>

                                {/* Question Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2 w-full">
                                        <span className="shrink-0 text-black font-bold text-[22px]">Q{index + 1}.</span>
                                        <div className="prose prose-black max-w-none flex-1 prose-p:font-bold prose-p:text-[22px] prose-p:my-0 prose-li:text-[18px]">
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                                {q.questionText}
                                            </ReactMarkdown>

                                            {/* Exam and Year Tags */}
                                            {(q.sourceExam || q.sourceYear || (q.tags && q.tags.length > 0)) && (
                                                <div className="flex flex-wrap gap-2 mt-3 mb-1 font-normal print:mt-2">
                                                    {q.sourceExam && <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded border border-blue-200 print:border-gray-400 print:text-gray-800 print:bg-white print:[print-color-adjust:exact]">{q.sourceExam}</span>}
                                                    {q.sourceYear && <span className="bg-purple-50 text-purple-700 text-[11px] px-2 py-0.5 rounded border border-purple-200 print:border-gray-400 print:text-gray-800 print:bg-white print:[print-color-adjust:exact]">{q.sourceYear}</span>}
                                                    {q.tags && q.tags.map((tag: string, i: number) => (
                                                        <span key={i} className="bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded border border-gray-200 print:border-gray-400 print:text-gray-800 print:bg-white print:[print-color-adjust:exact]">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 print:hidden">
                                        <Link href={`/${params.locale}/question/${q.slug || q.id}`} target="_blank" className="text-gray-400 hover:text-blue-500 transition-colors" title="View Question">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link href={`/${params.locale}/admin/question-bank/academic-questions/${q.id}`} target="_blank" className="text-gray-400 hover:text-emerald-500 transition-colors" title="Edit Question">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{q.id}</span>
                                    </div>
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
                                                className={`flex items-center gap-3 p-3 rounded-full border print:[print-color-adjust:exact] ${isCorrect
                                                        ? 'border-emerald-400 bg-emerald-50/50 print:border-emerald-500 print:bg-emerald-50 print:font-bold'
                                                        : [
                                                            'border-blue-100 bg-blue-50/30 print:border-blue-200 print:bg-[#f0f7ff]',
                                                            'border-teal-100 bg-teal-50/30 print:border-teal-200 print:bg-[#f0fdfa]',
                                                            'border-purple-100 bg-purple-50/30 print:border-purple-200 print:bg-[#faf5ff]',
                                                            'border-orange-100 bg-orange-50/30 print:border-orange-200 print:bg-[#fff7ed]',
                                                            'border-rose-100 bg-rose-50/30 print:border-rose-200 print:bg-[#fff1f2]'
                                                        ][oIdx % 5]
                                                    }`}
                                            >
                                                <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium border print:[print-color-adjust:exact] ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white print:bg-emerald-500 print:border-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-600 print:bg-white'
                                                    }`}>
                                                    {isCorrect ? <Check className="w-5 h-5 print:text-white" /> : optLetter}
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
                                    <div className="ml-8 mt-4 bg-white/60 border border-black/5 p-5 rounded-lg print:bg-white/80 print:border-gray-200 print:p-4 print:text-[13px] print:break-inside-avoid">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Lightbulb className="w-5 h-5 text-yellow-500 print:text-black" />
                                            <h4 className="font-bold text-blue-900 print:text-black m-0">Explanation</h4>
                                        </div>

                                        {q.explanation && (
                                            <div className="prose prose-sm max-w-none text-gray-700 mb-5 print:text-black print:prose-p:text-[13px] print:prose-li:text-[13px]">
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
                                                        <div key={opt.key} className={`border rounded-md p-3 print:[print-color-adjust:exact] print:break-inside-avoid print:p-2 ${[
                                                                'border-blue-100 bg-blue-50/30 print:border-blue-200 print:bg-[#f0f7ff]',
                                                                'border-teal-100 bg-teal-50/30 print:border-teal-200 print:bg-[#f0fdfa]',
                                                                'border-purple-100 bg-purple-50/30 print:border-purple-200 print:bg-[#faf5ff]',
                                                                'border-orange-100 bg-orange-50/30 print:border-orange-200 print:bg-[#fff7ed]',
                                                                'border-rose-100 bg-rose-50/30 print:border-rose-200 print:bg-[#fff1f2]'
                                                            ][oIdx % 5]
                                                            }`}>
                                                            <div className="flex items-start gap-2 mb-1">
                                                                <span className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-sm font-medium shrink-0 print:border print:border-gray-300">
                                                                    {optLetter}
                                                                </span>
                                                                <div className="font-semibold text-gray-800 prose prose-sm max-w-none [&>p]:m-0 print:prose-p:text-[13px] print:text-[13px]">
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
                        )
                    })
                )}
            </div>

            {/* Print Button Header for Screen only */}
            <PrintButton />
        </div>
    );
}
