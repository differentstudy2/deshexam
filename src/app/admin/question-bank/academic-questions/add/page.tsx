'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionBankEditor } from '@/components/admin/QuestionBankEditor';
import { QuestionBankEntry } from '@/lib/question-bank-types';

export default function AddAcademicQuestionPage() {
  const router = useRouter();
  
  // Start with an empty question, but default to 'academic' content type.
  const [initialData] = useState<Partial<QuestionBankEntry>>({});

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen">
      <QuestionBankEditor
        initialData={initialData}
        defaultContentType="academic"
        title="Add Academic Question"
        breadcrumbs={['Admin', 'Question Bank', 'Academic Questions', 'Add Question']}
        onSaveComplete={() => {
          // You could redirect back to the list page if it exists
          router.push('/admin/question-bank/questions');
        }}
        onCancel={() => {
          router.back();
        }}
      />
    </div>
  );
}
