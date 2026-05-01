
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next';
import QuizClientPage from './quiz-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type Props = {
  params: { id: string };
};

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

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { id } = params;
  const quiz = await getContentById(id) as any;
  if (!quiz) {
    return { title: 'Quiz Not Found' };
  }
  return {
    title: `${formatTitleForBrowser(quiz.title)} | Quiz`,
    description: `Take the quiz: ${formatTitleForBrowser(quiz.title)}.`,
  };
}

export default async function QuizPage({ params }: Props) {
  const { id } = params;
  const quizData = await getContentById(id);
  if (!quizData || quizData.testType !== 'Quiz') {
    notFound();
  }
  
  const quiz = serializeTimestamps(quizData);
  const cleanTitle = formatTitleForBrowser(quiz.title);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      'name': cleanTitle,
      'description': formatTitleForBrowser(quiz.description),
      'learningResourceType': 'Quiz',
      'about': {
          '@type': 'Thing',
          'name': quiz.subject || 'Education'
      },
      'image': quiz.featureImage || `https://picsum.photos/seed/${quiz.id}/400/225`,
      'author': {
        '@type': 'Organization',
        'name': 'DeshExam',
      },
      'datePublished': quiz.createdAt,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://deshexam.com/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Quizzes',
          'item': 'https://deshexam.com/quizzes'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': cleanTitle,
          'item': `https://deshexam.com/quiz/${quiz.id}`
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
        <QuizClientPage quiz={quiz as any} />
    </>
  );
}
