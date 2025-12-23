
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { getContentById, getTextbookById } from '@/lib/firebase/firestore';
import QuizClientPage from './quiz-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    quizId: string;
    bookId: string;
  };
};

const serializeFirestoreTimestamps = (data: any): any => {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreTimestamps(item));
    }
    if (typeof data === 'object' && data !== null) {
        if (data.hasOwnProperty('seconds') && data.hasOwnProperty('nanoseconds') && typeof (data as any).toDate === 'function') {
            return (data as any).toDate().toISOString();
        }
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            newObj[key] = serializeFirestoreTimestamps(data[key]);
        }
        return newObj;
    }
    return data;
};

async function getPageData(params: PageProps['params']) {
    const { quizId, bookId } = params;
    try {
        const quiz = await getContentById(quizId);
        const textbook = await getTextbookById(bookId);
        
        return { 
            quiz: serializeFirestoreTimestamps(quiz),
            textbook: serializeFirestoreTimestamps(textbook), 
        };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { quiz: null, textbook: null };
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { textbook, quiz } = await getPageData(params);

  if (!quiz || !textbook) {
    return {
      title: 'Quiz Not Found',
    };
  }

  const title = `Manage: ${(quiz as any).title} | ${(textbook as any).title} | DeshExam`;
  const description = `Manage questions for the quiz "${(quiz as any).title}".`;

  return {
    title,
    description,
    robots: {
        index: false,
        follow: false,
    },
  };
}


export default async function QuizPage({ params }: PageProps) {
    const { quiz, textbook } = await getPageData(params);
    
    if (!quiz || !textbook) {
        notFound();
    }
    
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <QuizClientPage 
                initialTest={quiz as any}
                initialTextbook={textbook as any} 
            />
        </Suspense>
    )
}
