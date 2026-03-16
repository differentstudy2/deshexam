
import type { Metadata, ResolvingMetadata } from 'next';
import QuizzesClientPage from './quizzes-client';
import { getAllContent } from '@/lib/firebase/firestore';

export async function generateMetadata(
  {},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: 'Fun & Engaging Online Quizzes',
    description: 'Test your knowledge and challenge yourself with a wide variety of quizzes on DeshExam. Perfect for quick practice, learning new topics, and having fun while studying.',
    keywords: ['online quizzes', 'fun quizzes', 'knowledge test', 'subject quizzes', 'exam practice quiz'],
    openGraph: {
      title: 'Fun & Engaging Online Quizzes | DeshExam',
      description: 'Test your knowledge with fun and challenging quizzes on a wide range of subjects.',
      images: ['https://picsum.photos/seed/quizzes-og/1200/630', ...previousImages],
      type: 'website',
      url: 'https://deshexam.com/quizzes',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Fun & Engaging Online Quizzes | DeshExam',
      description: 'Test your knowledge with fun and challenging quizzes on a wide range of subjects.',
      images: ['https://picsum.photos/seed/quizzes-og/1200/630'],
    },
  };
}

// Helper to make Timestamps serializable
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

export default async function QuizzesPage() {
    const fetchedQuizzes = await getAllContent("Quiz");
    const initialQuizzes = serializeTimestamps(fetchedQuizzes);

    return <QuizzesClientPage initialQuizzes={initialQuizzes as any[]} />;
}
