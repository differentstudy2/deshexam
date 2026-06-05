'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock, Star, Info, Crown, Medal } from 'lucide-react';

const topThree = [
  { rank: 1, name: 'MD Moin Uddin', xp: 80, avatar: 'https://i.pravatar.cc/150?u=1' },
  { rank: 2, name: 'Md. Roy', xp: 0, avatar: 'https://i.pravatar.cc/150?u=2' },
  { rank: 3, name: 'Alamgir Hossain', xp: 0, avatar: 'https://i.pravatar.cc/150?u=3' },
];

const rankList = [
  'Sahed Hasan',
  'MD Abdur Rob',
  'Mohammad Saddam Hossain',
  'SHAZEDUL ISLAM',
  'Anika Roy (অনিকা)',
  'Nupur Sultana',
  'User 10',
  'Md Lutfor Rahman',
  'Asfaq Ahmed Rafi',
  'Md Mahmudul Hasan',
  'Shafi Dulal',
  'Sofikul Islam Badhon',
  'Mokhlesur Rahman',
  'SUMAIYA MUSTAFA',
  'Md sihab',
  'Al Hasanat Jibon Khan',
  'Hridoy Sen',
  'Sojib Ali',
  'Rony B',
  'Lamia Haque',
  'MD Hasan',
  'Robiul Islam',
  'Ruma',
  'Md. Tafsirul Islam V',
  'Asik Ashiq',
  'MD. ABU BAKAR',
  'saif ahmed',
  'Abubakkar Abubakkar',
  'Tofail Talukder Tobin',
  'Muntasirur Rahman',
  'Tamim Sourav',
  'Anis Sikder - Bidyutkosh',
  'Rumpa Ruma',
  'Md Al Mamun Khan',
  'Naaz',
  'Milon Kumar',
  'Sahabuddin Riad',
  'Israt Jahan',
  'Joya Roy',
  'Sonia Akter',
  'MD Hasan Mahmud',
  'Chandrima Mondal',
  'Ad Libit Online Shop',
  'Subita Binte Ha...',
  'AKASH HOSSAIN',
  'Alam',
  'Salam',
  'Md Pabel',
];

export default function LeaderboardPage() {
  return (
    <div className="w-full max-w-3xl mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 px-4 sm:px-0">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Leaderboard</h1>
      </div>

      <div className="space-y-4">
        
        {/* Bronze League Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#f99d1c] to-[#e47900] shadow-md p-6 flex flex-col items-center justify-center text-white min-h-[220px]">
          
          {/* Rules / Tiers Button */}
          <div className="absolute top-4 right-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-xs font-semibold transition-colors">
              <Star className="w-3.5 h-3.5 fill-current" /> Rules / Tiers
            </button>
          </div>
          
          {/* Medals Visual */}
          <div className="flex items-center justify-center gap-2 mb-4 mt-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c98e6a] to-[#804f32] shadow-inner flex items-center justify-center border-4 border-[#ffb142]">
              <Crown className="w-8 h-8 text-[#5c3722]" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner border border-white/30"></div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner border border-white/30"></div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner border border-white/30"></div>
          </div>

          <h2 className="text-2xl font-bold mb-1">Bronze League</h2>
          <div className="flex items-center gap-1 text-xs font-medium text-white/90 mb-4">
            Top 20% advance to next League <Info className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-[#e47900] rounded-full text-xs font-bold shadow-sm">
            <Clock className="w-4 h-4" /> 5 days Remaining
          </div>
          
          <div className="absolute bottom-4 left-4 text-xs font-bold text-white/80">
            Top 20
          </div>
        </div>

        {/* Top 3 List */}
        <div className="space-y-2 mt-4 px-2 sm:px-0">
          
          {/* Rank 1 */}
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 flex items-center p-3 rounded-xl shadow-sm">
            <div className="w-8 flex justify-center text-amber-500">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
            <div className="flex-1 flex items-center gap-3 ml-2">
              <img src={topThree[0].avatar} alt="" className="w-10 h-10 rounded-full border-2 border-amber-400" />
              <span className="font-bold text-[15px] text-slate-800 dark:text-slate-200">{topThree[0].name}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-500 text-[15px]">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {topThree[0].xp} XP
            </div>
          </Card>

          {/* Rank 2 & 3 */}
          {[topThree[1], topThree[2]].map((user, i) => (
            <Card key={i} className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30 flex items-center p-3 rounded-xl shadow-sm">
              <div className="w-8 flex justify-center font-bold text-slate-500 dark:text-slate-400">
                {user.rank}nd
              </div>
              <div className="flex-1 flex items-center gap-3 ml-2">
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                <span className="font-bold text-[14px] text-slate-700 dark:text-slate-300">{user.name}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-500 text-[14px]">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {user.xp} XP
              </div>
            </Card>
          ))}
          
        </div>

        {/* Full Rank List (Ranks 4+) */}
        <div className="px-2 sm:px-0 mt-6 space-y-1">
          {rankList.map((name, i) => {
            const rank = i + 4;
            let rankSuffix = 'th';
            
            return (
              <div key={i} className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                <div className="w-8 flex justify-center text-[13px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {rank}{rankSuffix}
                </div>
                <div className="flex-1 flex items-center gap-3 ml-2">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
                    <img src={`https://i.pravatar.cc/150?u=${rank + 10}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium text-[14px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                    {name}
                  </span>
                </div>
                <div className="font-bold text-[13px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                  0 XP
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
