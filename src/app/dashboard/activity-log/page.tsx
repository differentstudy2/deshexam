'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, BookOpen, Target, CheckCircle2, Award, Zap, Trophy, ListTodo } from 'lucide-react';

const activities = [
  { title: 'MCQ Practice', date: '5 days ago', xp: 2, icon: ClipboardList, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { title: 'Onboarding Bonus', date: '5 days ago', xp: 30, icon: Target, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { title: 'Completed Daily Goal', date: '6 days ago', xp: 15, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  { title: 'First Exam Taken', date: '1 week ago', xp: 20, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { title: 'Achievement Unlocked', date: '1 week ago', xp: 50, icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { title: 'Streak Bonus (3 Days)', date: '2 weeks ago', xp: 10, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { title: 'Weekly Challenge', date: '2 weeks ago', xp: 25, icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { title: 'Subject Mastery (Math)', date: '3 weeks ago', xp: 100, icon: ListTodo, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
];

export default function ActivityLogPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-4 sm:px-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Activity History <ListTodo className="w-5 h-5 text-slate-400" />
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Track all your XP earning activities</p>
        </div>
        
        <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-full text-orange-600 dark:text-orange-400 font-bold text-sm shadow-sm w-fit">
          Total: 32 XP
        </div>
      </div>

      {/* 3-Column Grid Layout (As Requested) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-4 sm:px-0">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <Card key={i} className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
              <CardContent className="p-5 flex items-center justify-between">
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${activity.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-slate-800 dark:text-slate-200 leading-tight mb-1">{activity.title}</h3>
                    <p className="text-[12px] font-medium text-slate-400">{activity.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800/50 shadow-sm shrink-0">
                  ★ +{activity.xp} XP
                </div>
                
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
