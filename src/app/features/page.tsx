import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  CheckCircle2, Search, Trophy, BookOpen, BrainCircuit, Target, 
  FileText, Zap, ShieldCheck, SearchCode, User, Star, ArrowRight, 
  LayoutDashboard, BarChart3, Library, Sparkles, PlayCircle, Plus,
  ChevronDown, BookMarked, Clock, Brain, Settings
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] font-sans overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-4 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 left-0 -ml-20 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Hero Content */}
          <div className="space-y-8 max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold mb-2 shadow-sm border border-emerald-200 dark:border-emerald-800/50">
              <Sparkles className="w-4 h-4" />
              Powerful Learning Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              Everything You Need <br className="hidden sm:block" />
              to Learn, Practice <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400">& Succeed</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              DeshExam helps students discover institutions, practice mock tests, access study materials, and track academic growth—all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 text-base shadow-lg shadow-emerald-600/20 rounded-sm w-full sm:w-auto">
                Start Learning
              </Button>
              <Button variant="outline" className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold h-12 px-8 text-base shadow-sm rounded-sm w-full sm:w-auto">
                Explore Features
              </Button>
            </div>

            {/* Trust Row */}
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-8 gap-y-4 justify-center lg:justify-start">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">50K+</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Students</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">100K+</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Questions</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">10K+</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Institutions</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><BrainCircuit className="w-6 h-6" /> AI</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Powered</span>
              </div>
            </div>
          </div>

          {/* Hero Mockup (CSS Dashboard) */}
          <div className="relative w-full aspect-square max-w-lg mx-auto lg:max-w-none perspective-1000 hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-indigo-50 dark:from-emerald-900/20 dark:to-indigo-900/10 rounded-full blur-3xl opacity-50" />
            
            {/* Main Window */}
            <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[15%] bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 transform -rotate-1 hover:rotate-0 transition-transform duration-500 flex flex-col">
              {/* Header */}
              <div className="h-10 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-2 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className="ml-4 flex-1 flex justify-center">
                  <div className="w-32 h-4 bg-white dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <span className="w-16 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full"></span>
                  </div>
                </div>
              </div>
              {/* Sidebar + Content */}
              <div className="flex flex-1 overflow-hidden">
                <div className="w-16 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center py-4 gap-4">
                  <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"><LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
                  <div className="w-8 h-8 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center"><BookOpen className="w-4 h-4 text-slate-400" /></div>
                  <div className="w-8 h-8 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-slate-400" /></div>
                  <div className="w-8 h-8 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center mt-auto"><Settings className="w-4 h-4 text-slate-400" /></div>
                </div>
                <div className="flex-1 p-6 space-y-6">
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="w-40 h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50"></div>
                  </div>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-emerald-500 rounded-lg p-3 text-white flex flex-col justify-between shadow-lg shadow-emerald-500/20">
                      <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Score</span>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold">92%</span>
                        <BarChart3 className="w-5 h-5 opacity-50" />
                      </div>
                    </div>
                    <div className="h-20 bg-indigo-500 rounded-lg p-3 text-white flex flex-col justify-between shadow-lg shadow-indigo-500/20">
                      <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Rank</span>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold">#4</span>
                        <Trophy className="w-5 h-5 opacity-50" />
                      </div>
                    </div>
                  </div>
                  {/* Progress Line */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Course Progress</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">65%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[65%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Chart Widget */}
            <div className="absolute -right-[5%] bottom-[5%] w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">Mock Test Analytics</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-end gap-1 h-16 w-full opacity-80">
                <div className="w-1/6 bg-slate-200 dark:bg-slate-700 rounded-t h-[40%]"></div>
                <div className="w-1/6 bg-slate-200 dark:bg-slate-700 rounded-t h-[60%]"></div>
                <div className="w-1/6 bg-slate-200 dark:bg-slate-700 rounded-t h-[50%]"></div>
                <div className="w-1/6 bg-emerald-400 rounded-t h-[80%] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                <div className="w-1/6 bg-slate-200 dark:bg-slate-700 rounded-t h-[65%]"></div>
                <div className="w-1/6 bg-slate-200 dark:bg-slate-700 rounded-t h-[75%]"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. EXPLORE CORE FEATURES GRID */}
      <section className="py-20 px-4 bg-white dark:bg-[#020817] relative z-20 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Explore Core Features</h2>
            <div className="w-16 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'institutions', icon: <Library />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', title: 'Institution Directory', desc: 'DeshExam helps students discover institutions, practice mock tests, attempt quizzes—all in one platform.' },
              { id: 'mock-tests', icon: <FileText />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', title: 'Mock Tests', desc: 'Real exam pattern simulated mock tests, in-depth analysis, detailed solutions, automated grading.' },
              { id: 'practice-sets', icon: <Target />, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30', title: 'Practice Sets', desc: 'Practice mock exams, access study materials, and track academic growth—all inside.' },
              { id: 'quiz-arena', icon: <Trophy />, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', title: 'Quiz Arena', desc: 'Assess quick career quiz recommendations and assessments across multiple interactive questions.' },
              { id: 'question-bank', icon: <BookMarked />, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', title: 'Question Bank', desc: 'Comprehensive editions have answer bases with smart filters and instant solution.' },
              { id: 'ai-assistant', icon: <BrainCircuit />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', title: 'AI Study Assistant', desc: 'AI Study assistance can enhance your study experience and explain concepts efficiently.' },
              { id: 'rich-content', icon: <PlayCircle />, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30', title: 'Rich Learning Content', desc: 'Rich visual videos for engaging academic learners, rich learning content, and normal solutions.' },
              { id: 'analytics', icon: <BarChart3 />, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', title: 'Performance Analytics', desc: 'Performance analytics with massive architecture of real exam simulation, and performance analytics.' },
            ].map((feature, i) => (
              <Card key={i} className={`border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 rounded-lg overflow-hidden group ${i === 0 ? 'ring-2 ring-emerald-500/20 dark:ring-emerald-500/40' : ''}`}>
                <CardContent className="p-6 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={feature.color}>{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                    {feature.desc}
                  </p>
                  <a href={`#${feature.id}`} className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline mt-auto">
                    Scroll to section <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURE HIGHLIGHTS */}
      
      {/* 3.1 Institution Directory */}
      <section id="institutions" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mockup Left */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-[3rem] blur-3xl transform -rotate-6"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-sm flex items-center justify-center text-white"><Library className="w-4 h-4" /></div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Institution Finder</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-24 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm flex items-center px-2 text-xs text-slate-400"><Search className="w-3 h-3 mr-1" /> Search</div>
                </div>
              </div>
              {/* Content */}
              <div className="flex p-4 gap-4 h-80">
                {/* Filters */}
                <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 pr-4 space-y-4 hidden sm:block">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-600" /></div><div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border border-slate-200 dark:border-slate-700"></div><div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border border-slate-200 dark:border-slate-700"></div><div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div></div>
                  </div>
                </div>
                {/* Cards */}
                <div className="flex-1 space-y-4 overflow-hidden relative">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-3 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm">
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Text Right */}
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase flex items-center gap-2">
              <Library className="w-4 h-4" /> Institution Directory
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Find the Best <br/> Institutions
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Explore verified schools, colleges, universities, and coaching centers with admission details, reviews, facilities, placements, and SEO-rich profiles.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 pt-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Verified institutions</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Reviews & ratings</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Admission info</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Location map</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Course comparison</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Facilities & placements</span>
              </div>
            </div>
            <div className="pt-4">
              <Button className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-sm">
                Explore Institutions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3.2 Mock Tests */}
      <section id="mock-tests" className="py-24 px-4 bg-white dark:bg-[#020817] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Left */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase flex items-center gap-2">
              <FileText className="w-4 h-4" /> Mock Tests
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Real Exam Experience
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Simulate actual exams with timer-based mock tests, automated scoring, and detailed performance insights.
            </p>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Exam timer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Auto-submission</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Negative marking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Detailed solutions</span>
              </div>
            </div>
          </div>
          {/* Mockup Right */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-500/10 rounded-[3rem] blur-3xl transform rotate-3"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/80">
                <span className="font-semibold text-slate-800 dark:text-slate-200">JEE Mains Mock Test - 1</span>
                <div className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-3 py-1 rounded font-bold text-sm tracking-wider">
                  02 : 45 : 12
                </div>
              </div>
              <div className="flex p-4 gap-4 h-72">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg text-slate-900 dark:text-white">Question 4</span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+4 Marks / -1 Mark</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-3"><div className="w-4 h-4 rounded-full border border-slate-300"></div> <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                    <div className="p-3 border border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-md flex items-center gap-3"><div className="w-4 h-4 rounded-full border-4 border-emerald-500"></div> <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-3"><div className="w-4 h-4 rounded-full border border-slate-300"></div> <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-3"><div className="w-4 h-4 rounded-full border border-slate-300"></div> <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                  </div>
                </div>
                {/* Palette */}
                <div className="w-1/4 border-l border-slate-100 dark:border-slate-800 pl-4 hidden sm:block">
                  <span className="text-xs font-bold text-slate-500 uppercase mb-3 block">Palette</span>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="w-6 h-6 rounded-sm bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold">1</div>
                    <div className="w-6 h-6 rounded-sm bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold">2</div>
                    <div className="w-6 h-6 rounded-sm bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold">3</div>
                    <div className="w-6 h-6 rounded-sm bg-indigo-500 text-[10px] text-white flex items-center justify-center font-bold">4</div>
                    <div className="w-6 h-6 rounded-sm bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-500 flex items-center justify-center font-bold">5</div>
                    <div className="w-6 h-6 rounded-sm bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-500 flex items-center justify-center font-bold">6</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.3 Practice Sets */}
      <section id="practice-sets" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mockup Left */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-[3rem] blur-3xl transform -rotate-3"></div>
            <div className="relative grid grid-cols-2 gap-4">
              {['Topic-wise practice', 'Chapter-wise', 'Weak-area practice', 'Adaptive practice'].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-between h-32 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer">
                  <div className="flex justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{item}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Progress</span>
                      <span>{Math.floor(Math.random() * 60) + 20}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Text Right */}
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase flex items-center gap-2">
              <Target className="w-4 h-4" /> Practice Sets
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Master Concepts <br/> with Practice
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Target specific areas of improvement with intelligent, adaptive practice sets designed to turn weaknesses into strengths.
            </p>
          </div>
        </div>
      </section>

      {/* 3.4 Quiz Arena */}
      <section id="quiz-arena" className="py-24 px-4 bg-white dark:bg-[#020817] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Left */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Quiz Arena
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Learn with Fun <br/> Quizzes
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Engage in daily quizzes, climb the leaderboard, earn XP points, and unlock achievements as you learn.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><Trophy className="w-4 h-4 text-amber-500" /> Daily quiz</div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><Trophy className="w-4 h-4 text-amber-500" /> Leaderboard</div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><Trophy className="w-4 h-4 text-amber-500" /> XP points</div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><Trophy className="w-4 h-4 text-amber-500" /> Streak rewards</div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><Trophy className="w-4 h-4 text-amber-500" /> Badges</div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><Trophy className="w-4 h-4 text-amber-500" /> Quiz battles</div>
            </div>
          </div>
          {/* Mockup Right */}
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/10 dark:bg-amber-500/10 rounded-[3rem] blur-3xl transform rotate-6"></div>
            <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Daily quiz</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"><Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Leaderboard</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"><Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">XP points</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Badges</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"><Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Streak rewards</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"><Target className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Quiz battles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Question Bank */}
      <section id="question-bank" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mockup Left */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-rose-400/10 dark:bg-rose-500/10 rounded-[3rem] blur-3xl transform -rotate-2"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-md h-10 flex items-center px-4">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-400 text-sm">Search 100K+ questions...</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">Class</div>
                <div className="border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">Subject</div>
                <div className="border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">Topic</div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-rose-500" /><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Physics - Thermodynamics</span></div>
                  <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50">MCQ</Badge>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-indigo-500" /><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Math - Calculus Integration</span></div>
                  <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50">Subjective</Badge>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-emerald-500" /><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Chemistry - Organic Rx</span></div>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50">True/False</Badge>
                </div>
              </div>
            </div>
          </div>
          {/* Text Right */}
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase flex items-center gap-2">
              <BookMarked className="w-4 h-4" /> Question Bank
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Massive Question <br/> Repository
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Access over 100K+ questions categorized by class, subject, topic, and difficulty level. Perfect for targeted practice.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="text-slate-600 dark:text-slate-300">MCQ</Badge>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-300">Fill in Blank</Badge>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-300">True/False</Badge>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-300">Matching</Badge>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-300">Creative Questions</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 3.6 AI Features (Dark Section) */}
      <section id="ai-assistant" className="py-24 px-4 bg-slate-900 dark:bg-[#020817] relative overflow-hidden text-white border-y border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-indigo-900/20"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Text Left */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-purple-400 tracking-wider uppercase flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" /> AI Features
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              AI-Powered Learning <br/> Assistant
            </h2>
            <p className="text-lg text-slate-300">
              Experience the future of education with an intelligent assistant that explains concepts, solves doubts, and provides smart hints instantly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <Brain className="w-6 h-6 text-purple-400 mb-2" />
                <h4 className="font-bold text-sm mb-1">AI explanations</h4>
                <p className="text-xs text-slate-400">Step-by-step breakdown of complex topics.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <SearchCode className="w-6 h-6 text-indigo-400 mb-2" />
                <h4 className="font-bold text-sm mb-1">AI doubt solver</h4>
                <p className="text-xs text-slate-400">Instant answers to your academic queries.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <Sparkles className="w-6 h-6 text-amber-400 mb-2" />
                <h4 className="font-bold text-sm mb-1">Smart hints</h4>
                <p className="text-xs text-slate-400">Get nudged in the right direction without spoilers.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <BarChart3 className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm mb-1">AI performance analysis</h4>
                <p className="text-xs text-slate-400">Deep insights into your learning patterns.</p>
              </div>
            </div>
          </div>
          {/* Mockup Right */}
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-[3rem] blur-3xl transform rotate-3"></div>
            <div className="relative bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-slate-200">DeshExam AI</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
                <div className="flex gap-2 w-3/4 self-end flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0"></div>
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-none p-3 text-sm text-white">
                    Can you explain Newton's second law simply?
                  </div>
                </div>
                <div className="flex gap-2 w-5/6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex-shrink-0 flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 text-sm text-slate-200 space-y-2">
                    <p>Certainly! Think of it like this: <br/><strong>F = m × a</strong></p>
                    <p className="text-slate-400">The heavier an object is (mass), the more force you need to make it move faster (acceleration).</p>
                    <div className="bg-slate-900 rounded p-2 text-xs border border-slate-700 font-mono">
                      Force = Mass × Acceleration
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2 items-center">
                <div className="h-8 flex-1 bg-slate-800 rounded-full px-4 flex items-center text-xs text-slate-500">Ask a question...</div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center"><ArrowRight className="w-4 h-4" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.7 Rich Content */}
      <section id="rich-content" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mockup Left */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-[3rem] blur-3xl transform -rotate-3"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden p-6 flex flex-col gap-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400"><PlayCircle className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Video Lectures</h4>
                  <p className="text-xs text-slate-500">100+ Hours of rich visual content</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><FileText className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">PDF Notes</h4>
                  <p className="text-xs text-slate-500">Downloadable study materials</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"><LayoutDashboard className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Interactive Infographics</h4>
                  <p className="text-xs text-slate-500">Visual representations of complex data</p>
                </div>
              </div>
            </div>
          </div>
          {/* Text Right */}
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-sm font-bold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase flex items-center gap-2">
              <Library className="w-4 h-4" /> Rich Content
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Interactive Learning <br/> Materials
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Go beyond text with rich visual videos, interactive infographics, comprehensive PDF notes, and clear diagrams.
            </p>
            <div className="pt-4 flex gap-3">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-sm">View Sample Content</Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3.8 Performance Analytics */}
      <section id="analytics" className="py-24 px-4 bg-white dark:bg-[#020817] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Left */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-orange-600 dark:text-orange-400 tracking-wider uppercase flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Analytics
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Track Your <br/> Growth
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get detailed performance analytics with a massive architecture simulating real exams to help you identify strengths and improve weaknesses.
            </p>
          </div>
          {/* Mockup Right */}
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400/10 dark:bg-orange-500/10 rounded-[3rem] blur-3xl transform rotate-2"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Performance Dashboard</span>
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Weekly view</Badge>
              </div>
              <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 p-4 flex flex-col justify-end gap-2">
                <div className="flex gap-1 items-end h-full w-full">
                  <div className="w-1/5 bg-slate-200 dark:bg-slate-700 rounded-t h-[30%]"></div>
                  <div className="w-1/5 bg-slate-200 dark:bg-slate-700 rounded-t h-[50%]"></div>
                  <div className="w-1/5 bg-slate-200 dark:bg-slate-700 rounded-t h-[40%]"></div>
                  <div className="w-1/5 bg-slate-200 dark:bg-slate-700 rounded-t h-[70%]"></div>
                  <div className="w-1/5 bg-orange-400 rounded-t h-[90%]"></div>
                </div>
                <span className="text-[10px] font-medium text-slate-500 text-center">Score Trend</span>
              </div>
              <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-center relative">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-emerald-500" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">75%</span>
                  <span className="text-[8px] text-slate-500">Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY DESHEXAM */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why DeshExam</h2>
            <div className="w-16 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'Fast', desc: 'Lightning-fast platform architecture built for seamless navigation.' },
              { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, title: 'Reliable', desc: '99.9% uptime with secure data infrastructure you can trust.' },
              { icon: <BrainCircuit className="w-5 h-5 text-purple-500" />, title: 'AI Powered', desc: 'Smart algorithms that adapt to your unique learning style.' },
              { icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />, title: 'Verified Content', desc: 'All study materials and institution data are manually verified.' },
              { icon: <SearchCode className="w-5 h-5 text-rose-500" />, title: 'SEO Optimized', desc: 'Institutions get maximum visibility through SEO-rich profiles.' },
              { icon: <User className="w-5 h-5 text-indigo-500" />, title: 'Personalized', desc: 'Tailored recommendations for exams, courses, and practice sets.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="mt-1">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-24 px-4 bg-white dark:bg-[#020817]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">What Our Users Say</h2>
            <div className="w-16 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Rahul Sharma', role: 'Engineering Aspirant', text: 'The mock tests here are exactly like the real JEE Mains. The detailed analytics helped me find my weak spots instantly.' },
              { name: 'Priya Patel', role: 'Medical Student', text: 'I found my dream coaching institute through the directory. The verified reviews saved me a lot of time and confusion.' },
              { name: 'Amit Kumar', role: 'UPSC Candidate', text: 'The AI study assistant is a game-changer. It explains complex topics so simply, it feels like having a personal tutor 24/7.' },
            ].map((test, idx) => (
              <Card key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 italic">"{test.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                      {test.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{test.name}</h4>
                      <span className="text-xs text-slate-500">{test.role}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="w-16 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-4">
            {[
              { q: 'Is DeshExam free to use?', a: 'Yes, basic features like the institution directory and a selection of practice sets are completely free. We also offer premium plans for advanced AI features and unlimited mock tests.' },
              { q: 'Which exams are supported?', a: 'We currently support major engineering (JEE), medical (NEET), and government exams (UPSC, SSC, Bank PO), with more added regularly.' },
              { q: 'Is the AI assistant included in all plans?', a: 'The AI study assistant is available as a limited trial for free users and fully unlocked for our premium subscribers.' },
              { q: 'Are the institutions listed verified?', a: 'Yes, our team manually verifies the institutions listed in our directory to ensure you get accurate and reliable information.' },
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-slate-900 dark:text-white">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-slate-500 transition-transform group-open:-rotate-180" />
                </summary>
                <div className="p-4 pt-0 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-2">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="py-24 px-4 bg-white dark:bg-[#020817]">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-emerald-600 shadow-2xl p-8 sm:p-16 text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-700 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
                Start Your Learning <br className="hidden sm:block" /> Journey Today
              </h2>
              <p className="text-emerald-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of students who are already learning smarter, practicing better, and achieving their goals with DeshExam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-emerald-700 hover:bg-slate-100 font-bold h-14 px-8 text-lg rounded-full shadow-xl w-full sm:w-auto">
                  Get Started Free
                </Button>
                <Button className="bg-emerald-800 text-white hover:bg-emerald-900 font-bold h-14 px-8 text-lg rounded-full border border-emerald-500 w-full sm:w-auto">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
