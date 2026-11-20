import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getQuestions, getTotalQuestionsCount } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionsHeader from '@/components/question-bank/QuestionsHeader';
import QuestionsSidebar from '@/components/question-bank/QuestionsSidebar';
import QuestionFeed from '@/components/question-bank/QuestionFeed';
import QuestionsSeoContent from '@/components/question-bank/QuestionsSeoContent';
import QuestionsFaq from '@/components/question-bank/QuestionsFaq';
import {
    getCollectionPageSchema,
    getItemListSchema,
    getBreadcrumbSchema,
    getFAQSchema,
    getSearchActionSchema,
    getOrganizationSchema
} from '@/lib/seo/json-ld';
import { CLASSES, MEDIUMS, SUBJECTS_BY_CLASS, toBn } from '@/lib/wb-board';

// --- WB Board filters (URL query: ?class=&subject=&medium=) -----------------
// The question bank stores taxonomy as ids (boardId "board-wb",
// classId "class-5-wb", subjectId "subject-evs-class-5-wb") and has no
// medium field, so filters are matched against the stored ids / text:
//  - class: number parsed out of classId ("class-5-wb" -> 5)
//  - subject: romanised key of the WB subject label matched inside subjectId
//  - medium: Bengali script present in the question text -> bn, else en
// Class 5 EVS questions are filed under "বিজ্ঞান" in this taxonomy.

const SUBJECT_KEYS: Record<string, string[]> = {
    'বাংলা': ['bangla', 'bengali'],
    'English': ['english'],
    'গণিত': ['math', 'gonit'],
    'বিজ্ঞান': ['science', 'evs', 'poribesh'],
    'ইতিহাস': ['history', 'itihas'],
    'ভূগোল': ['geography', 'bhugol'],
    'ভৌতবিজ্ঞান': ['physical-science', 'physics', 'phy', 'bhouto'],
    'জীবনবিজ্ঞান': ['life-science', 'biology', 'jibon'],
    'পদার্থবিদ্যা': ['physics', 'phy'],
    'রসায়ন': ['chemistry', 'chem', 'rosayon'],
    'জীববিদ্যা': ['biology', 'bio'],
    'কম্পিউটার বিজ্ঞান': ['computer'],
    'হিসাবশাস্ত্র': ['accountancy', 'accounts', 'hisab'],
    'রাষ্ট্রবিজ্ঞান': ['political-science', 'polity', 'rashtro'],
    'শিক্ষাবিজ্ঞান': ['education', 'shiksha'],
};

function classOf(q: any): number | null {
    const m = String(q.classId || '').match(/class-(\d+)/);
    return m ? parseInt(m[1], 10) : null;
}

function hasBengali(text: string): boolean {
    return /[\u0980-\u09FF]/.test(text || '');
}

interface WbQuestionFilters {
    classNum?: number;
    subject?: string;
    medium?: string;
}

function applyWbFilters(questions: any[], f: WbQuestionFilters): any[] {
    return questions.filter((q: any) => {
        if (f.classNum && classOf(q) !== f.classNum) return false;
        if (f.subject) {
            const sid = String(q.subjectId || '').toLowerCase();
            const keys = SUBJECT_KEYS[f.subject] || [f.subject.toLowerCase()];
            if (!keys.some((k) => sid.includes(k))) return false;
        }
        if (f.medium === 'bn' && !hasBengali(q.questionText || '')) return false;
        if (f.medium === 'en' && hasBengali(q.questionText || '')) return false;
        return true;
    });
}

