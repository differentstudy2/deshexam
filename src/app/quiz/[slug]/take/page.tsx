import React from 'react';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import PracticeQuiz from '@/components/question-bank/PracticeQuiz';
import { notFound } from 'next/navigation';
import { Quiz } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const quiz = await getAssessmentBySlug('quizzes', slug) as Quiz | null;
  if (!quiz) {
    return { title: 'Quiz Not Found' };
  }
  return {
    title: `Taking: ${formatTitleForBrowser(quiz.title)} | DeshExam`,
    robots: { index: false, follow: false },
  };
}

export const dynamic = 'force-dynamic';

export default async function QuizTakePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Try finding by slug first
  let quiz = await getAssessmentBySlug('quizzes', slug) as Quiz | null;

  // If not found by slug, try ID
  if (!quiz) {
    const { getAssessment } = await import('@/lib/firebase/assessment');
    quiz = await getAssessment('quizzes', slug) as Quiz | null;
  }

  if (!quiz) {
    notFound();
  }

  const questions = await getQuestionsByIds(quiz.questionIds);

  if (questions.length === 0) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">{quiz.title}</h1>
        <p className="text-slate-500">This quiz doesn't have any questions yet.</p>
        <Link href={`/quiz/${quiz.slug}`} className="text-purple-600 mt-4 inline-block font-medium">
          &larr; Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b py-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href={`/quiz/${quiz.slug}`} className="text-slate-500 hover:text-slate-900 flex items-center font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Quiz
          </Link>
          <div className="flex flex-col items-center">
             <h2 className="font-bold text-slate-800 truncate px-4">{quiz.title}</h2>
             <div className="flex items-center text-red-500 text-sm font-semibold mt-1">
                {/* In a real client component, this would be a countdown timer */}
                <Clock className="w-3.5 h-3.5 mr-1" /> {quiz.timeLimitMin}:00 remaining
             </div>
          </div>
          <div className="w-24"></div> {/* spacer for centering */}
        </div>
      </div>
      <div className="container max-w-5xl mx-auto px-4">
        {/* For this phase, we reuse PracticeQuiz. A real timed quiz would be its own component */}
        <PracticeQuiz questions={JSON.parse(JSON.stringify(questions))} taxonomyId={quiz.id} />
      </div>
    </div>
  );
}
