'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PieChart,
  Bookmark,
  Heart,
  Flag,
  Share2,
  CheckCircle2,
  Eye,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserMistakes } from '@/lib/firebase/student-analytics';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import Link from 'next/link';

export default function MistakeVaultPage() {
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [allMistakeData, setAllMistakeData] = useState<any[]>([]);
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'wrong' | 'correct' | 'skipped'>('wrong');
  
  const [stats, setStats] = useState({ right: 0, wrong: 0, skipped: 0, total: 0, acc: 0 });
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const mistakeDocs = await getUserMistakes(user!.uid);
        
        if (mistakeDocs.length === 0) {
          setLoading(false);
          return;
        }

        const questionIds = mistakeDocs.map(d => d.questionId);
        // Firebase 'in' query supports max 10, so if there are many, we might need chunking,
        // but for now let's chunk if > 30.
        const chunkedIds = [];
        for (let i = 0; i < questionIds.length; i += 30) {
          chunkedIds.push(questionIds.slice(i, i + 30));
        }

        let fetchedQuestions: any[] = [];
        for (const chunk of chunkedIds) {
           const qs = await getQuestionsByIds(chunk);
           fetchedQuestions = [...fetchedQuestions, ...qs];
        }

        let right = 0;
        let wrong = 0;
        let skipped = 0;
        
        const subjectsMap: Record<string, any> = {};

        const combinedData = mistakeDocs.map(md => {
          const q = fetchedQuestions.find(fq => fq.id === md.questionId);
          
          if (md.latestStatus === 'correct') right++;
          else if (md.latestStatus === 'skipped') skipped++;
          else wrong++;

          if (q && q.tags && q.tags.length > 0) {
            const subjName = q.tags[0];
            if (!subjectsMap[subjName]) {
              subjectsMap[subjName] = { 
                name: subjName, 
                progress: 0, 
                mcq: { current: 0, total: 0 },
                cq: { current: 0, total: 0 },
                content: { current: 0, total: 0 },
                started: '' 
              };
            }
            subjectsMap[subjName].mcq.total += 1;
            if (md.latestStatus !== 'correct') {
              subjectsMap[subjName].mcq.current += 1;
            }
          }

          return { ...md, question: q };
        }).filter(d => d.question); // Filter out orphans

        const total = right + wrong + skipped;
        const acc = total > 0 ? (right / total) * 100 : 0;

        setStats({ right, wrong, skipped, total, acc });
        
        const subjArr = Object.values(subjectsMap).map(s => {
           s.progress = s.mcq.total > 0 ? ((s.mcq.total - s.mcq.current) / s.mcq.total) * 100 : 0;
           return s;
        });
        
        setSubjects(subjArr);
        setAllMistakeData(combinedData);
      } catch (error) {
        console.error("Failed to fetch mistakes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading]);

  const toggleSubject = (name: string) => {
    setOpenSubjects(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500">
        Please login to view your mistake vault.
      </div>
    );
  }

  const filteredQuestions = allMistakeData.filter(d => d.latestStatus === filter || (filter === 'wrong' && !d.latestStatus));

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100 relative">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Vault Content */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Top Summary Card */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
              
              {/* Circular Progress & Stats */}
              <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto shrink-0">
                
                {/* SVG Accuracy Circle */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-800" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="#ef4444" strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 45}`} 
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (stats.acc / 100))}`}
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800 dark:text-white">{stats.acc.toFixed(1)}%</span>
                    <span className="text-[10px] font-bold text-slate-400">ACC.</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{stats.right} <span className="font-medium text-slate-400">RIGHT</span></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{stats.wrong} <span className="font-medium text-slate-400">WRONG</span></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{stats.skipped} <span className="font-medium text-slate-400">SKIP</span></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{stats.total} <span className="font-medium text-slate-400">TOTAL</span></span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Practice CTA */}
              <div className="flex-1 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 w-full">
                <div>
                  <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-0.5">Practice Wrong</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic font-medium mb-1.5">Learn from mistakes — review, retry, and improve.</p>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500">💰 Get +5 XP for every wrong question you correct.</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>

            </div>
          </Card>

          {/* Filter Tabs */}
          <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 pb-2 relative">
             <div className="flex items-center gap-4">
               <button 
                  onClick={() => setFilter('wrong')}
                  className={`px-4 py-1.5 font-bold text-xs rounded border ${filter === 'wrong' ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                >
                 Wrong ({stats.wrong})
               </button>
               <button 
                  onClick={() => setFilter('correct')}
                  className={`px-4 py-1.5 font-bold text-xs rounded border ${filter === 'correct' ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                >
                 Right ({stats.right})
               </button>
               <button 
                  onClick={() => setFilter('skipped')}
                  className={`px-4 py-1.5 font-bold text-xs rounded border ${filter === 'skipped' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                >
                 Skipped ({stats.skipped})
               </button>
             </div>
             <div className="absolute -bottom-[1px] w-full border-b border-dashed border-slate-300 dark:border-slate-700 -z-10"></div>
          </div>

          {/* Question Cards Container */}
          <div className="space-y-4 relative pb-10">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No questions found for this filter.
              </div>
            ) : filteredQuestions.map((data, i) => {
              const q = data.question;
              const options = q.options ? Object.entries(q.options).map(([key, val]) => ({
                key, text: `${key.toUpperCase()}   ${val}`, correct: q.correctAnswer?.toLowerCase() === key.toLowerCase()
              })) : [];

              return (
                <Card key={i} className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] mb-3">{q.questionText}</h3>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {q.tags?.map((tag: string, ti: number) => (
                        <span key={ti} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-[10px] rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((opt, oi) => {
                          const isLastPicked = data.lastSelectedAnswer?.toLowerCase() === opt.key.toLowerCase();
                          let borderClass = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400';
                          if (opt.correct) borderClass = 'border-green-500 bg-white dark:bg-slate-900';
                          else if (isLastPicked) borderClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';

                          return (
                            <div 
                              key={oi} 
                              className={`px-4 py-2.5 rounded-md text-[13px] font-medium border flex items-center ${borderClass}`}
                            >
                              {opt.correct ? (
                                <>
                                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mr-3 shadow-sm">
                                    <span className="text-[10px] font-bold">{opt.text.split(' ')[0]}</span>
                                  </div>
                                  <span className="text-slate-800 dark:text-slate-200">{opt.text.substring(opt.text.indexOf(' ') + 1).trim()}</span>
                                </>
                              ) : isLastPicked ? (
                                <>
                                  <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 mr-3 shadow-sm">
                                    <span className="text-[10px] font-bold">{opt.text.split(' ')[0]}</span>
                                  </div>
                                  <span className="text-red-700 dark:text-red-300">{opt.text.substring(opt.text.indexOf(' ') + 1).trim()}</span>
                                </>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-500 font-bold ml-1.5">{opt.text.split(' ')[0]}</span>
                                  <span>{opt.text.substring(opt.text.indexOf(' ') + 1).trim()}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Card Footer Tools */}
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/50">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 cursor-pointer">
                      DES <ChevronDown className="w-3 h-3" />
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:text-slate-600">
                        <Eye className="w-4 h-4" /> 0
                      </div>
                      <PieChart className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                      <Bookmark className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                      <Heart className="w-4 h-4 cursor-pointer hover:text-red-500" />
                      <Flag className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                      <Share2 className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Subjects Report Sidebar */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl sticky top-24 overflow-hidden">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <CardTitle className="text-[13px] font-bold text-slate-900 dark:text-white">Subjects Report</CardTitle>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] lg:h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar p-2 space-y-2">
                {subjects.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">No data available.</div>
                ) : subjects.map((sub, i) => {
                  const isOpen = openSubjects[sub.name];
                  
                  if (isOpen) {
                    return (
                      <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm">
                        <div 
                          className="flex justify-between items-center cursor-pointer mb-4"
                          onClick={() => toggleSubject(sub.name)}
                        >
                          <h4 className="font-bold text-[13px] text-slate-800 dark:text-slate-100">{sub.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5 cursor-pointer hover:bg-slate-200 transition-colors">
                              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span> {sub.mcq.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.mcq.total}</span>
                            </div>
                            <div className="text-[9px] font-semibold text-slate-400 ml-3 uppercase">MCQ</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span> {sub.cq.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.cq.total}</span>
                            </div>
                            <div className="text-[9px] font-semibold text-slate-400 ml-3 uppercase">CQ</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span> {sub.content.current}<span className="text-slate-400 font-medium whitespace-nowrap">/{sub.content.total}</span>
                            </div>
                            <div className="text-[9px] font-semibold text-slate-400 ml-3 uppercase">Content</div>
                          </div>
                        </div>
                        
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden flex">
                          <div className="h-full bg-green-500" style={{ width: `${sub.progress}%` }}></div>
                          <div className="h-full bg-blue-500" style={{ width: '0%' }}></div>
                          <div className="h-full bg-purple-500" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={i} 
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                      onClick={() => toggleSubject(sub.name)}
                    >
                      <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate pr-2">{sub.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}</style>
    </div>
  );
}
