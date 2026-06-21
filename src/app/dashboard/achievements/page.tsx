'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle2 } from 'lucide-react';

export default function AchievementsPage() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];

  const filteredAchievements = activeTab === 'All' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(ach => ach.type === activeTab.toUpperCase());

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="mb-6 px-2 sm:px-0">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Achievements</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Track your progress and earn rewards.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 px-2 sm:px-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 shadow-sm'
                : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Achievements Grid (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-0">
        {filteredAchievements.map((ach, i) => {
          const unlocked = userProfile?.achievements?.includes(ach.id);
          
          // Determine current progress based on metric
          let rawCurrent = 0;
          if (ach.metric === 'xp') {
            rawCurrent = userProfile?.xp || 0;
          } 
          // Future metrics can be handled here:
          // else if (ach.metric === 'exams_taken') { rawCurrent = userProfile?.stats?.examsTaken || 0; }
          
          const current = unlocked ? ach.target : Math.min(rawCurrent, ach.target);
          const progressPct = (current / ach.target) * 100;

          // Format the unit based on metric
          let unitText = '';
          if (ach.metric === 'xp') unitText = ' XP';
          else if (ach.metric === 'streak_days') unitText = ' Days';
          else if (ach.metric === 'exams_taken' || ach.metric === 'perfect_exams') unitText = ' Exams';
          else if (ach.metric === 'study_hours') unitText = ' Mins';

          return (
            <Card key={i} className={`bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl transition-all ${unlocked ? 'border-amber-200 dark:border-amber-800 ring-1 ring-amber-100 dark:ring-amber-900/30' : 'hover:border-slate-300 dark:hover:border-slate-700 opacity-70 hover:opacity-100'}`}>
              <CardContent className="p-6">
                <div className="flex gap-4 items-center h-full">
                  {/* Icon Box */}
                  <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 relative border-2 ${unlocked ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                    <span className="text-3xl leading-none">{ach.icon}</span>
                    
                    {/* Rarity Tag */}
                    <div className={`text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm absolute -bottom-2.5 shadow-sm uppercase tracking-wider
                      ${ach.type === 'COMMON' ? 'bg-slate-600' : 
                        ach.type === 'RARE' ? 'bg-blue-500' : 
                        ach.type === 'EPIC' ? 'bg-purple-500' : 
                        'bg-orange-500'}`}
                    >
                      {ach.type}
                    </div>
                  </div>
                  
                  {/* Content Details */}
                  <div className="flex-1 pt-1 ml-2">
                    <div className="flex justify-between items-end mb-2">
                      <h4 className="font-bold text-[15px] text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {ach.title}
                        {unlocked && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">{current}/{ach.target}{unitText}</span>
                    </div>
                    
                    <Progress value={progressPct} className={`h-2 mb-2 ${unlocked ? 'bg-green-100 [&>div]:bg-green-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
                    
                    <p className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2">
                      {ach.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Empty State if filter yields no results */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-20">
          <span className="text-4xl">📭</span>
          <h3 className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-300">No achievements found</h3>
          <p className="text-sm text-slate-500 mt-1">Try selecting a different tab.</p>
        </div>
      )}

    </div>
  );
}
