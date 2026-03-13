
import type { Metadata, ResolvingMetadata } from 'next';
import LearnClientPage from './learn-client';
import { getAllContent } from '@/lib/firebase/firestore';

export async function generateMetadata(
  {},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: 'Learn - In-Depth Articles & Tutorials',
    description: 'Expand your knowledge with our curated collection of in-depth articles and tutorials on a wide range of subjects. Perfect for building a strong foundation for your exam preparation.',
    keywords: ['learn', 'articles', 'tutorials', 'study guides', 'educational content', 'exam concepts'],
    openGraph: {
      title: 'Learn - In-Depth Articles & Tutorials | DeshExam',
      description: 'Expand your knowledge with expertly written articles and tutorials.',
      images: ['https://picsum.photos/seed/learn-og/1200/630', ...previousImages],
      type: 'website',
      url: 'https://deshexam.com/learn',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Learn - In-Depth Articles & Tutorials | DeshExam',
      description: 'Expand your knowledge with expertly written articles and tutorials.',
      images: ['https://picsum.photos/seed/learn-og/1200/630'],
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

export default async function LearnPage() {
  const articlesData = await getAllContent("Learn");
  const initialArticles = serializeTimestamps(articlesData);

  return <LearnClientPage initialArticles={initialArticles as any[]} />;
}
