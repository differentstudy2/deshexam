
import type { Metadata, ResolvingMetadata } from 'next';
import MockTestsClientPage from './mock-tests-client';
import { getAllContent, getAllTextbooks } from '@/lib/firebase/firestore';
import type { Textbook } from '@/lib/types';

export async function generateMetadata(
  {},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: 'Exams with Realistic Mock Tests',
    description: 'Find and practice from a vast collection of mock tests for various competitive exams like NEET, JEE, UPSC, and more. Improve your speed, accuracy, and time management skills with our realistic exam simulations.',
    keywords: ['mock tests', 'online test series', 'exam practice papers', 'NEET mock test', 'JEE Main mock test', 'UPSC prelims mock', 'competitive exam preparation'],
    openGraph: {
      title: 'Exams with Realistic Mock Tests',
      description: 'Find and practice from a vast collection of mock tests for various competitive exams.',
      images: ['https://picsum.photos/seed/mock-tests-og/1200/630', ...previousImages],
      type: 'website',
      url: 'https://deshexam.com/mock-tests',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Exams with Realistic Mock Tests',
      description: 'Find and practice from a vast collection of mock tests for various competitive exams.',
      images: ['https://picsum.photos/seed/mock-tests-og/1200/630'],
    },
  };
}

// Helper to make Timestamps serializable
const serializeTimestamps = (data: any): any => {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(item => serializeTimestamps(item));
    }
    if (typeof data === 'object' && data !== null) {
        if (data.hasOwnProperty('seconds') && data.hasOwnProperty('nanoseconds') && typeof (data as any).toDate === 'function') {
            return (data as any).toDate().toISOString();
        }
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            newObj[key] = serializeTimestamps(data[key]);
        }
        return newObj;
    }
    return data;
};


export default async function MockTestsPage() {
  const [fetchedTests, allTextbooks] = await Promise.all([
    getAllContent("Mock Test"),
    getAllTextbooks(),
  ]);

  const textbooksMap = new Map((allTextbooks as Textbook[]).map(book => [book.id, book]));

  const testsWithTextbookMeta = (fetchedTests as any[]).map(test => {
      if (test.textbookId && textbooksMap.has(test.textbookId)) {
          const textbook = textbooksMap.get(test.textbookId);
          return {
              ...test,
              textbookTitle: textbook?.title,
              subject: test.subject || textbook?.subject,
              board: test.board || textbook?.board,
              classCategory: test.classCategory || textbook?.classCategory,
              class: test.class || textbook?.class,
              featureImage: test.featureImage || textbook?.featureImage,
          };
      }
      return test;
  });

  const initialTests = serializeTimestamps(testsWithTextbookMeta);
  
  return <MockTestsClientPage initialTests={initialTests as any[]} />;
}
