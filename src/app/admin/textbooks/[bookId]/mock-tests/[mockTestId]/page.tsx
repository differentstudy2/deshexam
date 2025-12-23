
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Exam } from '@/lib/types';
import { getContentById } from '@/lib/firebase/firestore';
import MockTestClientPage from './mock-test-client-page';
import { notFound } from 'next/navigation';

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { textbook, mockTest } = await getPageData(params);

  if (!mockTest || !textbook) {
    return {
      title: 'Mock Test Not Found',
    };
  }

  const title = `Manage: ${(mockTest as any).title} | ${(textbook as any).title} | DeshExam`;
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
    const { mockTest, textbook } = await getPageData(params);
    
    if (!mockTest || !textbook) {
        notFound();
    }
    
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <MockTestClientPage 
                initialTest={mockTest as any}
                initialTextbook={textbook as any} 
            />
        </Suspense>
    )
}
