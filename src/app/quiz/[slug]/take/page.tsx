import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { ExamClient, ExamConfig } from '@/components/assessment/ExamClient';
import { getAssessmentBySlug, getAssessment } from '@/lib/firebase/assessment';
import { getTaxonomyNodeById } from '@/lib/firebase/taxonomy';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { Quiz } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';

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

import { CACHE_SETTINGS } from '@/lib/cache-settings';
export const revalidate = 3600;

import { GlobalTakePage } from '@/components/assessment/GlobalTakePage';

export default async function QuizTakePage({ params }: Props) {
  const resolvedParams = await params;
  return <GlobalTakePage collectionName="quizzes" slug={resolvedParams.slug} />;
}
