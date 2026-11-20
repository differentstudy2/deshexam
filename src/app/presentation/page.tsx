import React from 'react';
import { Metadata } from 'next';
import PresentationClient from '@/app/presentation/PresentationClient';
import { getAllHardcodedMockTests, getAllHardcodedQuizzes, getAllHardcodedPracticeSets, getHardcodedMockTest, getHardcodedQuiz, getHardcodedPracticeSet } from '@/lib/hardcoded-loader';
import { getAssessments, getAssessment, getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { serializeTimestamps } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Presentation & Smartboard Mode | DeshExam',
    description: 'Immersive full-screen classroom presentation mode for mock tests, quizzes, and assessments on smartboards and projectors.',
};

export const dynamic = 'force-dynamic';

const FIREBASE_COLLECTIONS = [
    { name: 'mockTests', type: 'Mock Test' },
    { name: 'quizzes', type: 'Quiz' },
    { name: 'practiceSets', type: 'Practice Set' },
] as const;

/**
 * Resolve the featured launch test exactly the way the single
 * /presentation/[slug] page does (hardcoded first, then Firebase by
 * slug, then by id) so the hero shows the same live record that the
 * presentation itself opens — not a different record that happens to
 * share the slug in the list.
 */
async function resolveFeatured(slug: string): Promise<any | null> {
    const hardcoded =
        getHardcodedMockTest(slug) ? { ...getHardcodedMockTest(slug), type: 'Mock Test' } :
        getHardcodedQuiz(slug) ? { ...getHardcodedQuiz(slug), type: 'Quiz' } :
        getHardcodedPracticeSet(slug) ? { ...getHardcodedPracticeSet(slug), type: 'Practice Set' } :
        null;
    if (hardcoded) return hardcoded;

    for (const col of FIREBASE_COLLECTIONS) {
        try {
            const bySlug = await getAssessmentBySlug(col.name as any, slug);
            if (bySlug) return { ...bySlug, type: col.type };
            const byId = await getAssessment(col.name as any, slug);
            if (byId) return { ...byId, type: col.type };
        } catch (_) {
            // Continue to next collection
        }
    }
    return null;
}

async function resolveQuestionCount(test: any): Promise<number> {
    if (test.questions && Array.isArray(test.questions) && test.questions.length > 0) {
        return test.questions.length;
    }
    if (test.questionIds && Array.isArray(test.questionIds) && test.questionIds.length > 0) {
        try {
            const questions = await getQuestionsByIds(test.questionIds);
            return questions.length;
        } catch (_) {
            return test.questionIds.length;
        }
    }
    return test.questionCount || test.totalQuestions || 0;
}

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

    // 5. Featured launch test ("copy-of") — resolved the same way the single
    // presentation page resolves it, with only live scalar fields passed on.
    let featured: any = null;
    try {
        const test = await resolveFeatured('copy-of');
        if (test) {
            const questionCount = await resolveQuestionCount(test);
            if (questionCount > 0) {
                featured = {
                    title: test.title,
                    slug: test.slug || test.id,
                    type: test.type || 'Mock Test',
                    classId: test.classId || null,
                    language: test.language || null,
                    questionCount,
                    durationMin: test.durationMin ?? test.timeLimitMin ?? null,
                    totalMarks: test.totalMarks ?? null,
                    negativeMarking: test.negativeMarking ?? null,
                };
            }
        }
    } catch (e) {
        console.error('Failed to load featured presentation:', e);
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Cards and Controls — launch hero lives at the top of PresentationClient */}
                <PresentationClient assessments={serializedAssessments} featured={featured} />
            </div>
        </div>
    );
}

