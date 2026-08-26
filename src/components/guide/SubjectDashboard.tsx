"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Share2, MoreVertical, Search, Clock, Play, FileText, Library, BookOpen, ChevronDown, List, ChevronLeft, Eye, User, Languages, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CurriculumTree } from '@/components/guide/CurriculumTree';
import { GuideSidebar, translateToBengali } from '@/components/guide/GuideSidebar';
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
  const router = useRouter();

  // Analytics and Counts
  const viewCount = node?.metrics?.views || (Math.floor(Math.random() * 5000) + 1200); // Fake views if 0
  const formattedViews = viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}k` : viewCount.toString();
  const updatedAt = node?.updatedAt?.seconds ? new Date(node.updatedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently';



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
    const textbook = curriculum.find((c: any) => c.dbId === id || c.id === id) || curriculum[0];
    if (textbook) {
      treeData = textbook.topics.map((ch: any) => ({
        id: ch.id,
        title: ch.title,
        topics: ch.subtopics || []
      })) as any;
    }
  }

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTreeData = useMemo(() => {
    if (!searchQuery) return treeData;
    const lowerQ = searchQuery.toLowerCase();

    return treeData.map((chapter: any) => {
      const chapterMatch = chapter.title.toLowerCase().includes(lowerQ);

      const filteredTopics = (chapter.topics || []).map((topic: any) => {
        const topicMatch = topic.title.toLowerCase().includes(lowerQ);

        const filteredSubtopics = (topic.subtopics || []).filter((sub: any) =>
          sub.title.toLowerCase().includes(lowerQ)
        );

        if (chapterMatch || topicMatch || filteredSubtopics.length > 0) {
          return {
            ...topic,
            subtopics: (chapterMatch || topicMatch) ? topic.subtopics : filteredSubtopics
          };
        }
        return null;
      }).filter(Boolean);

      if (chapterMatch || filteredTopics.length > 0) {
        return {
          ...chapter,
          topics: chapterMatch ? chapter.topics : filteredTopics
        };
      }
      return null;
    }).filter(Boolean);
  }, [treeData, searchQuery]);

  // Calculate real counts from treeData
  let mcqCount = 0;
  let cqCount = 0;
  let mockTestCount = 0;
  let quizCount = 0;
  let chapterCount = treeData?.length || 0;
  let topicCount = 0;

  treeData?.forEach((chapter: any) => {
    topicCount += (chapter.topics?.length || 0);

    chapter.topics?.forEach((topic: any) => {
      const tTitle = (topic.title || '').toLowerCase();
      if (tTitle.includes('mcq') || tTitle.includes('বহুনির্বাচনি')) mcqCount++;
      if (tTitle.includes('cq') || tTitle.includes('সৃজনশীল')) cqCount++;
      if (tTitle.includes('mock') || tTitle.includes('মডেল')) mockTestCount++;
      if (tTitle.includes('quiz') || tTitle.includes('কুইজ')) quizCount++;

      if (topic.metrics) {
        mockTestCount += (topic.metrics.mockTestCount || 0);
        quizCount += (topic.metrics.quizCount || 0);
        mcqCount += (topic.metrics.mcqCount || 0);
        cqCount += (topic.metrics.cqCount || 0);
      }

      topic.subtopics?.forEach((sub: any) => {
        const sTitle = (sub.title || '').toLowerCase();
        if (sTitle.includes('mcq') || sTitle.includes('বহুনির্বাচনি')) mcqCount++;
        if (sTitle.includes('cq') || sTitle.includes('সৃজনশীল')) cqCount++;
        if (sTitle.includes('mock') || sTitle.includes('মডেল')) mockTestCount++;
        if (sTitle.includes('quiz') || sTitle.includes('কুইজ')) quizCount++;
      });
    });
  });

  // Fallbacks to node.metrics if zero
  if (mcqCount === 0) mcqCount = node?.metrics?.mcqCount || 0;
  if (cqCount === 0) cqCount = node?.metrics?.cqCount || 0;
  if (mockTestCount === 0) mockTestCount = node?.metrics?.mockTestCount || node?.metrics?.practiceSetCount || 0;
  if (quizCount === 0) quizCount = node?.metrics?.quizCount || 0;

  let schemas: any[] = [];
  let faqs: { question: string; answer: string }[] = [];
  let seoContent = '';

  if (node) {
    const breadcrumbItems = [
      { name: 'Home', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}` },
      { name: 'Academy', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/guide/board` }
    ];
    let currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/guide`;

    node.ancestors?.forEach((anc: any) => {
      currentUrl += `/${anc.slug || anc.id}`;
      breadcrumbItems.push({ name: anc.title, item: currentUrl });
    });
    breadcrumbItems.push({ name: node.title, item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/guide/${node.fullSlug || node.id}` });

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
      itemListElements = ((curriculum.find((c: any) => c.dbId === id || c.id === id) || curriculum[0])?.topics || []).map((t: any) => ({
        name: t.title,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/guide/${(t as any).fullSlug || t.id}`
      }));
    } else {
      itemListElements = treeData.map((item: any) => ({
        name: item.title,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/guide/${item.fullSlug || item.id}`
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

  let uiBreadcrumbs = breadcrumbs;

  if (!uiBreadcrumbs && node) {
    uiBreadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Academy', url: '/guide/board' }
    ];
    let currentPath = '/guide';
    node.ancestors?.forEach((anc: any) => {
      currentPath += `/${anc.slug || anc.id}`;
      uiBreadcrumbs!.push({ name: anc.title, url: currentPath });
    });
    uiBreadcrumbs.push({ name: node.title, url: `/guide/${node.fullSlug || node.id}` });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">

      {/* Top Header Bar (White) */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between relative">

          {/* Mobile Back Button & Centered Title */}
          <div className="flex items-center md:hidden w-full">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-[16px] text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2 max-w-[200px] truncate">
              {translateToBengali(displayTitle)}
            </h1>
            <button className="p-2 -mr-2 ml-auto text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>

            <div className="hidden sm:flex flex-wrap items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              {uiBreadcrumbs ? (
                uiBreadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 mx-2" />}
                    {idx === uiBreadcrumbs!.length - 1 ? (
                      <span className="text-slate-800 dark:text-slate-200">{translateToBengali(crumb.name)}</span>
                    ) : (
                      <Link href={crumb.url} className="hover:text-emerald-600 transition-colors">
                        {translateToBengali(crumb.name)}
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
                      <span className="text-slate-800 dark:text-slate-200">{boardTitle}</span>
                    </>
                  )}
                  {classTitle && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 mx-2" />
                      <span className="text-slate-800 dark:text-slate-200">{classTitle}</span>
                    </>
                  )}
                  {subjectTitle && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 mx-2" />
                      <span className="text-slate-800 dark:text-slate-200">{translateToBengali(subjectTitle)}</span>
                    </>
                  )}
                  {textbookTitle && (pageType === 'textbook' || pageType === 'chapter') && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 mx-2" />
                      <span className="text-slate-800 dark:text-slate-200">{translateToBengali(textbookTitle)}</span>
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
            onClick={() => router.back()}
            className="hidden md:flex h-8 px-5 bg-[#dcefe2] text-[#1b6b3e] border-transparent hover:bg-[#c2e2cc] hover:text-[#11512d] dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 rounded-md font-bold text-sm shadow-sm"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 flex flex-col lg:flex-row gap-6 items-start">

        {/* Left Column (Main Content) */}
        <div className="flex-1 w-full flex flex-col bg-white dark:bg-slate-900 sm:rounded-xl shadow-sm sm:border border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Green Header Box */}
          <div className="bg-[#dcefe2] dark:bg-emerald-900/20 p-2 relative flex items-start gap-4 sm:gap-6">
            {pageType === 'textbook' && node?.featureImage && (
              <div className="shrink-0 w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden shadow-md">
                <Image src={node.featureImage} alt={`${displayTitle} textbook cover`} width={96} height={128} className="object-cover w-full h-full" priority />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="absolute top-4 right-4 hidden sm:flex items-center gap-3 text-[#589d76] dark:text-emerald-500">
                <button className="hover:text-[#1b6b3e] dark:hover:text-emerald-400 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-800 rounded-sm hover:text-[#1b6b3e] dark:hover:text-emerald-400 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                {translateToBengali(displayTitle)}
              </h1>

              {/* Description */}
              {pageType === 'textbook' && node?.description ? (
                <p className="text-[13px] sm:text-[14px] text-[#3d6b52] dark:text-emerald-200/80 mb-3 leading-relaxed line-clamp-3">
                  {node.description}
                </p>
              ) : (
                <p className="text-[13px] sm:text-[14px] text-[#5c7a6b] dark:text-emerald-200/70 mb-3">
                  {pageType === 'board'
                    ? 'All Classes & Curriculum'
                    : pageType === 'class'
                      ? `${boardTitle || ''} Curriculum Guide`.trim()
                      : pageType === 'textbook'
                        ? `${boardTitle || ''} ${classTitle || ''} ${subjectTitle || ''} Textbook Guide`.replace(/\s+/g, ' ').trim()
                        : `${classTitle || ''} ${subjectTitle || ''} Guide`.replace(/\s+/g, ' ').trim()}
                </p>
              )}

              {/* Author + Medium badges — textbook only */}
              {pageType === 'textbook' && (node?.author || (node?.mediumOfInstruction && node.mediumOfInstruction.length > 0)) && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {node.author && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1b6b3e] dark:text-emerald-300 bg-white/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-[#a8d5bc] dark:border-emerald-700/50 shadow-sm">
                      <User className="w-2.5 h-2.5 shrink-0" />
                      {node.author}
                    </span>
                  )}
                  {node.mediumOfInstruction && node.mediumOfInstruction.map((m: string) => (
                    <span key={m} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1b6b3e] dark:text-emerald-300 bg-white/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-[#a8d5bc] dark:border-emerald-700/50 shadow-sm">
                      <Languages className="w-2.5 h-2.5 shrink-0" />
                      {m}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between">
                <p className="text-[11px] font-bold text-[#6a8b7a] dark:text-emerald-200/60">
                  Last Updated: {updatedAt}
                </p>
                <div className="flex items-center gap-1 text-[11px] sm:text-[12px] font-bold text-[#6a8b7a] dark:text-emerald-200/60">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {formattedViews} Views
                </div>
              </div>
            </div>
          </div>

          {/* Mobile native search bar */}
          <div className="px-4 py-3 sm:p-0 relative sm:border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative bg-slate-100 dark:bg-slate-950/50 rounded-xl sm:rounded-none overflow-hidden sm:bg-transparent flex items-center">
              <div className="pl-3 sm:absolute sm:inset-y-0 sm:left-6 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Search chapters or topics"
                className="h-10 sm:h-14 bg-transparent border-none focus-visible:ring-0 w-full text-[14px] sm:text-base placeholder:text-slate-400 placeholder:font-medium font-medium text-slate-700 shadow-none px-2 sm:pl-14"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {mcqCount > 0 && <span className="shrink-0 px-3 py-1.5 sm:py-1 bg-[#107c41] text-white text-[11px] sm:text-[12px] font-bold rounded-full">MCQ: {mcqCount}</span>}
            {cqCount > 0 && <span className="shrink-0 px-3 py-1.5 sm:py-1 bg-[#107c41] text-white text-[11px] sm:text-[12px] font-bold rounded-full">CQ: {cqCount}</span>}
            <span className="shrink-0 px-3 py-1.5 sm:py-1 bg-[#0b5c30] text-white text-[11px] sm:text-[12px] font-bold rounded-full">Chapters: {chapterCount}</span>
            <span className="shrink-0 px-3 py-1.5 sm:py-1 bg-[#0b5c30] text-white text-[11px] sm:text-[12px] font-bold rounded-full">Topics: {topicCount}</span>
            {pageType === 'textbook' && node?.mediumOfInstruction && node.mediumOfInstruction.map((m: string) => (
              <span key={m} className="shrink-0 px-3 py-1.5 sm:py-1 bg-sky-600 text-white text-[11px] sm:text-[12px] font-bold rounded-full flex items-center gap-1">
                <Languages className="w-3 h-3" />{m}
              </span>
            ))}
            <Link href={`/practice/${node?.fullSlug || node?.id || id}`} className="shrink-0 px-3 py-1.5 sm:py-1 bg-white dark:bg-slate-800 border-[1.5px] border-[#107c41] text-[#107c41] dark:text-emerald-400 text-[11px] sm:text-[12px] font-bold rounded-full flex items-center gap-1 hover:bg-[#f0f9f4] dark:hover:bg-emerald-900/20 transition-colors">
              <Play className="w-3 h-3 fill-current" /> Practice
            </Link>
            <Link href={`/mock-tests`} className="shrink-0 px-3 py-1.5 sm:py-1 bg-white dark:bg-slate-800 border-[1.5px] border-rose-600 text-rose-600 dark:text-rose-400 text-[11px] sm:text-[12px] font-bold rounded-full flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
              <FileText className="w-3 h-3" /> Mock Test {mockTestCount > 0 && `(${mockTestCount})`}
            </Link>
            <Link href={`/quiz`} className="shrink-0 px-3 py-1.5 sm:py-1 bg-white dark:bg-slate-800 border-[1.5px] border-amber-600 text-amber-600 dark:text-amber-400 text-[11px] sm:text-[12px] font-bold rounded-full flex items-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
              <Clock className="w-3 h-3" /> Quiz {quizCount > 0 && `(${quizCount})`}
            </Link>
            <div className="ml-auto shrink-0 pl-2 hidden sm:block">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                width={110}
                height={32}
                className="h-8 w-auto cursor-pointer"
              />
            </div>
          </div>

          <div className="p-0 sm:p-6 pb-6">
            <h2 className="sr-only">Chapters</h2>
            {filteredTreeData.length > 0 ? (
              <CurriculumTree curriculum={filteredTreeData} />
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">No chapters or topics found matching "{searchQuery}"</p>
              </div>
            )}
          </div>

          {node && (
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800">

              {/* Textbook quick info card — author, medium, status */}
              {pageType === 'textbook' && (node.author || (node.mediumOfInstruction && node.mediumOfInstruction.length > 0)) && (
                <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 divide-y divide-slate-200 dark:divide-slate-700">
                  {node.author && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Author / Publisher</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{node.author}</p>
                      </div>
                    </div>
                  )}
                  {node.mediumOfInstruction && node.mediumOfInstruction.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center shrink-0">
                        <Languages className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Language / Medium</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {node.mediumOfInstruction.map((m: string) => (
                            <span key={m} className="text-xs font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {node.tags && node.tags.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                        <BookMarked className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Topics / Tags</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {node.tags.slice(0, 8).map((t: string) => (
                            <span key={t} className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About {translateToBengali(displayTitle)}</h2>
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


            </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        {pageType !== 'board' && (
          <div className="w-full lg:w-[340px] shrink-0">
            <GuideSidebar subjects={subjects} activeId={node?.fullSlug || id} classTitle={classTitle} />
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
