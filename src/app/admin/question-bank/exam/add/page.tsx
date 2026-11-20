'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionBankEditor } from '@/components/admin/QuestionBankEditor';
import { QuestionBankEntry } from '@/lib/question-bank-types';

export default function AddExamQuestionPage() {
  const router = useRouter();
  
  // Default to 'exam' content type so that the Exam Taxonomy is shown
  // and the Academic Taxonomy is hidden.
  const [initialData] = useState<Partial<QuestionBankEntry>>({});

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <QuestionBankEditor
        initialData={initialData}
        defaultContentType="exam"
        title="Add Exam Question"
        breadcrumbs={['Admin', 'Question Bank', 'Exam Questions', 'Add Question']}
        onSaveComplete={() => {
          // Redirect back to question list (you could point this to an exam-specific list later)
          router.push('/admin/question-bank/questions');
        }}
        onCancel={() => {
          router.back();
        }}
      />
    </div>
  );
}
