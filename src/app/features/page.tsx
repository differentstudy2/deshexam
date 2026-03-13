import type { Metadata } from 'next';
import FeaturesClientPage from './features-client';

export const metadata: Metadata = {
  title: 'Features | DeshExam',
  description: 'Explore the powerful features of DeshExam, including realistic mock tests, AI-powered learning paths, solved textbooks, quizzes, leaderboards, and more, all designed to help you succeed.',
  keywords: ['deshexam features', 'mock tests', 'ai learning path', 'solved textbooks', 'online quizzes', 'leaderboards'],
  openGraph: {
      title: 'Powerful Features to Supercharge Your Exam Preparation | DeshExam',
      description: 'Explore realistic mock tests, AI-powered learning paths, solved textbooks, quizzes, and leaderboards.',
      images: ['https://picsum.photos/seed/features-og/1200/630'],
  },
  twitter: {
      card: 'summary_large_image',
      title: 'Powerful Features to Supercharge Your Exam Preparation | DeshExam',
      description: 'Explore realistic mock tests, AI-powered learning paths, solved textbooks, quizzes, and leaderboards.',
      images: ['https://picsum.photos/seed/features-og/1200/630'],
  }
};

export default function FeaturesPage() {
    return <FeaturesClientPage />;
}
