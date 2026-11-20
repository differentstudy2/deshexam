import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ChapterSolutionsClient from './ChapterSolutionsClient';

interface Props {
  params: Promise<{ board: string; classSlug: string; textbookSlug: string; chapterSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board, classSlug, textbookSlug, chapterSlug } = await params;
  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedChapter = chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedTextbook = textbookSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${formattedChapter} Solutions - ${formattedTextbook} ${formattedBoard} ${formattedClass} | DeshExam`,
    description: `Step-by-step solutions for ${formattedChapter} from ${formattedTextbook} (${formattedBoard} ${formattedClass}). Topic-wise answers and explanations on DeshExam.`,
  };
}

export default async function ChapterSolutionsPage({ params }: Props) {
  const { board, classSlug, textbookSlug, chapterSlug } = await params;

  if (!board || !classSlug || !textbookSlug || !chapterSlug) {
    notFound();
  }

  return (
    <ChapterSolutionsClient
      board={board}
      classSlug={classSlug}
      textbookSlug={textbookSlug}
      chapterSlug={chapterSlug}
    />
  );
}
