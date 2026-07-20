'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { getQuestions } from '@/lib/firebase/question-bank';
import { QuestionCard } from '@/components/question-bank/QuestionCard';

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex flex-wrap items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 mx-2" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-slate-800 dark:text-slate-200">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.url} className="hover:text-emerald-600 transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Questions</span>
            </div>
          </div>
          {breadcrumbs.length > 0 && (
            <Link href={breadcrumbs[breadcrumbs.length - 1].url}>
              <Button
                variant="outline"
                className="h-8 px-5 bg-[#dcefe2] text-[#1b6b3e] border-transparent hover:bg-[#c2e2cc] hover:text-[#11512d] dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 rounded-md font-bold text-sm shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Topic
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Questions: {node.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Test your knowledge with these questions specifically curated for {node.title}.
          </p>
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
            {questions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question} 
                mode="practice"
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
