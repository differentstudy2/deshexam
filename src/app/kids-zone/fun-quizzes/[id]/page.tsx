
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = await getContentById(params.id) as any;
  if (!quiz) {
    return { title: 'Quiz Not Found' };
  }
  return {
    title: `${formatTitleForBrowser(quiz.title)} | Kids Zone`,
    description: `A fun quiz about ${formatTitleForBrowser(quiz.title)}.`,
  };
}

export default async function FunQuizPage({ params }: Props) {
  const quizData = await getContentById(params.id);
  if (!quizData || quizData.testType !== 'Quiz' || quizData.category !== 'Fun Quizzes') {
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
      'educationalLevel': 'Primary',
      'about': {
          '@type': 'Thing',
          'name': 'Kids Learning'
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
          'name': 'Kids Zone',
          'item': 'https://deshexam.com/kids-zone'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Fun Quizzes',
          'item': 'https://deshexam.com/kids-zone/fun-quizzes'
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': cleanTitle,
          'item': `https://deshexam.com/kids-zone/fun-quizzes/${quiz.id}`
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
