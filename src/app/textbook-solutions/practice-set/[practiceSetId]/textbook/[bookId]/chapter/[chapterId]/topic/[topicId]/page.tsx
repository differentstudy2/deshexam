
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Textbook, Chapter, Topic, Question } from '@/lib/types';
import { getPracticeSetById, getQuestionsByPracticeSet, getContentById } from '@/lib/firebase/firestore';
import PracticeSetClientPage from './practice-set-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    practiceSetId: string;
    bookId: string;
    chapterId: string;
    topicId: string;
  };
};

async function getPageData(params: PageProps['params']) {
    const { practiceSetId, bookId, chapterId, topicId } = params;
    try {
        const practiceSet = await getPracticeSetById(bookId, chapterId, topicId === 'null' ? null : topicId, practiceSetId);
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
        
        return { practiceSet, textbook, chapter, topic };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { practiceSet: null, textbook: null, chapter: null, topic: null };
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { practiceSet, textbook, chapter, topic } = await getPageData(params);

  if (!practiceSet || !textbook || !chapter) {
    return {
      title: 'Practice Set Not Found',
    };
  }

  const title = `${practiceSet.title} | ${topic?.title || chapter.title} | DeshExam`;
  const description = `Take the interactive practice set "${practiceSet.title}" for the topic "${topic?.title || chapter.title}" from the ${textbook.title} textbook. Check your knowledge and prepare for your exams.`;
  const keywords = [
    practiceSet.title,
    topic?.title || '',
    chapter.title,
    textbook.title,
    (textbook as any).subject,
    'practice set',
    'online quiz',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
  };
}


export default async function PracticeSetPage({ params }: PageProps) {
    const { practiceSet, textbook, chapter, topic } = await getPageData(params);
    
    if (!practiceSet || !textbook || !chapter) {
        notFound();
    }
    
    const questions = await getQuestionsByPracticeSet(params.bookId, params.chapterId, params.topicId === 'null' ? null : params.topicId, params.practiceSetId);

    // Helper function to serialize Firestore Timestamps
    const serializeFirestoreTimestamps = (data: any) => {
        if (!data) return data;
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            const value = data[key];
            if (value && typeof value === 'object' && value.hasOwnProperty('seconds') && value.hasOwnProperty('nanoseconds')) {
                // It's a Firestore Timestamp
                newObj[key] = new Date(value.seconds * 1000).toISOString();
            } else if (Array.isArray(value)) {
                newObj[key] = value.map(item => serializeFirestoreTimestamps(item));
            } else if (typeof value === 'object') {
                newObj[key] = serializeFirestoreTimestamps(value);
            } else {
                newObj[key] = value;
            }
        }
        return newObj;
    };

    const initialTest = {
        ...practiceSet,
        questions: questions.map(q => serializeFirestoreTimestamps(q)),
        testType: 'Practice Set'
    };

    const serializedTest = serializeFirestoreTimestamps(initialTest);
    const serializedTextbook = serializeFirestoreTimestamps(textbook);
    const serializedChapter = serializeFirestoreTimestamps(chapter);
    const serializedTopic = topic ? serializeFirestoreTimestamps(topic) : null;

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <PracticeSetClientPage 
                initialTest={serializedTest as any} 
                initialTextbook={serializedTextbook as any} 
                initialChapter={serializedChapter as any}
                initialTopic={serializedTopic as any}
            />
        </Suspense>
    )
}

// Define the type for the initialTest prop
type Test = PracticeSet & { questions: Question[], testType: 'Practice Set' };

