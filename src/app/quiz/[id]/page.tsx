
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next';
import QuizClientPage from './quiz-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    'name': cleanTitle,
    'description': formatTitleForBrowser(quiz.description),
    'about': {
        '@type': 'Thing',
        'name': quiz.subject || 'Education'
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://deshexam.com/quiz/${quiz.id}`,
    },
    'headline': cleanTitle,
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
        const cleanQuestionText = formatTitleForBrowser(q.text);
        const questionObj: any = {
            '@type': 'Question',
            'name': cleanQuestionText.substring(0, 100),
            'text': cleanQuestionText,
        };

        if (q.type === 'Multiple Choice' || q.type === 'True/False') {
            questionObj.eduQuestionType = q.type === 'Multiple Choice' ? 'Multiple choice' : 'True/false';
            questionObj.suggestedAnswer = (q.options || []).map((opt: any) => ({
                '@type': 'Answer',
                'text': formatTitleForBrowser(opt.text)
            }));
            questionObj.acceptedAnswer = {
                '@type': 'Answer',
                'text': formatTitleForBrowser(q.correctAnswer)
            };
        } else if (q.type === 'Short Answer' || q.type === 'Fill in the Blank') {
            questionObj.eduQuestionType = 'Short answer';
            questionObj.acceptedAnswer = {
                '@type': 'Answer',
                'text': formatTitleForBrowser(q.correctAnswer)
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
