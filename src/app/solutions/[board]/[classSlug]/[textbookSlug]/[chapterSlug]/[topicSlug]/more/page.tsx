import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicMoreSolutionsClient from './TopicMoreSolutionsClient';

interface Props {
  params: Promise<{ board: string; classSlug: string; textbookSlug: string; chapterSlug: string; topicSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board, classSlug, textbookSlug, chapterSlug, topicSlug } = await params;
  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedTopic = topicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${formattedTopic} — আরো Solutions | ${formattedBoard} ${formattedClass} | DeshExam`,
    description: `Additional solutions, notes and practice questions for ${formattedTopic} on DeshExam.`,
  };
}

export default async function TopicMoreSolutionsPage({ params }: Props) {
  const { board, classSlug, textbookSlug, chapterSlug, topicSlug } = await params;

  if (!board || !classSlug || !textbookSlug || !chapterSlug || !topicSlug) {
    notFound();
  }

  return (
    <TopicMoreSolutionsClient
      board={board}
      classSlug={classSlug}
      textbookSlug={textbookSlug}
      chapterSlug={chapterSlug}
      topicSlug={topicSlug}
    />
  );
}
