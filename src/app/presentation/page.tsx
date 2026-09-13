import React from 'react';
import { Metadata } from 'next';
import PresentationClient from '@/app/presentation/PresentationClient';
import { getAllHardcodedMockTests, getAllHardcodedQuizzes, getAllHardcodedPracticeSets } from '@/lib/hardcoded-loader';
import { Monitor } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Presentation Mode | DeshExam',
    description: 'Immersive presentation mode for mock tests and assessments.',
};

export default function PresentationPage() {
    const mockTests = getAllHardcodedMockTests();
    const quizzes = getAllHardcodedQuizzes();
    const practiceSets = getAllHardcodedPracticeSets();

    const allAssessments = [...mockTests, ...quizzes, ...practiceSets].filter(
        t => t && t.questions && t.questions.length > 0
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-10 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Page Header */}
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900 mb-4">
                        <Monitor className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Presentation Mode
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        Launch any test in a full-screen, immersive, distraction-free classroom presentation.
                    </p>
                </div>

                {/* Cards */}
                <PresentationClient assessments={allAssessments} />
            </div>
        </div>
    );
}
