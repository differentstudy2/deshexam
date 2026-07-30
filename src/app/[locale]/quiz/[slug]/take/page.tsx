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

const getCachedQuestions = unstable_cache(
  async (ids: string[]) => getQuestionsByIds(ids),
  ['questions-by-ids'],
  { revalidate: 86400, tags: ['questions'] }
);

export default async function QuizTakePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Try finding by slug first
  let quiz = await getAssessmentBySlug('quizzes', slug) as Quiz | null;

  // If not found by slug, try ID
  if (!quiz) {
    quiz = await getAssessment('quizzes', slug) as Quiz | null;
  }

  if (!quiz) {
    notFound();
  }

  const questionIds = quiz.questionIds || [];
  const rawQuestions = await getCachedQuestions(questionIds);

  let taxonomyParts: string[] = [];
  if (quiz.boardId) { const node = await getTaxonomyNodeById(quiz.boardId); if (node) taxonomyParts.push(node.acronym || node.title); }
  if (quiz.classId) { const node = await getTaxonomyNodeById(quiz.classId); if (node) taxonomyParts.push(node.title); }
  if (quiz.subjectId) { const node = await getTaxonomyNodeById(quiz.subjectId); if (node) taxonomyParts.push(node.title); }
  if (quiz.chapterId) { const node = await getTaxonomyNodeById(quiz.chapterId); if (node) taxonomyParts.push(node.title); }
  
  const taxonomyLine = taxonomyParts.length > 0 ? taxonomyParts.join(' • ') : undefined;

  const examConfig: ExamConfig = {
    id: quiz.id,
    slug: quiz.slug,
    title: quiz.title,
    durationMin: quiz.timeLimitMin || 0,
    totalMarks: rawQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
    negativeMarking: 0,
    attemptsAllowed: quiz.attemptsAllowed,
    isStrictMode: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    accessType: quiz.accessType,
    allowedSubscriptionPlans: quiz.allowedSubscriptionPlans,
    taxonomyLine
  };

  const serializedQuestions = JSON.parse(JSON.stringify(rawQuestions));

  return <ExamClient mockTest={examConfig} initialQuestions={serializedQuestions} />;
}
