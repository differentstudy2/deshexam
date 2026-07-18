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
    if (boardName || className || subjectName || test.subject) {
        classLine = `${[boardName, className, subjectName || test.subject].filter(Boolean).join(' | ')} - ${currentYear}`;
    }

    return (
        <div className="-mt-4 -mx-4 -mb-20 md:-mt-6 md:-mx-6 md:-mb-8 lg:-mt-8 lg:-mx-8 min-h-[calc(100vh-64px)] bg-gray-100 text-black py-10 px-4 md:px-8 font-sans print:p-0 print:m-0 print:bg-white print:text-black print:min-h-0 print:block group/settings">
            <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-6 items-start print:block">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-72 shrink-0 print:hidden lg:sticky lg:top-8 lg:max-h-[calc(100vh-8rem)] overflow-y-auto bg-white border border-gray-200 p-6 rounded-xl shadow-sm custom-scrollbar">
                    <div className="flex items-center gap-2 text-blue-800 font-bold mb-6 pb-4 border-b border-gray-100">
                        <Settings className="w-5 h-5" />
                        <span className="text-lg">Display Settings</span>
                    </div>
                    <div className="space-y-6">
                        {/* Print Layout */}
                        <div>
                            <span className="text-gray-900 font-bold block mb-3 text-sm">Print Layout</span>
                            <div className="space-y-4">
                                <div>
                                    <select defaultValue="default" className="input-layout w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                                        <option value="default">Default Layout</option>
                                        <option value="presentation">Presentation (Slide)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Print Elements */}
                        <div className="pt-5 border-t border-gray-100">
                            <span className="text-gray-900 font-bold block mb-3 text-sm">Print Options</span>
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 text-sm hover:text-blue-600 transition-colors">
                                    <input type="checkbox" defaultChecked className="toggle-header w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span>Show Header</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 text-sm hover:text-blue-600 transition-colors">
                                    <input type="checkbox" defaultChecked className="toggle-footer w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span>Show Footer</span>
                                </label>
                            </div>
                        </div>

                        {/* Visibility Settings */}
                        <div className="pt-5 border-t border-gray-100">
                            <span className="text-gray-900 font-bold block mb-3 text-sm">Visibility (All)</span>
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 text-sm hover:text-blue-600 transition-colors">
                                    <input type="checkbox" defaultChecked className="toggle-exp w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span>Main Explanations</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 text-sm hover:text-blue-600 transition-colors">
                                    <input type="checkbox" defaultChecked className="toggle-optexp w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span>Option Explanations</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 text-sm hover:text-blue-600 transition-colors">
                                    <input type="checkbox" defaultChecked className="toggle-tick w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span>Correct Answer Highlight</span>
                                </label>
                            </div>
                        </div>

                        {/* Question Styling */}
                        <div className="pt-5 border-t border-gray-100">
                            <span className="text-gray-900 font-bold block mb-3 text-sm">Question Style</span>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
                                    <input type="range" min="14" max="32" defaultValue="22" className="input-fs-q w-full accent-blue-600" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Font Family</label>
                                    <select defaultValue="" className="input-font-q w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                                        <option value="">Default (System)</option>
                                        <option value="'Kalpurush', sans-serif">Kalpurush</option>
                                        <option value="'SolaimanLipi', sans-serif">SolaimanLipi</option>
                                        <option value="Arial, sans-serif">Arial</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Options Styling */}
                        <div className="pt-5 border-t border-gray-100">
                            <span className="text-gray-900 font-bold block mb-3 text-sm">Options Style</span>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
                                    <input type="range" min="12" max="28" defaultValue="16" className="input-fs-opt w-full accent-blue-600" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Font Family</label>
                                    <select defaultValue="" className="input-font-opt w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                                        <option value="">Default (System)</option>
                                        <option value="'Kalpurush', sans-serif">Kalpurush</option>
                                        <option value="'SolaimanLipi', sans-serif">SolaimanLipi</option>
                                        <option value="Arial, sans-serif">Arial</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Explanations Styling */}
                        <div className="pt-5 border-t border-gray-100">
                            <span className="text-gray-900 font-bold block mb-3 text-sm">Explanations Style</span>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
                                    <input type="range" min="12" max="28" defaultValue="14" className="input-fs-exp w-full accent-blue-600" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Font Family</label>
                                    <select defaultValue="" className="input-font-exp w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                                        <option value="">Default (System)</option>
                                        <option value="'Kalpurush', sans-serif">Kalpurush</option>
                                        <option value="'SolaimanLipi', sans-serif">SolaimanLipi</option>
                                        <option value="Arial, sans-serif">Arial</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Document */}
                <div className="flex-1 w-full max-w-[1000px] mx-auto bg-white p-6 md:p-12 pb-32 md:pb-32 shadow-xl rounded-sm print:max-w-none print:mx-0 print:p-0 print:pb-32 print:shadow-none print:rounded-none relative min-h-[1056px] flex flex-col">

                <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --font-q: inherit;
                    --fs-q: 22px;
                    --font-opt: inherit;
                    --fs-opt: 16px;
                    --font-exp: inherit;
                    --fs-exp: 14px;
                }
                .print-q-text p, .print-q-text li, .print-q-num {
                    font-family: var(--font-q) !important;
                    font-size: var(--fs-q) !important;
                    line-height: 1.5 !important;
                }
                .print-opt-text p, .print-opt-text li {
                    font-family: var(--font-opt) !important;
                    font-size: var(--fs-opt) !important;
                    line-height: 1.5 !important;
                }
                .print-exp-text p, .print-exp-text li, .print-exp-text span {
                    font-family: var(--font-exp) !important;
                    font-size: var(--fs-exp) !important;
                    line-height: 1.5 !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                @media print {
                    @page { margin: 0; }
                }
                
                /* Presentation Layout Overrides */
                html[data-layout="presentation"] body {
                    background-color: #f8fbff !important;
                }
                html[data-layout="presentation"] .flex-1.w-full.max-w-\\[1000px\\] {
                    max-width: none !important;
                    width: 100% !important;
                    padding: 0 !important;
                    background: transparent !important;
                    box-shadow: none !important;
                }
                html[data-layout="presentation"] .presentation-header,
                html[data-layout="presentation"] .presentation-badges,
                html[data-layout="presentation"] .presentation-footer,
                html[data-layout="presentation"] .presentation-watermark {
                    display: flex !important;
                }
                html[data-layout="presentation"] .group\\/question {
                    height: 100vh;
                    display: flex !important;
                    flex-direction: column;
                    justify-content: center;
                    padding-left: 10rem !important;
                    padding-right: 10rem !important;
                    border: none !important;
                    page: presentation-page;
                    background: #f8fbff !important;
                }
                @page presentation-page {
                    size: landscape;
                    margin: 0;
                }
                html[data-layout="presentation"] .print-q-text {
                    font-size: 32px !important;
                    line-height: 1.5 !important;
                    margin-bottom: 2.5rem !important;
                    text-align: left;
                    z-index: 10;
                }
                html[data-layout="presentation"] .print-q-text p,
                html[data-layout="presentation"] .print-q-text span {
                    font-size: 32px !important;
                    font-weight: 800 !important;
                    color: #111827 !important;
                }
                html[data-layout="presentation"] .print-q-num {
                    display: none !important;
                }
                html[data-layout="presentation"] .options-container {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 1.5rem 3rem !important;
                    padding: 0 4rem;
                    z-index: 10;
                }
                html[data-layout="presentation"] .options-container > div {
                    background: white !important;
                    border-width: 4px !important;
                    padding: 1rem 1.5rem !important;
                    border-radius: 1rem !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                html[data-layout="presentation"] .options-container > div:nth-child(1) { border-color: #3b82f6 !important; }
                html[data-layout="presentation"] .options-container > div:nth-child(1) .relative.shrink-0 { background: #eff6ff !important; color: #3b82f6 !important; border: none !important; width: 3.5rem !important; height: 3.5rem !important; border-radius: 0.5rem !important; font-size: 1.5rem !important; font-weight: 900 !important; }
                
                html[data-layout="presentation"] .options-container > div:nth-child(2) { border-color: #22c55e !important; }
                html[data-layout="presentation"] .options-container > div:nth-child(2) .relative.shrink-0 { background: #f0fdf4 !important; color: #22c55e !important; border: none !important; width: 3.5rem !important; height: 3.5rem !important; border-radius: 0.5rem !important; font-size: 1.5rem !important; font-weight: 900 !important; }
                
                html[data-layout="presentation"] .options-container > div:nth-child(3) { border-color: #f59e0b !important; }
                html[data-layout="presentation"] .options-container > div:nth-child(3) .relative.shrink-0 { background: #fffbeb !important; color: #f59e0b !important; border: none !important; width: 3.5rem !important; height: 3.5rem !important; border-radius: 0.5rem !important; font-size: 1.5rem !important; font-weight: 900 !important; }
                
                html[data-layout="presentation"] .options-container > div:nth-child(4) { border-color: #ef4444 !important; }
                html[data-layout="presentation"] .options-container > div:nth-child(4) .relative.shrink-0 { background: #fef2f2 !important; color: #ef4444 !important; border: none !important; width: 3.5rem !important; height: 3.5rem !important; border-radius: 0.5rem !important; font-size: 1.5rem !important; font-weight: 900 !important; }
                
                html[data-layout="presentation"] .print-opt-text p {
                    font-size: 26px !important;
                    font-weight: 700 !important;
                    color: #000 !important;
                    margin: 0 !important;
                }
            `}} />

            {/* Native Print Table for Repeating Header/Footer without Overlap */}
            <table className="w-full border-collapse h-full flex-1 flex flex-col print:table print:h-auto">
                <thead className="hidden print:table-header-group w-full z-50 group-has-[:not(:checked).toggle-header]/settings:print:!hidden [html[data-layout='presentation']_&]:!hidden">
                    <tr>
                        <td className="p-0 border-b border-blue-200">
                            <div className="bg-[#eef6ff] py-3 px-12 flex justify-between items-center w-full print:[print-color-adjust:exact]">
                                <div className="flex items-center gap-3">
                                    <img src="/image/logo.png" alt="DeshExam" className="h-6 w-auto object-contain" />
                                    <div className="font-bold text-[18px] text-[#1e4b85] tracking-tight">DeshExam</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-[14px] text-[#1e4b85]">{classLine}</div>
                                    {[chapterName, topicName].some(Boolean) && (
                                        <div className="text-[12px] text-[#1e4b85]/90 mt-0.5">
                                            {[chapterName, topicName].filter(Boolean).join(' | ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tfoot className="hidden print:table-footer-group w-full bg-white z-50 group-has-[:not(:checked).toggle-footer]/settings:print:!hidden [html[data-layout='presentation']_&]:!hidden">
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
                <tbody className="w-full h-full flex-1 flex flex-col print:table-row-group">
                    <tr className="h-full flex-1 flex flex-col print:table-row">
                        <td className="p-0 align-top w-full h-full flex-1 flex flex-col print:table-cell">
                {/* Watermark for Print */}
            <div className="fixed inset-0 pointer-events-none z-0 hidden print:flex items-center justify-center opacity-10 print:opacity-10">
                <div className="text-7xl font-bold text-gray-400 -rotate-45 whitespace-nowrap">
                    DeshExam
                </div>
            </div>

            {/* Header - Print Friendly */}
            <div className="mb-8 print:pt-12 print:px-12 [html[data-layout='presentation']_&]:hidden">
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
            <div className="flex flex-col gap-12 flex-1 print:block print:gap-0 print:break-before-page">
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
                        const isLast = index === sortedQuestions.length - 1;

                        return (
                            <div key={q.id} className={`group/question ${bgColor} ${isLast ? 'flex-1 print:flex-none' : ''} border border-gray-200 p-6 rounded-lg print:border-none print:p-6 print:pt-8 print:pb-6 print:break-after-page print:[print-color-adjust:exact] break-inside-avoid print:break-inside-avoid relative`}>

                                {/* Presentation Header (Hidden by default) */}
                                <div className="presentation-header hidden w-full absolute top-0 left-0 right-0 justify-between items-center px-12 pt-10 z-10">
                                    <div className="flex items-center gap-3">
                                        <img src="/image/logo.png" alt="DeshExam" className="h-10 w-auto object-contain" />
                                        <div className="font-bold text-[24px] text-[#1e4b85] tracking-tight">DeshExam</div>
                                    </div>
                                    <div className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold text-lg shadow-sm">MOCK TEST</div>
                                    <div className="text-2xl font-bold text-gray-800">Page {String(index + 1).padStart(2, '0')}</div>
                                </div>

                                {/* Presentation Top Badges */}
                                <div className="presentation-badges hidden absolute top-32 right-12 gap-3 z-10">
                                    {(q.sourceExam || (q.tags && q.tags.length > 0)) && (
                                        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded border border-blue-200 font-medium flex items-center gap-2 shadow-sm text-sm">
                                            <span className="w-3 h-4 bg-blue-500 inline-block rounded-sm"></span>
                                            {q.sourceExam || (q.tags && q.tags[0]) || 'History'}
                                        </div>
                                    )}
                                    <div className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded border border-amber-200 font-medium flex items-center gap-2 shadow-sm text-sm">
                                        <div className="flex items-end gap-0.5 h-4">
                                            <span className="w-1.5 h-2 bg-amber-300 inline-block rounded-sm"></span>
                                            <span className="w-1.5 h-3 bg-amber-400 inline-block rounded-sm"></span>
                                            <span className="w-1.5 h-4 bg-amber-500 inline-block rounded-sm"></span>
                                        </div>
                                        {q.difficulty || 'Hard'}
                                    </div>
                                    <div className="bg-gray-50 text-gray-700 px-4 py-1.5 rounded border border-gray-200 font-medium flex items-center gap-2 shadow-sm text-sm">
                                        <span className="w-4 h-3 bg-gray-400 inline-block rounded-sm relative"><span className="absolute w-2 h-4 bg-gray-500 left-1 -top-0.5 rounded-sm"></span></span>
                                        {test.subject || 'Module 1'}
                                    </div>
                                    <div className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full border border-gray-300 font-bold flex items-center gap-2 shadow-sm text-sm">
                                        <span className="w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-[10px]">?</span>
                                        Question {String(index + 1).padStart(2, '0')} / {sortedQuestions.length}
                                    </div>
                                </div>

                                {/* Presentation Footer */}
                                <div className="presentation-footer hidden absolute bottom-0 left-0 right-0 w-full justify-between items-center px-12 pb-8 text-gray-700 font-semibold text-lg z-10">
                                    <div>© DeshExam</div>
                                    <div className="text-gray-500 font-medium">www.deshexam.in</div>
                                    <div>{test.subject || 'Bangladesh History Series'}</div>
                                </div>

                                {/* Watermark */}
                                <div className="presentation-watermark hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-[60px] font-black text-gray-200/40 whitespace-nowrap z-0 pointer-events-none tracking-widest uppercase">
                                    {test.subject || 'HISTORICAL EVENT'} Q{index + 1} - {sortedQuestions.length}
                                </div>

                                {/* Question Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-baseline gap-3 w-full">
                                        <div className="flex flex-col shrink-0">
                                            <span className="text-black font-bold text-[22px] print-q-num">Q{index + 1}.</span>
                                            <div className="flex flex-col gap-2 mt-4 print:hidden opacity-60 hover:opacity-100 transition-opacity">
                                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-gray-600 hover:text-gray-900" title="Show Main Explanation">
                                                    <input type="checkbox" defaultChecked className="toggle-exp-local w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                    <span>Exp</span>
                                                </label>
                                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-gray-600 hover:text-gray-900" title="Show Option Explanations">
                                                    <input type="checkbox" defaultChecked className="toggle-optexp-local w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                    <span>Opt Exp</span>
                                                </label>
                                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-gray-600 hover:text-gray-900" title="Highlight Correct Answer">
                                                    <input type="checkbox" defaultChecked className="toggle-tick-local w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                    <span>Ans</span>
                                                </label>
                                            </div>
                                        </div>
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
                                    </div>
                                </div>

                                {/* Options Grid */}
                                <div className="options-container ml-8 space-y-3 md:space-y-0 md:grid md:grid-cols-2 print:space-y-0 print:grid print:grid-cols-2 gap-4 mt-4 mb-6 print:mt-2 print:mb-3">
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
                                                className={`flex items-center gap-3 p-3 rounded-full border transition-colors duration-300 print:[print-color-adjust:exact] ${!isCorrect
                                                        ? [
                                                            'border-blue-100 bg-blue-50/30 print:border-blue-200 print:bg-[#f0f7ff]',
                                                            'border-teal-100 bg-teal-50/30 print:border-teal-200 print:bg-[#f0fdfa]',
                                                            'border-purple-100 bg-purple-50/30 print:border-purple-200 print:bg-[#faf5ff]',
                                                            'border-orange-100 bg-orange-50/30 print:border-orange-200 print:bg-[#fff7ed]',
                                                            'border-rose-100 bg-rose-50/30 print:border-rose-200 print:bg-[#fff1f2]'
                                                          ][oIdx % 5]
                                                        : 'group-has-[:checked.toggle-tick-local]/question:border-emerald-400 group-has-[:checked.toggle-tick-local]/question:bg-emerald-50/50 group-has-[:checked.toggle-tick-local]/question:print:border-emerald-500 group-has-[:checked.toggle-tick-local]/question:print:bg-emerald-50 group-has-[:checked.toggle-tick-local]/question:print:font-bold ' +
                                                          'group-has-[:not(:checked).toggle-tick-local]/question:border-gray-200 group-has-[:not(:checked).toggle-tick-local]/question:bg-gray-50/30 group-has-[:not(:checked).toggle-tick-local]/question:print:border-gray-300 group-has-[:not(:checked).toggle-tick-local]/question:print:bg-white'
                                                    }`}
                                            >
                                                <div className={`relative shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium border transition-colors duration-300 print:[print-color-adjust:exact] ${
                                                    !isCorrect 
                                                    ? 'bg-gray-50 border-gray-200 text-gray-600 print:bg-white' 
                                                    : 'group-has-[:checked.toggle-tick-local]/question:bg-emerald-500 group-has-[:checked.toggle-tick-local]/question:border-emerald-500 group-has-[:checked.toggle-tick-local]/question:text-white group-has-[:checked.toggle-tick-local]/question:print:bg-emerald-500 ' +
                                                      'group-has-[:not(:checked).toggle-tick-local]/question:bg-gray-50 group-has-[:not(:checked).toggle-tick-local]/question:border-gray-200 group-has-[:not(:checked).toggle-tick-local]/question:text-gray-600 group-has-[:not(:checked).toggle-tick-local]/question:print:bg-white'
                                                    }`}>
                                                    {isCorrect ? (
                                                        <>
                                                            <Check className="w-5 h-5 print:text-white absolute transition-transform duration-300 scale-0 group-has-[:checked.toggle-tick-local]/question:scale-100" />
                                                            <span className="absolute transition-transform duration-300 scale-100 group-has-[:checked.toggle-tick-local]/question:scale-0">{optLetter}</span>
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
                                    <div className="grid transition-all duration-300 ease-in-out group-has-[:not(:checked).toggle-exp-local]/question:grid-rows-[0fr] group-has-[:not(:checked).toggle-exp-local]/question:opacity-0 group-has-[:checked.toggle-exp-local]/question:grid-rows-[1fr] group-has-[:checked.toggle-exp-local]/question:opacity-100">
                                        <div className="overflow-hidden">
                                            <div className="ml-8 mt-4 bg-white/60 border border-black/5 p-5 rounded-lg print:bg-white/80 print:border-gray-200 print:p-4 print:text-[13px] print:break-inside-avoid">
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
                                            <div className="mt-5 grid transition-all duration-300 ease-in-out group-has-[:not(:checked).toggle-optexp-local]/question:grid-rows-[0fr] group-has-[:not(:checked).toggle-optexp-local]/question:opacity-0 group-has-[:checked.toggle-optexp-local]/question:grid-rows-[1fr] group-has-[:checked.toggle-optexp-local]/question:opacity-100">
                                                <div className="overflow-hidden">
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
                                                </div>
                                            </div>
                                        )}
                                            </div>
                                        </div>
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
