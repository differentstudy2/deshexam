import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getQuestions } from '@/lib/firebase/question-bank';
import QuestionFeed from '@/components/question-bank/QuestionFeed';
import QuestionsHeader from '@/components/question-bank/QuestionsHeader';
import QuestionsSidebar from '@/components/question-bank/QuestionsSidebar';
import { getCollectionPageSchema, getItemListSchema, getBreadcrumbSchema } from '@/lib/seo/json-ld';
import { CLASSES, MEDIUMS, SUBJECTS_BY_CLASS, toBn } from '@/lib/wb-board';

// --- WB Board filters (URL query: ?class=&subject=&medium=) -----------------
// Same matching rules as src/app/questions/page.tsx: class is parsed out of
// classId ("class-5-wb" -> 5), subject is a romanised key matched inside
// subjectId, medium is detected from Bengali script in the question text
// (the bank has no medium field). Class 5 EVS is filed under "বিজ্ঞান".

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

function applyWbFilters(questions: any[], f: { classNum?: number; subject?: string; medium?: string }): any[] {
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
function FilterBar({ base, classNum, subject, medium }: {
    base: string;
    classNum?: number;
    subject?: string;
    medium?: string;
}) {
    const href = (patch: Record<string, string | undefined>) => {
        const params = new URLSearchParams();
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

async function getFilteredQuestions(taxonomy: string[]) {
    let questions = await getQuestions({}, 500);
    const [level1, level2, level3] = taxonomy;

    return questions.filter((q: any) => {
        let match = true;
        if (level1) {
            match = match && (
                q.boardId?.toLowerCase() === level1.toLowerCase() ||
                (q.metadata?.examTypes || []).some((e: string) => e.toLowerCase() === level1.toLowerCase())
            );
        }
        if (level2) {
            match = match && (q.classId?.toLowerCase() === level2.toLowerCase() || q.subjectId?.toLowerCase() === level2.toLowerCase());
        }
        if (level3) {
            match = match && (q.subjectId?.toLowerCase() === level3.toLowerCase() || q.chapterId?.toLowerCase() === level3.toLowerCase());
        }
        return match;
    });
}

export async function generateMetadata({ params }: { params: Promise<{ taxonomy: string[] }> }): Promise<Metadata> {
    const { taxonomy } = await params;
    const titleBase = taxonomy.map(t => t.toUpperCase().replace('-', ' ')).join(' ');

    const questions = await getFilteredQuestions(taxonomy);

    if (questions.length === 0) {
        return {
            title: `No Results for ${titleBase} | DeshExam`,
            robots: { index: false, follow: true }
        };
    }

    return {
        title: `Top ${titleBase} Questions | DeshExam`,
        description: `Practice ${titleBase} questions with answers and explanations on DeshExam.`,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/questions/${taxonomy.join('/')}`
        }
    };
}

export default async function TaxonomyFilterPage(props: { params: Promise<{ taxonomy: string[] }>, searchParams: Promise<{ page?: string, class?: string, subject?: string, medium?: string }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const taxonomy = params.taxonomy || [];
    const page = parseInt(searchParams?.page || '1', 10);
    const classNum = searchParams?.class ? parseInt(searchParams.class, 10) : undefined;
    const subject = searchParams?.subject || undefined;
    const medium = searchParams?.medium === 'bn' || searchParams?.medium === 'en' ? searchParams.medium : undefined;
    const wbActive = Boolean(classNum || subject || medium);
    const itemsPerPage = 20;

    let questions = await getFilteredQuestions(taxonomy);
    if (wbActive) {
        questions = applyWbFilters(questions, { classNum, subject, medium });
    }

    const totalItems = questions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedQuestions = questions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const titleBase = taxonomy.map(t => t.toUpperCase().replace('-', ' ')).join(' ');

    const breadcrumbItems = [
        { name: 'Home', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}` },
        { name: 'Questions', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/questions` }
    ];

    let currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/questions`;
    taxonomy.forEach(t => {
        currentUrl += `/${t}`;
        breadcrumbItems.push({ name: t.toUpperCase().replace('-', ' '), url: currentUrl });
    });

    const schemas = [
        getCollectionPageSchema(currentUrl),
        getItemListSchema(paginatedQuestions),
        getBreadcrumbSchema(breadcrumbItems)
    ];

    if (paginatedQuestions.length === 0) {
        return (
            <div className="w-full flex flex-col items-center pb-20">
                <QuestionsHeader />
                <div className="container max-w-[1200px] mx-auto py-10 px-4">
                    <FilterBar base={`/questions/${taxonomy.join('/')}`} classNum={classNum} subject={subject} medium={medium} />
                    <div className="py-10 text-center">
                        <h2 className="text-2xl font-bold mb-4">No Questions Found</h2>
                        <p className="text-slate-500">We couldn&apos;t find any questions matching &quot;{titleBase}&quot;{wbActive ? ' এই ফিল্টারে' : ''}। ক্লাস অনুযায়ী প্রশ্নভান্ডার তৈরি হচ্ছে।</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center pb-20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
            <QuestionsHeader />

            <div className="container max-w-[1200px] mx-auto py-10 px-4">
                <FilterBar base={`/questions/${taxonomy.join('/')}`} classNum={classNum} subject={subject} medium={medium} />
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {titleBase} Practice Questions
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Showing {totalItems} questions for {titleBase}.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-[68%]">
                        <QuestionFeed
                            initialQuestions={JSON.parse(JSON.stringify(paginatedQuestions))}
                            serverCurrentPage={page}
                            serverTotalPages={totalPages}
                            serverTotalItems={totalItems}
                            serverItemsPerPage={itemsPerPage}
                        />
                    </div>
                    <div className="w-full lg:w-[32%] lg:sticky lg:top-24">
                        <QuestionsSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}
