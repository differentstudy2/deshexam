
import type { Metadata, ResolvingMetadata } from 'next';
import { getContentById } from '@/lib/firebase/firestore';
import TextbookClientPage from './textbook-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
    params: Promise<{ bookId: string }>;
};

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const { bookId } = params;
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

  const newTitle = `${textbook.title} | Solution, Mock Test, Practice Set, Exam Free`;

  return {
    title: newTitle,
    description: textbook.description || `Solutions and practice sets for the ${textbook.title} textbook.`,
    keywords,
    openGraph: {
      title: newTitle,
      description: textbook.description,
      images: [featureImage, ...previousImages],
      type: 'article',
    },
  };
}


export default async function TextbookSolutionsPage(props: PageProps) {
  const params = await props.params;
  const { bookId } = params;
  const textbookData = await getContentById(bookId);

  if (!textbookData) {
      notFound();
  }

  // Serialize the textbook object to make it a "plain object"
  const textbook = {
    ...textbookData,
    // Convert Firestore Timestamps to simple strings.
    createdAt: textbookData.createdAt?.toDate ? textbookData.createdAt.toDate().toLocaleDateString() : null,
    updatedAt: textbookData.updatedAt?.toDate ? textbookData.updatedAt.toDate().toLocaleDateString() : null,
  };

  return <TextbookClientPage textbook={textbook as any} />;
}
