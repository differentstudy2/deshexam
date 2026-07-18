import React from 'react';
import { Metadata } from 'next';
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
import { Lightbulb, CheckCircle2, XCircle, Check, Edit, Eye, Settings } from 'lucide-react';
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

export async function generateMetadata({ params }: { params: { locale: string, type: string, slug: string } }): Promise<Metadata> {
    const typeToCollection: Record<string, AssessmentCollectionType> = {
        'mock-tests': 'mockTests',
        'quizzes': 'quizzes',
        'practice-sets': 'practiceSets',
        'daily-challenges': 'dailyChallenges',
        'exams': 'examPapers',
    };

    const collectionName = typeToCollection[params.type];
    if (!collectionName) return { title: 'Answer Sheet' };

    const testDoc = await getAssessment(collectionName, params.slug);
    if (!testDoc) return { title: 'Answer Sheet' };

    const test = testDoc as any;
    return {
        title: `${test.title || 'Assessment'} - Answer Sheet`
    };
}

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
        <div className="min-h-screen bg-gray-100 text-black py-8 px-4 md:px-8 font-sans print:p-0 print:bg-white print:text-black print:min-h-0 print:block group/settings">
            <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-6 items-start print:block">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-72 shrink-0 print:hidden lg:sticky lg:top-8 bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-blue-800 font-bold mb-6 pb-4 border-b border-gray-100">
                        <Settings className="w-5 h-5" />
                        <span className="text-lg">Display Settings</span>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 font-medium hover:text-blue-600 transition-colors">
                            <input type="checkbox" defaultChecked className="toggle-exp w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                            <span>Main Explanations</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 font-medium hover:text-blue-600 transition-colors">
                            <input type="checkbox" defaultChecked className="toggle-optexp w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                            <span>Option Explanations</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 font-medium hover:text-blue-600 transition-colors">
                            <input type="checkbox" defaultChecked className="toggle-tick w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                            <span>Correct Answer Highlight</span>
                        </label>
                        
                        <div className="pt-6 mt-4 border-t border-gray-100">
                            <span className="text-gray-900 font-bold block mb-4">Print Font Size</span>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
                                    <input type="radio" name="font-size" value="small" defaultChecked className="toggle-fs-small w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    <span>Small (Compact)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
                                    <input type="radio" name="font-size" value="medium" className="toggle-fs-medium w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    <span>Medium (Standard)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
                                    <input type="radio" name="font-size" value="large" className="toggle-fs-large w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    <span>Large (Accessible)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Document */}
                <div className="flex-1 w-full max-w-[1000px] mx-auto bg-white p-6 md:p-12 pb-32 md:pb-32 shadow-xl rounded-sm print:max-w-none print:mx-0 print:p-0 print:pb-32 print:shadow-none print:rounded-none relative min-h-[1056px]">

                <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                    .group\\/settings:has(.toggle-fs-small:checked) {
                        --fs-q: 16px;
                        --fs-q-li: 15px;
                        --fs-opt: 14px;
                        --fs-exp: 12px;
                    }
                    .group\\/settings:has(.toggle-fs-medium:checked) {
                        --fs-q: 18px;
                        --fs-q-li: 16px;
                        --fs-opt: 16px;
                        --fs-exp: 14px;
                    }
                    .group\\/settings:has(.toggle-fs-large:checked) {
                        --fs-q: 22px;
                        --fs-q-li: 18px;
                        --fs-opt: 18px;
                        --fs-exp: 16px;
                    }
                    .print-q-text p { font-size: var(--fs-q) !important; }
                    .print-q-text li { font-size: var(--fs-q-li) !important; }
                    .print-q-num { font-size: var(--fs-q) !important; }
                    .print-opt-text p { font-size: var(--fs-opt) !important; }
                    .print-exp-text p, .print-exp-text li { font-size: var(--fs-exp) !important; }
                }
            `}} />

            {/* Native Print Table for Repeating Header/Footer without Overlap */}
            <table className="w-full border-collapse">
                <thead className="hidden print:table-header-group w-full z-50">
                    <tr>
                        <td className="p-0 border-b border-blue-200">
                            <div className="bg-[#eef6ff] py-3 px-12 flex justify-between items-center w-full print:[print-color-adjust:exact]">
                                <div className="flex items-center gap-3">
                                    <img src="/image/logo.png" alt="DeshExam" className="h-6 w-auto object-contain" />
                                    <div className="font-bold text-[18px] text-[#1e4b85] tracking-tight">DeshExam</div>
                                </div>
                                <div className="font-semibold text-[14px] text-[#1e4b85]">{classLine}</div>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tfoot className="hidden print:table-footer-group w-full bg-white z-50">
                    <tr>
                        <td className="border-t border-blue-200 p-0 bg-white">
                            <div className="bg-[#eef6ff] text-[#1e4b85] py-2.5 px-12 flex justify-between items-center w-full print:[print-color-adjust:exact]">
                                <div className="font-semibold text-[14px]">&copy; DeshExam</div>
                                <div className="font-bold text-[15px]">India's Smart Learning Platform</div>
                                <div className="font-semibold text-[14px]">www.deshexam.in</div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
                <tbody className="w-full">
                    <tr>
                        <td className="p-0 align-top w-full">
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

                {/* General Instructions Box */}
                <div className="mt-12 border border-gray-400 p-6 rounded-lg text-sm bg-gray-50/50 print:bg-white print:border-gray-500">
                    <h3 className="font-bold text-center text-lg mb-4 underline uppercase tracking-wider">General Instructions</h3>
                    <ol className="list-decimal pl-6 space-y-3 text-gray-800">
                        <li><strong>Read carefully:</strong> Before starting the examination, read all the instructions given on this page and the OMR answer sheet.</li>
                        <li><strong>OMR Sheet:</strong> Use only a Black/Blue ballpoint pen to darken the circles. Do not use pencil.</li>
                        <li><strong>Filling the OMR:</strong> Darken the circle completely and properly. A lightly or faintly darkened circle may not be evaluated.</li>
                        <li><strong>No changes:</strong> Once an answer is marked, it cannot be changed. Do not use white fluid, eraser, or blade on the OMR sheet.</li>
                        <li><strong>Negative Marking:</strong> There is no negative marking for incorrect answers (unless specified otherwise). Attempting all questions is recommended.</li>
                        <li><strong>Rough Work:</strong> Do all rough work only in the space provided at the end of this booklet. Do not write anything on the OMR sheet other than the required details.</li>
                        <li><strong>Electronic Devices:</strong> Use of calculators, smartwatches, and mobile phones is strictly prohibited inside the examination hall.</li>
                        <li><strong>Submission:</strong> Hand over the OMR sheet to the invigilator before leaving the examination hall. You may retain the question paper.</li>
                    </ol>
                    <div className="mt-10 pt-4 border-t border-gray-300 flex justify-between items-end font-bold text-gray-700">
                        <div className="text-center">
                            <div className="border-b border-dashed border-gray-500 w-48 mb-1 h-8"></div>
                            <span>Candidate's Signature</span>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-dashed border-gray-500 w-48 mb-1 h-8"></div>
                            <span>Invigilator's Signature</span>
                        </div>
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
                            <div key={q.id} className={`${bgColor} border border-gray-200 p-6 rounded-lg print:border-none print:p-6 print:pt-8 print:pb-6 print:break-after-page print:[print-color-adjust:exact] break-inside-avoid print:break-inside-avoid`}>

                                {/* Question Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2 w-full">
                                        <span className="shrink-0 text-black font-bold text-[22px] print-q-num print:mt-1">Q{index + 1}.</span>
                                        <div className="prose prose-black max-w-none flex-1 prose-p:font-bold prose-p:text-[22px] print-q-text print:leading-snug prose-p:my-0 prose-li:text-[18px]">
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
                                <div className="ml-8 space-y-3 md:space-y-0 md:grid md:grid-cols-2 print:space-y-0 print:grid print:grid-cols-2 gap-4 mt-4 mb-6 print:mt-2 print:mb-3">
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
                                                className={`flex items-center gap-3 p-3 rounded-full border print:[print-color-adjust:exact] ${!isCorrect
                                                        ? [
                                                            'border-blue-100 bg-blue-50/30 print:border-blue-200 print:bg-[#f0f7ff]',
                                                            'border-teal-100 bg-teal-50/30 print:border-teal-200 print:bg-[#f0fdfa]',
                                                            'border-purple-100 bg-purple-50/30 print:border-purple-200 print:bg-[#faf5ff]',
                                                            'border-orange-100 bg-orange-50/30 print:border-orange-200 print:bg-[#fff7ed]',
                                                            'border-rose-100 bg-rose-50/30 print:border-rose-200 print:bg-[#fff1f2]'
                                                          ][oIdx % 5]
                                                        : 'group-has-[:checked.toggle-tick]/settings:border-emerald-400 group-has-[:checked.toggle-tick]/settings:bg-emerald-50/50 group-has-[:checked.toggle-tick]/settings:print:border-emerald-500 group-has-[:checked.toggle-tick]/settings:print:bg-emerald-50 group-has-[:checked.toggle-tick]/settings:print:font-bold ' +
                                                          'group-has-[:not(:checked).toggle-tick]/settings:border-gray-200 group-has-[:not(:checked).toggle-tick]/settings:bg-gray-50/30 group-has-[:not(:checked).toggle-tick]/settings:print:border-gray-300 group-has-[:not(:checked).toggle-tick]/settings:print:bg-white'
                                                    }`}
                                            >
                                                <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium border print:[print-color-adjust:exact] ${
                                                    !isCorrect 
                                                    ? 'bg-gray-50 border-gray-200 text-gray-600 print:bg-white' 
                                                    : 'group-has-[:checked.toggle-tick]/settings:bg-emerald-500 group-has-[:checked.toggle-tick]/settings:border-emerald-500 group-has-[:checked.toggle-tick]/settings:text-white group-has-[:checked.toggle-tick]/settings:print:bg-emerald-500 ' +
                                                      'group-has-[:not(:checked).toggle-tick]/settings:bg-gray-50 group-has-[:not(:checked).toggle-tick]/settings:border-gray-200 group-has-[:not(:checked).toggle-tick]/settings:text-gray-600 group-has-[:not(:checked).toggle-tick]/settings:print:bg-white'
                                                    }`}>
                                                    {isCorrect ? (
                                                        <>
                                                            <Check className="w-5 h-5 print:text-white hidden group-has-[:checked.toggle-tick]/settings:block" />
                                                            <span className="group-has-[:not(:checked).toggle-tick]/settings:block hidden">{optLetter}</span>
                                                        </>
                                                    ) : optLetter}
                                                </div>
                                                <div className="prose prose-sm max-w-none text-gray-700 [&>p]:m-0 w-full print-opt-text">
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
                                    <div className="ml-8 mt-4 bg-white/60 border border-black/5 p-5 rounded-lg print:bg-white/80 print:border-gray-200 print:p-4 print:text-[13px] print:break-inside-avoid group-has-[:not(:checked).toggle-exp]/settings:hidden">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Lightbulb className="w-5 h-5 text-yellow-500 print:text-black" />
                                            <h4 className="font-bold text-blue-900 print:text-black m-0">Explanation</h4>
                                        </div>

                                        {q.explanation && (
                                            <div className="prose prose-sm max-w-none text-gray-700 mb-5 print:text-black print-exp-text print:leading-tight">
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                                    {q.explanation}
                                                </ReactMarkdown>
                                            </div>
                                        )}

                                        {/* Option Explanations inside main Explanation block */}
                                        {q.optionExplanations && Object.keys(q.optionExplanations).length > 0 && (
                                            <div className="space-y-3 group-has-[:not(:checked).toggle-optexp]/settings:hidden">
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
                                                                <div className="font-semibold text-gray-800 prose prose-sm max-w-none [&>p]:m-0 print-exp-text print:leading-tight">
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
                                                                <div className="text-gray-600 text-sm ml-8 prose prose-sm max-w-none [&>p]:m-0 print:text-black print-exp-text print:leading-tight">
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

                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Screen-only Footer (Since print uses tfoot) */}
            <div className="w-full mt-12 print:hidden">
                <div className="bg-[#eef6ff] text-[#1e4b85] py-2.5 px-6 md:px-12 flex justify-between items-center w-full border-t border-blue-200">
                    <div className="font-semibold text-[13px] md:text-[14px]">&copy; DeshExam</div>
                    <div className="font-bold text-[14px] md:text-[15px]">India's Smart Learning Platform</div>
                    <div className="font-semibold text-[13px] md:text-[14px]">www.deshexam.in</div>
                </div>
            </div>
            
            </div>
            </div>

            {/* Print Button Header for Screen only */}
            <PrintButton />
        </div>
    );
}
