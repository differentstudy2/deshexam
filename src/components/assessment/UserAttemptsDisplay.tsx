'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserExamAttempts } from '@/lib/firebase/student-analytics';
import { getGrade } from '@/lib/utils';
import { Loader2, History, CheckCircle2, XCircle, Target, Award, Info } from 'lucide-react';
import { format } from 'date-fns';

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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Your Previous Attempts</h2>
        <span className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
          {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
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

          return (
            <div key={attempt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="mb-3 sm:mb-0">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">ATTEMPT #{attempts.length - index}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{date}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Score</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{score.toFixed(2)} <span className="text-xs text-slate-400">/ {total}</span></p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Grade</p>
                  <p className={`text-lg font-bold flex items-center justify-center gap-1 ${gradeColor}`}>
                    <Award className="w-3.5 h-3.5" /> {grade}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Accuracy</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <Target className="w-3.5 h-3.5" /> {accuracy}%
                  </p>
                </div>
                
                <div className="text-center hidden sm:block">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Details</p>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-0.5" /> {scoreData.correct || 0}</span>
                    <span className="flex items-center text-red-500 dark:text-red-400"><XCircle className="w-3 h-3 mr-0.5" /> {scoreData.wrong || 0}</span>
                  </div>
                </div>
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
