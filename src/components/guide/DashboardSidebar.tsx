import React from 'react';
import Link from 'next/link';
import { Trophy, Users, Calendar, ArrowRight, TrendingUp } from 'lucide-react';

export function DashboardSidebar({ userProfile }: { userProfile: any }) {
  // Use userProfile data, or fallback to mock data
  const rank = userProfile?.rank || 142;
  const xp = userProfile?.xp || 12450;
  
  return (
    <div className="w-full space-y-6">
      {/* Leaderboard Rank Widget */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">National Rank</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">#{rank}</h3>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" /> Top 5%
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{xp} XP</p>
        </div>
      </div>

      {/* Challenge Friends */}
      <div className="bg-gradient-to-br from-[#00a651] to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
        <Users className="w-8 h-8 text-emerald-200 mb-4 relative z-10" />
        <h3 className="text-lg font-bold mb-2 relative z-10">Challenge Friends</h3>
        <p className="text-emerald-100/80 text-sm mb-4 leading-relaxed relative z-10">Earn 500 XP and climb the leaderboard faster by inviting friends.</p>
        <button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-bold py-2.5 rounded-xl transition-colors shadow-sm text-sm relative z-10">
          Invite Now
        </button>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> Upcoming
          </h3>
          <Link href="#" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Weekly Mock Test', days: 2, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { name: 'Physics Unit 3', days: 5, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { name: 'Board Finals', days: 45, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
          ].map((exam, i) => (
            <div key={i} className={`p-3 rounded-xl flex items-center justify-between ${exam.bg} border border-transparent hover:border-${exam.color.split('-')[1]}-200 transition-colors cursor-pointer group`}>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{exam.name}</p>
                <p className={`text-xs font-medium ${exam.color}`}>In {exam.days} days</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
