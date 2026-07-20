'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { getQuestions } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';

interface NodeQuestionsPageProps {
  node: any;
  contentType: string;
  breadcrumbs: { name: string; url: string }[];
}

export function NodeQuestionsPage({ node, contentType, breadcrumbs }: NodeQuestionsPageProps) {
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const filters: Record<string, any> = {};
        
        // Add filter based on node type
        if (node.type === 'topic') filters.topicId = node.id;
        else if (node.type === 'chapter') filters.chapterId = node.id;
        else if (node.type === 'subject') filters.subjectId = node.id;
        else if (node.type === 'class') filters.classId = node.id;
        else if (node.type === 'board') filters.boardId = node.id;
        else if (node.type === 'textbook') filters.textbookId = node.id;

        if (contentType === 'mcq') {
          filters.type = 'mcq';
        } else if (contentType === 'cq') {
          filters.type = 'descriptive'; // or 'cq' depending on your question bank structure
        }

        // Fetch questions, limit to 50 for now
        const data = await getQuestions(filters, 50);
        setQuestions(data);
      } catch (e) {
        console.error("Error fetching node questions", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [node.id, node.type]);

  return (
    <div className="max-w-[800px] mx-auto pb-10">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-6 sm:p-10 mb-8 shadow-sm text-white border border-emerald-400/20">
        <div className="absolute -top-12 -right-12 text-emerald-900/10 pointer-events-none">
          <HelpCircle className="w-64 h-64" strokeWidth={1} />
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold mb-4 shadow-sm border border-white/20">
            <HelpCircle className="w-4 h-4" />
            {contentType === 'mcq' ? 'MCQ Practice' : contentType === 'cq' ? 'Creative Questions' : 'Question Bank'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-md">
            {node.title}
          </h2>
          <p className="text-emerald-50 max-w-2xl text-[15px] sm:text-lg leading-relaxed">
            Test your knowledge with these questions specifically curated for this topic. Prepare effectively by practicing them.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#00a651]" />
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Questions Found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            There are currently no questions available for this topic in the question bank. Please check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
            </span>
          </div>
          {questions.map((question, index) => (
            <QuestionCard 
              key={question.id} 
              question={question} 
              index={index}
              isListView={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
