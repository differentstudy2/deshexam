
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import QuizClientPage from './quiz-client-page';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = await getContentById(params.id) as any;
  if (!quiz) {
    return { title: 'Quiz Not Found' };
  }
  return {
    title: `${quiz.title} | Kids Zone`,
    description: `A fun quiz about ${quiz.title}.`,
  };
}

export default async function FunQuizPage({ params }: Props) {
  const quiz = await getContentById(params.id);
  if (!quiz || quiz.testType !== 'Quiz' || quiz.category !== 'Fun Quizzes') {
    notFound();
  }
  return <QuizClientPage quiz={quiz as any} />;
}
