
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Textbook, Chapter, Topic, Question } from '@/lib/types';
import { getPracticeSetById, getQuestionsByPracticeSet, getContentById } from '@/lib/firebase/firestore';
import PracticeSetClientPage from '@/app/textbook-solutions/practice-set/[practiceSetId]/textbook/[bookId]/chapter/[chapterId]/topic/[topicId]/practice-set-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    practiceSetId: string;
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
    const { practiceSetId, bookId } = params;
    try {
        // This is a textbook-level practice set, so chapter and topic are null.
        const practiceSet = await getPracticeSetById(bookId, 'null', 'null', practiceSetId);
        const textbook = await getContentById(bookId);
        
        return { 
            practiceSet: serializeFirestoreTimestamps(practiceSet),
            textbook: serializeFirestoreTimestamps(textbook), 
        };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { practiceSet: null, textbook: null };
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { textbook, practiceSet } = await getPageData(params);

  if (!practiceSet || !textbook) {
    return {
      title: 'Practice Set Not Found',
    };
  }

  const title = `${(practiceSet as any).title} | ${(textbook as any).title} | DeshExam`;
  const description = `Take the practice set "${(practiceSet as any).title}" for the ${textbook.title} textbook. Check your knowledge and prepare for your exams.`;
  const keywords = [
    (practiceSet as any).title,
    textbook.title,
    (textbook as any).subject,
    'practice set',
    'online test',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
  };
}


export default async function TextbookPracticeSetPage({ params }: PageProps) {
    const { practiceSet, textbook } = await getPageData(params);
    
    if (!practiceSet || !textbook) {
        notFound();
    }
    
    const questionsData = await getQuestionsByPracticeSet(params.bookId, 'null', 'null', params.practiceSetId);
    const questions = serializeFirestoreTimestamps(questionsData);


    const initialTest = {
        ...(practiceSet as any),
        questions,
        testType: 'Practice Set'
    };

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
