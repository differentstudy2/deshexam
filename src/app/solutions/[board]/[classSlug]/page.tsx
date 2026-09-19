import { Metadata } from 'next';
import ClassSolutionsClient from './ClassSolutionsClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ board: string; classSlug: string }>;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const boardParam = resolvedParams.board;
  const classSlug = resolvedParams.classSlug;
  
  if (!boardParam || !classSlug) {
    return { title: 'Textbook Solutions | DeshExam' };
  }

  const formattedBoard = boardParam.toUpperCase();
  const formattedClass = classSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${formattedBoard} ${formattedClass} Solutions | DeshExam`,
    description: `Find comprehensive, step-by-step textbook solutions for ${formattedBoard} ${formattedClass}. Access chapter-wise answers, explanations, and practice materials on DeshExam.`,
    keywords: `${formattedBoard} ${formattedClass} solutions, ${formattedBoard} textbook answers, board exam solutions, chapter wise solutions, deshexam solutions`,
    openGraph: {
      title: `${formattedBoard} ${formattedClass} Solutions | DeshExam`,
      description: `Step-by-step textbook solutions for ${formattedBoard} ${formattedClass} students. Download and read online.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/solutions/${boardParam}/${classSlug}`,
      siteName: 'DeshExam',
      images: [
        {
          url: '/og/solutions-default.png',
          width: 1200,
          height: 630,
          alt: `${formattedBoard} ${formattedClass} Solutions`,
        }
      ],
      type: 'website',
    }
  };
}

export default async function ClassSolutionsPage({ params }: Props) {
  const resolvedParams = await params;
  const board = resolvedParams.board;
  const classSlug = resolvedParams.classSlug;

  if (!board || !classSlug) {
    notFound();
  }

  return <ClassSolutionsClient board={board} classSlug={classSlug} />;
}
