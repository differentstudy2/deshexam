import React from 'react';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import PracticeQuiz from '@/components/question-bank/PracticeQuiz';
import { notFound } from 'next/navigation';
import { PracticeSet } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';

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
    title: `${formatTitleForBrowser(set.title)} | Practice Set`,
    description: set.description || `Take the practice set: ${set.title}.`,
  };
}

export default async function PracticeSetPage({ params }: Props) {
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
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{set.title}</h1>
            {set.description && <p className="text-slate-500">{set.description}</p>}
        </div>
        
        {/* Reuse the PracticeQuiz component which is perfect for this */}
        <PracticeQuiz questions={JSON.parse(JSON.stringify(questions))} taxonomyId={set.id} />
    </div>
  );
}
