import { notFound } from 'next/navigation';
import { ExamClient } from './exam-client';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { MockTest } from '@/lib/assessment-types';

export const metadata = {
  title: 'Exam Environment - DeshExam',
  description: 'Full-screen mock test environment for DeshExam',
};

export default async function TakeMockTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  
  const mockTest = await getAssessmentBySlug('mockTests', unwrappedParams.slug) as MockTest | null;
  
  if (!mockTest) {
    notFound();
  }

  const questionIds = mockTest.questionIds || [];
  const rawQuestions = await getQuestionsByIds(questionIds);

  // Serialize Firestore objects for Client Component (removing Timestamps and non-plain objects)
  const serializedMockTest = JSON.parse(JSON.stringify(mockTest));
  const serializedQuestions = JSON.parse(JSON.stringify(rawQuestions));

  return <ExamClient mockTest={serializedMockTest} questions={serializedQuestions} />;
}
