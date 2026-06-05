import React from 'react';
import { ChevronRight, Share2, MoreVertical, Search, Clock, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CurriculumTree } from '@/components/guide/CurriculumTree';
import { GuideSidebar } from '@/components/guide/GuideSidebar';
import { ContentNavigationSidebar } from '@/components/guide/ContentNavigationSidebar';
import { ReadingArticle } from '@/components/guide/ReadingArticle';
import { getGuideSubjects, getCurriculumBySubject, getReadingContent } from '@/lib/firebase/guide';
import { Chapter } from './guide-data';
import Image from 'next/image';

// Temporary helper until we fully migrate navigation logic
function getPageType(id: string) {
  if (['sahitya-kanika', 'bangla-byakoron', 'english-for-today', 'gonit', 'ict'].includes(id)) {
    return 'subject';
  }
  if (id.startsWith('c1') || id.startsWith('c2') || id.includes('গদ্য') || id.includes('কবিতা')) {
    return 'chapter';
  }
  return 'reading';
}

export default async function GuideDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const pageType = getPageType(decodedId);

  // Fetch common data
  const subjects = await getGuideSubjects();

  if (pageType === 'subject' || pageType === 'chapter') {
    // Determine the subject ID to fetch curriculum for
    const subjectId = pageType === 'subject' ? decodedId : 'sahitya-kanika'; // Fallback to sahitya-kanika for chapters right now
    const curriculum = await getCurriculumBySubject(subjectId);
    
    return <SubjectDashboard id={decodedId} pageType={pageType} subjects={subjects} curriculum={curriculum} />;
  }

  // Reading Page
  const readingData = await getReadingContent(decodedId);
  const curriculum = await getCurriculumBySubject('sahitya-kanika'); // Fetch curriculum for left sidebar

  return <ReadingLayout id={decodedId} data={readingData} subjects={subjects} curriculum={curriculum} />;
}

// ============================================================================
// Layout A: Subject Dashboard (Curriculum Tree + Right Subjects Sidebar)
// ============================================================================
function SubjectDashboard({ 
  id, 
  pageType, 
  subjects, 
  curriculum 
}: { 
  id: string; 
  pageType: 'subject' | 'chapter'; 
  subjects: any[]; 
  curriculum: Chapter[];
}) {
  const currentSubject = subjects.find(s => s.id === id) || subjects[0];
  const chapterTitle = id.includes('গদ্য') ? 'গদ্য' : id.includes('কবিতা') ? 'কবিতা' : 'গদ্য';
  const displayTitle = pageType === 'chapter' ? chapterTitle : currentSubject?.title || 'Subject';

  let treeData = curriculum;
  if (pageType === 'chapter') {
    const chapter = curriculum.find(c => c.id === id || (id.includes('গদ্য') && c.id === 'c1') || (id.includes('কবিতা') && c.id === 'c2'));
    if (chapter) {
      treeData = chapter.topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        topics: topic.subtopics.map((sub: any) => ({
          id: sub.id,
          title: sub.title,
          type: 'topic',
          subtopics: []
        }))
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
            
            <div className="hidden sm:flex items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/academy" className="hover:text-emerald-600 transition-colors">Academy</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/guide" className="hover:text-emerald-600 transition-colors">অষ্টম শ্রেণি</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/guide/sahitya-kanika" className="hover:text-emerald-600 transition-colors">সাহিত্য কণিকা</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-slate-800 dark:text-slate-200">{displayTitle}</span>
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
              Class 8 Sahitya Kanika Guide
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
        <div className="w-full lg:w-[340px] shrink-0">
          <GuideSidebar subjects={subjects} activeId={id} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Layout B: Reading Content (Left Nav Sidebar + Reading Area)
// ============================================================================
function ReadingLayout({ 
  id, 
  data, 
  subjects, 
  curriculum 
}: { 
  id: string; 
  data: any; 
  subjects: any[]; 
  curriculum: Chapter[];
}) {
  
  if (!data) {
    return <div className="p-20 text-center text-xl text-slate-500">Content not found!</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">
      
      {/* Top Header Bar (White) */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>
            
            <div className="hidden sm:flex flex-wrap items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/academy" className="hover:text-emerald-600 transition-colors">Academy</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/guide" className="hover:text-emerald-600 transition-colors">অষ্টম শ্রেণি</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/guide/sahitya-kanika" className="hover:text-emerald-600 transition-colors">সাহিত্য কণিকা</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="hover:text-emerald-600 transition-colors cursor-pointer">গদ্য</span>
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
      <div className="max-w-[1600px] mx-auto flex items-start">
        
        {/* Left Navigation Sidebar */}
        <ContentNavigationSidebar curriculum={curriculum} activeId={id} />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <ReadingArticle data={data} />
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[320px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 xl:bg-slate-50 dark:xl:bg-[#020817] xl:h-[calc(100vh)] xl:sticky top-0 hidden xl:block">
          <ScrollArea className="h-full w-full">
            <div className="p-6">
              <GuideSidebar subjects={subjects} activeId="sahitya-kanika" />
            </div>
          </ScrollArea>
        </div>
        
      </div>
    </div>
  );
}
