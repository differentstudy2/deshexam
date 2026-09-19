'use client';

import React from 'react';
import Link from 'next/link';
import { MockTest } from '@/lib/assessment-types';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface MockTestListCardProps {
  mockTest: MockTest;
  baseHref: string;
}

export function MockTestListCard({ mockTest, baseHref }: MockTestListCardProps) {
  const attemptsCount = (mockTest as any).attemptsCount || 0;
  
  const formattedAttempts = attemptsCount >= 1000 
    ? `${(attemptsCount / 1000).toFixed(1).replace(/\.0$/, '')}K` 
    : attemptsCount.toString();

  let diffColorClass = 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
  if (mockTest.difficulty === 'Easy') diffColorClass = 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
  if (mockTest.difficulty === 'Medium') diffColorClass = 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30';
  if (mockTest.difficulty === 'Hard') diffColorClass = 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30';
  if (mockTest.difficulty === 'Expert') diffColorClass = 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';

  const isPremium = mockTest.accessType === 'subscription' || mockTest.accessType === 'one_time' || mockTest.accessType === 'both' || mockTest.isPremium;
  const accessLabel = isPremium ? 'Premium' : 'Free';

  return (
    <Link href={`${baseHref}/${mockTest.slug}`} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 pr-5 rounded-[16px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
      
      {/* Thumbnail */}
      <div className="relative w-32 h-20 sm:w-40 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
        <img 
          src={mockTest.thumbnail || "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&q=80"} 
          alt={mockTest.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
          {accessLabel}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0 flex flex-col justify-center">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate mb-1.5 group-hover:text-[#16A34A] transition-colors">
          {mockTest.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded">Exam</span>
            <span className={cn("px-1.5 py-0.5 rounded", diffColorClass)}>{mockTest.difficulty || 'Mixed'}</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-700 pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            <span>{mockTest.questionIds?.length || 0} Questions</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-700 pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>{formattedAttempts} Attempts</span>
          </div>

          <div className="flex items-center sm:border-l border-slate-200 dark:border-slate-700 sm:pl-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill={star <= 4 ? "#eab308" : "none"} stroke={star <= 4 ? "#eab308" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={star <= 4 ? "" : "text-slate-300 dark:text-slate-600"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="shrink-0 flex items-center justify-center pl-2">
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-[#16A34A] group-hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

    </Link>
  );
}
