import React from 'react';
import QuestionPaperBuilder from './QuestionPaperBuilder';

export const metadata = {
  title: 'Create Question Paper | E-Question Builder',
};

interface Props {
  searchParams: Promise<{
    board_id?: string;
    class_id?: string;
    textbook_id?: string;
    subject_id?: string;
    chapter_id?: string;
    paper_name?: string;
  }>;
}

export default async function CreateQuestionPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <div className="bg-[#f0f2f5] min-h-screen">
      <QuestionPaperBuilder 
        boardId={params.board_id}
        classId={params.class_id}
        textbookId={params.textbook_id}
        subjectId={params.subject_id} 
        chapterId={params.chapter_id} 
        paperName={params.paper_name} 
      />
    </div>
  );
}
