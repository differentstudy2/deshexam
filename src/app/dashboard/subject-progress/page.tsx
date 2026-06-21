'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserSubjectsProgress } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function SubjectProgressPage() {
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      if (user && userProfile) {
        setLoading(true);
        try {
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

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="mb-6 px-4 sm:px-0">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Subjects Report</h1>
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
          subjects.map((sub, i) => {
          const isOpen = openSubjects[sub.name];
          
          if (isOpen) {
            return (
              <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-full justify-between">
                <div>
                  <div 
                    className="flex justify-between items-center cursor-pointer mb-5"
                    onClick={() => toggleSubject(sub.name)}
                  >
                    <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100">{sub.name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-1.5 cursor-pointer hover:bg-slate-200 transition-colors">
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span> {sub.mcq.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.mcq.total}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 ml-3.5 uppercase">MCQ</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span> {sub.cq.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.cq.total}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 ml-3.5 uppercase">CQ</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span> {sub.content.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.content.total}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 ml-3.5 uppercase">Content</div>
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
                  <div className="text-[12px] font-bold text-blue-600 dark:text-blue-500 flex items-center gap-1 cursor-pointer hover:underline">
                    <Link href={`/textbook-solutions/${sub.id}`} className="flex items-center gap-1">
                      View Report <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={i} 
              className="px-5 py-4 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
              onClick={() => toggleSubject(sub.name)}
            >
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-300 truncate pr-2">{sub.name}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[13px] font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-1.5 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
