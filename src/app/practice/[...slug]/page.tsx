import React from 'react';
import { getQuestionsByTaxonomySlug } from '@/lib/firebase/question-bank';
import PracticeQuiz from '@/components/question-bank/PracticeQuiz';
import { notFound } from 'next/navigation';

export default async function PracticePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug;
  const lastSlug = decodeURIComponent(slugArray[slugArray.length - 1]);

  // Fetch questions for this taxonomy slug
  const questions = await getQuestionsByTaxonomySlug(lastSlug, 20); // Limit to 20 for a quiz

  if (questions.length === 0) {
    notFound();
  }

  const title = lastSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Practice: {title}</h1>
            <p className="text-slate-500">Test your knowledge with this interactive practice set.</p>
        </div>
        
        <PracticeQuiz questions={JSON.parse(JSON.stringify(questions))} taxonomyId={lastSlug} />
    </div>
  );
}
