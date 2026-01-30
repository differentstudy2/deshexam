
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Exam as Quiz } from '@/lib/types';
import { getContentById } from '@/lib/firebase/firestore';
import PracticeSetClientPage from '@/app/textbook-solutions/practice-set/[practiceSetId]/textbook/[bookId]/chapter/[chapterId]/topic/[topicId]/practice-set-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

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
        const textbook = await getContentById(bookId);
        
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

  const title = `${formatTitleForBrowser((quiz as any).title)} | ${(textbook as any).title} | DeshExam`;
  const description = `Take the quiz "${formatTitleForBrowser((quiz as any).title)}" for the ${textbook.title} textbook. Check your knowledge and prepare for your exams.`;
  const keywords = [
    (quiz as any).title,
    textbook.title,
    (textbook as any).subject,
    'quiz',
    'online test',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
  };
}


export default async function TextbookQuizPage({ params }: PageProps) {
    const { quiz, textbook } = await getPageData(params);
    
    if (!quiz || !textbook) {
        notFound();
    }
    
    const initialTest = {
        ...(quiz as any),
        testType: 'Quiz'
    };

    // Since this is a textbook-level exam, chapter and topic are null.
    const mockChapter: Chapter = { id: 'null', title: 'Full Textbook', topics: [] , access: 'free'};
    const mockTopic: null = null;


    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <PracticeSetClientPage 
                initialTest={initialTest as any} 
                initialTextbook={textbook as any} 
                initialChapter={mockChapter}
                initialTopic={mockTopic}
            />
        </Suspense>
    )
}
