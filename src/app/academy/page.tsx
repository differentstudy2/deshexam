'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, ChevronRight, ExternalLink, Play, ArrowUp, ArrowDown, Loader2, Circle, CircleDot, ChevronsDown } from 'lucide-react';
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
  subtopics?: SubjectTopic[];
};

type Subject = {
  title: string;
  link?: string;
  badges: any[];
  progressText: string;
  progressValue: number;
  stats?: { mcq: string; cq: string; content: string };
  topics?: SubjectTopic[];
}

function ChapterRow({ chapter }: { chapter: SubjectTopic }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="flex flex-col border-b border-dashed border-slate-200 dark:border-slate-800 last:border-b-0">
      <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
        <Link href={chapter.link} className="flex items-center gap-3 py-3.5 pl-4 pr-2 flex-1 cursor-pointer">
          <CircleDot className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors shrink-0" strokeWidth={2} />
          <span className="text-[14px] text-slate-800 dark:text-slate-200 font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {chapter.title}
          </span>
        </Link>
        {chapter.subtopics && chapter.subtopics.length > 0 && (
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }} 
            className={cn(
              "flex items-center justify-center w-7 h-7 mr-3 rounded-md transition-colors cursor-pointer shrink-0",
              isOpen 
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50" 
                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400"
            )}
          >
            {isOpen ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>
      
      {isOpen && chapter.subtopics && chapter.subtopics.length > 0 && (
        <div className="flex flex-col pb-2">
          {chapter.subtopics.map((topic, i) => (
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

function AcademyCard({ subject }: { subject: Subject }) {
  const [isTopExpanded, setIsTopExpanded] = useState(false);
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);

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
            <ChevronsDown className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <Link href={subject.link || '#'} className="hover:underline transition-colors">
              <h3 className="font-bold text-emerald-600 dark:text-emerald-500 text-[18px] leading-tight">
                {subject.title}
              </h3>
            </Link>
          </div>
          <button 
            onClick={() => setIsTopExpanded(!isTopExpanded)}
            className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0",
            isTopExpanded 
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100" 
              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400"
          )}>
            {isTopExpanded ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Topics List */}
        {isTopExpanded && subject.topics && subject.topics.length > 0 && (
          <div className="flex flex-col mb-6 mt-4 border-t border-slate-100 dark:border-slate-800">
            {subject.topics.map((chapter, i) => (
              <ChapterRow key={i} chapter={chapter} />
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
          allTextbooks = [...allTextbooks, ...tbSnap.docs.map(d => ({id: d.id, ...d.data()}))];
        }

        if (allTextbooks.length === 0) {
           setSubjectsData([]);
           setLoading(false);
           return;
        }

        // Fetch chapters for these textbooks
        const textbookIds = allTextbooks.map(tb => tb.id);
        let allChapters: any[] = [];
        if (textbookIds.length > 0) {
          for (let i = 0; i < textbookIds.length; i += chunkSize) {
            const chunk = textbookIds.slice(i, i + chunkSize);
            const chQ = query(
              collection(db, 'taxonomy_nodes'), 
              where('type', '==', 'chapter'), 
              where('parentId', 'in', chunk)
            );
            const chSnap = await getDocs(chQ);
            allChapters = [...allChapters, ...chSnap.docs.map(d => ({id: d.id, ...d.data()}))];
          }
        }

        // Fetch topics for these chapters
        const chapterIds = allChapters.map(ch => ch.id);
        let allTopics: any[] = [];
        if (chapterIds.length > 0) {
          for (let i = 0; i < chapterIds.length; i += chunkSize) {
            const chunk = chapterIds.slice(i, i + chunkSize);
            const tpQ = query(
              collection(db, 'taxonomy_nodes'), 
              where('type', '==', 'topic'), 
              where('parentId', 'in', chunk)
            );
            const tpSnap = await getDocs(tpQ);
            allTopics = [...allTopics, ...tpSnap.docs.map(d => ({id: d.id, ...d.data()}))];
          }
        }

        // Map data to the UI structure
        const mappedData = allTextbooks.map(tb => {
          const tbChapters = allChapters.filter(c => c.parentId === tb.id);
          
          let chapterItems: SubjectTopic[] = [];
          tbChapters.forEach(ch => {
             const chTopics = allTopics.filter(t => t.parentId === ch.id);
             const subtopics = chTopics.map(tp => ({
                id: tp.id,
                title: tp.title,
                link: `/guide/${tp.fullSlug || tp.id}`
             }));

             chapterItems.push({ 
               id: ch.id,
               title: ch.title, 
               link: `/guide/${ch.fullSlug || ch.id}`,
               subtopics
             });
          });

          return {
            title: tb.title,
            link: `/guide/${tb.fullSlug || tb.id}`,
            badges: [
              { type: 'Practice', icon: true, color: 'slate' },
              { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
            ],
            progressText: 'Progress: 0%',
            progressValue: 0,
            stats: { mcq: '0%', cq: '0%', content: '0%' },
            topics: chapterItems
          };
        });

        setSubjectsData(mappedData);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200">
      
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-lg text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
              <ChevronDown className="w-3 h-3 mx-2 -rotate-90 text-slate-400" />
              <span className="text-slate-900 dark:text-slate-200">{selectedClassTitle}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="h-8 px-4 bg-green-100 text-green-800 border-transparent hover:bg-green-200 hover:text-green-900 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
          >
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2">
              {classesList.map((cls) => (
                <button 
                  key={cls.id} 
                  onClick={() => setSelectedClassId(cls.id)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full shadow-sm transition-colors cursor-pointer",
                    selectedClassId === cls.id 
                      ? "bg-green-600 text-white" 
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {cls.title}
                </button>
              ))}
            </div>

            {/* Section Header */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedClassTitle} Dashboard</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Showing 1 - {filteredSubjectsData.length} of {filteredSubjectsData.length} entries</p>
              </div>
              
              <div className="relative max-w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="Search here" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 w-full text-base placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Grid of Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-12 items-start">
              {filteredSubjectsData.map((subject, idx) => (
                <AcademyCard key={idx} subject={subject} />
              ))}
              {filteredSubjectsData.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No textbooks found for the selected class.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
