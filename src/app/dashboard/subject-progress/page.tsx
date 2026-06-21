'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserSubjectsProgress } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function SubjectProgressPage() {
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'lowest' | 'highest'>('recent');
  const [resolvedClassName, setResolvedClassName] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      if (user && userProfile) {
        setLoading(true);
        try {
          if (userProfile.classId) {
            const classDoc = await getDoc(doc(db, 'taxonomy_nodes', userProfile.classId));
            if (classDoc.exists()) {
              setResolvedClassName(classDoc.data().title);
            }
          }
          const data = await getUserSubjectsProgress(user.uid, userProfile);
          setSubjects(data);
        } catch (error) {
          console.error("Error fetching subject progress:", error);
        } finally {
          setLoading(false);
        }
      } else if (!user) {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, [user, userProfile]);

  const toggleSubject = (name: string) => {
    setOpenSubjects(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const sortedSubjects = [...subjects].sort((a, b) => {
    if (sortBy === 'lowest') return a.progress - b.progress;
    if (sortBy === 'highest') return b.progress - a.progress;
    // For 'recent', prioritize started subjects, then by progress
    if (a.started && !b.started) return -1;
    if (!a.started && b.started) return 1;
    return b.progress - a.progress;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="mb-6 px-4 sm:px-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex flex-col sm:flex-row sm:items-center">
            <span>Subjects Report</span>
            {resolvedClassName && <span className="text-slate-500 font-medium sm:ml-2 text-[13px] sm:text-[15px] mt-0.5 sm:mt-0">({resolvedClassName})</span>}
        </h1>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 sm:py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-auto"
        >
          <option value="recent">Recently Started</option>
          <option value="lowest">Lowest Progress</option>
          <option value="highest">Highest Progress</option>
        </select>
      </div>

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-0">
        {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm h-20 flex items-center justify-between">
                   <Skeleton className="h-5 w-1/2" />
                   <Skeleton className="h-6 w-16" />
                </div>
            ))
        ) : subjects.length === 0 ? (
             <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                <p>No subjects found for your class category.</p>
                <Link href="/textbook-solutions" className="text-blue-600 hover:underline mt-2 inline-block">Explore Subjects</Link>
             </div>
        ) : (
          sortedSubjects.map((sub, i) => {
          const isOpen = openSubjects[sub.name];
          
          let badge = null;
          if (sub.progress > 0 && sub.progress < 50) {
            badge = <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-200 dark:border-red-500/30">Needs Revision</span>;
          } else if (sub.progress === 0) {
            badge = <span className="text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold border border-slate-200 dark:border-slate-700">Not Started</span>;
          } else if (sub.progress === 100) {
            badge = <span className="text-[10px] bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full font-bold border border-green-200 dark:border-green-500/30">Completed</span>;
          }
          
          if (isOpen) {
            return (
              <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-full justify-between">
                <div>
                  <div 
                    className="flex justify-between items-start sm:items-center cursor-pointer mb-5"
                    onClick={() => toggleSubject(sub.name)}
                  >
                    <div className="flex flex-col gap-1.5 pr-2 w-full">
                        <h4 className="font-bold text-[15px] sm:text-[16px] text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{sub.name}</h4>
                        <div className="mt-0.5 flex items-start">{badge}</div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2 mt-1 sm:mt-0">
                      <span className="text-[13px] sm:text-[14px] font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1.5 sm:p-2 cursor-pointer hover:bg-slate-100 transition-colors">
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-0 sm:bg-transparent rounded-lg flex-1 sm:flex-none">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span> {sub.mcq.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.mcq.total}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 sm:ml-3.5 uppercase">MCQ</div>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-0 sm:bg-transparent rounded-lg flex-1 sm:flex-none">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span> {sub.cq.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.cq.total}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 sm:ml-3.5 uppercase">CQ</div>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-0 sm:bg-transparent rounded-lg flex-1 sm:flex-none">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span> {sub.content.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.content.total}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 sm:ml-3.5 uppercase">Content</div>
                    </div>
                  </div>
                  
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-5 overflow-hidden flex">
                    <div className="h-full bg-green-500" style={{ width: '1%' }}></div>
                    <div className="h-full bg-blue-500" style={{ width: '0%' }}></div>
                    <div className="h-full bg-purple-500" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {sub.started ? `Started: ${sub.started}` : 'Not started'}
                  </div>
                  <div className="flex items-center gap-3">
                      <Link href={`/textbook-solutions/${sub.id}`} className="text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                        Report
                      </Link>
                      <Link href={`/textbook-solutions/${sub.id}`} className="text-[12px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                        Resume <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={i} 
              className="px-4 sm:px-5 py-4 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
              onClick={() => toggleSubject(sub.name)}
            >
              <div className="flex flex-col pr-3 w-full">
                 <span className="text-[14px] sm:text-[15px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">{sub.name}</span>
                 <div className="mt-1.5 flex items-start">{badge}</div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                <span className="text-[13px] sm:text-[14px] font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1.5 sm:p-2 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
