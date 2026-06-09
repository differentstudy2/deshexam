import React from 'react';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import PracticeQuiz from '@/components/question-bank/PracticeQuiz';
import { notFound } from 'next/navigation';
import { ExamPaper } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const test = await getAssessmentBySlug('examPapers', slug) as ExamPaper | null;
  if (!test) {
    return { title: 'Exam Paper Not Found' };
  }
  return {
    title: `Taking: ${formatTitleForBrowser(test.title)} | DeshExam`,
    robots: { index: false, follow: false },
  };
}

export default async function ExamTakePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const test = await getAssessmentBySlug('examPapers', slug) as ExamPaper | null;

  if (!test || test.status !== 'Published') {
    notFound();
  }

  const questions = await getQuestionsByIds(test.questionIds);

  if (questions.length === 0) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">{test.title}</h1>
        <p className="text-slate-500">This online exam doesn't have any questions yet.</p>
        <Link href={`/exams/${test.slug}`} className="text-orange-600 mt-4 inline-block font-medium">
          &larr; Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b py-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href={`/exams/${test.slug}`} className="text-slate-500 hover:text-slate-900 flex items-center font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Exam
          </Link>
          <div className="flex flex-col items-center">
             <h2 className="font-bold text-slate-800 truncate px-4 flex items-center"><BookOpen className="w-4 h-4 mr-2" /> {test.title}</h2>
          </div>
          <div className="w-24"></div> {/* spacer for centering */}
        </div>
      </div>
      <div className="container max-w-5xl mx-auto px-4">
        {/* For this phase, we reuse PracticeQuiz. */}
        <PracticeQuiz questions={JSON.parse(JSON.stringify(questions))} taxonomyId={test.id} />
      </div>
    </div>
  );
}
