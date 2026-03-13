
import type { Metadata, ResolvingMetadata } from 'next';
import ExamsClientPage from './exams-client';
import { getAllContent } from '@/lib/firebase/firestore';

export async function generateMetadata(
  {},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: 'Official Exam Papers & Previous Year Papers | DeshExam',
    description: 'Practice with official exam papers and previous year question papers for NEET, JEE, UPSC, and more. Simulate real exam conditions and get detailed performance analysis to ace your preparation.',
    keywords: ['exam papers', 'previous year papers', 'solved papers', 'exam preparation', 'NEET question papers', 'JEE previous papers', 'UPSC prelims papers'],
    openGraph: {
      title: 'Official Exam Papers & Previous Year Papers | DeshExam',
      description: 'Practice with official exam papers and previous year question papers to ace your preparation.',
      images: ['https://picsum.photos/seed/exams-og/1200/630', ...previousImages],
      type: 'website',
      url: 'https://deshexam.com/exams',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Official Exam Papers & Previous Year Papers | DeshExam',
      description: 'Practice with official exam papers and previous year question papers to ace your preparation.',
      images: ['https://picsum.photos/seed/exams-og/1200/630'],
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

export default async function ExamsPage() {
    const fetchedExams = await getAllContent("Exam");
    const initialExams = serializeTimestamps(fetchedExams);
    
    return <ExamsClientPage initialExams={initialExams as any[]} />;
}
