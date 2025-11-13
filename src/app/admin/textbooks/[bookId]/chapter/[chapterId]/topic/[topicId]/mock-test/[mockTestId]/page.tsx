

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Textbook, Chapter, Topic, Question } from '@/lib/types';
import { getPracticeSetById, getQuestionsByPracticeSet, getContentById } from '@/lib/firebase/firestore';
import MockTestClientPage from './mock-test-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    mockTestId: string;
    bookId: string;
    chapterId: string;
    topicId: string;
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
    const { mockTestId, bookId, chapterId, topicId } = params;
    try {
        const mockTest = await getContentById(mockTestId);
        const textbook = await getContentById(bookId);
        const chapterRef = doc(db, `textbooks/${bookId}/chapters`, chapterId);
        const chapterSnap = await getDoc(chapterRef);
        const chapter = chapterSnap.exists() ? { id: chapterSnap.id, ...chapterSnap.data() as Chapter } : null;

        let topic: Topic | null = null;
        if(topicId !== 'null') {
            const topicRef = doc(db, `textbooks/${bookId}/chapters/${chapterId}/topics`, topicId);
            const topicSnap = await getDoc(topicRef);
            if(topicSnap.exists()) {
                topic = { id: topicSnap.id, ...topicSnap.data() as Topic };
            }
        }
        
        return { 
            mockTest: serializeFirestoreTimestamps(mockTest),
            textbook: serializeFirestoreTimestamps(textbook), 
            chapter: serializeFirestoreTimestamps(chapter), 
            topic: serializeFirestoreTimestamps(topic) 
        };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { mockTest: null, textbook: null, chapter: null, topic: null };
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { textbook, chapter, topic, mockTest } = await getPageData(params);

  if (!mockTest || !textbook || !chapter) {
    return {
      title: 'Mock Test Not Found',
    };
  }

  const title = `Manage: ${(mockTest as any).title} | ${topic?.title || chapter.title} | DeshExam`;
  const description = `Manage questions for the mock test "${(mockTest as any).title}".`;

  return {
    title,
    description,
    robots: {
        index: false,
        follow: false,
    },
  };
}


export default async function MockTestPage({ params }: PageProps) {
    const { mockTest, textbook, chapter, topic } = await getPageData(params);
    
    if (!mockTest || !textbook || !chapter) {
        notFound();
    }
    
    // Since questions are part of the mockTest object, we can just use it.
    const initialTest = {
        ...(mockTest as any),
        testType: 'Mock Test'
    };

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <MockTestClientPage 
                initialTest={initialTest as any}
                initialTextbook={textbook as any} 
                initialChapter={chapter as any}
                initialTopic={topic as any}
            />
        </Suspense>
    )
}
