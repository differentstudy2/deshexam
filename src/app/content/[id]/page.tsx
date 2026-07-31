
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next';
import TestClientPage from './test-client-page';
import BlogClientPage from './blog-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  const test: any = await getContentById(id);

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

export default async function TestPage(props: Props) {
  const params = await props.params;
  const { id } = params;
  const testData: any = await getContentById(id);

  if (!testData) {
    notFound();
  }

  // Serialize Firestore Timestamps
  const test: any = {
      ...testData,
      createdAt: testData.createdAt?.toDate ? testData.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: testData.updatedAt?.toDate ? testData.updatedAt.toDate().toISOString() : null,
      publishedAt: testData.publishedAt?.toDate ? testData.publishedAt.toDate().toISOString() : (testData.publishedAt || null),
  };

  const primaryType = Array.isArray(test.testType) ? test.testType[0] : test.testType;
  const typeSlug = (primaryType || 'content').toLowerCase().replace(/\s+/g, '-');
  const cleanTitle = formatTitleForBrowser(test.title);

  const isArticle = ['blog', 'news', 'job'].includes(typeSlug);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      'name': cleanTitle,
      'description': formatTitleForBrowser(test.description),
      'learningResourceType': 'Assessment',
      'educationalLevel': test.class || 'All Levels',
      'about': {
          '@type': 'Thing',
          'name': test.subject
      },
      'author': {
        '@type': 'Organization',
        'name': 'DeshExam',
      },
      'image': test.featureImage || `https://picsum.photos/seed/${test.id}/400/225`,
      'datePublished': test.createdAt,
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
          'name': primaryType || 'Content',
          'item': `https://deshexam.com/${typeSlug}s`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': cleanTitle,
          'item': `https://deshexam.com/content/${test.id}`
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
        {isArticle ? (
          <BlogClientPage test={test as any} />
        ) : (
          <TestClientPage test={test as any} />
        )}
    </>
  );
}
