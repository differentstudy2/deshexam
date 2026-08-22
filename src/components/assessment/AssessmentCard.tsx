'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, HelpCircle, ShieldCheck, Trophy, FileText, ArrowRight, Star, Users, Crown, ListChecks, Timer, UsersRound, Flame, Activity } from 'lucide-react';
import Link from 'next/link';
import { AssessmentBase } from '@/lib/assessment-types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AssessmentCardProps {
  assessment: AssessmentBase;
  type: 'Practice' | 'Quiz' | 'Mock Test' | 'Exam';
  href: string;
  taxonomyString?: string;
}

export function AssessmentCard({ assessment, type, href, taxonomyString }: AssessmentCardProps) {
  // Determine Type Colors & Icons
  let typeColor = 'bg-green-100 text-green-700';
  let Icon = HelpCircle;
  let btnColor = 'from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-blue-600/25';

  if (type === 'Practice') {
    typeColor = 'bg-[#00a651]/10 text-[#00a651] border-[#00a651]/20 dark:bg-[#00a651]/20 dark:border-[#00a651]/30';
    Icon = FileText;
    btnColor = 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25';
  } else if (type === 'Quiz') {
    typeColor = 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
    Icon = Trophy;
    btnColor = 'from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 shadow-purple-500/25';
  } else if (type === 'Mock Test') {
    typeColor = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    Icon = FileText;
    btnColor = 'from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-blue-600/25';
  } else if (type === 'Exam') {
    typeColor = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    Icon = Trophy;
    btnColor = 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-500/25';
  }

  // Difficulty Colors
  let diffColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (assessment.difficulty === 'Easy') diffColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (assessment.difficulty === 'Medium') diffColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (assessment.difficulty === 'Hard') diffColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  if (assessment.difficulty === 'Expert') diffColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  const isPremium = assessment.accessType === 'subscription' || assessment.accessType === 'both' || assessment.accessType === 'one_time';
  
  if (isPremium) {
    btnColor = 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25 text-white';
  }

  return (
    <Card className={cn(
      "flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border group",
      isPremium ? "border-amber-200 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-500/80 shadow-amber-500/5" : "border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50"
    )}>
      {/* Image Header with Gradients */}
      <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={assessment.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80"} 
          alt={assessment.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent"></div>
        
        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <div className="flex items-center gap-2">
            <div className={`text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 backdrop-blur-md bg-gradient-to-r ${type === 'Practice' ? 'from-emerald-500 to-teal-500' : type === 'Quiz' ? 'from-purple-500 to-fuchsia-500' : type === 'Mock Test' ? 'from-blue-500 to-indigo-500' : 'from-orange-500 to-red-500'}`}>
                <Icon className="w-3.5 h-3.5" /> {type}
            </div>
            {assessment.difficulty && (
              <div className={cn("flex items-center gap-1 text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-md shadow-lg backdrop-blur-md border", 
                  assessment.difficulty === 'Easy' ? 'text-emerald-100 border-emerald-400/50 bg-emerald-900/60' :
                  assessment.difficulty === 'Medium' ? 'text-amber-100 border-amber-400/50 bg-amber-900/60' :
                  assessment.difficulty === 'Hard' ? 'text-orange-100 border-orange-400/50 bg-orange-900/60' :
                  'text-rose-100 border-rose-400/50 bg-rose-900/60'
              )}>
                  <Activity className="w-3.5 h-3.5" /> {assessment.difficulty}
              </div>
            )}
          </div>

          {isPremium && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 border border-white/20 backdrop-blur-md">
              <Crown className="w-3.5 h-3.5" /> PRO
            </div>
          )}
        </div>

        {/* Title overlayed on image */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
            <h3 className="font-bold text-[17px] leading-tight line-clamp-2 text-white group-hover:text-blue-300 transition-colors drop-shadow-md">
              {assessment.title}
            </h3>
        </div>
      </div>

      <CardContent className="flex-grow pt-4 pb-4">
        {/* Taxonomy row */}
        <div className="mb-4">
           {taxonomyString ? (
             <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 truncate">
               <ShieldCheck className="w-4 h-4 shrink-0" />
               <span className="truncate">{taxonomyString}</span>
             </p>
           ) : (
             <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
               Interactive {type.toLowerCase()}
             </p>
           )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm w-full">
          <div className="flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1.5 rounded-md font-medium text-xs border border-indigo-100 dark:border-indigo-800/50">
            <ListChecks className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{assessment.questionCount ?? assessment.questionIds?.length ?? 0} Qs</span>
          </div>
          {/* Unified Time display */}
          {((assessment as any).durationMin || (assessment as any).timeLimitMin || (assessment as any).estimatedTimeMin) && (
            <div className="flex items-center justify-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2.5 py-1.5 rounded-md font-medium text-xs border border-orange-100 dark:border-orange-800/50">
              <Timer className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {((assessment as any).durationMin || (assessment as any).timeLimitMin) 
                  ? `${(assessment as any).durationMin || (assessment as any).timeLimitMin}m` 
                  : `~${(assessment as any).estimatedTimeMin}m`}
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 rounded-md font-medium text-xs border border-emerald-100 dark:border-emerald-800/50">
            <UsersRound className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{(!assessment.attemptCount || assessment.attemptCount < 1000) ? '75K+' : assessment.attemptCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2.5 py-1.5 rounded-md font-medium text-xs border border-amber-100 dark:border-amber-800/50">
            <Star className="w-3.5 h-3.5 shrink-0 fill-amber-500 text-amber-500" />
            <span className="truncate">{assessment.reviewStats?.averageRating ? assessment.reviewStats.averageRating.toFixed(1) : '4.8'}</span>
          </div>
        </div>

        {/* Verification Badges */}
        {assessment.verificationBadges && assessment.verificationBadges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
            {assessment.verificationBadges.slice(0, 2).map((badge, idx) => (
              <div key={idx} className="flex items-center text-xs font-medium text-[#00a651] bg-[#00a651]/10 px-2 py-1 rounded">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {badge}
              </div>
            ))}
            {assessment.verificationBadges.length > 2 && (
              <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                +{assessment.verificationBadges.length - 2} more
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex-none">
        <Button asChild className={`w-full bg-gradient-to-r text-white transition-all duration-500 hover:shadow-lg border-transparent font-bold ${btnColor}`}>
          <Link href={href}>
            Start {type} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
