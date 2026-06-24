"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, ChevronDown, Star, BookOpen, Layers, BookMarked, MoreVertical, Library } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { DashboardSidebar } from './DashboardSidebar';
import { ContinueLearningWidget, DailyGoalWidget, WeakSubjectsWidget, RecommendedCarousel } from './DashboardWidgets';

export function ClassDashboard({ classes }: { classes: any[] }) {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const tabs = ['All', 'School', 'Primary', 'Secondary', 'Higher Secondary', 'Competitive'];

  const filteredClasses = classes.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeTab === 'All') return true;
    
    const title = c.title.toLowerCase();
    
    if (activeTab === 'Primary') {
      return ['1', '2', '3', '4', '5', 'primary', 'pre'].some(k => title.includes(k));
    }
    if (activeTab === 'Secondary') {
      return ['6', '7', '8', '9', '10', 'secondary'].some(k => title.includes(k));
    }
    if (activeTab === 'Higher Secondary') {
      return ['11', '12', 'higher'].some(k => title.includes(k));
    }
    if (activeTab === 'School') {
      return !['admission', 'job', 'bcs', 'university'].some(k => title.includes(k));
    }
    if (activeTab === 'Competitive') {
      return ['admission', 'job', 'bcs', 'university', 'competitive'].some(k => title.includes(k));
    }
    
    // Dropdown filters logic
    if (selectedBoard) {
      // Allow if boardSlug matches, or if it's missing, let's just match title or assume it passes for now to not hide everything 
      // since mock data might not have boardSlug for all. We'll do a loose text match.
      const boardMatch = c.boardSlug === selectedBoard || title.includes(selectedBoard.toLowerCase());
      if (!boardMatch) return false;
    }
    
    if (selectedMedium) {
      const mediumMatch = c.mediumSlug === selectedMedium || title.includes(selectedMedium.toLowerCase());
      if (!mediumMatch) return false;
    }
    
    if (selectedCategory) {
      const catMatch = c.categorySlug === selectedCategory || title.includes(selectedCategory.toLowerCase()) || c.type === selectedCategory;
      if (!catMatch) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24">
      {/* Hero Section */}
      <div className="relative pt-16 pb-24 px-6 lg:px-24 overflow-hidden bg-gradient-to-br from-[#e0f7eb] via-[#e8fbf3] to-[#e0effc] dark:from-[#0a1f16] dark:via-[#051310] dark:to-[#071525]">
        {/* Background Decorative Blur */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#a2d5fd]/30 to-transparent blur-3xl rounded-full translate-x-1/3 -translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            {user && userProfile && (
              <div className="inline-block px-4 py-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-6 shadow-sm">
                👋 Welcome back, <span className="text-emerald-600 dark:text-emerald-400">{userProfile.displayName || 'Student'}</span>!
              </div>
            )}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
              Browse Classes & Start Learning
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed">
              Explore board-wise textbooks, subjects, notes, MCQ, CQ, practice tests and chapter-wise learning resources.
            </p>

            {/* Search Bar */}
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-1.5 pl-6 max-w-xl mx-auto lg:mx-0 mb-6 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search class, board, subject..." 
                className="w-full bg-transparent border-none focus:ring-0 px-4 text-slate-700 dark:text-slate-200 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium mr-1">Filter</span>
              
              <div className="relative">
                <select 
                  className="appearance-none bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 pl-4 pr-8 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 dark:text-slate-300"
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                >
                  <option value="">Board</option>
                  <option value="wbbse">WBBSE</option>
                  <option value="cbse">CBSE</option>
                  <option value="icse">ICSE</option>
                  <option value="wbchse">WBCHSE</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>

              <div className="relative">
                <select 
                  className="appearance-none bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 pl-4 pr-8 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 dark:text-slate-300"
                  value={selectedMedium}
                  onChange={(e) => setSelectedMedium(e.target.value)}
                >
                  <option value="">Medium</option>
                  <option value="bengali">Bengali</option>
                  <option value="english">English</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>

              <div className="relative">
                <select 
                  className="appearance-none bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 pl-4 pr-8 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 dark:text-slate-300"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Category</option>
                  <option value="school">School</option>
                  <option value="competitive">Competitive</option>
                  <option value="skill">Skill</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>

            </div>
          </div>

          {/* Right Image & Stats */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none flex flex-col items-center">
            {/* Fake 3D books & graduation cap illustration using Lucide */}
            <div className="relative w-full h-[280px] lg:h-[350px] flex items-center justify-center mb-8">
              <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-500/10 blur-[80px] rounded-full"></div>
              <div className="relative z-10 w-64 h-64">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-bounce z-20">
                  <GraduationCap className="w-32 h-32 text-[#1b6b3e] dark:text-emerald-500 drop-shadow-2xl" />
                </div>
                <div className="absolute bottom-10 left-4 animate-pulse">
                  <BookOpen className="w-24 h-24 text-blue-500 drop-shadow-xl" />
                </div>
                <div className="absolute bottom-4 right-0">
                  <Layers className="w-28 h-28 text-emerald-500 drop-shadow-xl" />
                </div>
                <div className="absolute top-10 right-4 animate-bounce">
                  <BookMarked className="w-16 h-16 text-amber-400 drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-2 sm:gap-4 justify-center flex-wrap">
              {[
                { count: '15+', label: 'Classes' },
                { count: '500+', label: 'Subjects' },
                { count: '8k+', label: 'Chapters' },
                { count: '100k+', label: 'Questions' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center min-w-[80px] sm:min-w-[90px] transform hover:-translate-y-1 transition-transform">
                  <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">{stat.count}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-24 py-12">
        
        {/* Personalized Dashboard Widgets */}
            {user ? (
              <div className="mb-12 space-y-6">
                <ContinueLearningWidget userProfile={userProfile} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DailyGoalWidget userProfile={userProfile} />
                  <WeakSubjectsWidget userProfile={userProfile} />
                </div>
                <RecommendedCarousel userProfile={userProfile} />
              </div>
            ) : null}

        {/* Quick Filters */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Filters</h2>
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-[#00a651] text-white shadow-md shadow-green-500/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Available Classes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClasses.length > 0 ? filteredClasses.map((cls, idx) => {
              // Fake stats for UI mockup purposes
              const subjectsCount = 25;
              const booksCount = 300;
              const questionsCount = 30;
              const isPopular = idx === 4 || idx === 7 || cls.title.includes('9') || cls.title.includes('12');
              const isHighlighted = idx === 6 || cls.title.includes('10');
              const isWarningHighlighted = idx === 7 || cls.title.includes('12');

              let borderClass = 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500';
              if (isHighlighted) borderClass = 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20';
              if (isWarningHighlighted) borderClass = 'border-amber-400 dark:border-amber-500 ring-1 ring-amber-400/20';

              return (
                <div key={cls.id} className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 border ${borderClass} shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col relative`}>
                  
                  {isPopular && (
                    <div className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Popular
                    </div>
                  )}

                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" aria-label={`Class ${cls.title} study materials on DeshExam`}>
                    <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  </div>

                  <Link href={`/guide/${cls.slug || cls.id}`}>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 hover:text-emerald-600 transition-colors">{cls.title}</h3>
                  </Link>

                  <div className="grid grid-cols-3 gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div className="text-center">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{subjectsCount}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Subjects</p>
                    </div>
                    <div className="text-center border-l border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{booksCount}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Books</p>
                    </div>
                    <div className="text-center border-l border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{questionsCount}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Questions</p>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex flex-col 2xl:flex-row gap-2">
                      <Link href={`/guide/${cls.slug || cls.id}`} className="flex-1 bg-[#00a651] hover:bg-[#008c44] text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl text-center transition-colors">
                        Explore <span className="sr-only">{cls.title} Study Materials</span>
                      </Link>
                      <Link href={`/guide/${cls.slug || cls.id}`} className="flex-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-bold py-2.5 rounded-xl text-center transition-colors">
                        Practice <span className="sr-only">{cls.title} Mock Tests</span>
                      </Link>
                    </div>
                    <Link href={`/guide/${cls.slug || cls.id}`} className="block w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold py-2.5 rounded-xl text-center transition-colors">
                      Quick Practice <span className="sr-only">{cls.title} Questions</span>
                    </Link>
                  </div>

                </div>
              );
            }) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 dark:text-slate-400">No classes found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Popular Boards */}
        <div className="mb-16 mt-16">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Popular Subjects & Boards</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The most popular boards and exams</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {['WBBSE', 'CBSE', 'ICSE', 'WBCHSE', 'JEE', 'NEET', 'Medical', 'Engineering'].slice(0, 8).map((board, idx) => (
              <Link key={idx} href="#" className="group bg-gradient-to-b from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-center flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Library className="w-7 h-7 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{board}</h3>
                  <p className="text-xs text-slate-500 font-medium">Subjects</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Promo Banner */}
        <div className="relative w-full bg-gradient-to-r from-[#0a1b14] via-[#0d2a1d] to-[#0a1b14] rounded-3xl p-8 sm:p-12 overflow-hidden border border-emerald-900/30 shadow-[0_0_40px_rgba(0,166,81,0.15)] flex flex-col items-center text-center mt-8">
          {/* Floating decorative elements */}
          <div className="absolute top-6 left-10 w-4 h-4 rounded-full border-2 border-pink-400 opacity-60"></div>
          <div className="absolute bottom-8 left-20 w-12 h-4 bg-blue-500 rounded-full rotate-45 opacity-80"></div>
          <div className="absolute bottom-6 right-24 w-8 h-8 bg-amber-400 rounded-lg rotate-12 opacity-90"></div>
          <div className="absolute top-10 right-16 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[16px] border-l-transparent border-r-transparent border-b-emerald-400 rotate-45 opacity-70"></div>
          <div className="absolute top-1/2 left-4 w-12 h-12 bg-emerald-500 rounded-full blur-[30px] opacity-40"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20"></div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 relative z-10">
            Ready to boost your exam preparation?
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <Link href="#" className="bg-[#00a651] hover:bg-[#008c44] text-white px-8 py-3.5 rounded-xl font-bold transition-colors w-full sm:w-auto">
              Start Learning
            </Link>
            <Link href="#" className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3.5 rounded-xl font-bold transition-colors w-full sm:w-auto">
              Try Mock Test
            </Link>
          </div>
        </div>

        {/* SEO Content Block */}
        <div className="mt-20 pt-16 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
          <div className="max-w-4xl mx-auto space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Why Study with DeshExam Academy?</h2>
              <div className="space-y-4 text-base leading-relaxed">
                <p>
                  Welcome to DeshExam Academy, your ultimate destination for comprehensive, class-wise online learning. 
                  Whether you are preparing for primary school assessments, secondary board exams, or higher secondary competitive tests, 
                  our platform provides everything you need in one place. We meticulously organize class-wise learning resources, 
                  so you can easily access chapter-wise textbooks, curated notes, and extensive MCQ practice sets.
                </p>
                <p>
                  By choosing DeshExam Academy, you are embracing smart study techniques. From detailed explanations to mock tests 
                  and previous year questions, we ensure your board exam preparation is completely guided and structured. 
                  Our personalized dashboard allows you to track your learning progress, identify weak subjects, and focus on recommended topics.
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Class-Wise Learning & Board Exam Preparation</h2>
              <p className="mb-6 text-base leading-relaxed">
                We cover a wide array of educational boards and classes. Our materials are tailored for specific curriculum requirements, ensuring that every student gets relevant and up-to-date content for maximum score improvement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Available Boards</h3>
                  <ul className="space-y-3">
                    <li><Link href="/academy/wbbse" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>WBBSE (West Bengal Board)</Link></li>
                    <li><Link href="/boards/wbbse" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>WBBSE (West Bengal Board)</Link></li>
                    <li><Link href="/boards/wbchse" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>WBCHSE (Higher Secondary)</Link></li>
                    <li><Link href="/boards/cbse" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>CBSE (Central Board)</Link></li>
                    <li><Link href="/boards/icse" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>ICSE (Indian Certificate)</Link></li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Popular Classes</h3>
                  <ul className="space-y-3">
                    <li><Link href="/classes/class-5" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Class 5 Online Textbooks</Link></li>
                    <li><Link href="/classes/class-6" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Class 6 Study Materials</Link></li>
                    <li><Link href="/classes/class-10" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Class 10 Bengali Textbooks & Notes</Link></li>
                    <li><Link href="/exams/madhyamik" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Madhyamik Exam Preparation</Link></li>
                    <li><Link href="/exams/hs" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>HS (Higher Secondary) MCQ Practice</Link></li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Comprehensive Study Resources</h2>
              <p className="mb-6 text-base leading-relaxed">
                Access a vast library of structured study materials, carefully curated by expert educators to help you master every subject and crack competitive exams with confidence.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Study Materials</h3>
                  <ul className="space-y-3">
                    <li><Link href="/textbooks" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Textbooks & PDF Notes</Link></li>
                    <li><Link href="/practice" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Chapter-wise MCQ Practice</Link></li>
                    <li><Link href="/previous-year-papers" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Previous Year Questions (PYQ)</Link></li>
                    <li><Link href="/textbook-solutions" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Subject-wise Solutions</Link></li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tests & Assessments</h3>
                  <ul className="space-y-3">
                    <li><Link href="/mock-tests" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Mock Tests & Exam Series</Link></li>
                    <li><Link href="/practice" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Daily Practice Problems (DPP)</Link></li>
                    <li><Link href="/dashboard" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Performance Analytics</Link></li>
                    <li><Link href="/dashboard" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Weak Area Improvement</Link></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
