import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentNavigationSidebar } from '@/components/guide/ContentNavigationSidebar';
import { ReadingArticle } from '@/components/guide/ReadingArticle';
import { AssessmentTabs } from '@/components/guide/AssessmentTabs';
import { TopicSectionsSidebar } from '@/components/guide/TopicSectionsSidebar';
import { Chapter } from '@/app/guide/guide-data';

export function ReadingLayout({
  id,
  data,
  subjects,
  curriculum,
  boardTitle,
  classTitle,
  subjectTitle,
  textbookTitle,
  chapterTitle
}: {
  id: string;
  data: any;
  subjects: any[];
  curriculum: Chapter[];
  boardTitle: string;
  classTitle: string;
  subjectTitle: string;
  textbookTitle: string;
  chapterTitle?: string;
}) {

  if (!data) {
    return <div className="p-20 text-center text-xl text-slate-500">Content not found!</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">

      {/* Top Header Bar (White) */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>

            <div className="hidden sm:flex flex-wrap items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/academy" className="hover:text-emerald-600 transition-colors">Academy</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="hover:text-emerald-600 transition-colors cursor-pointer">{boardTitle}</span>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="hover:text-emerald-600 transition-colors cursor-pointer">{classTitle}</span>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="hover:text-emerald-600 transition-colors cursor-pointer">{subjectTitle}</span>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="hover:text-emerald-600 transition-colors cursor-pointer">{textbookTitle}</span>
              {chapterTitle && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 mx-2" />
                  <span className="hover:text-emerald-600 transition-colors cursor-pointer">{chapterTitle}</span>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-slate-800 dark:text-slate-200">{data.title}</span>
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

      {/* Main Reading Layout Area */}
      <div className="max-w-[1400px] mx-auto flex items-stretch mt-[10px]">

        {/* Left Navigation Sidebar */}
        <ContentNavigationSidebar curriculum={curriculum} activeId={id} subjectTitle={textbookTitle} />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <ReadingArticle 
            data={data} 
            hierarchy={{
              boardTitle,
              classTitle,
              subjectTitle,
              textbookTitle,
              chapterTitle
            }}
          />
          
          <div className="px-4 sm:px-6 xl:px-12 pb-12">
            <AssessmentTabs chapterId={id} />
          </div>
        </div>

        {/* Right Sections Sidebar */}
        <div className="w-[300px] shrink-0 hidden lg:block sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">
          <TopicSectionsSidebar sections={data.sections} />
        </div>

      </div>
    </div>
  );
}
