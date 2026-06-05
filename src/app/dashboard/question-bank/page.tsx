'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, Printer, Play } from 'lucide-react';

const tabs = [
  { name: 'প্রশ্ন ব্যাংক', active: false },
  { name: 'বোর্ড ভিত্তিক', active: false },
  { name: 'স্কুল ভিত্তিক', active: false },
  { name: 'বিষয় ভিত্তিক', active: true },
  { name: 'মডেল টেস্ট', active: false },
];

const subjectsData = [
  {
    title: 'সাহিত্য কণিকা',
    badges: [
      { type: 'MCQ', count: '2.4k', color: 'blue' },
      { type: 'CQ', count: '1.8k', color: 'blue' },
      { type: 'বোর্ড এক্সাম', count: '1', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  },
  {
    title: 'আনন্দ পাঠ(বাংলা দ্রুত পঠন)',
    badges: [
      { type: 'MCQ', count: '255', color: 'blue' },
      { type: 'CQ', count: '118', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  },
  {
    title: 'বাংলা ব্যাকরণ ও নির্মিতি',
    badges: [
      { type: 'MCQ', count: '700', color: 'blue' },
      { type: 'CQ', count: '385', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  },
  {
    title: 'English for Today',
    badges: [
      { type: 'MCQ', count: '650', color: 'blue' },
      { type: 'CQ', count: '2.6k', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  },
  {
    title: 'English Grammar and Composition',
    badges: [
      { type: 'MCQ', count: '0', color: 'blue' },
      { type: 'CQ', count: '2.8k', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  },
  {
    title: 'গণিত',
    badges: [
      { type: 'MCQ', count: '2.4k', color: 'blue' },
      { type: 'CQ', count: '2.3k', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  },
  {
    title: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    badges: [
      { type: 'MCQ', count: '948', color: 'blue' },
      { type: 'CQ', count: '345', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  },
  {
    title: 'বাংলাদেশ ও বিশ্বপরিচয়',
    badges: [
      { type: 'MCQ', count: '1.8k', color: 'blue' },
      { type: 'CQ', count: '2.2k', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  },
  {
    title: 'বিজ্ঞান',
    badges: [
      { type: 'MCQ', count: '2k', color: 'blue' },
      { type: 'CQ', count: '2k', color: 'blue' },
      { type: 'প্রাকটিস', icon: true, color: 'gray' }
    ]
  }
];

export default function QuestionBankPage() {
  return (
    <div className="space-y-6 pb-12 w-full max-w-[1400px] mx-auto text-slate-800 dark:text-slate-100">
      
      {/* Top Navigation & Search Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, idx) => (
            <Button 
              key={idx} 
              variant={tab.active ? "default" : "outline"}
              className={`rounded-full h-9 px-5 text-sm font-medium ${
                tab.active 
                  ? "bg-green-600 hover:bg-green-700 text-white border-transparent" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tab.name}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="প্রশ্নব্যাংক খুঁজুন" 
            className="pl-9 h-10 bg-slate-100/80 dark:bg-slate-800/80 border-transparent focus-visible:ring-1 focus-visible:ring-green-500 rounded-full w-full text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Header Titles */}
      <div className="mt-4 mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">সকল বিষয়ের প্রশ্নব্যাংক</h1>
        <p className="text-sm font-medium text-slate-400">বিষয়ভিত্তিক সাজানো প্রশ্ন ও অনুশীলন</p>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjectsData.map((subject, idx) => (
          <Card key={idx} className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl hover:border-green-200 transition-colors">
            <CardContent className="p-5 flex flex-col h-full justify-between gap-6">
              
              {/* Card Header (Title & Actions) */}
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight mt-1">{subject.title}</h3>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                </div>
              </div>

              {/* Badges Footer */}
              <div className="flex flex-wrap gap-2 items-center">
                {subject.badges.map((badge, bIdx) => {
                  if (badge.icon) {
                    return (
                      <span key={bIdx} className="flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-md cursor-pointer transition-colors">
                        <Play className="w-3 h-3 fill-slate-500 text-slate-500 dark:fill-slate-400 dark:text-slate-400" />
                        {badge.type}
                      </span>
                    )
                  }
                  return (
                    <span key={bIdx} className="flex items-center gap-1 px-2 py-1 bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-md">
                      <span className="text-slate-500 dark:text-slate-400">{badge.type}</span> {badge.count}
                    </span>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
