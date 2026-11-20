import React from 'react';
import AssessmentLandingPage from '@/components/assessment/AssessmentLandingPage';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { notFound } from 'next/navigation';
import { MockTest } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import { getHardcodedMockTest } from '@/lib/hardcoded-loader';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 2592000;
export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const test = (await getAssessmentBySlug('mockTests', slug) as MockTest | null)
    ?? getHardcodedMockTest(slug);
  if (!test) return { title: 'Mock Test Not Found' };
  const imageUrl = (Array.isArray(test.thumbnail) ? test.thumbnail[0] : test.thumbnail) || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/og/mock-tests.jpg`;
  const title = `${formatTitleForBrowser(test.title)} | Mock Test | DeshExam`;
  const description = test.description || `Take the mock test: ${test.title}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  };
}

export default async function MockTestLandingPage({ params }: Props) {
  const { slug } = await params;
  const test = (await getAssessmentBySlug('mockTests', slug) as MockTest | null)
    ?? getHardcodedMockTest(slug);
  
  if (!test) notFound();

  return (
    // Dark premium page backdrop (matches the homepage sections). The
    // landing content itself is rendered by the shared
    // AssessmentLandingPage component, which is intentionally untouched
    // here — it is shared with the quiz / practice landing pages.
    <div className="section-dark">
      <AssessmentLandingPage
        test={test}
        collectionName="mockTests"
        basePath="/mock-tests"
        titlePrefix="Mock Test"
      />
    </div>
  );
}
