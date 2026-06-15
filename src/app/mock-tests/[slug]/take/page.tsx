import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { ExamClient } from './exam-client';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { MockTest } from '@/lib/assessment-types';

export const metadata = {
  title: 'Exam Environment - DeshExam',
  description: 'Full-screen mock test environment for DeshExam',
};

const getCachedAssessment = unstable_cache(
  async (slug: string) => getAssessmentBySlug('mockTests', slug),
  ['assessment-by-slug'],
  { revalidate: 86400, tags: ['mockTests'] }
);

const getCachedQuestions = unstable_cache(
  async (ids: string[]) => getQuestionsByIds(ids),
  ['questions-by-ids'],
  { revalidate: 86400, tags: ['questions'] }
);

export default async function TakeMockTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  
  // We use the cached version to reduce Firebase read limits drastically.
  const mockTest = await getCachedAssessment(unwrappedParams.slug) as MockTest | null;
  
  if (!mockTest) {
    notFound();
  }

  const questionIds = mockTest.questionIds || [];
  const rawQuestions = await getCachedQuestions(questionIds);

  // Serialize Firestore objects for Client Component (removing Timestamps and non-plain objects)
  const serializedMockTest = JSON.parse(JSON.stringify(mockTest));
  const serializedQuestions = JSON.parse(JSON.stringify(rawQuestions));

  return <ExamClient mockTest={serializedMockTest} initialQuestions={serializedQuestions} />;
}
