'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, PlayCircle, Calendar, ClipboardList, CheckCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuestionsSidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return (
    <div className="space-y-6 w-full">
      
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button 
          variant="outline" 
          className="w-full flex justify-between items-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="font-semibold text-slate-800 dark:text-slate-200">More Tools & Filters</span>
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      )}

      <div className={cn("space-y-6 transition-all duration-300", isMobile && isCollapsed ? "hidden" : "block")}>
        
      {/* Widget 1: Quick Practice */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[8px] border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div className="bg-amber-500 px-2 py-2">
            <h3 className="font-extrabold text-white flex items-center gap-2.5 tracking-tight">
            <Zap className="w-5 h-5 text-white/90" /> Quick Practice
            </h3>
        </div>
        <div className="space-y-2 p-2">
          <Button variant="outline" className="w-full justify-start text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-0 h-10 font-medium">
            <CheckCircle className="w-4 h-4 mr-3 text-green-600 dark:text-green-500" /> Random MCQ
          </Button>
          <Button variant="outline" className="w-full justify-start text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-0 h-10 font-medium">
            <Calendar className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-500" /> Daily Quiz
          </Button>
          <Button variant="outline" className="w-full justify-start text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-0 h-10 font-medium">
            <ClipboardList className="w-4 h-4 mr-3 text-purple-600 dark:text-purple-500" /> Mock Test
          </Button>
        </div>
      </div>

      {/* Widget 2: Daily Challenge */}
      <div className="bg-gradient-to-br from-[#eaf7f0] to-[#d1f0df] dark:from-[#1a3826] dark:to-[#112a1a] rounded-[8px] border border-[#bce8ce] dark:border-[#204a30] p-2 shadow-[0_8px_30px_rgb(58,150,98,0.15)] hover:shadow-[0_12px_40px_rgb(58,150,98,0.25)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/40 dark:bg-black/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <Badge className="bg-[#3a9662] hover:bg-[#2d764d] text-white border-0 mb-3 text-[11px] font-semibold tracking-wider uppercase">Today's Challenge</Badge>
          <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">General Knowledge</h3>
          <p className="text-[#3a9662] dark:text-[#52c886] font-medium text-sm mb-5">10 Questions • 8 Minutes</p>
          <Button className="w-full bg-[#3a9662] hover:bg-[#2d764d] text-white rounded-xl shadow-md shadow-[#3a9662]/20 h-11 font-semibold text-[15px]">
            Start Challenge <PlayCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Widget 3: Popular Topics */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[8px] border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div className="bg-slate-800 dark:bg-slate-900 px-2 py-2">
            <h3 className="font-extrabold text-white tracking-tight">Popular Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2 p-2">
          {['Algebra', 'Arithmetic', 'Grammar', 'Biology', 'Geography', 'History'].map(topic => (
            <Badge key={topic} variant="secondary" className="bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-3 py-1 cursor-pointer transition-colors border border-transparent">
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      {/* Widget 4: Trending Exams */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[8px] border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div className="bg-slate-800 dark:bg-slate-900 px-2 py-2">
            <h3 className="font-extrabold text-white tracking-tight">Trending Exams</h3>
        </div>
        <div className="space-y-0.5 p-2 pt-4">
          {['SSC CGL', 'Railway Group D', 'WBBSE Madhyamik', 'JEE Main', 'NEET'].map(exam => (
            <div key={exam} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer transition-colors group">
              <span className="text-[14.5px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{exam}</span>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Widget 5: Premium Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[8px] p-2 shadow-[0_8px_30px_rgb(99,102,241,0.15)] hover:shadow-[0_12px_40px_rgb(99,102,241,0.25)] hover:-translate-y-1 transition-all duration-300 text-white relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h3 className="font-bold text-xl mb-4 leading-tight tracking-tight">Unlock Premium Learning</h3>
          <ul className="space-y-2.5 mb-7">
            <li className="flex items-center text-[14.5px] text-slate-300 font-medium">
              <CheckCircle className="w-4 h-4 mr-3 text-indigo-400 shrink-0" /> Mock Tests
            </li>
            <li className="flex items-center text-[14.5px] text-slate-300 font-medium">
              <CheckCircle className="w-4 h-4 mr-3 text-indigo-400 shrink-0" /> PDF Notes
            </li>
            <li className="flex items-center text-[14.5px] text-slate-300 font-medium">
              <CheckCircle className="w-4 h-4 mr-3 text-indigo-400 shrink-0" /> Detailed Solutions
            </li>
          </ul>
          <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] h-11 transition-all hover:scale-[1.02]">
            Try Premium
          </Button>
        </div>
      </div>

      </div>
    </div>
  );
}


