import React from 'react';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import PracticeQuiz from '@/components/question-bank/PracticeQuiz';
import { notFound } from 'next/navigation';
import { PracticeSet } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const set = await getAssessmentBySlug('practiceSets', slug) as PracticeSet | null;
  if (!set) {
    return { title: 'Practice Set Not Found' };
  }
  return {
    title: `Taking: ${formatTitleForBrowser(set.title)} | DeshExam`,
    robots: { index: false, follow: false }, // Don't index the 'take' page, just the landing page
  };
}

export default async function PracticeSetTakePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const set = await getAssessmentBySlug('practiceSets', slug) as PracticeSet | null;

  if (!set || set.status !== 'Published') {
    notFound();
  }

  // Fetch all questions mapped to this practice set
  const questions = await getQuestionsByIds(set.questionIds);

  if (questions.length === 0) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">{set.title}</h1>
        <p className="text-slate-500">This practice set doesn't have any questions yet.</p>
        <Link href={`/practice/${set.slug}`} className="text-[#00a651] mt-4 inline-block font-medium">
          &larr; Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b py-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href={`/practice/${set.slug}`} className="text-slate-500 hover:text-slate-900 flex items-center font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Practice
          </Link>
          <h2 className="font-bold text-slate-800 truncate px-4">{set.title}</h2>
          <div className="w-24"></div> {/* spacer for centering */}
        </div>
      </div>
      <div className="container max-w-5xl mx-auto px-4">
        {/* Reuse the PracticeQuiz component which is perfect for this */}
        <PracticeQuiz questions={JSON.parse(JSON.stringify(questions))} taxonomyId={set.id} />
      </div>
    </div>
  );
}
