import React from 'react';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import PracticeQuiz from '@/components/question-bank/PracticeQuiz';
import { notFound } from 'next/navigation';
import { Quiz } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2 } from 'lucide-react';

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
    title: `${formatTitleForBrowser(quiz.title)} | Quiz`,
    description: quiz.description || `Take the quiz: ${quiz.title}.`,
  };
}

export default async function AssessmentQuizPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const quiz = await getAssessmentBySlug('quizzes', slug) as Quiz | null;

  if (!quiz || quiz.status !== 'Published') {
    notFound();
  }

  // Fetch all questions mapped to this quiz
  const questions = await getQuestionsByIds(quiz.questionIds);

  if (questions.length === 0) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">{quiz.title}</h1>
        <p className="text-slate-500">This quiz doesn't have any questions yet.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{quiz.title}</h1>
            {quiz.description && <p className="text-slate-500 max-w-2xl mx-auto">{quiz.description}</p>}
            
            <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 mr-2" />
                    {quiz.timeLimitMin} Minutes
                </div>
                <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Pass: {quiz.passingScorePercent}%
                </div>
            </div>
        </div>
        
        {/* For this iteration we reuse PracticeQuiz. 
            In the future, we would use a specialized timed Quiz component here */}
        <PracticeQuiz questions={JSON.parse(JSON.stringify(questions))} taxonomyId={quiz.id} />
    </div>
  );
}
