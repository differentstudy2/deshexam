import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TextbookSolutionsClient from './TextbookSolutionsClient';

interface Props {
  params: Promise<{ board: string; classSlug: string; textbookSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board, classSlug, textbookSlug } = await params;

  const formattedBoard = board.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedTextbook = textbookSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${formattedTextbook} Solutions - ${formattedBoard} ${formattedClass} | DeshExam`,
    description: `Chapter-wise solutions for ${formattedTextbook} (${formattedBoard} ${formattedClass}). Step-by-step answers and explanations on DeshExam.`,
  };
}

export default async function TextbookSolutionsPage({ params }: Props) {
  const { board, classSlug, textbookSlug } = await params;

  if (!board || !classSlug || !textbookSlug) {
    notFound();
  }

  return (
    <TextbookSolutionsClient
      board={board}
      classSlug={classSlug}
      textbookSlug={textbookSlug}
    />
  );
}
