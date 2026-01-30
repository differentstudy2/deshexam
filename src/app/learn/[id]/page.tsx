
import { getContentById } from '@/lib/firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next';
import ArticleClientPage from './article-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const article = await getContentById(id) as any;

  if (!article || article.testType !== 'Learn') {
    return {
      title: 'Article Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  
  // Ensure createdAt is a string for metadata
  const publishedTime = article.createdAt && typeof article.createdAt.toDate === 'function' 
    ? article.createdAt.toDate().toISOString() 
    : new Date().toISOString();


  return {
    title: formatTitleForBrowser(article.title),
    description: formatTitleForBrowser(article.description),
    keywords: [article.subject, article.title, 'learn', 'tutorial', 'study guide'],
    openGraph: {
      title: formatTitleForBrowser(article.title),
      description: formatTitleForBrowser(article.description),
      images: [article.featureImage || `https://picsum.photos/seed/${id}/800/450`, ...previousImages],
      type: 'article',
      publishedTime: publishedTime,
      authors: [article.authorName],
    },
  };
}


export default async function LearnArticlePage({ params }: Props) {
    const articleData = await getContentById(params.id);

    if (!articleData || articleData.testType !== 'Learn') {
        notFound();
    }
    
    // Serialize the article object to make it a "plain object"
    const article = {
      ...articleData,
      // Convert Firestore Timestamps to simple strings.
      createdAt: articleData.createdAt?.toDate ? articleData.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
      updatedAt: articleData.updatedAt?.toDate ? articleData.updatedAt.toDate().toLocaleDateString() : null,
    };


    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://deshexam.com/learn/${article.id}`,
        },
        'headline': article.title,
        'description': article.description,
        'image': article.featureImage || `https://picsum.photos/seed/${article.id}/800/450`,  
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
            <ArticleClientPage article={article as any} />
        </>
    );
}
