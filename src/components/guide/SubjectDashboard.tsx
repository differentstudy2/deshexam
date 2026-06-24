import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Share2, MoreVertical, Search, Clock, Play, FileText, Library, BookOpen, ChevronDown, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CurriculumTree } from '@/components/guide/CurriculumTree';
import { GuideSidebar } from '@/components/guide/GuideSidebar';
import { Chapter } from '@/app/guide/guide-data';
import { generateBreadcrumbSchema, generateBookSchema, generateLearningResourceSchema, generateItemListSchema, generateFAQPageSchema } from '@/lib/seo-schemas';
import ReactMarkdown from 'react-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function SubjectDashboard({
  id,
  pageType,
  subjects,
  curriculum,
  boardTitle,
  classTitle,
  subjectTitle,
  textbookTitle,
  chapterTitle,
  node,
  breadcrumbs
}: {
  id: string;
  pageType: 'board' | 'class' | 'subject' | 'textbook' | 'chapter';
  subjects: any[];
  curriculum: Chapter[];
  boardTitle?: string;
  classTitle?: string;
  subjectTitle?: string;
  textbookTitle?: string;
  chapterTitle?: string;
  node?: any;
  breadcrumbs?: { name: string, url: string }[];
}) {
  const displayTitle = 
    pageType === 'chapter' ? (chapterTitle || 'Chapter') : 
    pageType === 'textbook' ? (textbookTitle || 'Textbook') : 
    pageType === 'class' ? (classTitle || 'Class') : 
    pageType === 'board' ? (boardTitle || 'Board') : 
    (subjectTitle || 'Subject');

  let treeData = curriculum;
  if (pageType === 'chapter') {
    const chapter = curriculum.find(c => c.id === id || (id.includes('গদ্য') && c.id === 'c1') || (id.includes('কবিতা') && c.id === 'c2'));
    if (chapter) {
      treeData = chapter.topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        topics: (topic.subtopics || []).map((sub: any) => ({
          id: sub.id,
          title: sub.title,
          type: 'topic',
          subtopics: []
        }))
      })) as any;
    }
  } else if (pageType === 'textbook') {
    const textbook = curriculum.find(c => c.id === id);
    if (textbook) {
      treeData = textbook.topics.map((ch: any) => ({
        id: ch.id,
        title: ch.title,
        topics: ch.subtopics || []
      })) as any;
    }
  }

  let schemas: any[] = [];
  let faqs: { question: string; answer: string }[] = [];
  let seoContent = '';
  
  if (node) {
    const breadcrumbItems = [
      { name: 'Home', item: 'https://deshexam.com' },
      { name: 'Academy', item: 'https://deshexam.com/guide/board' }
    ];
    let currentUrl = 'https://deshexam.com/guide';
    
    node.ancestors?.forEach((anc: any) => {
      currentUrl += `/${anc.slug || anc.id}`;
      breadcrumbItems.push({ name: anc.title, item: currentUrl });
    });
    breadcrumbItems.push({ name: node.title, item: `https://deshexam.com/guide/${node.fullSlug || node.id}` });
    
    schemas.push(generateBreadcrumbSchema(breadcrumbItems));
    
    if (pageType === 'textbook') {
      schemas.push(generateBookSchema({
        name: node.title,
        educationalLevel: classTitle,
        publisherName: boardTitle
      }));
    }

    schemas.push(generateLearningResourceSchema({
      name: `${node.title} Guide`,
      educationalLevel: 'Secondary'
    }));
    
    let itemListElements = [];
    if (pageType === 'textbook') {
      itemListElements = (curriculum.find(c => c.id === id)?.topics || []).map(t => ({
        name: t.title,
        url: `https://deshexam.com/guide/${(t as any).fullSlug || t.id}`
      }));
    } else {
      itemListElements = treeData.map((item: any) => ({
        name: item.title,
        url: `https://deshexam.com/guide/${item.fullSlug || item.id}`
      }));
    }
    
    if (itemListElements.length > 0) {
      schemas.push(generateItemListSchema(itemListElements));
    }
    
    faqs = (node.faqs && node.faqs.length > 0) ? node.faqs : [
      { question: `Which class is ${node.title} for?`, answer: `This is an essential guide for ${classTitle ? classTitle : 'students'}${boardTitle ? ' under the ' + boardTitle + ' curriculum' : ''}.` },
      { question: `Does this guide contain chapter-wise notes?`, answer: `Yes, detailed notes, summaries, and questions-answers are provided for every chapter.` },
      { question: `Are there MCQ practice questions available?`, answer: `Absolutely. We provide ample MCQs for every subject to help you with your preparation.` },
      { question: `How should I prepare for my board exams?`, answer: `By regularly practicing our chapter-wise notes, previous year questions, and mock tests, you can easily get ready for your board exams.` }
    ];
    schemas.push(generateFAQPageSchema(faqs));

    seoContent = node.seoContent || `Welcome to the complete guide for **${displayTitle}**. This guide is a crucial part of the **${boardTitle || 'Board'}** curriculum for **${classTitle || 'students'}** studying **${subjectTitle || 'various subjects'}**. Mastering this is essential for scoring well in your exams.

Our study materials provide chapter-wise notes, summaries, and solutions designed to help you build a strong foundation. 

At DeshExam, we provide high-quality MCQ, short answer questions (SAQ), long answer questions (LAQ), and previous year board questions. Whether you're doing a quick revision or deep diving into complex topics, this guide is your perfect companion. Regular practice with our question bank and mock tests will significantly boost your exam preparation.`;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">

      {/* Top Header Bar (White) */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>

            <div className="hidden sm:flex flex-wrap items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              {breadcrumbs ? (
                breadcrumbs.map((crumb, idx) => (
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
                ))
              ) : (
                <>
                  <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
                  <ChevronRight className="w-3.5 h-3.5 mx-2" />
                  <Link href="/guide/board" className="hover:text-emerald-600 transition-colors">Boards</Link>
                  {boardTitle && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 mx-2" />
                      <span className="hover:text-emerald-600 transition-colors cursor-pointer">{boardTitle}</span>
                    </>
                  )}
                  {classTitle && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 mx-2" />
                      <Link href="/guide/class" className="hover:text-emerald-600 transition-colors">{classTitle}</Link>
                    </>
                  )}
                  {subjectTitle && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 mx-2" />
                      <span className="hover:text-emerald-600 transition-colors cursor-pointer">{subjectTitle}</span>
                    </>
                  )}
                  {textbookTitle && (pageType === 'textbook' || pageType === 'chapter') && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 mx-2" />
                      {pageType === 'textbook' ? (
                        <span className="text-slate-800 dark:text-slate-200">{textbookTitle}</span>
                      ) : (
                        <span className="hover:text-emerald-600 transition-colors cursor-pointer">{textbookTitle}</span>
                      )}
                    </>
                  )}
                  {pageType === 'chapter' && chapterTitle && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 mx-2" />
                      <span className="text-slate-800 dark:text-slate-200">{chapterTitle}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="h-8 px-5 bg-[#dcefe2] text-[#1b6b3e] border-transparent hover:bg-[#c2e2cc] hover:text-[#11512d] dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 rounded-md font-bold text-sm shadow-sm"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6 items-start">

        {/* Left Column (Main Content) */}
        <div className="flex-1 w-full flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Green Header Box */}
          <div className="bg-[#dcefe2] dark:bg-emerald-900/20 px-6 py-5 relative flex items-start gap-6">
            {pageType === 'textbook' && node?.featureImage && (
              <div className="shrink-0 w-24 h-32 rounded-lg overflow-hidden shadow-md hidden sm:block">
                <Image src={node.featureImage} alt={`${displayTitle} textbook cover`} width={96} height={128} className="object-cover w-full h-full" priority />
              </div>
            )}
            <div className="flex-1">
              <div className="absolute top-5 right-5 flex items-center gap-3 text-[#589d76] dark:text-emerald-500">
                <div className="flex items-center gap-1 text-[13px] font-bold">
                  <Clock className="w-4 h-4" />
                  5.4k
                </div>
                <button className="hover:text-[#1b6b3e] dark:hover:text-emerald-400 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-800 rounded-sm hover:text-[#1b6b3e] dark:hover:text-emerald-400 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-[26px] font-bold text-[#1e293b] dark:text-slate-100 mb-1">
                {displayTitle}
              </h1>
              <p className="text-[14px] text-[#5c7a6b] dark:text-emerald-200/70 mb-8">
                {pageType === 'board' ? 'All Classes & Curriculum' : pageType === 'class' ? `${boardTitle} Curriculum Guide` : `${classTitle} ${subjectTitle || ''} Guide`}
              </p>

              <div className="mt-auto">
                <p className="text-[11px] font-bold text-[#6a8b7a] dark:text-emerald-200/60 mb-2">
                  Started: 4 months ago || Progress: 0.54%
                </p>
                <Progress value={0.54} className="h-1.5 bg-white/60 dark:bg-slate-800" indicatorClassName="bg-[#00a651]" />
              </div>
            </div>
          </div>

          <div className="relative border-b border-slate-200 dark:border-slate-800">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Search"
              className="pl-14 h-14 bg-transparent border-none focus-visible:ring-0 w-full text-base placeholder:text-slate-400 placeholder:font-medium font-medium text-slate-700"
            />
          </div>

          <div className="px-6 py-4 flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <span className="px-3 py-1 bg-[#107c41] text-white text-[12px] font-bold rounded-full">MCQ: 2.3k</span>
            <span className="px-3 py-1 bg-[#107c41] text-white text-[12px] font-bold rounded-full">CQ: 1.8k</span>
            <span className="px-3 py-1 bg-[#0b5c30] text-white text-[12px] font-bold rounded-full">Board Exam: 1</span>
            <button className="px-3 py-1 bg-white dark:bg-slate-800 border-2 border-[#107c41] text-[#107c41] dark:text-emerald-400 text-[12px] font-bold rounded-full flex items-center gap-1 hover:bg-[#f0f9f4] dark:hover:bg-emerald-900/20 transition-colors">
              <Play className="w-3 h-3 fill-current" /> Practice
            </button>
            <div className="ml-auto">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                width={110}
                height={32}
                className="h-8 w-auto cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <h2 className="sr-only">Chapters</h2>
            <CurriculumTree curriculum={treeData} />
          </div>

          {node && (
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About {displayTitle}</h2>
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                <ReactMarkdown>{seoContent}</ReactMarkdown>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">FAQs</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left font-semibold text-slate-800 dark:text-slate-200">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-slate-600 dark:text-slate-400">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {subjects && subjects.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Related Content</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subjects.slice(0, 4).map(sub => (
                      <Link key={sub.id} href={`/guide/${sub.id}`} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{sub.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{classTitle ? `Class ${classTitle}` : 'View More'}</p>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        {pageType !== 'board' && (
          <div className="w-full lg:w-[340px] shrink-0">
            <GuideSidebar subjects={subjects} activeId={id} classTitle={classTitle} />
          </div>
        )}
      </div>
      
      {schemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
      )}
    </div>
  );
}
