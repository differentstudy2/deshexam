
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Textbook, Chapter, Topic, Question } from '@/lib/types';
import { getPracticeSetById, getQuestionsByPracticeSet, getContentById } from '@/lib/firebase/firestore';
import PracticeSetClientPage from '@/app/textbook-solutions/practice-set/[practiceSetId]/textbook/[bookId]/chapter/[chapterId]/topic/[topicId]/practice-set-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

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

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const awaitedParams = await params;
  const { textbook, chapter, topic, mockTest } = await getPageData(awaitedParams);

  if (!mockTest || !textbook || !chapter) {
    return {
      title: 'Mock Test Not Found',
    };
  }

  const title = `${formatTitleForBrowser((mockTest as any).title)} | ${topic?.title || chapter.title} | DeshExam`;
  const description = `Take the interactive mock test "${formatTitleForBrowser((mockTest as any).title)}" for the topic "${topic?.title || chapter.title}" from the ${textbook.title} textbook. Check your knowledge and prepare for your exams.`;
  const keywords = [
    (mockTest as any).title,
    topic?.title || '',
    chapter.title,
    textbook.title,
    (textbook as any).subject,
    'mock test',
    'online quiz',
  ].filter(Boolean);

  const imageUrl = (textbook as any).featureImage || `https://picsum.photos/seed/${params.mockTestId}/1200/630`;

  return {
    title,
    description,
    keywords,
    openGraph: {
        title,
        description,
        url: `https://deshexam.com/textbook-solutions/mock-test/${params.mockTestId}/textbook/${params.bookId}/chapter/${params.chapterId}/topic/${params.topicId}`,
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


export default async function MockTestPage({ params }: PageProps) {
    const awaitedParams = await params;
    const { mockTest, textbook, chapter, topic } = await getPageData(awaitedParams);
    
    if (!mockTest || !textbook || !chapter) {
        notFound();
    }

    const initialTest = {
        ...(mockTest as any),
        testType: 'Mock Test'
    };
    
    const cleanTitle = formatTitleForBrowser(initialTest.title);

    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        "name": cleanTitle,
        "description": formatTitleForBrowser(initialTest.description),
        "learningResourceType": "Assessment",
        "educationalLevel": textbook.class || 'All Levels',
        "about": {
          "@type": "Thing",
          "name": textbook.subject
        },
        "author": {
          "@type": "Organization",
          "name": "DeshExam"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://deshexam.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Textbook Solutions",
            "item": "https://deshexam.com/textbook-solutions"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": textbook.title,
            "item": `https://deshexam.com/textbook-solutions/${textbook.id}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": chapter.title,
            "item": `https://deshexam.com/textbook-solutions/${textbook.id}/chapter/${chapter.id}`
          },
          ...(topic ? [{
            "@type": "ListItem",
            "position": 5,
            "name": topic.title,
            "item": `https://deshexam.com/textbook-solutions/${textbook.id}/chapter/${chapter.id}/topic/${topic.id}`
          }] : []),
          {
            "@type": "ListItem",
            "position": topic ? 6 : 5,
            "name": cleanTitle,
            "item": `https://deshexam.com/textbook-solutions/mock-test/${params.mockTestId}/textbook/${params.bookId}/chapter/${params.chapterId}/topic/${params.topicId}`
          }
        ]
      }
    ];

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
