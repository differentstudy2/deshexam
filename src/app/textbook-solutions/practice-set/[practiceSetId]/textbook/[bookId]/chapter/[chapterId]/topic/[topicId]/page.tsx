
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Textbook, Chapter, Topic, Question } from '@/lib/types';
import { getPracticeSetById, getQuestionsByPracticeSet, getContentById } from '@/lib/firebase/firestore';
import PracticeSetClientPage from './practice-set-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type PageProps = {
  params: Promise<{
    practiceSetId: string;
    bookId: string;
    chapterId: string;
    topicId: string;
  }>;
};

// Helper function to serialize Firestore Timestamps
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
    const { practiceSetId, bookId, chapterId, topicId } = await params;
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
        
        return { 
            practiceSet: serializeFirestoreTimestamps(practiceSet), 
            textbook: serializeFirestoreTimestamps(textbook), 
            chapter: serializeFirestoreTimestamps(chapter), 
            topic: serializeFirestoreTimestamps(topic) 
        };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { practiceSet: null, textbook: null, chapter: null, topic: null };
    }
}

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
    const params = await props.params;
    const awaitedParams = await params;
    const { textbook, chapter, topic, practiceSet } = await getPageData(awaitedParams);

    if (!practiceSet || !textbook || !chapter) {
      return {
        title: 'Practice Set Not Found',
      };
    }

    const title = `${formatTitleForBrowser(practiceSet.title)} | ${topic?.title || chapter.title} | DeshExam`;
    const description = `Take the interactive practice set "${formatTitleForBrowser(practiceSet.title)}" for the topic "${topic?.title || chapter.title}" from the ${textbook.title} textbook. Check your knowledge and prepare for your exams.`;
    const keywords = [
      practiceSet.title,
      topic?.title || '',
      chapter.title,
      textbook.title,
      (textbook as any).subject,
      'practice set',
      'online quiz',
    ].filter(Boolean);

    const imageUrl = (textbook as any).featureImage || `https://picsum.photos/seed/${params.practiceSetId}/1200/630`;

    return {
      title,
      description,
      keywords,
      openGraph: {
          title,
          description,
          url: `https://deshexam.com/textbook-solutions/practice-set/${params.practiceSetId}/textbook/${params.bookId}/chapter/${params.chapterId}/topic/${params.topicId}`,
          images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
          type: 'website',
      },
      twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [imageUrl],
      },
    };
}


export default async function PracticeSetPage(props: PageProps) {
    const params = await props.params;
    const awaitedParams = await params;
    const { practiceSet, textbook, chapter, topic } = await getPageData(awaitedParams);

    if (!practiceSet || !textbook || !chapter) {
        notFound();
    }

    const questionsData = await getQuestionsByPracticeSet(awaitedParams.bookId, awaitedParams.chapterId, awaitedParams.topicId === 'null' ? null : awaitedParams.topicId, awaitedParams.practiceSetId);
    const questions = serializeFirestoreTimestamps(questionsData);


    const initialTest = {
        ...(practiceSet as any),
        questions,
        testType: 'Practice Set'
    };

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": `${(practiceSet as any).title} | ${topic?.title || chapter.title}`,
      "description": `Take the interactive practice set "${(practiceSet as any).title}" for the topic "${topic?.title || chapter.title}" from the ${textbook.title} textbook.`,
      "url": `https://deshexam.com/textbook-solutions/practice-set/${params.practiceSetId}/textbook/${params.bookId}/chapter/${params.chapterId}/topic/${params.topicId}`
    };


    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            }>
                <PracticeSetClientPage 
                    initialTest={initialTest as any} 
                    initialTextbook={textbook as any} 
                    initialChapter={chapter as any}
                    initialTopic={topic as any}
                />
            </Suspense>
        </>
    )
}
