import React from 'react';
import { getQuestionBySlug, getQuestionsByTaxonomySlug, getQuestion, getQuestions } from '@/lib/firebase/question-bank';
import { getTopicHierarchy } from '@/lib/firebase/guide';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionListViewer from '@/components/question-bank/QuestionListViewer';
import QuestionSidebar from '@/components/question-bank/QuestionSidebar';
import QuestionComments from '@/components/question-bank/QuestionComments';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ChevronRight, Share2 } from 'lucide-react';

type Props = {
    params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const slugArray = resolvedParams.slug;
    const lastSlug = decodeURIComponent(slugArray[slugArray.length - 1]);
    
    try {
        let question = await getQuestionBySlug(lastSlug);
        if (!question) {
            question = await getQuestion(lastSlug);
        }
        if (question) {
            return {
                title: `${question.title || question.questionText.substring(0, 50)} | DeshExam`,
                description: question.questionText.substring(0, 160)
            }
        }
    } catch(e) {}

    return {
        title: `${lastSlug.replace(/-/g, ' ').toUpperCase()} Questions | DeshExam`,
        description: `Explore all questions for ${lastSlug.replace(/-/g, ' ')}`
    }
}

export default async function DynamicQuestionPage({ params }: Props) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug;
  const lastSlug = decodeURIComponent(slugArray[slugArray.length - 1]);

  let question = null;
  try {
      question = await getQuestionBySlug(lastSlug);
      if (!question) {
          question = await getQuestion(lastSlug);
      }
  } catch(e) {}

  let relatedQuestions: any[] = [];
  let taxonomyTags: string[] = [];

  if (question) {
      // 1. Fetch Taxonomies
      const leafId = question.topicId || question.chapterId || question.textbookId || question.subjectId || question.classId || question.boardId;
      if (leafId) {
          try {
              const hierarchy = await getTopicHierarchy(leafId);
              if (hierarchy) {
                  if (hierarchy.boardTitle) taxonomyTags.push(hierarchy.boardTitle);
                  if (hierarchy.classTitle) taxonomyTags.push(hierarchy.classTitle);
                  if (hierarchy.subjectTitle) taxonomyTags.push(hierarchy.subjectTitle);
                  if (hierarchy.chapterTitle) taxonomyTags.push(hierarchy.chapterTitle);
              }
          } catch(e) {}
      }

      // 2. Fetch Related Questions
      try {
          const fetchAndMerge = async (queryParam: any) => {
              try { return await getQuestions(queryParam, 6); } catch (e) { return []; }
          };

          const promises = [];
          if (question.topicId) promises.push(fetchAndMerge({ topicId: question.topicId }));
          if (question.chapterId) promises.push(fetchAndMerge({ chapterId: question.chapterId }));
          if (question.subjectId) promises.push(fetchAndMerge({ subjectId: question.subjectId }));
          if (question.classId) promises.push(fetchAndMerge({ classId: question.classId }));
          if (question.tags && question.tags.length > 0) promises.push(fetchAndMerge({ tags: question.tags[0] }));

          const results = await Promise.all(promises);
          let allRelated: any[] = [];
          results.forEach(res => { allRelated = allRelated.concat(res); });

          // De-duplicate and filter self
          const uniqueMap = new Map();
          allRelated.forEach(q => {
              if (q.id !== question.id && !uniqueMap.has(q.id)) {
                  uniqueMap.set(q.id, q);
              }
          });
          
          relatedQuestions = Array.from(uniqueMap.values()).slice(0, 5);
      } catch(e) {}
  }

  if (question) {
    const safeQuestion = JSON.parse(JSON.stringify(question));
    safeQuestion.taxonomyTags = taxonomyTags;
    const safeRelated = JSON.parse(JSON.stringify(relatedQuestions));
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4 w-full">
            {/* Breadcrumb */}
            <nav className="flex items-center text-xs md:text-sm text-slate-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            <Link href="/" className="hover:text-[#107c41] flex items-center shrink-0">
                <Home className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
            <Link href="/questions" className="hover:text-[#107c41] shrink-0">Question Bank</Link>
            
            {slugArray.slice(0, -1).map((s, i) => (
                <React.Fragment key={i}>
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
                    <span className="capitalize text-slate-500">{decodeURIComponent(s).replace(/-/g, ' ')}</span>
                </React.Fragment>
            ))}

            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px] md:max-w-[400px]">
                {question.title || decodeURIComponent(lastSlug).replace(/-/g, ' ')}
            </span>
            </nav>

            <QuestionListViewer questions={[safeQuestion]} />

            {safeRelated.length > 0 && (
              <div className="mt-12 mb-8">
                 <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Related Questions</h2>
                    <Link href={`/questions`} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#107c41] transition-colors border bg-white dark:bg-slate-800 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                       <Share2 className="w-4 h-4" /> View All
                    </Link>
                 </div>
                 <QuestionListViewer questions={safeRelated} />
              </div>
            )}

            <QuestionComments questionId={question.id} />

            <div className="mt-12 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b pb-3">Frequently Asked Questions</h3>
                <div className="space-y-4">
                    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg p-4 cursor-pointer">
                        <summary className="font-semibold text-slate-700 dark:text-slate-300 marker:text-[#107c41]">How can I save this question for later?</summary>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 ml-4">You can click the "Bookmark" icon on the question card to save it to your dashboard.</p>
                    </details>
                    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg p-4 cursor-pointer">
                        <summary className="font-semibold text-slate-700 dark:text-slate-300 marker:text-[#107c41]">Is the explanation verified?</summary>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 ml-4">Yes, the explanation is either verified by our expert instructors or auto-generated by AI based on verified sources.</p>
                    </details>
                </div>
            </div>


        </div>
        <div className="lg:w-1/4 w-full hidden lg:block">
            <QuestionSidebar />
        </div>
      </div>
    );
  }

  let questionsList: any[] = [];
  try {
      questionsList = await getQuestionsByTaxonomySlug(lastSlug);
  } catch(e) {}

  if (questionsList.length > 0) {
      const safeQuestionsList = JSON.parse(JSON.stringify(questionsList));
      const formattedTitle = lastSlug.replace(/-/g, ' ');
      return (
          <div className="container max-w-6xl mx-auto py-12 px-4 flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4 w-full">
                {/* Breadcrumb */}
                <nav className="flex items-center text-xs md:text-sm text-slate-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
                <Link href="/" className="hover:text-[#107c41] flex items-center shrink-0">
                    <Home className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Home
                </Link>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
                <Link href="/questions" className="hover:text-[#107c41] shrink-0">Question Bank</Link>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
                <span className="text-slate-800 dark:text-slate-200 font-medium capitalize truncate">
                    {formattedTitle}
                </span>
                </nav>

                <h1 className="text-3xl font-bold mb-8 capitalize">{formattedTitle} Questions</h1>
                <QuestionListViewer questions={safeQuestionsList} />
            </div>
            <div className="lg:w-1/4 w-full hidden lg:block">
                <QuestionSidebar />
            </div>
          </div>
      )
  }

  notFound();
}
