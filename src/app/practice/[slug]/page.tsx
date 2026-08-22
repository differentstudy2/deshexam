import React from 'react';
import AssessmentLandingPage from '@/components/assessment/AssessmentLandingPage';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { notFound } from 'next/navigation';
import { MockTest } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import { getHardcodedPracticeSet } from '@/lib/hardcoded-loader';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 2592000;

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const test = (await getAssessmentBySlug('practiceSets', slug) as MockTest | null)
    ?? getHardcodedPracticeSet(slug);

  if (!test) return { title: 'Practice Set Not Found' };

  const imageUrl = (Array.isArray(test.thumbnail) ? test.thumbnail[0] : test.thumbnail) || 'https://deshexam.com/og/quiz.jpg';
  const title = `${formatTitleForBrowser(test.title)} | Practice Set | DeshExam`;
  const description = test.description || `Take the ${test.title} practice set on DeshExam.`;
  const keywords = ['online quiz', 'mcq test', 'practice set', test.boardId, test.classId, test.subjectId]
    .filter(Boolean).join(', ') + ', deshexam practice sets';

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `https://deshexam.com/practice/${slug}` },
    openGraph: {
      title, description,
      url: `https://deshexam.com/practice/${slug}`,
      siteName: 'DeshExam',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: 'website',
      locale: 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default async function PracticeLandingPage({ params }: Props) {
  const { slug } = await params;

  // 1. Firebase
  let test = await getAssessmentBySlug('practiceSets', slug) as MockTest | null;

  // 2. Hardcoded fallback
  if (!test) {
    test = getHardcodedPracticeSet(slug);
  }

  // 3. Legacy fallback
  if (!test) {
    const { getContentById } = await import('@/lib/firebase/firestore');
    const legacyData = await getContentById(slug);
    if (legacyData && (legacyData as any).testType === 'Quiz') {
      const serializeTimestamps = (data: any): any => {
        if (!data) return data;
        if (Array.isArray(data)) return data.map(item => serializeTimestamps(item));
        if (typeof data === 'object' && data !== null) {
          if (data.hasOwnProperty('seconds') && typeof (data as any).toDate === 'function') {
            return (data as any).toDate().toISOString();
          }
          const newObj: { [key: string]: any } = {};
          for (const key in data) newObj[key] = serializeTimestamps(data[key]);
          return newObj;
        }
        return data;
      };
      const serializedLegacy = serializeTimestamps(legacyData);
      const OldQuizClientPage = (await import('@/components/legacy/OldQuizClientPage')).default;
      return <div className="legacy-wrapper"><OldQuizClientPage quiz={serializedLegacy} /></div>;
    }
  }

  if (!test) notFound();

  return (
    <AssessmentLandingPage
      test={test}
      collectionName="practiceSets"
      basePath="/practice"
      titlePrefix="Practice Set"
    />
  );
}
