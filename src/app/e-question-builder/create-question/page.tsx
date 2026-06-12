import React from 'react';
import QuestionPaperBuilder from './QuestionPaperBuilder';

export const metadata = {
  title: 'Create Question Paper | E-Question Builder',
};

interface Props {
  searchParams: {
    subject_id?: string;
    chapter_id?: string;
    paper_name?: string;
  };
}

export default function CreateQuestionPage({ searchParams }: Props) {
  return (
    <div className="bg-[#f0f2f5] min-h-screen">
      <QuestionPaperBuilder 
        subjectId={searchParams.subject_id} 
        chapterId={searchParams.chapter_id} 
        paperName={searchParams.paper_name} 
      />
    </div>
  );
}
