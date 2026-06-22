import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Share2, MoreVertical, Search, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CurriculumTree } from '@/components/guide/CurriculumTree';
import { GuideSidebar } from '@/components/guide/GuideSidebar';
import { Chapter } from '@/app/guide/guide-data';

export function SubjectDashboard({
  id,
  pageType,
  subjects,
  curriculum,
  boardTitle,
  classTitle,
  subjectTitle,
  textbookTitle,
  chapterTitle
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">

      {/* Top Header Bar (White) */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>

            <div className="hidden sm:flex flex-wrap items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
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
          <div className="bg-[#dcefe2] dark:bg-emerald-900/20 px-6 py-5 relative">
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

            <h2 className="text-[26px] font-bold text-[#1e293b] dark:text-slate-100 mb-1">
              {displayTitle}
            </h2>
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
            <CurriculumTree curriculum={treeData} />
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        {pageType !== 'board' && (
          <div className="w-full lg:w-[340px] shrink-0">
            <GuideSidebar subjects={subjects} activeId={id} classTitle={classTitle} />
          </div>
        )}
      </div>
    </div>
  );
}
