'use client';

import React, { useEffect, useState } from 'react';
import { getTopScorersForAssessment } from '@/lib/firebase/student-analytics';
import { getUserProfile } from '@/lib/firebase/firestore';
import { getGrade } from '@/lib/utils';
import { Trophy, Medal, Star, Target, Loader2 } from 'lucide-react';

interface TopScorersWidgetProps {
  assessmentId: string;
}

interface ScorerData {
  uid: string;
  name: string;
  avatar: string;
  score: number;
  accuracy: number;
  percentage: number;
}

export function TopScorersWidget({ assessmentId }: TopScorersWidgetProps) {
  const [scorers, setScorers] = useState<ScorerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScorers() {
      try {
        const topAttempts = await getTopScorersForAssessment(assessmentId, 5);
        if (!topAttempts || topAttempts.length === 0) {
          setScorers([]);
          return;
        }

        const scorerPromises = topAttempts.map(async (attempt) => {
          const uid = attempt.userId;
          let name = 'Anonymous Student';
          let avatar = '';
          try {
            const profile = await getUserProfile(uid);
            if (profile) {
              name = profile.displayName || profile.name || 'Anonymous Student';
              avatar = profile.photoURL || profile.avatar || '';
            }
          } catch (e) {
            console.error(`Failed to fetch profile for ${uid}`, e);
          }
          
          const scoreData = attempt.scoreData || {};
          const score = scoreData.score || 0;
          const total = scoreData.total || Math.max(1, score); // Fallback to avoid division by zero or inflated percentage if total is missing
          const percentage = total > 0 ? (score / total) * 100 : 0;
          const accuracy = scoreData.correct + scoreData.wrong > 0 
            ? Math.round((scoreData.correct / (scoreData.correct + scoreData.wrong)) * 100) 
            : 0;

          return { uid, name, avatar, score, accuracy, percentage };
        });

        const resolvedScorers = await Promise.all(scorerPromises);
        setScorers(resolvedScorers);
      } catch (error) {
        console.error("Error fetching top scorers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchScorers();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5 text-center transition-colors">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading Top Scorers...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <Trophy className="w-16 h-16 text-white" />
        </div>
        <h3 className="text-white font-bold flex items-center gap-2 relative z-10">
          <Trophy className="w-4 h-4 text-amber-100" /> Top Scorers
        </h3>
        <p className="text-amber-100 text-xs mt-1 relative z-10">All-time highest scores for this test</p>
      </div>

      <div className="p-2 space-y-1">
        {scorers.length === 0 ? (
          <div className="text-center p-6 text-slate-500">
            <Star className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No scores yet!</p>
            <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Take the test and be the first on the leaderboard.</p>
          </div>
        ) : (
          scorers.map((scorer, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;
            const { grade, color: gradeColor } = getGrade(scorer.percentage);
            
            return (
              <div key={scorer.uid} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isFirst ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <div className="w-6 h-6 shrink-0 flex items-center justify-center font-bold text-xs rounded-full">
                  {isFirst ? <Medal className="w-6 h-6 text-amber-500" /> : 
                   isSecond ? <Medal className="w-5 h-5 text-slate-400" /> : 
                   isThird ? <Medal className="w-5 h-5 text-orange-400" /> : 
                   <span className="text-slate-400">{index + 1}</span>}
                </div>
                
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                  {scorer.avatar ? (
                    <img src={scorer.avatar} alt={scorer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xs font-bold uppercase">
                      {scorer.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{scorer.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {scorer.accuracy}% Acc</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className={`font-bold ${gradeColor}`}>{grade} Grade</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-base font-extrabold ${isFirst ? 'text-amber-600 dark:text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {scorer.score.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
