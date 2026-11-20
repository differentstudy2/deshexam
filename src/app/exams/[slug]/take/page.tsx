import React from 'react';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import PracticeQuiz from '@/components/question-bank/PracticeQuiz';
import { notFound } from 'next/navigation';
import { ExamPaper } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const test = await getAssessmentBySlug('examPapers', slug) as ExamPaper | null;
  if (!test) {
    return { title: 'Exam Paper Not Found' };
  }
  return {
    title: `Taking: ${formatTitleForBrowser(test.title)} | DeshExam`,
    robots: { index: false, follow: false },
  };
}

import { GlobalTakePage } from '@/components/assessment/GlobalTakePage';

export default async function ExamTakePage({ params }: Props) {
  const resolvedParams = await params;
  return <GlobalTakePage collectionName="examPapers" slug={resolvedParams.slug} />;
}
