import React from 'react';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import PracticeQuiz from '@/components/question-bank/PracticeQuiz';
import { notFound } from 'next/navigation';
import { MockTest } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Clock, FileText } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const test = await getAssessmentBySlug('mockTests', slug) as MockTest | null;
  if (!test) {
    return { title: 'Mock Test Not Found' };
  }
  return {
    title: `Exam: ${formatTitleForBrowser(test.title)} | DeshExam`,
    robots: { index: false, follow: false },
  };
}

export default async function MockTestTakePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const test = await getAssessmentBySlug('mockTests', slug) as MockTest | null;

  if (!test || test.status !== 'Published') {
    notFound();
  }

  const questions = await getQuestionsByIds(test.questionIds);

  if (questions.length === 0) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">{test.title}</h1>
        <p className="text-slate-500">This mock test doesn't have any questions yet.</p>
        <Link href={`/mock-tests/${test.slug}`} className="text-blue-600 mt-4 inline-block font-medium">
          &larr; Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b py-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href={`/mock-tests/${test.slug}`} className="text-slate-500 hover:text-slate-900 flex items-center font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Exam
          </Link>
          <div className="flex flex-col items-center">
             <h2 className="font-bold text-slate-800 truncate px-4 flex items-center"><FileText className="w-4 h-4 mr-2" /> {test.title}</h2>
             <div className="flex items-center text-red-500 text-sm font-semibold mt-1">
                {/* In a real client component, this would be a countdown timer strictly enforcing rules */}
                <Clock className="w-3.5 h-3.5 mr-1" /> {test.durationMin}:00 remaining
             </div>
          </div>
          <div className="w-24"></div> {/* spacer for centering */}
        </div>
      </div>
      <div className="container max-w-5xl mx-auto px-4">
        {/* For this phase, we reuse PracticeQuiz. A real mock test would be its own component with a Submit Final button, grid layout, etc. */}
        <PracticeQuiz questions={JSON.parse(JSON.stringify(questions))} taxonomyId={test.id} />
      </div>
    </div>
  );
}
