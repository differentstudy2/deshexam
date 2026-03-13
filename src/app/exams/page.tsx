
import type { Metadata } from 'next';
import ExamsClientPage from './exams-client';
import { getAllContent } from '@/lib/firebase/firestore';

export const metadata: Metadata = {
  title: 'Exams | DeshExam',
  description: 'Practice with our extensive library of exams for NEET, JEE, UPSC and more. Simulate real exam conditions and get detailed performance analysis.',
  keywords: ['exams', 'previous year papers', 'exam preparation', 'NEET exams', 'JEE papers', 'UPSC solved papers'],
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

export default async function ExamsPage() {
    const fetchedExams = await getAllContent("Exam");
    const initialExams = serializeTimestamps(fetchedExams);
    
    return <ExamsClientPage initialExams={initialExams as any[]} />;
}
