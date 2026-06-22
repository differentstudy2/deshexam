'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, ChevronRight, ExternalLink, Play, ArrowUp, ArrowDown, Loader2, Circle, CircleDot, ChevronsDown, BookOpen, GraduationCap, BookMarked, Lightbulb, Target, Activity, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getTaxonomyNodesByType, getTaxonomyNodeById, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

type SubjectTopic = {
  id: string;
  title: string;
  link: string;
};

type Subject = {
  id: string;
  title: string;
  link: string;
  badges: any[];
  progressText: string;
  progressValue: number;
  stats?: { mcq: string; cq: string; content: string };
}

const sortTaxonomyNodes = (nodes: any[]) => {
  const extractNumber = (title: string): number => {
    const match = title?.match(/[0-9০-৯]+/);
    if (!match) return 0;
    const bengaliToEnglish: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    const numStr = match[0].replace(/[০-৯]/g, (c) => bengaliToEnglish[c]);
    return parseInt(numStr, 10);
  };

  return nodes.sort((a, b) => {
    const numA = extractNumber(a.title);
    const numB = extractNumber(b.title);
    if (numA !== numB && (numA > 0 || numB > 0)) return numA - numB;
    if (typeof a.orderIndex === 'number' && typeof b.orderIndex === 'number' && a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
    return (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' });
  });
};

function ChapterRow({ chapterId, chapterTitle, chapterLink }: { chapterId: string, chapterTitle: string, chapterLink: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<SubjectTopic[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const toggleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen && !hasFetched) {
      setIsLoading(true);
      try {
        const tpQ = query(
          collection(db, 'taxonomy_nodes'), 
          where('type', '==', 'topic'), 
          where('parentId', '==', chapterId)
        );
        const tpSnap = await getDocs(tpQ);
        let fetchedTopics = tpSnap.docs.map((d: any) => ({id: d.id, ...d.data()}));
        fetchedTopics = sortTaxonomyNodes(fetchedTopics);
        
        setTopics(fetchedTopics.map((t: any) => ({
          id: t.id,
          title: t.title,
          link: `/guide/${t.fullSlug || t.id}`
        })));
        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="flex flex-col border-b border-dashed border-slate-200 dark:border-slate-800 last:border-b-0">
      <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
        <Link href={chapterLink} className="flex items-center gap-3 py-3.5 pl-4 pr-2 flex-1 cursor-pointer">
          <CircleDot className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors shrink-0" strokeWidth={2} />
          <span className="text-[14px] text-slate-800 dark:text-slate-200 font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {chapterTitle}
          </span>
        </Link>
        <div 
          onClick={toggleOpen} 
          className={cn(
            "flex items-center justify-center w-7 h-7 mr-3 rounded-md transition-colors cursor-pointer shrink-0",
            isOpen 
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50" 
              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400"
          )}
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isOpen ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
        </div>
      </div>
      
      {isOpen && (
        <div className="flex flex-col pb-2">
          {topics.length === 0 && !isLoading && (
            <div className="pl-12 py-2 text-[13px] text-slate-400">No topics found.</div>
          )}
          {topics.map((topic, i) => (
            <Link 
              key={i} 
              href={topic.link} 
              className="flex items-center gap-3 py-2.5 pl-12 pr-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group/topic"
            >
              <Circle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover/topic:text-blue-400 transition-colors shrink-0" strokeWidth={2.5} />
              <span className="text-[14px] text-slate-600 dark:text-slate-400 font-medium group-hover/topic:text-blue-600 dark:group-hover/topic:text-blue-400 transition-colors">
                {topic.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AcademyCard({ subject, index }: { subject: Subject, index: number }) {
  const [isTopExpanded, setIsTopExpanded] = useState(false);
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chapters, setChapters] = useState<SubjectTopic[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const colorThemes = [
    { text: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50' },
    { text: 'text-blue-600 dark:text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/50' },
    { text: 'text-purple-600 dark:text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/50' },
    { text: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/50' },
    { text: 'text-rose-600 dark:text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400', hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/50' },
    { text: 'text-indigo-600 dark:text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400', hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50' },
  ];
  const theme = colorThemes[index % colorThemes.length];

  const toggleTopExpanded = async () => {
    if (!isTopExpanded && !hasFetched && subject.id) {
      setIsLoading(true);
      try {
        const chQ = query(
          collection(db, 'taxonomy_nodes'), 
          where('type', '==', 'chapter'), 
          where('parentId', '==', subject.id)
        );
        const chSnap = await getDocs(chQ);
        let fetchedChapters = chSnap.docs.map((d: any) => ({id: d.id, ...d.data()}));
        fetchedChapters = sortTaxonomyNodes(fetchedChapters);
        
        setChapters(fetchedChapters.map((c: any) => ({
          id: c.id,
          title: c.title,
          link: `/guide/${c.fullSlug || c.id}`
        })));
        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching chapters:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsTopExpanded(!isTopExpanded);
  };

  // Parse progress text to use || instead of |
  const progressTextFormatted = subject.progressText.replace(' | ', ' || ');

  return (
    <Card className={cn(
      "relative bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow flex flex-col",
      subject.progressValue > 0 && "theme-border-left"
    )}>
      <CardContent className="p-5 flex flex-col">
        
        {/* Card Header (Title & Right Icon) */}
        <div className="flex justify-between items-start gap-4 mb-2">
          <div className="flex items-center gap-2.5">
            <ChevronsDown className={cn("w-5 h-5", theme.text)} />
            <Link href={subject.link || '#'} className="hover:underline transition-colors">
              <h3 className={cn("font-bold text-[18px] leading-tight", theme.text)}>
                {subject.title}
              </h3>
            </Link>
          </div>
          <button 
            onClick={toggleTopExpanded}
            className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0",
            isTopExpanded 
              ? cn(theme.bg, theme.hoverBg)
              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400"
          )}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isTopExpanded ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
          </button>
        </div>

        {/* Expanded Topics List */}
        {isTopExpanded && (
          <div className="flex flex-col mb-6 mt-4 border-t border-slate-100 dark:border-slate-800">
            {chapters.length === 0 && !isLoading && (
              <div className="py-4 text-center text-sm text-slate-400">No chapters found.</div>
            )}
            {chapters.map((chapter, i) => (
              <ChapterRow key={i} chapterId={chapter.id} chapterTitle={chapter.title} chapterLink={chapter.link} />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 items-center mb-6">
          {subject.badges.map((badge, bIdx) => {
            if (badge.icon) {
              return (
                <span key={bIdx} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-medium rounded-md">
                  <Play className="w-3 h-3 fill-slate-700 text-slate-700 dark:fill-slate-300 dark:text-slate-300" />
                  {badge.type}
                </span>
              )
            }
            if (badge.isAction) {
              return (
                 <span key={bIdx} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-medium rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                   {badge.type}
                 </span>
              )
            }
            if (badge.color === 'blue') {
                return (
                  <span key={bIdx} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#0066ff] dark:text-blue-400 text-[13px] font-semibold rounded-md">
                    <span className="text-slate-700 dark:text-slate-300">{badge.type}</span> {badge.count}
                  </span>
                )
            }
            return (
              <span key={bIdx} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-medium rounded-md">
                {badge.type} <span className="font-semibold">{badge.count}</span>
              </span>
            )
          })}
        </div>

        {/* Progress Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{progressTextFormatted}</p>
              <button 
                onClick={() => setIsBottomExpanded(!isBottomExpanded)}
                className="flex items-center justify-center w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-400 shrink-0"
              >
                {isBottomExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
          </div>
          {subject.progressValue > 0 ? (
                <Progress value={subject.progressValue} className="h-1.5 bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-[#00a651]" />
          ) : (
                <Progress value={0} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
          )}

          {/* Expanded Stats */}
          {isBottomExpanded && subject.stats && (
            <div className="flex items-center justify-between mt-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              <span>MCQ: {subject.stats.mcq}</span>
              <span>CQ: {subject.stats.cq}</span>
              <span>Content: {subject.stats.content}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AcademyPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const [classesList, setClassesList] = useState<TaxonomyNode[]>([]);
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch only necessary Classes (Optimized Read Counts)
  useEffect(() => {
    if (authLoading) return;
    const fetchClasses = async () => {
      setLoading(true);
      try {
        let fetchedClasses: TaxonomyNode[] = [];
        if (userProfile?.classId) {
          // Only fetch 1 document if user is onboarded!
          const userClass = await getTaxonomyNodeById(userProfile.classId);
          if (userClass) {
            fetchedClasses = [userClass];
          }
        } else {
          // Fetch only 'class' nodes, not the entire database
          fetchedClasses = await getTaxonomyNodesByType('academic', 'class');
        }
        
        setClassesList(fetchedClasses);
        if (fetchedClasses.length > 0 && !selectedClassId) {
          setSelectedClassId(fetchedClasses[0].id);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [authLoading, userProfile]);

  // 2. Fetch Textbooks & Chapters dynamically ONLY for the selected Class
  useEffect(() => {
    if (!selectedClassId) return;
    const fetchClassData = async () => {
      setLoading(true);
      try {
        // Find subjects for this class
        const subjectsQ = query(
          collection(db, 'taxonomy_nodes'), 
          where('parentId', '==', selectedClassId), 
          where('type', '==', 'subject')
        );
        const subjectsSnap = await getDocs(subjectsQ);
        const subjectIds = subjectsSnap.docs.map(d => d.id);
        
        let parentIdsToSearch = [selectedClassId];
        if (subjectIds.length > 0) {
           parentIdsToSearch = [...parentIdsToSearch, ...subjectIds];
        }

        // Firestore 'in' query allows up to 30 items. Chunking for safety.
        let allTextbooks: any[] = [];
        const chunkSize = 30;
        for (let i = 0; i < parentIdsToSearch.length; i += chunkSize) {
          const chunk = parentIdsToSearch.slice(i, i + chunkSize);
          const tbQ = query(
            collection(db, 'taxonomy_nodes'), 
            where('type', '==', 'textbook'), 
            where('parentId', 'in', chunk)
          );
          const tbSnap = await getDocs(tbQ);
          allTextbooks = [...allTextbooks, ...tbSnap.docs.map((d: any) => ({id: d.id, ...d.data()}))];
        }

        if (allTextbooks.length === 0) {
           setSubjectsData([]);
           setLoading(false);
           return;
        }

        // Map data to the UI structure
        const mappedData = allTextbooks.map(tb => {
          return {
            id: tb.id,
            title: tb.title,
            link: `/guide/${tb.fullSlug || tb.id}`,
            badges: [
              { type: 'Practice', icon: true, color: 'slate' },
              { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
            ],
            progressText: 'Progress: 0%',
            progressValue: 0,
            stats: { mcq: '0%', cq: '0%', content: '0%' }
          };
        });

        setSubjectsData(sortTaxonomyNodes(mappedData));

      } catch (error) {
        console.error("Error fetching class specific data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [selectedClassId]);

  let filteredSubjectsData = subjectsData;
  if (searchQuery) {
    filteredSubjectsData = filteredSubjectsData.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  const selectedClass = classesList.find(c => c.id === selectedClassId);
  const selectedClassTitle = selectedClass ? selectedClass.title : 'Academy Subject';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200">
      

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-900 text-white shadow-xl mb-10 border border-emerald-500/30">
              {/* Background Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60"></div>
              <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-teal-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -left-32 w-[25rem] h-[25rem] bg-emerald-400/20 rounded-full blur-3xl"></div>
              
              <div className="relative p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-2xl space-y-4">
                  {/* Greeting & Badge Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {userProfile?.displayName ? (
                      <div className="text-emerald-100 font-semibold text-base border-r border-white/20 pr-3">
                        Welcome back, {userProfile.displayName}!
                      </div>
                    ) : null}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-md shadow-inner">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                      Interactive Learning Platform
                    </div>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                    Master Your Subjects with <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-100">DeshExam Academy</span>
                  </h2>
                  
                  <p className="text-emerald-50/90 text-base max-w-xl leading-relaxed font-medium">
                    Access comprehensive textbooks, interactive chapters, and curated practice materials specifically tailored for {selectedClassTitle}.
                  </p>
                  
                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-lg hover:bg-white/20 transition-colors">
                      <div className="bg-emerald-400/20 p-2 rounded-lg border border-white/10">
                        <BookOpen className="w-5 h-5 text-emerald-100" />
                      </div>
                      <div>
                        <div className="text-2xl font-black">{filteredSubjectsData.length}</div>
                        <div className="text-[10px] text-emerald-100/80 uppercase tracking-wider font-bold">Textbooks</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-lg hover:bg-white/20 transition-colors">
                      <div className="bg-blue-400/20 p-2 rounded-lg border border-white/10">
                        <Target className="w-5 h-5 text-blue-100" />
                      </div>
                      <div>
                        <div className="text-2xl font-black">1.5k+</div>
                        <div className="text-[10px] text-blue-100/80 uppercase tracking-wider font-bold">Questions</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-lg hover:bg-white/20 transition-colors">
                      <div className="bg-purple-400/20 p-2 rounded-lg border border-white/10">
                        <Activity className="w-5 h-5 text-purple-100" />
                      </div>
                      <div>
                        <div className="text-2xl font-black">50+</div>
                        <div className="text-[10px] text-purple-100/80 uppercase tracking-wider font-bold">Mock Tests</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-1">
                    <button className="flex items-center gap-2 bg-white text-emerald-900 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-colors shadow-lg group">
                      Resume Learning
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="flex flex-col w-full max-w-[200px] space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-emerald-100">
                        <span>Overall Progress</span>
                        <span>12%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-300 w-[12%] rounded-full shadow-[0_0_10px_rgba(110,231,183,0.5)]"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden lg:flex relative shrink-0 items-center justify-center">
                  <div className="w-56 h-56 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/30 to-teal-300/30 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
                      <GraduationCap className="w-24 h-24 text-emerald-50 drop-shadow-xl" />
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute top-2 -left-2 bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 shadow-2xl animate-[bounce_3s_ease-in-out_infinite]">
                      <BookMarked className="w-6 h-6 text-emerald-200" />
                    </div>
                    <div className="absolute bottom-6 -right-2 bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 shadow-2xl animate-[bounce_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
                      <Lightbulb className="w-6 h-6 text-yellow-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Control Bar Inside Hero */}
              <div className="relative border-t border-white/10 bg-black/10 backdrop-blur-md p-4 md:px-8 lg:px-10">
                <div className="flex flex-col space-y-4">
                  {/* Filter Tags */}
                  <div className="flex flex-wrap gap-2">
                    {classesList.map((cls) => (
                      <button 
                        key={cls.id} 
                        onClick={() => setSelectedClassId(cls.id)}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-colors cursor-pointer border",
                          selectedClassId === cls.id 
                            ? "bg-white text-emerald-800 border-white" 
                            : "bg-white/10 text-emerald-50 hover:bg-white/20 border-white/20"
                        )}
                      >
                        {cls.title}
                      </button>
                    ))}
                  </div>

                  {/* Section Header & Search */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedClassTitle} Dashboard</h2>
                      <p className="text-sm text-emerald-100/80 mt-1">Showing 1 - {filteredSubjectsData.length} of {filteredSubjectsData.length} entries</p>
                    </div>
                    
                    <div className="relative w-full md:max-w-md bg-white/10 backdrop-blur-md rounded-xl shadow-inner border border-white/20">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-100/70" />
                      <Input 
                        type="text" 
                        placeholder="Search here" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 w-full text-base text-white placeholder:text-emerald-100/70"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-12 items-start">
              {filteredSubjectsData.map((subject, idx) => (
                <AcademyCard key={idx} subject={subject} index={idx} />
              ))}
              {filteredSubjectsData.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No textbooks found for the selected class.
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
