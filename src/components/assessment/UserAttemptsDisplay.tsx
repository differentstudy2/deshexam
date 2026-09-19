'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserExamAttempts } from '@/lib/firebase/student-analytics';
import { getGrade } from '@/lib/utils';
import { Loader2, History, CheckCircle2, XCircle, Target, Award, Info, Clock, ArrowRight, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserAttemptsDisplayProps {
  assessmentId: string;
}

export function UserAttemptsDisplay({ assessmentId }: UserAttemptsDisplayProps) {
  const { user, loading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    getUserExamAttempts(user.uid, assessmentId)
      .then((data) => {
        setAttempts(data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [user, authLoading, assessmentId]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse mt-8">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
        <span className="text-slate-500 text-sm">Loading previous attempts...</span>
      </div>
    );
  }

  if (!user || attempts.length === 0) {
    return null;
  }

  const maxScore = Math.max(...attempts.map(a => a.scoreData?.score || 0));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-100/50 dark:border-blue-900/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
          <History className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Your Previous Attempts</h2>
        <span className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(attempts.length)} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
        </span>
      </div>
      
      <div className="p-4 space-y-3">
        {attempts.map((attempt, index) => {
          const scoreData = attempt.scoreData || {};
          const total = scoreData.total || 1;
          const score = scoreData.score || 0;
          const accuracy = scoreData.correct + scoreData.wrong > 0 
            ? Math.round((scoreData.correct / (scoreData.correct + scoreData.wrong)) * 100) 
            : 0;
            
          const percentage = total > 0 ? (score / total) * 100 : 0;
          const { grade, color: gradeColor } = getGrade(percentage);
            
          const date = attempt.createdAt?.seconds 
            ? format(new Date(attempt.createdAt.seconds * 1000), 'MMM dd, yyyy • hh:mm a') 
            : 'Unknown Date';

          const isPersonalBest = score === maxScore && score > 0;
          const timeTakenStr = attempt.timeTaken 
            ? (attempt.timeTaken < 60 ? `${attempt.timeTaken}s` : `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s`)
            : '--';

          return (
            <div key={attempt.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border ${isPersonalBest ? 'border-amber-300 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20'} hover:shadow-md transition-all duration-300 relative overflow-hidden group`}>
              {isPersonalBest && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> PERSONAL BEST
                </div>
              )}
              
              <div className="mb-4 md:mb-0 md:w-1/4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">ATTEMPT #{attempts.length - index}</p>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{date}</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time: {timeTakenStr}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-between md:justify-center gap-4 sm:gap-8 md:w-2/4">
                <div className="text-center">
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1">Score</p>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400">{score.toFixed(2)} <span className="text-xs font-semibold text-slate-400">/ {total}</span></p>
                </div>
                
                <div className="text-center">
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1">Grade</p>
                  <p className={`text-xl font-black flex items-center justify-center gap-1 ${gradeColor}`}>
                    <Award className="w-4 h-4" /> {grade}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1">Accuracy</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <Target className="w-4 h-4" /> {accuracy}%
                  </p>
                </div>
                
                <div className="text-center hidden sm:block">
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1">Details</p>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold bg-white dark:bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {scoreData.correct || 0}</span>
                    <span className="flex items-center text-red-500 dark:text-red-400"><XCircle className="w-3.5 h-3.5 mr-1" /> {scoreData.wrong || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 md:w-1/4 flex md:justify-end">
                <Link href={`/content/${assessmentId}/results?submissionId=${attempt.id}`} className="w-full md:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-800 shadow-sm">
                  View Report <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grading Scale Info */}
      <div className="px-4 pb-4">
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/20 text-sm">
          <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <Info className="w-4 h-4 text-blue-500" />
            View Grading Scale
          </summary>
          <div className="p-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-100 dark:border-slate-800 mx-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-emerald-500">A+</span> <span className="text-slate-500">90% - 100%</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-emerald-500">A</span> <span className="text-slate-500">80% - 89%</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-blue-500">B+</span> <span className="text-slate-500">70% - 79%</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-blue-500">B</span> <span className="text-slate-500">60% - 69%</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-amber-500">C+</span> <span className="text-slate-500">50% - 59%</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-amber-500">C</span> <span className="text-slate-500">40% - 49%</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-orange-500">D</span> <span className="text-slate-500">33% - 39%</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-red-500">F</span> <span className="text-slate-500">Below 33%</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
