import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { ExamClient, ExamConfig } from '@/components/assessment/ExamClient';
import { getAssessmentBySlug, getAssessment } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { PracticeSet } from '@/lib/assessment-types';
import { getHardcodedPracticeSet } from '@/lib/hardcoded-loader';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  let test = await getAssessmentBySlug('practiceSets', slug) as PracticeSet | null;

  if (!test) {
    test = getHardcodedPracticeSet(slug) as PracticeSet | null;
  }
  
  if (!test) {
    return { title: 'Practice Environment - DeshExam' };
  }
  return {
    title: `Taking: ${formatTitleForBrowser(test.title)} | DeshExam`,
    robots: { index: false, follow: false },
  };
}

import { CACHE_SETTINGS } from '@/lib/cache-settings';
export const revalidate = 3600;

import { GlobalTakePage } from '@/components/assessment/GlobalTakePage';

export default async function PracticeTakePage({ params }: Props) {
  const resolvedParams = await params;
  return <GlobalTakePage collectionName="practiceSets" slug={resolvedParams.slug} />;
}
