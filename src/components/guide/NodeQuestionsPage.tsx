'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { getQuestionsPaginated } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';

interface NodeQuestionsPageProps {
  node: any;
  contentType: string;
  breadcrumbs: { name: string; url: string }[];
}

export function NodeQuestionsPage({ node, contentType, breadcrumbs }: NodeQuestionsPageProps) {
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const getFilters = () => {
    const filters: Record<string, any> = {};
    if (node.type === 'topic') filters.topicId = node.id;
    else if (node.type === 'chapter') filters.chapterId = node.id;
    else if (node.type === 'subject') filters.subjectId = node.id;
    else if (node.type === 'class') filters.classId = node.id;
    else if (node.type === 'board') filters.boardId = node.id;
    else if (node.type === 'textbook') filters.textbookId = node.id;

    if (contentType === 'mcq') {
      filters.type = 'mcq';
    } else if (contentType === 'cq') {
      filters.type = 'descriptive';
    }
    return filters;
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const filters = getFilters();
        const data = await getQuestionsPaginated(filters, 20);
        setQuestions(data.questions);
        setLastDoc(data.lastDoc);
        setHasMore(data.questions.length === 20);
      } catch (e) {
        console.error("Error fetching node questions", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [node.id, node.type, contentType]);

  const handleLoadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const filters = getFilters();
      const data = await getQuestionsPaginated(filters, 20, lastDoc);
      setQuestions(prev => [...prev, ...data.questions]);
      setLastDoc(data.lastDoc);
      setHasMore(data.questions.length === 20);
    } catch (e) {
      console.error("Error loading more questions", e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="w-full pb-10">
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
            </span>
            <div className="flex bg-slate-200/60 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setIsTestMode(false)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${!isTestMode ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                Reading Mode
              </button>
              <button
                onClick={() => setIsTestMode(true)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${isTestMode ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                Practice Mode
              </button>
            </div>
          </div>
          {questions.map((question, index) => (
            <QuestionCard 
              key={question.id || `q-fallback-${index}`}
              question={question} 
              index={index}
              isListView={true}
              testMode={isTestMode}
              isDetailView={!isTestMode}
            />
          ))}

          {hasMore && (
            <div className="pt-6 pb-2 text-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Questions'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
