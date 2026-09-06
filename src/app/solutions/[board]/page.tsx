import { Metadata } from 'next';
import BoardSolutionsClient from './BoardSolutionsClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ board: string }>;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const boardParam = resolvedParams.board;
  
  if (!boardParam) {
    return { title: 'Textbook Solutions | DeshExam' };
  }

  const formattedBoard = boardParam.toUpperCase();

  return {
    title: `${formattedBoard} Textbook Solutions | DeshExam`,
    description: `Find comprehensive, step-by-step textbook solutions for ${formattedBoard} board exams. Access chapter-wise answers, explanations, and practice materials on DeshExam.`,
    keywords: `${formattedBoard} solutions, ${formattedBoard} textbook answers, board exam solutions, chapter wise solutions, deshexam solutions`,
    openGraph: {
      title: `${formattedBoard} Textbook Solutions | DeshExam`,
      description: `Step-by-step textbook solutions for ${formattedBoard} board students. Download and read online.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/solutions/${boardParam}`,
      siteName: 'DeshExam',
      images: [
        {
          url: '/og/solutions-default.png',
          width: 1200,
          height: 630,
          alt: `${formattedBoard} Solutions`,
        }
      ],
      type: 'website',
    }
  };
}

export default async function BoardSolutionsPage({ params }: Props) {
  const resolvedParams = await params;
  const board = resolvedParams.board;

  if (!board) {
    notFound();
  }

  return <BoardSolutionsClient board={board} />;
}
