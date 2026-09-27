import React from 'react';
import { Metadata } from 'next';
import PresentationClient from '@/app/presentation/PresentationClient';
import { getAllHardcodedMockTests, getAllHardcodedQuizzes, getAllHardcodedPracticeSets } from '@/lib/hardcoded-loader';
import { getAssessments } from '@/lib/firebase/assessment';
import { serializeTimestamps } from '@/lib/utils';
import { Monitor, Sparkles, Tv, HelpCircle, CheckCircle2, Award, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Presentation & Smartboard Mode | DeshExam',
    description: 'Immersive full-screen classroom presentation mode for mock tests, quizzes, and assessments on smartboards and projectors.',
};

export const dynamic = 'force-dynamic';

export default async function PresentationPage() {
    // 1. Fetch hardcoded tests
    const hardcodedMockTests = (getAllHardcodedMockTests() || []).map(t => ({ ...t, type: 'Mock Test' }));
    const hardcodedQuizzes = (getAllHardcodedQuizzes() || []).map(t => ({ ...t, type: 'Quiz' }));
    const hardcodedPracticeSets = (getAllHardcodedPracticeSets() || []).map(t => ({ ...t, type: 'Practice Set' }));

    // 2. Fetch Firebase tests safely
    let fbMockTests: any[] = [];
    let fbQuizzes: any[] = [];
    let fbPracticeSets: any[] = [];

    try {
        const [mocks, quizzes, practice] = await Promise.allSettled([
            getAssessments('mockTests'),
            getAssessments('quizzes'),
            getAssessments('practiceSets')
        ]);

        if (mocks.status === 'fulfilled' && Array.isArray(mocks.value)) {
            fbMockTests = mocks.value
                .filter((t: any) => t && t.status !== 'Draft')
                .map((t: any) => ({ ...t, type: 'Mock Test' }));
        }
        if (quizzes.status === 'fulfilled' && Array.isArray(quizzes.value)) {
            fbQuizzes = quizzes.value
                .filter((t: any) => t && t.status !== 'Draft')
                .map((t: any) => ({ ...t, type: 'Quiz' }));
        }
        if (practice.status === 'fulfilled' && Array.isArray(practice.value)) {
            fbPracticeSets = practice.value
                .filter((t: any) => t && t.status !== 'Draft')
                .map((t: any) => ({ ...t, type: 'Practice Set' }));
        }
    } catch (e) {
        console.error('Failed to load assessments from Firebase for presentation:', e);
    }

    // 3. Combine with deduplication (by slug or id)
    const combinedMap = new Map<string, any>();

    // Firebase first
    for (const t of [...fbMockTests, ...fbQuizzes, ...fbPracticeSets]) {
        const key = t.slug || t.id;
        if (key) combinedMap.set(key, t);
    }

    // Hardcoded fallback/enrichment
    for (const t of [...hardcodedMockTests, ...hardcodedQuizzes, ...hardcodedPracticeSets]) {
        const key = t.slug || t.id;
        if (key && !combinedMap.has(key)) {
            combinedMap.set(key, t);
        }
    }

    // Filter tests that have at least one question or questionId
    const allAssessments = Array.from(combinedMap.values()).filter(t => {
        const qCount = (t.questions && t.questions.length) || (t.questionIds && t.questionIds.length) || t.questionCount || t.totalQuestions || 0;
        return qCount > 0;
    });

    // 4. Serialize timestamps for Next.js Server-to-Client component boundary
    const serializedAssessments = JSON.parse(JSON.stringify(serializeTimestamps(allAssessments)));

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Modern Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 sm:p-12 mb-10 shadow-xl border border-indigo-700/40">
                    {/* Background decorative glows */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                        {/* Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-indigo-100 mb-5 shadow-inner">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                            Smartboard & Projector Ready
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
                            Interactive <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-sky-200 to-indigo-200">Presentation Mode</span>
                        </h1>

                        {/* Description */}
                        <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed mb-6 max-w-2xl font-normal">
                            Teach, explain, and engage students on smartboards and large screens. Display questions one by one with immersive layouts, live timers, and instant answer reveals.
                        </p>

                        {/* Features Badges */}
                        <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-indigo-100">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                                <Monitor className="w-4 h-4 text-emerald-400" /> Fullscreen Display
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                                <CheckCircle2 className="w-4 h-4 text-amber-300" /> Instant Solution Reveal
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                                <Tv className="w-4 h-4 text-sky-400" /> Classroom Smartboards
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cards and Controls */}
                <PresentationClient assessments={serializedAssessments} />
            </div>
        </div>
    );
}

