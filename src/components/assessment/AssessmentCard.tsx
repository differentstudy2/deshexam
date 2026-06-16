'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, HelpCircle, ShieldCheck, Trophy, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AssessmentBase } from '@/lib/assessment-types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AssessmentCardProps {
  assessment: AssessmentBase;
  type: 'Practice' | 'Quiz' | 'Mock Test' | 'Exam';
  href: string;
}

export function AssessmentCard({ assessment, type, href }: AssessmentCardProps) {
  // Determine Type Colors & Icons
  let typeColor = 'bg-green-100 text-green-700';
  let Icon = HelpCircle;

  if (type === 'Practice') {
    typeColor = 'bg-[#00a651]/10 text-[#00a651] border-[#00a651]/20 dark:bg-[#00a651]/20 dark:border-[#00a651]/30';
    Icon = FileText;
  } else if (type === 'Quiz') {
    typeColor = 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
    Icon = Trophy;
  } else if (type === 'Mock Test') {
    typeColor = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    Icon = FileText;
  } else if (type === 'Exam') {
    typeColor = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    Icon = Trophy;
  }

  // Difficulty Colors
  let diffColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (assessment.difficulty === 'Easy') diffColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (assessment.difficulty === 'Medium') diffColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (assessment.difficulty === 'Hard') diffColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  if (assessment.difficulty === 'Expert') diffColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 group">
      {/* Thumbnail or colored top border (DEMO IMAGE APPLIED) */}
      <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={assessment.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80"} 
          alt={assessment.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <CardHeader className="pb-3 flex-none">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={cn("font-medium", typeColor)}>
            <Icon className="w-3 h-3 mr-1" />
            {type}
          </Badge>
          <Badge variant="secondary" className={diffColor}>{assessment.difficulty}</Badge>
        </div>
        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {assessment.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {assessment.description || `Test your knowledge with this interactive ${type.toLowerCase()}.`}
        </p>

        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-1.5 text-slate-400" />
            {assessment.questionIds?.length || 0} Questions
          </div>
          {/* We can cast and check for estimatedTimeMin or timeLimitMin if we want, or just rely on generic metadata if added later */}
          {(assessment as any).timeLimitMin && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
              {(assessment as any).timeLimitMin} Mins
            </div>
          )}
          {(assessment as any).estimatedTimeMin && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
              ~{(assessment as any).estimatedTimeMin} Mins
            </div>
          )}
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
        <Button asChild className="w-full bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white transition-all duration-500 group-hover:from-blue-600 group-hover:to-violet-600 group-hover:shadow-lg group-hover:shadow-blue-600/25 border border-slate-700 dark:border-slate-600 group-hover:border-transparent font-bold">
          <Link href={href}>
            Start {type} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
