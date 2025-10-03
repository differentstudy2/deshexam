

import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next';
import TestClientPage from './test-client-page';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const test = await getContentById(id);

  if (!test) {
    return {
      title: 'Test Not Found',
      description: 'The test you are looking for could not be found.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: test.title,
    description: `Take the ${test.title} mock test on DeshExam. ${test.description}`,
    keywords: [test.title, test.subject, test.testType, 'mock test', 'online test', 'exam preparation'],
    openGraph: {
      images: [`https://picsum.photos/seed/${id}/400/225`, ...previousImages],
    },
  };
}

export default async function TestPage({ params }: Props) {
  const test = await getContentById(params.id);

  if (!test) {
    notFound();
  }
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://deshexam.com/mock-test/${test.id}`,
    },
    headline: test.title,
    description: test.description,
    image: `https://picsum.photos/seed/${test.id}/400/225`,
    author: {
      '@type': 'Organization',
      name: 'DeshExam',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DeshExam',
      logo: {
        '@type': 'ImageObject',
        url: 'https://deshexam.com/logo.png',
      },
    },
    datePublished: test.createdAt,
  };

  return (
    <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <TestClientPage test={test} />
    </>
  );
}

