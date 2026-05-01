
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next';
import TestClientPage from './test-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = params;
  const test = await getContentById(id);

  if (!test) {
    return {
      title: 'Test Not Found',
      description: 'The test you are looking for could not be found.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: formatTitleForBrowser(test.title),
    description: `Take the ${formatTitleForBrowser(test.title)} mock test on DeshExam. ${formatTitleForBrowser(test.description)}`,
    keywords: [test.title, test.subject, test.testType, 'mock test', 'online test', 'exam preparation'],
    openGraph: {
      images: [`https://picsum.photos/seed/${id}/400/225`, ...previousImages],
    },
  };
}

export default async function TestPage({ params }: Props) {
  const { id } = params;
  const testData = await getContentById(id);

  if (!testData) {
    notFound();
  }
  
  // Serialize Firestore Timestamps
  const test = {
      ...testData,
      createdAt: testData.createdAt?.toDate ? testData.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: testData.updatedAt?.toDate ? testData.updatedAt.toDate().toISOString() : null,
  };

  const primaryType = Array.isArray(test.testType) ? test.testType[0] : test.testType;
  const typeSlug = (primaryType || 'content').toLowerCase().replace(/\s+/g, '-');
  const cleanTitle = formatTitleForBrowser(test.title);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    'name': cleanTitle,
    'description': formatTitleForBrowser(test.description),
    'about': {
        '@type': 'Thing',
        'name': test.subject
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://deshexam.com/${typeSlug}/${test.id}`,
    },
    'headline': cleanTitle,
    'image': test.featureImage || `https://picsum.photos/seed/${test.id}/400/225`,
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
    'datePublished': test.createdAt,
    'hasPart': (test.questions || []).map((q: any) => {
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
        <TestClientPage test={test as any} />
    </>
  );
}
