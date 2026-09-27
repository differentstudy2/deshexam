'use client';

import React from 'react';
import Link from 'next/link';
import { MockTest } from '@/lib/assessment-types';
import { cn } from '@/lib/utils';

interface FeaturedMockTestCardProps {
  mockTest: MockTest;
  baseHref: string;
}

export function FeaturedMockTestCard({ mockTest, baseHref }: FeaturedMockTestCardProps) {
  // Safe fallbacks for properties that might not exist in old data
  const attemptsCount = mockTest.attemptCount || (mockTest as any).attemptsCount || 0;
  const viewsCount = (mockTest as any).viewsCount || 0;
  
  // Real data popularity calculation
  const calculatedPop = viewsCount > 0 ? (attemptsCount / viewsCount) * 100 : 0;
  // If we don't have views, base it on attempts up to a max
  const fallbackPop = Math.min(100, Math.max(20, attemptsCount * 5));
  const popularity = viewsCount > 0 ? Math.round(calculatedPop) : Math.round(fallbackPop);
  
  // Formatting attempts
  const formattedAttempts = attemptsCount >= 1000 
    ? `${(attemptsCount / 1000).toFixed(1).replace(/\.0$/, '')}K` 
    : attemptsCount.toString();

  // Difficulty Colors
  let diffColorClass = 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
  if (mockTest.difficulty === 'Easy') diffColorClass = 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
  if (mockTest.difficulty === 'Medium') diffColorClass = 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30';
  if (mockTest.difficulty === 'Hard') diffColorClass = 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30';
  if (mockTest.difficulty === 'Expert') diffColorClass = 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';

  // Access Type label
  const isPremium = mockTest.accessType === 'subscription' || mockTest.accessType === 'one_time' || mockTest.accessType === 'both' || mockTest.isPremium;
  const accessLabel = isPremium ? 'Premium' : 'Free / Premium';

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={mockTest.thumbnail || "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80"} 
          alt={mockTest.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Play Icon Overlay (Optional) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-wider">
          <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded">Exam</span>
          <span className={cn("px-2 py-0.5 rounded", diffColorClass)}>{mockTest.difficulty || 'Mixed'}</span>
        </div>

        {/* Title */}
        <h3 className="text-[18px] font-extrabold text-slate-900 dark:text-white leading-snug mb-5 group-hover:text-[#16A34A] transition-colors line-clamp-2">
          {mockTest.title}
        </h3>

        {/* Stats 2x2 Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6">
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            <span>{mockTest.questionCount ?? mockTest.questionIds?.length ?? 0} Questions</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{mockTest.durationMin || 0} Min</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>{formattedAttempts} Attempts</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={star <= 4 ? "#eab308" : "none"} stroke={star <= 4 ? "#eab308" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={star <= 4 ? "" : "text-slate-300 dark:text-slate-600"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link href={`${baseHref}/${mockTest.slug}`} className="flex items-center justify-center h-10 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800 transition-colors">
            Details
          </Link>
          <Link href={`${baseHref}/${mockTest.slug}/take`} className="flex items-center justify-center h-10 rounded-lg bg-[#16A34A] text-white font-bold text-sm hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20">
            Start
          </Link>
        </div>
      </div>
    </div>
  );
}
