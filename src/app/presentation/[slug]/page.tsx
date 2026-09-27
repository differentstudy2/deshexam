import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getHardcodedMockTest, getHardcodedQuiz, getHardcodedPracticeSet } from '@/lib/hardcoded-loader';
import { getAssessment, getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import PresentationAutoOpen from './PresentationAutoOpen';

const FIREBASE_COLLECTIONS = [
    'mockTests',
    'quizzes',
    'practiceSets',
] as const;

async function findAssessmentFromFirebase(slugOrId: string): Promise<any | null> {
    // Try each collection — first by slug, then by id
    for (const col of FIREBASE_COLLECTIONS) {
        try {
            // Try by slug
            const bySlug = await getAssessmentBySlug(col, slugOrId);
            if (bySlug) return bySlug;

            // Try by id
            const byId = await getAssessment(col, slugOrId);
            if (byId) return byId;
        } catch (_) {
            // Continue to next collection
        }
    }
    return null;
}

async function resolveQuestions(test: any): Promise<any[]> {
    // If the test has embedded questions array, use them directly
    if (test.questions && Array.isArray(test.questions) && test.questions.length > 0) {
        return test.questions;
    }

    // If test has questionIds, fetch them from Firebase question bank
    if (test.questionIds && Array.isArray(test.questionIds) && test.questionIds.length > 0) {
        try {
            const questions = await getQuestionsByIds(test.questionIds);
            return questions;
        } catch (_) {
            return [];
        }
    }

    return [];
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const test =
        getHardcodedMockTest(params.slug) ||
        getHardcodedQuiz(params.slug) ||
        getHardcodedPracticeSet(params.slug) ||
        await findAssessmentFromFirebase(params.slug);

    if (!test) return { title: 'Test Not Found | DeshExam' };

    return {
        title: `${test.title} - Presentation | DeshExam`,
        description: test.description || `Presentation mode for ${test.title}`,
    };
}

export default async function SinglePresentationPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const slugOrId = params.slug;

    // 1. Try hardcoded sources first (fast, no network)
    let test =
        getHardcodedMockTest(slugOrId) ||
        getHardcodedQuiz(slugOrId) ||
        getHardcodedPracticeSet(slugOrId);

    // 2. Fallback to Firebase
    if (!test) {
        test = await findAssessmentFromFirebase(slugOrId);
    }

    if (!test) notFound();

    // 3. Resolve questions (embedded or from question bank)
    const questions = await resolveQuestions(test);

    if (!questions || questions.length === 0) {
        notFound();
    }

    const assessmentWithQuestions = JSON.parse(JSON.stringify({ ...test, questions }));

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <PresentationAutoOpen assessment={assessmentWithQuestions} />
        </div>
    );
}
