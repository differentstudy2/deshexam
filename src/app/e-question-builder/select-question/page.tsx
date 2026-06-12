import React from 'react';
import QuestionSelectionInterface from './QuestionSelectionInterface';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Select Questions | E-Question Builder",
  description: "Select questions to build your question paper.",
};

export default async function SelectQuestionPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  // Pass search params down to the client component so it knows what to fetch initially
  const initialFilters = {
    boardId: params.boardId || 'all',
    classId: params.classId || 'all',
    subjectId: params.subjectId || 'all',
    textbookId: params.textbookId || 'all',
    chapterId: params.chapterId || 'all',
    topicId: params.topicId || 'all',
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f172a]">
      <QuestionSelectionInterface initialFilters={initialFilters} />
    </main>
  );
}
