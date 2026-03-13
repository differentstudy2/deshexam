
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import QuizClientPage from './quiz-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type Props = {
  params: { id: string };
};

// Helper function to serialize Firestore Timestamps
const serializeTimestamps = (data: any): any => {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(item => serializeTimestamps(item));
    }
    if (typeof data === 'object' && data !== null) {
        if (data.hasOwnProperty('seconds') && data.hasOwnProperty('nanoseconds') && typeof (data as any).toDate === 'function') {
            return (data as any).toDate().toISOString();
        }
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            newObj[key] = serializeTimestamps(data[key]);
        }
        return newObj;
    }
    return data;
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = await getContentById(params.id) as any;
  if (!quiz) {
    return { title: 'Quiz Not Found' };
  }
  return {
    title: `${formatTitleForBrowser(quiz.title)} | Quiz`,
    description: `Take the quiz: ${formatTitleForBrowser(quiz.title)}.`,
  };
}

export default async function QuizPage({ params }: Props) {
  const quizData = await getContentById(params.id);
  if (!quizData || quizData.testType !== 'Quiz') {
    notFound();
  }
  
  const quiz = serializeTimestamps(quizData);

  return <QuizClientPage quiz={quiz as any} />;
}
