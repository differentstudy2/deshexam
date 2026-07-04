import React from 'react';
import { getQuestionBySlug, getQuestionsByTaxonomySlug, getQuestion, getQuestions } from '@/lib/firebase/question-bank';
import { getTopicHierarchy } from '@/lib/firebase/guide';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionListViewer from '@/components/question-bank/QuestionListViewer';
import QuestionSidebar from '@/components/question-bank/QuestionSidebar';
import QuestionComments from '@/components/question-bank/QuestionComments';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ChevronRight, Share2 } from 'lucide-react';
import { getFAQSchema, getBreadcrumbSchema, getQuestionSchema } from '@/lib/seo/json-ld';

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
            const title = `${question.title || question.questionText.substring(0, 60)} | Answer & Explanation | DeshExam`;
            const description = `Find the answer and explanation for "${question.questionText.substring(0, 100)}..." on DeshExam. Practice exam questions with detailed solutions and explanations.`;
            
            return {
                title,
                description,
                keywords: [question.questionText.substring(0, 50), 'question answer', 'solution', 'explanation', question.subjectId || '', question.topicId || ''],
                alternates: {
                    canonical: `https://deshexam.com/question/${lastSlug}`
                },
                openGraph: {
                    title,
                    description,
                    url: `https://deshexam.com/question/${lastSlug}`,
                    type: 'article',
                }
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
      
      const tryFetchTitle = async (id: string, col1: string, col2: string) => {
          if (!id) return null;
          try {
              // First try the new taxonomy_nodes collection
              let snap = await getDoc(doc(db, 'taxonomy_nodes', id));
              if (snap.exists()) return snap.data().title || snap.data().name;
              
              // Fallback to legacy collections
              snap = await getDoc(doc(db, col1, id));
              if (snap.exists()) return snap.data().title || snap.data().name;
              snap = await getDoc(doc(db, col2, id));
              if (snap.exists()) return snap.data().title || snap.data().name;
          } catch(e) {}
          return null;
      };

      if (question.boardId) { const t = await tryFetchTitle(question.boardId, 'guide_boards', 'question_boards'); if (t && t !== 'Board') taxonomyTags.push(t); }
      if (question.classId) { const t = await tryFetchTitle(question.classId, 'guide_classes', 'question_classes'); if (t && t !== 'Class') taxonomyTags.push(t); }
      if (question.subjectId) { const t = await tryFetchTitle(question.subjectId, 'guide_subjects', 'question_subjects'); if (t && t !== 'Subject') taxonomyTags.push(t); }
      if (question.textbookId) { const t = await tryFetchTitle(question.textbookId, 'guide_textbooks', 'question_textbooks'); if (t && t !== 'Textbook') taxonomyTags.push(t); }
      if (question.chapterId) { const t = await tryFetchTitle(question.chapterId, 'guide_chapters', 'question_chapters'); if (t && t !== 'Chapter') taxonomyTags.push(t); }
      if (question.topicId) { const t = await tryFetchTitle(question.topicId, 'guide_topics', 'question_topics'); if (t && t !== 'Topic') taxonomyTags.push(t); }
      if (question.yearId) { const t = await tryFetchTitle(question.yearId, 'question_years', 'question_years'); if (t) taxonomyTags.push(t); }
      if (question.examIds && question.examIds.length > 0) {
          for (const examId of question.examIds) {
              const t = await tryFetchTitle(examId, 'question_exams', 'question_exams');
              if (t) taxonomyTags.push(t);
          }
      }

      if (taxonomyTags.length === 0 && leafId) {
          try {
              const hierarchy = await getTopicHierarchy(leafId);
              if (hierarchy) {
                  if (hierarchy.boardTitle && hierarchy.boardTitle !== 'Board') taxonomyTags.push(hierarchy.boardTitle);
                  if (hierarchy.classTitle && hierarchy.classTitle !== 'Class') taxonomyTags.push(hierarchy.classTitle);
                  if (hierarchy.subjectTitle && hierarchy.subjectTitle !== 'Subject') taxonomyTags.push(hierarchy.subjectTitle);
                  if (hierarchy.chapterTitle && hierarchy.chapterTitle !== 'Chapter') taxonomyTags.push(hierarchy.chapterTitle);
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
    safeQuestion.taxonomyTags = Array.from(new Set(taxonomyTags));
    const safeRelated = JSON.parse(JSON.stringify(relatedQuestions));

    const breadcrumbItems = [
        { name: 'Home', url: 'https://deshexam.com' },
        { name: 'Questions', url: 'https://deshexam.com/questions' }
    ];
    if (safeQuestion.taxonomyTags.length > 0) {
        safeQuestion.taxonomyTags.forEach((t: string) => breadcrumbItems.push({ name: t, url: `https://deshexam.com/questions/${t.toLowerCase().replace(/ /g, '-')}` }));
    }
    breadcrumbItems.push({ name: question.title || lastSlug, url: `https://deshexam.com/question/${lastSlug}` });

    const schemas = [
        getBreadcrumbSchema(breadcrumbItems),
        getQuestionSchema(
            question.questionText, 
            question.explanation || (question.options && question.correctAnswer && question.options[question.correctAnswer.toLowerCase() as keyof typeof question.options]) || question.correctAnswer || "Answer not provided",
            `https://deshexam.com/question/${lastSlug}`,
            (function() {
                try {
                    const cDate = question.createdAt as any;
                    if (!cDate) return "2024-01-01T00:00:00Z";
                    if (typeof cDate?.toDate === 'function') return cDate.toDate().toISOString();
                    if (cDate?.seconds) return new Date(cDate.seconds * 1000).toISOString();
                    const d = new Date(cDate);
                    if (!isNaN(d.getTime())) return d.toISOString();
                } catch(e) {}
                return "2024-01-01T00:00:00Z";
            })()
        ),
        getFAQSchema([
            { q: "How can I save this question for later?", a: "You can click the \"Bookmark\" icon on the question card to save it to your dashboard." },
            { q: "Is the explanation verified?", a: "Yes, the explanation is either verified by our expert instructors or auto-generated by AI based on verified sources." }
        ])
    ];

    return (
      <div className="container max-w-6xl mx-auto py-12 px-4 flex flex-col lg:flex-row gap-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
        <div className="lg:w-3/4 w-full">
            {/* Breadcrumb */}
            <nav className="flex items-center text-xs md:text-sm text-slate-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            <Link href="/" className="hover:text-[#107c41] flex items-center shrink-0">
                <Home className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
            <Link href="/questions" className="hover:text-[#107c41] shrink-0">Question Bank</Link>
            
            {safeQuestion.taxonomyTags.length > 0 ? (
                safeQuestion.taxonomyTags.map((tag: string, i: number) => {
                    let displayTag = tag;
                    if (i === 0 && tag.length > 12) {
                        const ignoreWords = ['of', 'and', 'for', 'the', '&', 'in', 'on', 'at'];
                        const acronym = tag.split(/[\s-]+/).filter(w => w && !ignoreWords.includes(w.toLowerCase())).map(w => w[0]?.toUpperCase()).join('');
                        if (acronym.length > 1) displayTag = acronym;
                    }
                    const href = `/questions/${slugArray.slice(0, i + 1).join('/')}`;
                    return (
                        <React.Fragment key={`tag-${i}`}>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0 text-slate-400" />
                            <Link href={href} className="capitalize text-slate-700 hover:text-[#107c41] font-medium hover:underline transition-colors shrink-0 whitespace-nowrap">{displayTag}</Link>
                        </React.Fragment>
                    );
                })
            ) : (
                slugArray.slice(0, -1).map((s, i) => {
                    let displayTag = decodeURIComponent(s).replace(/-/g, ' ');
                    if (i === 0 && displayTag.length > 12) {
                        const ignoreWords = ['of', 'and', 'for', 'the', '&', 'in', 'on', 'at'];
                        const acronym = displayTag.split(/[\s-]+/).filter(w => w && !ignoreWords.includes(w.toLowerCase())).map(w => w[0]?.toUpperCase()).join('');
                        if (acronym.length > 1) displayTag = acronym;
                    }
                    const href = `/questions/${slugArray.slice(0, i + 1).join('/')}`;
                    return (
                        <React.Fragment key={`slug-${i}`}>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0 text-slate-400" />
                            <Link href={href} className="capitalize text-slate-700 hover:text-[#107c41] font-medium hover:underline transition-colors shrink-0 whitespace-nowrap">{displayTag}</Link>
                        </React.Fragment>
                    );
                })
            )}

            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px] md:max-w-[400px]">
                {question.title || decodeURIComponent(lastSlug).replace(/-/g, ' ')}
            </span>
            </nav>

            <QuestionCard question={safeQuestion} isDetailView={true} />

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
