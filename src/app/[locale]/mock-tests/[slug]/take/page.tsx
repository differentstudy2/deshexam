import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { ExamClient } from '@/components/assessment/ExamClient';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { MockTest } from '@/lib/assessment-types';

import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const test = await getAssessmentBySlug('mockTests', slug) as MockTest | null;
  
  if (!test) {
    return { title: 'Exam Environment - DeshExam' };
  }

  const title = `${formatTitleForBrowser(test.title)} | Live Exam | DeshExam`;
  const description = test.seoDescription || `Take the ${test.title} mock test live on DeshExam Academy.`;
  const imageUrl = (Array.isArray(test.thumbnail) ? test.thumbnail[0] : test.thumbnail) || "https://deshexam.com/og/mock-tests.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: false, // The live exam interface is gated, so we tell search engines not to index this specific URL, but they can still read the rich sharing tags.
      follow: false
    }
  };
}

const getCachedQuestions = unstable_cache(
  async (ids: string[]) => getQuestionsByIds(ids),
  ['questions-by-ids'],
  { revalidate: 86400, tags: ['questions'] }
);

export default async function TakeMockTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  
  // We fetch the assessment freshly to ensure we have the latest accessType, price, etc.
  // We still cache the questions to reduce Firebase read limits drastically.
  const mockTest = await getAssessmentBySlug('mockTests', unwrappedParams.slug) as MockTest | null;
  
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
