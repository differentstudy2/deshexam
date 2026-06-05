'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, Download, ExternalLink, Play, ArrowUp, ArrowDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const tags = [
  "class Five (2025) MCQ: 1.7k", "HSC MCQ: 161.2k", "SSC MCQ: 110.4k", "Class 8 MCQ: 15.6k",
  "Class 7 MCQ: 10.3k", "Class 6 MCQ: 10.1k", "Class Five MCQ: 3.3k", "Class Four MCQ: 2.6k",
  "Class Three MCQ: 1.7k", "Dakhil Class 9 & 10 MCQ: 518", "Class Eight MCQ: 20", 
  "Class Six MCQ: 1", "SSC Vokesonal MCQ: 6"
];

type Subject = {
  title: string;
  badges: any[];
  progressText: string;
  progressValue: number;
  stats?: { mcq: string; cq: string; content: string };
  topics?: string[];
}

const subjectsData: Subject[] = [
  {
    title: 'সাহিত্য কণিকা',
    badges: [
      { type: 'MCQ', count: '2.4k', color: 'blue' },
      { type: 'CQ', count: '1.8k', color: 'blue' },
      { type: 'Board Ques', count: '1', color: 'slate' },
      { type: 'Book', count: '1', color: 'slate' },
      { type: 'Exam', count: '3', color: 'slate' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Started: 4 months ago | Progress: 0.98%',
    progressValue: 0.98,
    stats: { mcq: '0.42%', cq: '0%', content: '0.54%' },
    topics: [
      'গদ্য',
      'কবিতা'
    ]
  },
  {
    title: 'আনন্দ পাঠ(বাংলা দ্রুত পঠন)',
    badges: [
      { type: 'MCQ', count: '255', color: 'blue' },
      { type: 'CQ', count: '118', color: 'blue' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Started: 11 hours ago | Progress: 2.44%',
    progressValue: 2.44,
    stats: { mcq: '0%', cq: '0%', content: '2.44%' },
    topics: [
      'কাকতাড়ুয়া (সৈয়দ ওয়ালীউল্লাহ)',
      'নয়া পত্তন (জহির রায়হান)',
      'হেমায়েত, এ্যালাপাথারি (হাসান আজিজুল হক)',
      'ডেভিড কপারফিল্ড (চার্লস ডিকেন্স, রূপান্তরঃ আখতারুজ্জামান ইলিয়াস)',
      'মুক্তি (হাসানুল বারী, রূপান্তরঃ বাণীব্রত বন্দ্যোপাধ্যায়)',
      'ফিলিস্তিনের চিঠি (হাসান কানাকানি, অনুবাদঃ মানবেন্দ্র বন্দ্যোপাধ্যায়)',
      'তিরস্কার (জ্যোতির্ময় সরকার)',
      'নাটক মানসিংহ ও ঈসা খাঁ (ইব্রাহীম সরকার)',
      'ভ্রমণ-কাহিনি কাবুলের শেষ প্রহরে (সৈয়দ মুজতবা আলী)'
    ]
  },
  {
    title: 'বাংলা ব্যাকরণ ও নির্মিতি',
    badges: [
      { type: 'MCQ', count: '700', color: 'blue' },
      { type: 'CQ', count: '385', color: 'blue' },
      { type: 'Book', count: '1', color: 'slate' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Started: 4 months ago | Progress: 0.28%',
    progressValue: 0.28,
    stats: { mcq: '0%', cq: '0%', content: '0.28%' },
    topics: [
      'ভাষা (প্রথম পরিচ্ছেদ)',
      'ধ্বনি ও বর্ণ (দ্বিতীয় পরিচ্ছেদ)',
      'সন্ধি (তৃতীয় পরিচ্ছেদ)',
      'শব্দ ও পদ (চতুর্থ পরিচ্ছেদ)',
      'শব্দগঠন (পঞ্চম পরিচ্ছেদ)',
      'বাক্য (ষষ্ঠ পরিচ্ছেদ)',
      'বিরামচিহ্ন (সপ্তম পরিচ্ছেদ)',
      'বানান (অষ্টম পরিচ্ছেদ)',
      'অভিধান (নবম পরিচ্ছেদ)',
      'শব্দার্থ (দশম পরিচ্ছেদ)',
      'নির্মিতি',
      'অনুধাবন দক্ষতা',
      'সারাংশ ও সারমর্ম',
      'অনুচ্ছেদ রচনা',
      'ভাব-সম্প্রসারণ',
      'পত্র রচনা',
      'প্রবন্ধ রচনা'
    ]
  },
  {
    title: 'English for Today',
    badges: [
      { type: 'MCQ', count: '650', color: 'blue' },
      { type: 'CQ', count: '2.6k', color: 'blue' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Progress: 0%',
    progressValue: 0,
    stats: { mcq: '0%', cq: '0%', content: '0%' },
    topics: [
      'A glimpse of our culture (Unit 1)',
      'Food and nutrition (Unit 2)',
      'Health and hygiene (Unit 3)',
      'Check your reference (Unit 4)',
      'Bangabandhu and Bangladesh (Unit 5)',
      'Going on a trip (Unit 6)',
      'Different people, different occupations (Unit 7)',
      'News! News! News! (Unit 8)',
      'Things that have changed our life (Unit 9)',
      'Fables (Unit 10)',
      'Sample question',
      'paragraph',
      'Humans and Environment (Unit 06)',
      'People and Occupations (Unit 07)',
      'Women\'s Role in Uprisings (Unit 11)',
      'Unseen Comprehension',
      'Matching Sentences',
      'Re-arranging Sentences',
      'Answering Questions form Poem',
      'Dialogue Writing',
      'Completing Stories',
      'Occupations at Risk (Unit 7)'
    ]
  },
  {
    title: 'English Grammar and Composition',
    badges: [
      { type: 'CQ', count: '2.8k', color: 'blue' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Progress: 0%',
    progressValue: 0,
    stats: { mcq: '0%', cq: '0%', content: '0%' },
    topics: []
  },
  {
    title: 'গণিত',
    badges: [
      { type: 'MCQ', count: '2.4k', color: 'blue' },
      { type: 'CQ', count: '2.3k', color: 'blue' },
      { type: 'Book', count: '1', color: 'slate' },
      { type: 'Courses', count: '1', color: 'slate' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Progress: 0%',
    progressValue: 0,
    stats: { mcq: '0%', cq: '0%', content: '0%' },
    topics: []
  },
  {
    title: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    badges: [
      { type: 'MCQ', count: '948', color: 'blue' },
      { type: 'CQ', count: '345', color: 'blue' },
      { type: 'Book', count: '1', color: 'slate' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Progress: 0%',
    progressValue: 0,
    stats: { mcq: '0%', cq: '0%', content: '0%' },
    topics: []
  },
  {
    title: 'বাংলাদেশ ও বিশ্বপরিচয়',
    badges: [
      { type: 'MCQ', count: '1.8k', color: 'blue' },
      { type: 'CQ', count: '2.2k', color: 'blue' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Progress: 0%',
    progressValue: 0,
    stats: { mcq: '0%', cq: '0%', content: '0%' },
    topics: []
  },
  {
    title: 'বিজ্ঞান',
    badges: [
      { type: 'MCQ', count: '2k', color: 'blue' },
      { type: 'CQ', count: '2k', color: 'blue' },
      { type: 'Practice', icon: true, color: 'slate' },
      { type: 'প্রশ্ন তৈরি করুন', isAction: true, color: 'slate' }
    ],
    progressText: 'Started: 4 months ago | Progress: 0.05%',
    progressValue: 0.05,
    stats: { mcq: '0%', cq: '0%', content: '0%' },
    topics: []
  }
];

function AcademyCard({ subject }: { subject: Subject }) {
  const [isTopExpanded, setIsTopExpanded] = useState(false);
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);

  // Parse progress text to use || instead of |
  const progressTextFormatted = subject.progressText.replace(' | ', ' || ');

  return (
    <Card className={cn(
      "relative bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow flex flex-col h-full",
      subject.progressValue > 0 && "theme-border-left"
    )}>
      <CardContent className="p-5 flex flex-col h-full">
        
        {/* Card Header (Title & Right Icon) */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-start gap-2.5">
            <div className="mt-1">
              <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[17px] leading-tight">
              {subject.title}
            </h3>
          </div>
          <button 
            onClick={() => setIsTopExpanded(!isTopExpanded)}
            className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0",
            isTopExpanded 
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100" 
              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400"
          )}>
            {isTopExpanded ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Topics List */}
        {isTopExpanded && subject.topics && subject.topics.length > 0 && (
          <div className="flex flex-col gap-1 mb-4">
            {subject.topics.map((topic, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-slate-100/80 dark:bg-slate-800/50 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{topic}</span>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 items-center mb-6">
          {subject.badges.map((badge, bIdx) => {
            if (badge.icon) {
              return (
                <span key={bIdx} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-medium rounded-md">
                  <Play className="w-3 h-3 fill-slate-700 text-slate-700 dark:fill-slate-300 dark:text-slate-300" />
                  {badge.type}
                </span>
              )
            }
            if (badge.isAction) {
              return (
                 <span key={bIdx} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-medium rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                   {badge.type}
                 </span>
              )
            }
            if (badge.color === 'blue') {
                return (
                  <span key={bIdx} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#0066ff] dark:text-blue-400 text-[13px] font-semibold rounded-md">
                    <span className="text-slate-700 dark:text-slate-300">{badge.type}</span> {badge.count}
                  </span>
                )
            }
            return (
              <span key={bIdx} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-medium rounded-md">
                {badge.type} <span className="font-semibold">{badge.count}</span>
              </span>
            )
          })}
        </div>

        {/* Progress Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{progressTextFormatted}</p>
              <button 
                onClick={() => setIsBottomExpanded(!isBottomExpanded)}
                className="flex items-center justify-center w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-400 shrink-0"
              >
                {isBottomExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
          </div>
          {subject.progressValue > 0 ? (
                <Progress value={subject.progressValue} className="h-1.5 bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-[#00a651]" />
          ) : (
                <Progress value={0} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
          )}

          {/* Expanded Stats */}
          {isBottomExpanded && subject.stats && (
            <div className="flex items-center justify-between mt-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              <span>MCQ: {subject.stats.mcq}</span>
              <span>CQ: {subject.stats.cq}</span>
              <span>Content: {subject.stats.content}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200">
      
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-lg text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
              <ChevronDown className="w-3 h-3 mx-2 -rotate-90 text-slate-400" />
              <span className="text-slate-900 dark:text-slate-200">Academy Subject</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="h-8 px-4 bg-green-100 text-green-800 border-transparent hover:bg-green-200 hover:text-green-900 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
          >
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Section Header */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subject Dashboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Showing 1 - {subjectsData.length} of {subjectsData.length} entries</p>
          </div>
          
          <div className="relative max-w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search here" 
              className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 w-full text-base placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Grid of Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-12">
          {subjectsData.map((subject, idx) => (
            <AcademyCard key={idx} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}
