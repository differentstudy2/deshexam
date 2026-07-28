import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { ExamClient, ExamConfig } from '@/components/assessment/ExamClient';
import { getAssessmentBySlug, getAssessment } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
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
    title: `Taking: ${formatTitleForBrowser(set.title)} | DeshExam`,
    robots: { index: false, follow: false },
  };
}

export const revalidate = 3600;

const getCachedQuestions = unstable_cache(
  async (ids: string[]) => getQuestionsByIds(ids),
  ['questions-by-ids'],
  { revalidate: 86400, tags: ['questions'] }
);

export default async function PracticeTakePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let set = await getAssessmentBySlug('practiceSets', slug) as PracticeSet | null;

  if (!set) {
    set = await getAssessment('practiceSets', slug) as PracticeSet | null;
  }

  if (!set || set.status !== 'Published') {
    notFound();
  }

  const questionIds = set.questionIds || [];
  const rawQuestions = await getCachedQuestions(questionIds);

  const examConfig: ExamConfig = {
    id: set.id,
    slug: set.slug,
    title: set.title,
    durationMin: set.estimatedTimeMin || 60,
    totalMarks: rawQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
    negativeMarking: 0,
    attemptsAllowed: 0,
    isStrictMode: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    accessType: set.accessType,
    allowedSubscriptionPlans: set.allowedSubscriptionPlans
  };

  const serializedQuestions = JSON.parse(JSON.stringify(rawQuestions));

  return <ExamClient mockTest={examConfig} initialQuestions={serializedQuestions} />;
}
