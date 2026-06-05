'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// MOCK DATA
const allAchievements = [
  { title: 'Novice Explorer', desc: 'সর্বমোট ১০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 100, icon: '🐣', type: 'COMMON' },
  { title: 'Curious Learner', desc: 'সর্বমোট ৫০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 500, icon: '🎒', type: 'COMMON' },
  { title: 'Rising Star', desc: 'সর্বমোট ১,০০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 1000, icon: '🌟', type: 'RARE' },
  { title: 'Knowledge Seeker', desc: 'টানা ৭ দিন পড়াশোনা করতে হবে।', current: 2, target: 7, icon: '🔥', type: 'COMMON' },
  { title: 'Consistent Student', desc: 'টানা ৩০ দিন পড়াশোনা করতে হবে।', current: 2, target: 30, icon: '📅', type: 'RARE' },
  { title: 'Exam Master', desc: '৫০টি পরীক্ষায় অংশগ্রহণ করতে হবে।', current: 7, target: 50, icon: '📝', type: 'EPIC' },
  { title: 'Flawless Victory', desc: '১টি পরীক্ষায় ১০০% নম্বর পেতে হবে।', current: 0, target: 1, icon: '🏆', type: 'EPIC' },
  { title: 'Subject Specialist', desc: 'যেকোনো ১টি বিষয়ের সবগুলো কনটেন্ট শেষ করতে হবে।', current: 0, target: 1, icon: '📚', type: 'RARE' },
  { title: 'Speed Reader', desc: '১ মিনিটে ১টি কনটেন্ট পড়া শেষ করতে হবে।', current: 1, target: 1, icon: '⏱️', type: 'COMMON' },
  { title: 'Social Butterfly', desc: '১০ জন বন্ধুকে রেফার করতে হবে।', current: 0, target: 10, icon: '👥', type: 'EPIC' },
  { title: 'Top of the Class', desc: 'সাপ্তাহিক লিডারবোর্ডে ১ম স্থান অর্জন করতে হবে।', current: 0, target: 1, icon: '👑', type: 'LEGENDARY' },
  { title: 'Night Owl', desc: 'রাত ১২টার পর ১টি পরীক্ষা দিতে হবে।', current: 1, target: 1, icon: '🦉', type: 'COMMON' },
  { title: 'Early Bird', desc: 'ভোর ৫টায় ১টি পরীক্ষা দিতে হবে।', current: 0, target: 1, icon: '🌅', type: 'RARE' },
  { title: 'Mistake Corrector', desc: 'ভুল হওয়া ১০টি প্রশ্নের সঠিক উত্তর দিতে হবে।', current: 3, target: 10, icon: '🔧', type: 'COMMON' },
  { title: 'Marathon Runner', desc: 'টানা ৩ ঘণ্টা পড়াশোনা করতে হবে।', current: 0, target: 180, icon: '🏃', type: 'EPIC' },
  { title: 'Ultimate Champion', desc: 'সর্বমোট ১,০০,০০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 100000, icon: '💎', type: 'LEGENDARY' },
  { title: 'Subject Matter Expert', desc: '৫টি বিষয়ে ১০০% দক্ষতা অর্জন করতে হবে।', current: 0, target: 5, icon: '🧠', type: 'LEGENDARY' },
  { title: 'Daily Grind', desc: 'টানা ৩৬৫ দিন পড়াশোনা করতে হবে।', current: 2, target: 365, icon: '🗓️', type: 'LEGENDARY' },
];

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];

  const filteredAchievements = activeTab === 'All' 
    ? allAchievements 
    : allAchievements.filter(ach => ach.type === activeTab.toUpperCase());

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
        {filteredAchievements.map((ach, i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex gap-4 items-center h-full">
                {/* Icon Box */}
                <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 relative">
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
                    <h4 className="font-bold text-[15px] text-slate-900 dark:text-slate-100">{ach.title}</h4>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">{ach.current}/{ach.target}</span>
                  </div>
                  
                  <Progress value={(ach.current / ach.target) * 100} className="h-2 bg-slate-100 dark:bg-slate-800 mb-2" />
                  
                  <p className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2">
                    {ach.desc}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
