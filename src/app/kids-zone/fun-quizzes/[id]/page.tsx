
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import QuizClientPage from './quiz-client-page';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

// Helper function to serialize Firestore Timestamps
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
    title: `${quiz.title} | Kids Zone`,
    description: `A fun quiz about ${quiz.title}.`,
  };
}

export default async function FunQuizPage({ params }: Props) {
  const quizData = await getContentById(params.id);
  if (!quizData || quizData.testType !== 'Quiz' || quizData.category !== 'Fun Quizzes') {
    notFound();
  }
  
  const quiz = serializeTimestamps(quizData);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    'name': quiz.title,
    'description': quiz.description,
    'about': {
        '@type': 'Thing',
        'name': 'Kids Learning'
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://deshexam.com/kids-zone/fun-quizzes/${quiz.id}`,
    },
    'headline': quiz.title,
    'image': quiz.featureImage || `https://picsum.photos/seed/${quiz.id}/400/225`,
    'author': {
      '@type': 'Organization',
      'name': 'DeshExam',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'DeshExam',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://deshexam.com/logo.png',
      },
    },
    'datePublished': quiz.createdAt,
    'hasPart': (quiz.questions || []).map((q: any) => {
        const questionObj: any = {
            '@type': 'Question',
            'text': q.text,
        };

        if (q.type === 'Multiple Choice' || q.type === 'True/False') {
            questionObj.eduQuestionType = q.type === 'Multiple Choice' ? 'Multiple choice' : 'True/false';
            questionObj.suggestedAnswer = (q.options || []).map((opt: any) => ({
                '@type': 'Answer',
                'text': opt.text
            }));
            questionObj.acceptedAnswer = {
                '@type': 'Answer',
                'text': q.correctAnswer
            };
        } else if (q.type === 'Short Answer' || q.type === 'Fill in the Blank' || q.type === 'Direct Question') {
            questionObj.eduQuestionType = 'Short answer';
            questionObj.acceptedAnswer = {
                '@type': 'Answer',
                'text': q.correctAnswer
            };
        }

        return questionObj;
    })
  };

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
