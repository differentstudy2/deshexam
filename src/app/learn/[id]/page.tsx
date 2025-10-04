
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next';
import ArticleClientPage from './article-client-page';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const article = await getContentById(id);

  if (!article || article.testType !== 'Learn') {
    return {
      title: 'Article Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: article.title,
    description: article.description,
    keywords: [article.subject, article.title, 'learn', 'tutorial', 'study guide'],
    openGraph: {
      title: article.title,
      description: article.description,
      images: [`https://picsum.photos/seed/${id}/800/450`, ...previousImages],
      type: 'article',
      publishedTime: article.createdAt,
      authors: [article.authorName],
    },
  };
}


export default async function LearnArticlePage({ params }: Props) {
    const article = await getContentById(params.id);

    if (!article || article.testType !== 'Learn') {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://deshexam.com/learn/${article.id}`,
        },
        'headline': article.title,
        'description': article.description,
        'image': `https://picsum.photos/seed/${article.id}/800/450`,  
        'author': {
            '@type': 'Person',
            'name': article.authorName,
        },  
        'publisher': {
            '@type': 'Organization',
            'name': 'DeshExam',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://deshexam.com/logo.png',
            },
        },
        'datePublished': article.createdAt,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ArticleClientPage article={article} />
        </>
    );
}