// Filter bar: server-rendered links, state lives in the URL query.
function FilterBar({ base, query, classNum, subject, medium }: {
    base: string;
    query: string;
    classNum?: number;
    subject?: string;
    medium?: string;
}) {
    const href = (patch: Record<string, string | undefined>) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (patch.classNum !== undefined) {
            if (patch.classNum) params.set('class', patch.classNum);
        } else if (classNum) params.set('class', String(classNum));
        if (patch.subject !== undefined) {
            if (patch.subject) params.set('subject', patch.subject);
        } else if (subject) params.set('subject', subject);
        if (patch.medium !== undefined) {
            if (patch.medium) params.set('medium', patch.medium);
        } else if (medium) params.set('medium', medium);
        const qs = params.toString();
        return qs ? `${base}?${qs}` : base;
    };
    const subjects = classNum
        ? SUBJECTS_BY_CLASS[classNum] || []
        : Array.from(new Set(Object.values(SUBJECTS_BY_CLASS).flat()));
    const chip = (active: boolean) =>
        `inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm font-bold transition-colors ${
            active
                ? 'border-amber-400 bg-amber-400 text-[#042f2e]'
                : 'border-white/15 bg-white/5 text-slate-200 hover:border-amber-400/60 hover:text-white'
        }`;
    return (
        <div className="mb-8 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#04121f,#0b3b39_55%,#042f2e)] p-4 text-white shadow-lg md:p-5">
            <p className="mb-3 text-sm font-bold tracking-wide text-amber-300">ফিল্টার করুন</p>
            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="w-16 shrink-0 text-sm font-semibold text-slate-300">ক্লাস</span>
                    <Link href={href({ classNum: '', subject: '' })} className={chip(!classNum)}>সব ক্লাস</Link>
                    {CLASSES.map((n) => (
                        <Link key={n} href={href({ classNum: String(n), subject: '' })} className={chip(classNum === n)}>
                            ক্লাস {toBn(n)}
                        </Link>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="w-16 shrink-0 text-sm font-semibold text-slate-300">বিষয়</span>
                    <Link href={href({ subject: '' })} className={chip(!subject)}>সব বিষয়</Link>
                    {subjects.map((s) => (
                        <Link key={s} href={href({ subject: s })} className={chip(subject === s)}>{s}</Link>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="w-16 shrink-0 text-sm font-semibold text-slate-300">মাধ্যম</span>
                    <Link href={href({ medium: '' })} className={chip(!medium)}>সব মাধ্যম</Link>
                    {MEDIUMS.map((m) => (
                        <Link key={m.id} href={href({ medium: m.id })} className={chip(medium === m.id)}>{m.label}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const query = params?.q;

    if (query) {
        return {
            title: `Search Results for "${query}" | DeshExam`,
            description: `Find practice questions, past papers, and mock tests for ${query} on DeshExam.`,
            robots: { index: false, follow: true }
        };
    }

    return {
        title: 'প্রশ্নভান্ডার — ক্লাস ৫–১২, WBBSE ও WBCHSE | DeshExam',
        description: 'ক্লাস ৫ থেকে ১২ — WBBSE (মাধ্যমিক) ও WBCHSE (উচ্চমাধ্যমিক) বোর্ডের অধ্যায়ভিত্তিক MCQ প্রশ্ন, উত্তর ও ব্যাখ্যাসহ। বাংলা ও English মাধ্যমে অনুশীলন করুন।',
        keywords: ['wbbse question bank', 'wbchse mcq practice', 'madhyamik question', 'higher secondary mcq', 'ক্লাস ১০ প্রশ্ন', 'বাংলা মাধ্যম প্রশ্ন'],
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/questions`
        },
        openGraph: {
            title: 'প্রশ্নভান্ডার — ক্লাস ৫–১২, WBBSE ও WBCHSE | DeshExam',
            description: 'অধ্যায়ভিত্তিক MCQ প্রশ্ন, উত্তর ও ব্যাখ্যাসহ — বাংলা ও English মাধ্যমে।',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/questions`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'প্রশ্নভান্ডার — ক্লাস ৫–১২, WBBSE ও WBCHSE | DeshExam',
            description: 'অধ্যায়ভিত্তিক MCQ প্রশ্ন, উত্তর ও ব্যাখ্যাসহ — বাংলা ও English মাধ্যমে।',
        }
    };
}

export default async function AllQuestionsPage(props: { searchParams: Promise<{ page?: string, q?: string, class?: string, subject?: string, medium?: string }> }) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1', 10);
    const query = searchParams?.q || '';
    const classNum = searchParams?.class ? parseInt(searchParams.class, 10) : undefined;
    const subject = searchParams?.subject || undefined;
    const medium = searchParams?.medium === 'bn' || searchParams?.medium === 'en' ? searchParams.medium : undefined;
    const wbActive = Boolean(classNum || subject || medium);
    const itemsPerPage = 20;

    // Fetch questions
    let questions = await getQuestions({}, (query || wbActive) ? 500 : page * itemsPerPage);

    if (query) {
        const lowerQuery = query.toLowerCase();
        questions = questions.filter((q: any) =>
            q.questionText?.toLowerCase().includes(lowerQuery) ||
            q.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery)) ||
            q.subjectId?.toLowerCase().includes(lowerQuery) ||
            q.boardId?.toLowerCase().includes(lowerQuery) ||
            q.questionType?.toLowerCase().includes(lowerQuery) ||
            (q.metadata?.examTypes || []).some((exam: string) => exam.toLowerCase().includes(lowerQuery)) ||
            (lowerQuery === 'academic' && q.boardId) ||
            (lowerQuery === 'competitive' && q.metadata?.examTypes?.length > 0) ||
            (lowerQuery === 'descriptive questions' && q.questionType !== 'mcq')
        );
    }

    if (wbActive) {
        questions = applyWbFilters(questions, { classNum, subject, medium });
    }

    // Total count for pagination
    const totalItems = (query || wbActive) ? questions.length : await getTotalQuestionsCount({});
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginatedQuestions = questions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const schemas = [
        getCollectionPageSchema(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/questions`),
        getItemListSchema(paginatedQuestions),
        getBreadcrumbSchema([
            { name: 'Home', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}` },
            { name: 'Questions', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/questions` }
        ]),
        getSearchActionSchema(),
        getOrganizationSchema(),
        getFAQSchema([
            { q: "Is DeshExam free?", a: "Yes, many of our practice questions, mock tests, and study materials are completely free. We also offer premium plans for advanced features, detailed analytics, and ad-free experiences." },
            { q: "Can I practice MCQ online?", a: "Absolutely! DeshExam provides an interactive platform to practice Multiple Choice Questions (MCQ) for various board and competitive exams with instant feedback." },
            { q: "Are solutions available?", a: "Yes, we provide detailed step-by-step solutions and explanations for most of our questions to help you understand the core concepts." },
            { q: "Which exams are supported?", a: "We currently support WBBSE (Class 5–10, Madhyamik) and WBCHSE (Class 11–12, Higher Secondary) board exams." },
            { q: "Can I save questions for later?", a: "Yes! If you create a free account, you can bookmark and save any question to your personal dashboard for quick revision later." }
        ])
    ];

    return (
        <div className="w-full flex flex-col items-center pb-20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

            <QuestionsHeader />

            <div className="container max-w-[1400px] mx-auto py-10 px-4">
                <FilterBar base="/questions" query={query} classNum={classNum} subject={subject} medium={medium} />
                {wbActive && totalItems === 0 && (
                    <p className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center text-base text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                        এই ফিল্টারে এখনো কোনো প্রশ্ন যোগ করা হয়নি — ক্লাস অনুযায়ী প্রশ্নভান্ডার তৈরি হচ্ছে।
                    </p>
                )}
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

                {/* SEO Content Blocks */}
                {!query && (
                    <>
                        <QuestionsSeoContent />
                        <QuestionsFaq />
                    </>
                )}
            </div>
        </div>
    );
}
