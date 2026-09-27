import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ChapterMoreSolutionsClient from './ChapterMoreSolutionsClient';

interface Props {
  params: Promise<{ board: string; classSlug: string; textbookSlug: string; chapterSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board, classSlug, textbookSlug, chapterSlug } = await params;
  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedChapter = chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${formattedChapter} — আরো Solutions | ${formattedBoard} ${formattedClass} | DeshExam`,
    description: `Additional solutions, notes and practice questions for ${formattedChapter} (${formattedBoard} ${formattedClass}) on DeshExam.`,
  };
}

export default async function ChapterMoreSolutionsPage({ params }: Props) {
  const { board, classSlug, textbookSlug, chapterSlug } = await params;

  if (!board || !classSlug || !textbookSlug || !chapterSlug) {
    notFound();
  }

  return (
    <ChapterMoreSolutionsClient
      board={board}
      classSlug={classSlug}
      textbookSlug={textbookSlug}
      chapterSlug={chapterSlug}
    />
  );
}
