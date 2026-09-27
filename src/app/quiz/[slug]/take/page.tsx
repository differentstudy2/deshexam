import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { ExamClient, ExamConfig } from '@/components/assessment/ExamClient';
import { getAssessmentBySlug, getAssessment } from '@/lib/firebase/assessment';
import { getTaxonomyNodeById } from '@/lib/firebase/taxonomy';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { Quiz } from '@/lib/assessment-types';
import { getHardcodedQuiz } from '@/lib/hardcoded-loader';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  let test = await getAssessmentBySlug('quizzes', slug) as Quiz | null;
  
  if (!test) {
    test = getHardcodedQuiz(slug) as Quiz | null;
  }

  if (!test) {
    return { title: 'Quiz Environment - DeshExam' };
  }
  return {
    title: `Taking: ${formatTitleForBrowser(test.title)} | DeshExam`,
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
