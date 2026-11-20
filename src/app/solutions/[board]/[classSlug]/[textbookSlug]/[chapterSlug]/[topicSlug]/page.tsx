import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicSolutionsClient from './TopicSolutionsClient';

interface Props {
  params: Promise<{ board: string; classSlug: string; textbookSlug: string; chapterSlug: string; topicSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board, classSlug, textbookSlug, chapterSlug, topicSlug } = await params;
  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedTopic = topicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedChapter = chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${formattedTopic} - ${formattedChapter} | ${formattedBoard} ${formattedClass} Solutions | DeshExam`,
    description: `Step-by-step solutions, MCQ answers and explanations for ${formattedTopic} (${formattedChapter}) - ${formattedBoard} ${formattedClass} on DeshExam.`,
  };
}

export default async function TopicSolutionsPage({ params }: Props) {
  const { board, classSlug, textbookSlug, chapterSlug, topicSlug } = await params;

  if (!board || !classSlug || !textbookSlug || !chapterSlug || !topicSlug) {
    notFound();
  }

  return (
    <TopicSolutionsClient
      board={board}
      classSlug={classSlug}
      textbookSlug={textbookSlug}
      chapterSlug={chapterSlug}
      topicSlug={topicSlug}
    />
  );
}
