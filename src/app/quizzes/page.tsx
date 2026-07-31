
import type { Metadata, ResolvingMetadata } from 'next';
import QuizzesClientPage from './quizzes-client';

export async function generateMetadata(
  {},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: 'Fun & Engaging Online Quizzes',
    description: 'Test your knowledge and challenge yourself with a wide variety of quizzes on DeshExam. Perfect for quick practice, learning new topics, and having fun while studying.',
    keywords: ['online quizzes', 'fun quizzes', 'knowledge test', 'subject quizzes', 'exam practice quiz'],
    openGraph: {
      title: 'Fun & Engaging Online Quizzes | DeshExam',
      description: 'Test your knowledge with fun and challenging quizzes on a wide range of subjects.',
      images: ['https://picsum.photos/seed/quizzes-og/1200/630', ...previousImages],
      type: 'website',
      url: 'https://deshexam.com/quizzes',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Fun & Engaging Online Quizzes | DeshExam',
      description: 'Test your knowledge with fun and challenging quizzes on a wide range of subjects.',
      images: ['https://picsum.photos/seed/quizzes-og/1200/630'],
    },
  };
}

export default function QuizzesPage() {
  return <QuizzesClientPage />;
}
