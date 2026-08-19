import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { ExamClient } from '@/components/assessment/ExamClient';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { MockTest } from '@/lib/assessment-types';

import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';

import { CACHE_SETTINGS } from '@/lib/cache-settings';
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

import { GlobalTakePage } from '@/components/assessment/GlobalTakePage';

export default async function TakeMockTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  return <GlobalTakePage collectionName="mockTests" slug={unwrappedParams.slug} />;
}
