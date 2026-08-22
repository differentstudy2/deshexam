import React from 'react';
import AssessmentLandingPage from '@/components/assessment/AssessmentLandingPage';
import { getAssessmentBySlug, getAssessments } from '@/lib/firebase/assessment';
import { getTaxonomyNodeById } from '@/lib/firebase/taxonomy';
import { notFound } from 'next/navigation';
import { MockTest } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser, cn } from '@/lib/utils';
import {
  Clock, HelpCircle, ShieldCheck, FileText, CheckCircle2,
  AlertTriangle, BookOpen, Target, Award, ChevronRight, ArrowRight,
  Zap, Users, BarChart3, Brain, Star, Maximize, LayoutGrid, ShieldAlert, MonitorPlay,
  Trophy, Sparkles, LineChart, BookCheck, History, Smartphone, PieChart, RotateCcw, Crown, Lock
} from 'lucide-react';
import Link from 'next/link';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { StartTestButton } from '@/components/assessment/StartTestButton';
import { MockTestReviews } from '@/components/assessment/MockTestReviews';
import { UserAttemptsDisplay } from '@/components/assessment/UserAttemptsDisplay';
import { TopScorersWidget } from '@/components/assessment/TopScorersWidget';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = { params: Promise<{ slug: string }> };

import { CACHE_SETTINGS } from '@/lib/cache-settings';
export const revalidate = 2592000;

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const test = await getAssessmentBySlug('practiceSets', slug) as MockTest | null;
  
  if (!test) return { title: 'Practice Set Not Found' };
  
  const imageUrl = (Array.isArray(test.thumbnail) ? test.thumbnail[0] : test.thumbnail) || "https://deshexam.com/og/quiz.jpg";
  const title = `${formatTitleForBrowser(test.title)} | Practice Set | DeshExam`;
  const description = test.description || `Take the ${test.title} practice set to test your preparation for ${test.boardId || 'competitive'} exams.`;
  
  // Generate keywords based on taxonomy if available
  const keywords = [
    'online quiz', 'mcq test', 'mock test', 
    test.boardId, test.classId, test.subjectId, test.chapterId
  ].filter(Boolean).join(', ') + ', deshexam practice sets, free govt job preparation';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://deshexam.com/practice/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://deshexam.com/practice/${slug}`,
      siteName: 'DeshExam',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PracticeLandingPage({ params }: Props) {
  const { slug } = await params;
  const test = await getAssessmentBySlug('practiceSets', slug) as MockTest | null;
  
  // LEGACY FALLBACK
  if (!test) {
    const { getContentById } = await import('@/lib/firebase/firestore');
    const legacyQuizData = await getContentById(slug);
    
    if (legacyQuizData && (legacyQuizData as any).testType === 'Quiz') {
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

      const serializedLegacyQuiz = serializeTimestamps(legacyQuizData);
      const OldQuizClientPage = (await import('@/components/legacy/OldQuizClientPage')).default;
      
      return (
        <div className="legacy-wrapper">
          <OldQuizClientPage quiz={serializedLegacyQuiz} />
        </div>
      );
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
