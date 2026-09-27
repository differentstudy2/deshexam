import React from 'react';
import Link from 'next/link';
import { PlayCircle, Target, Flame, ChevronRight, TrendingDown, BookOpen } from 'lucide-react';

// 1. Continue Learning Card
export function ContinueLearningWidget({ userProfile }: { userProfile: any }) {
  // Use actual data or fallback
  const progress = 68;
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 sm:gap-8 group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/30 transition-colors duration-700"></div>
      
      <div className="shrink-0 relative z-10 w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-white/50" />
      </div>

      <div className="flex-1 w-full relative z-10 text-center sm:text-left">
        <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full mb-3 border border-emerald-500/20">
          Continue Learning
        </span>
        <h3 className="text-2xl font-bold text-white mb-2">Physics Fundamentals</h3>
        <p className="text-slate-400 text-sm mb-6">Chapter 4: Work, Energy and Power</p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
              <span>Overall Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <Link href="#" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
            <PlayCircle className="w-4 h-4" /> Resume
          </Link>
        </div>
      </div>
    </div>
  );
}

// 2. Daily Goal Widget
export function DailyGoalWidget({ userProfile }: { userProfile: any }) {
  const streak = userProfile?.currentStreak || 4;
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group h-full">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
            <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-emerald-500" strokeDasharray="60, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Daily Goal</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">2 / 3 Topics Completed</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-500/20">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">{streak} Days</span>
      </div>
    </div>
  );
}

// 3. Weak Subjects Card
export function WeakSubjectsWidget({ userProfile }: { userProfile: any }) {
  const weakSubjects = [
    { name: 'Mathematics', accuracy: 42, status: 'critical' },
    { name: 'Chemistry', accuracy: 58, status: 'warning' },
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-rose-500" /> Areas to Improve
        </h3>
      </div>
      <div className="space-y-4">
        {weakSubjects.map((sub, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{sub.name}</span>
              <span className={`text-xs font-bold ${sub.status === 'critical' ? 'text-rose-500' : 'text-amber-500'}`}>{sub.accuracy}% Accuracy</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${sub.status === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${sub.accuracy}%` }}></div>
            </div>
          </div>
        ))}
        <Link href="#" className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs transition-colors mt-2 border border-slate-200 dark:border-slate-700">
          Take Remedial Quiz <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// 4. Recommended Carousel
export function RecommendedCarousel({ userProfile }: { userProfile: any }) {
  // Placeholder array
  const recommendations = [
    { title: 'Organic Chemistry', type: 'Chapter', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Algebra II', type: 'Practice', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Biology: Cell Structure', type: 'Video', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended For You</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-500 rotate-180" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((item, i) => (
          <Link key={i} href="#" className={`group ${item.bg} border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 rounded-2xl p-5 transition-all`}>
            <span className="inline-block px-2.5 py-1 bg-white/60 dark:bg-slate-900/60 rounded-md text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-3">
              {item.type}
            </span>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{item.title}</h3>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">
              Start Now <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
