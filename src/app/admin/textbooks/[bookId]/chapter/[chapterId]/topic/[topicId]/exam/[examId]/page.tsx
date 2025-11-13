

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Textbook, Chapter, Topic, Question, Exam } from '@/lib/types';
import { getPracticeSetById, getQuestionsByPracticeSet, getContentById } from '@/lib/firebase/firestore';
import ExamClientPage from './exam-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    examId: string;
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
    const { examId, bookId, chapterId, topicId } = params;
    try {
        const exam = await getContentById(examId);
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
            exam: serializeFirestoreTimestamps(exam),
            textbook: serializeFirestoreTimestamps(textbook), 
            chapter: serializeFirestoreTimestamps(chapter), 
            topic: serializeFirestoreTimestamps(topic) 
        };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { exam: null, textbook: null, chapter: null, topic: null };
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { textbook, chapter, topic, exam } = await getPageData(params);

  if (!exam || !textbook || !chapter) {
    return {
      title: 'Exam Not Found',
    };
  }

  const title = `Manage: ${(exam as any).title} | ${topic?.title || chapter.title} | DeshExam`;
  const description = `Manage questions for the exam "${(exam as any).title}".`;

  return {
    title,
    description,
    robots: {
        index: false,
        follow: false,
    },
  };
}


export default async function ChapterExamPage({ params }: PageProps) {
    const { exam, textbook, chapter, topic } = await getPageData(params);
    
    if (!exam || !textbook || !chapter) {
        notFound();
    }
    
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <ExamClientPage 
                initialTest={exam as any}
                initialTextbook={textbook as any} 
                initialChapter={chapter as any}
                initialTopic={topic as any}
            />
        </Suspense>
    )
}
