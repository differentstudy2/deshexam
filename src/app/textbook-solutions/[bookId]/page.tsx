
import type { Metadata, ResolvingMetadata } from 'next';
import { getContentById } from '@/lib/firebase/firestore';
import TextbookClientPage from './textbook-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
    params: { bookId: string };
};

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const bookId = params.bookId;
  const textbook = (await getContentById(bookId)) as any;

  if (!textbook) {
    return {
      title: 'Textbook Not Found',
    };
  }
  
  const keywords = [
    textbook.title,
    textbook.subject,
    textbook.class,
    textbook.board,
    'textbook solutions',
    'NCERT solutions',
  ].filter(Boolean);

  const previousImages = (await parent).openGraph?.images || [];
  const featureImage = textbook.featureImage || `https://picsum.photos/seed/${bookId}/1200/630`;

  return {
    title: textbook.title,
    description: textbook.description || `Solutions and practice sets for the ${textbook.title} textbook.`,
    keywords,
    openGraph: {
      title: textbook.title,
      description: textbook.description,
      images: [featureImage, ...previousImages],
      type: 'article',
    },
  };
}


export default async function TextbookSolutionsPage({ params }: PageProps) {
    const textbook = await getContentById(params.bookId);

    if (!textbook) {
        notFound();
    }

    return <TextbookClientPage textbook={textbook as any} />;
}
