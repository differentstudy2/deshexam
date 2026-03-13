
import type { Metadata } from 'next';
import MockTestsClientPage from './mock-tests-client';
import { getAllContent, getAllTextbooks } from '@/lib/firebase/firestore';
import type { Textbook } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Mock Tests | DeshExam',
  description: 'Practice with our extensive library of mock tests for NEET, JEE, UPSC and more. Simulate real exam conditions and get detailed performance analysis.',
  keywords: ['mock tests', 'online tests', 'exam preparation', 'NEET practice test', 'JEE mock test', 'UPSC prelims test'],
};

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
