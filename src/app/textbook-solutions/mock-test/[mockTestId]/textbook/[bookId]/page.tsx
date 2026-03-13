
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
    const { mockTestId, bookId } = params;
    try {
        const mockTest = await getContentById(mockTestId);
        const textbook = await getContentById(bookId);
        
        return { 
            mockTest: serializeFirestoreTimestamps(mockTest),
            textbook: serializeFirestoreTimestamps(textbook), 
        };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { mockTest: null, textbook: null };
    }
}

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { textbook, mockTest } = await getPageData(params);

  if (!mockTest || !textbook) {
    return {
      title: 'Mock Test Not Found',
    };
  }

  const mockTestTitle = formatTitleForBrowser((mockTest as any).title);
  const textbookTitle = formatTitleForBrowser((textbook as any).title);
  
  const title = `${mockTestTitle} | ${textbookTitle} | DeshExam`;
  const description = `Take the interactive mock test "${mockTestTitle}" for the ${textbookTitle} textbook. Check your knowledge and prepare for your exams.`;
  const keywords = [
    (mockTest as any).title,
    textbook.title,
    (textbook as any).subject,
    'mock test',
    'online test',
  ].filter(Boolean);

  const imageUrl = (textbook as any).featureImage || `https://picsum.photos/seed/${params.mockTestId}/1200/630`;

  return {
    title,
    description,
    keywords,
    openGraph: {
        title,
        description,
        url: `https://deshexam.com/textbook-solutions/mock-test/${params.mockTestId}/textbook/${params.bookId}`,
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


export default async function TextbookMockTestPage({ params }: PageProps) {
    const { mockTest, textbook } = await getPageData(params);
    
    if (!mockTest || !textbook) {
        notFound();
    }

    const initialTest = {
        ...(mockTest as any),
        testType: 'Mock Test'
    };

    const mockChapter: Chapter = { id: 'null', title: 'Full Textbook', topics: [] , access: 'free'};
    const mockTopic: null = null;
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": `${(mockTest as any).title} | ${(textbook as any).title}`,
      "description": `Take the interactive mock test "${(mockTest as any).title}" for the ${(textbook as any).title} textbook. Check your knowledge and prepare for your exams.`,
      "url": `https://deshexam.com/textbook-solutions/mock-test/${params.mockTestId}/textbook/${params.bookId}`
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
                    initialChapter={mockChapter}
                    initialTopic={mockTopic}
                />
            </Suspense>
        </>
    )
}
