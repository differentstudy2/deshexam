import React from 'react';
import { Metadata } from 'next';
import StudioClient from '@/components/studio/StudioClient';
import { getAllHardcodedMockTests, getAllHardcodedQuizzes, getAllHardcodedPracticeSets } from '@/lib/hardcoded-loader';
import { getAssessments } from '@/lib/firebase/assessment';
import { serializeTimestamps } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'DeshExam Studio | প্রেজেন্টেশন স্টুডিও',
    description: 'DeshExam Studio — প্রেজেন্টেশন সাজান, থিম ও রেকর্ডিং বাছুন, আর এক ক্লিকে প্রেজেন্ট করুন।',
};

export const dynamic = 'force-dynamic';

const FIREBASE_COLLECTIONS = [
    { name: 'mockTests', type: 'Mock Test' },
    { name: 'quizzes', type: 'Quiz' },
    { name: 'practiceSets', type: 'Practice Set' },
] as const;

/**
 * Loads the same live assessment list as /presentation (hardcoded first,
 * then Firebase, deduped by slug/id, only tests that have questions).
 * Kept in this page so /presentation stays untouched.
 */
export default async function StudioPage() {
    const hardcodedMockTests = (getAllHardcodedMockTests() || []).map(t => ({ ...t, type: 'Mock Test' }));
    const hardcodedQuizzes = (getAllHardcodedQuizzes() || []).map(t => ({ ...t, type: 'Quiz' }));
    const hardcodedPracticeSets = (getAllHardcodedPracticeSets() || []).map(t => ({ ...t, type: 'Practice Set' }));

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
        console.error('Failed to load assessments from Firebase for studio:', e);
    }

    const combinedMap = new Map<string, any>();

    for (const t of [...fbMockTests, ...fbQuizzes, ...fbPracticeSets]) {
        const key = t.slug || t.id;
        if (key) combinedMap.set(key, t);
    }

    for (const t of [...hardcodedMockTests, ...hardcodedQuizzes, ...hardcodedPracticeSets]) {
        const key = t.slug || t.id;
        if (key && !combinedMap.has(key)) {
            combinedMap.set(key, t);
        }
    }

    const allAssessments = Array.from(combinedMap.values()).filter(t => {
        const qCount = (t.questions && t.questions.length) || (t.questionIds && t.questionIds.length) || t.questionCount || t.totalQuestions || 0;
        return qCount > 0;
    });

    const serializedAssessments = JSON.parse(JSON.stringify(serializeTimestamps(allAssessments)));

    return (
        <div className="min-h-screen bg-[#040a16] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <StudioClient assessments={serializedAssessments} />
            </div>
        </div>
    );
}
