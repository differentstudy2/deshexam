'use client';

import React, { useState, useEffect } from 'react';
import { MockTest } from '@/lib/assessment-types';
import { FeaturedMockTestCard } from '@/components/assessment/FeaturedMockTestCard';
import { MockTestListCard } from '@/components/assessment/MockTestListCard';
import { MockTestsFooter } from '@/components/assessment/MockTestsFooter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, ChevronRight, CheckCircle2, LayoutGrid, List as ListIcon, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AssessmentClientProps {
  initialAssessments?: MockTest[];
  initialLeaderboard?: any[];
  initialChallenges?: any[];
  collectionName: string;
  type: string;
  heroBadgeText: string;
  heroTitle: React.ReactNode;
  heroDescription: string;
  primaryButtonText: string;
  baseHref: string;
  stats: {
    total: string;
    attempts: string;
    rating: string;
    successRate: string;
  };
  boards?: any[];
  classes?: any[];
  subjects?: any[];
}

export function AssessmentClient({
  collectionName,
  type,
  heroBadgeText,
  heroTitle,
  heroDescription,
  primaryButtonText,
  baseHref,
  stats,
  initialAssessments = [],
  initialLeaderboard = [],
  initialChallenges = [],
  boards = [],
  classes = [],
  subjects = [],
}: AssessmentClientProps) {
  const [assessments, setAssessments] = useState<MockTest[]>(initialAssessments);
  const [leaderboard, setLeaderboard] = useState<any[]>(initialLeaderboard);
  const [challenges, setChallenges] = useState<any[]>(initialChallenges);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [board, setBoard] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [language, setLanguage] = useState('All');
  const [sort, setSort] = useState('Popularity');



  const categories = ['All', 'WBBSE', 'WBCHSE', 'ICSE', 'CBSE', 'WBCS', 'NEET', 'JEE', 'GK', 'Math', 'Science'];

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setBoard('All');
    setClassFilter('All');
    setSubject('All');
    setDifficulty('All');
    setLanguage('All');
    setSort('Popularity');
  };

  const filtered = assessments.filter(a => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      a.title.toLowerCase().includes(searchLower) || 
      (a.description || '').toLowerCase().includes(searchLower);

    // Pill category acts as a unified filter
    const matchesCategory = category === 'All' || 
      (a.tags || []).includes(category) || 
      a.boardId === category || 
      a.subjectId === category;

    // Dropdown filters
    const matchesDiff = difficulty === 'All' || a.difficulty === difficulty;
    const matchesBoard = board === 'All' || a.boardId === board;
    const matchesClass = classFilter === 'All' || a.classId === classFilter;
    const matchesSubject = subject === 'All' || a.subjectId === subject;
    const matchesLanguage = language === 'All' || a.language === language;

    return matchesSearch && matchesCategory && matchesDiff && matchesBoard && matchesClass && matchesSubject && matchesLanguage;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Newest') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    // Default: Popularity (views)
    const viewsA = (a as any).viewsCount || 0;
    const viewsB = (b as any).viewsCount || 0;
    return viewsB - viewsA;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-20 dark:bg-slate-950 font-inter">
      
      {/* --- HERO SECTION --- */}
      <section className="relative w-full overflow-hidden bg-[#0a1128] pt-16 pb-32">
        {/* Background Grid & Blobs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute top-[20%] right-[30%] w-64 h-64 bg-purple-600/30 rounded-full blur-[100px]"></div>

        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left mt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-[13px] sm:text-sm font-semibold mb-6 shadow-xl">
                <span>🔥</span> {heroBadgeText}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.2] lg:leading-[1.1] mb-4 sm:mb-6 tracking-tight px-2 sm:px-0">
                {heroTitle}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-blue-100/80 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0">
                {heroDescription}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10 w-full px-4 sm:px-0">
                <Button className="w-full sm:w-auto h-12 sm:h-14 px-8 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white font-bold text-base sm:text-lg shadow-lg shadow-green-600/20 transition-all hover:scale-105">
                  {primaryButtonText}
                </Button>
                <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-8 rounded-xl border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white font-bold text-base sm:text-lg backdrop-blur-md transition-all">
                  Explore Categories
                </Button>
              </div>

              {/* Trust Checks */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-[13px] sm:text-sm font-medium text-blue-100/90 px-4 sm:px-0">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> 50K+ Students</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Live Rankings</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> AI Analytics</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Instant Results</div>
              </div>
            </div>

            {/* Hero Stats Card */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-8 shadow-2xl shadow-black/50">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-blue-100 text-lg font-medium">{type}s:</span>
                    <span className="text-white text-2xl font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-blue-100 text-lg font-medium">Daily Attempts:</span>
                    <span className="text-white text-2xl font-bold">{stats.attempts}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-blue-100 text-lg font-medium">Avg Rating:</span>
                    <span className="text-white text-2xl font-bold">{stats.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 text-lg font-medium">Success Rate:</span>
                    <span className="text-white text-2xl font-bold">{stats.successRate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FLOATING FILTER BAR --- */}
      <div className="container max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-[24px] p-4 flex flex-col xl:flex-row items-center gap-4">
          
          <div className="relative flex-grow w-full xl:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder={`Search by exam, class, subject, topic...`} 
              className="w-full h-12 pl-12 pr-4 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-[15px] font-medium placeholder:text-slate-400 focus-visible:ring-[#16A34A]"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 w-full xl:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Board</label>
              <Select value={board} onValueChange={setBoard}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {boards.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                  ))}
                  {/* Keep fallback options in case DB is empty */}
                  {boards.length === 0 && (
                    <>
                      <SelectItem value="WBBSE">WBBSE</SelectItem>
                      <SelectItem value="WBCHSE">WBCHSE</SelectItem>
                      <SelectItem value="ICSE">ICSE</SelectItem>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="WBCS">WBCS</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Class</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                  {classes.length === 0 && (
                    <>
                      <SelectItem value="Class 10">Class 10</SelectItem>
                      <SelectItem value="Class 12">Class 12</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                  {subjects.length === 0 && (
                    <>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Bengali">Bengali</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Sort</label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Popularity">Popularity</SelectItem>
                  <SelectItem value="Newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end gap-3 w-full xl:w-auto h-[62px] pb-0.5">
            <Button className="h-10 flex-1 xl:w-24 bg-[#16A34A] hover:bg-green-700 text-white font-bold rounded-lg shadow-sm">
              Filter
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-10 flex-1 xl:w-24 font-bold border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300">
              Reset
            </Button>
          </div>

        </div>
      </div>

      {/* --- CATEGORY PILLS --- */}
      <div className="container max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "h-10 px-6 rounded-full font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 shadow-sm border",
                category === cat 
                  ? "bg-[#16A34A] text-white border-[#16A34A] shadow-green-500/20" 
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-green-500/50 hover:text-[#16A34A]"
              )}
            >
              {cat}
            </button>
          ))}
          <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm flex-shrink-0">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- FEATURED SECTION --- */}
      <div className="container max-w-7xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Featured {type}s</h2>
          <Button variant="link" className="text-[#16A34A] font-bold">View All</Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorted.slice(0, 4).map(assessment => (
              <FeaturedMockTestCard 
                key={assessment.id} 
                mockTest={assessment} 
                baseHref={baseHref} 
              />
            ))}
          </div>
        )}
      </div>

      {/* --- BROWSE ALL SECTION --- */}
      <div className="container max-w-7xl mx-auto px-4 mt-16">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Browse All {type}s</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sorted.length.toLocaleString()} items found</p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all", viewMode === 'grid' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              <ListIcon className="w-4 h-4" /> List
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Content (Grid or List) */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#16A34A]" />
                <p className="font-medium">Loading {type.toLowerCase()}s...</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No items found matching your criteria.</p>
                <Button onClick={handleReset} variant="outline" className="mt-4 border-slate-300">Clear Filters</Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sorted.map(assessment => (
                  <FeaturedMockTestCard 
                    key={assessment.id} 
                    mockTest={assessment} 
                    baseHref={baseHref} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sorted.map(assessment => (
                  <MockTestListCard 
                    key={assessment.id} 
                    mockTest={assessment} 
                    baseHref={baseHref} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full xl:w-[320px] shrink-0 space-y-6">
            
            {/* Premium Upgrade Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[10px] p-6 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                Premium Upgrade
              </span>
              <h3 className="text-2xl font-extrabold leading-tight mb-4">Unlock Unlimited<br/>Access</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm font-medium"><CheckCircle className="w-4 h-4 text-purple-200" /> Unlimited access</li>
                <li className="flex items-center gap-2 text-sm font-medium"><CheckCircle className="w-4 h-4 text-purple-200" /> AI analytics</li>
                <li className="flex items-center gap-2 text-sm font-medium"><CheckCircle className="w-4 h-4 text-purple-200" /> Rank prediction</li>
              </ul>
              <Button className="w-full bg-white text-purple-700 hover:bg-slate-100 font-bold h-11 rounded-xl shadow-sm">
                Upgrade Now
              </Button>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Leaderboard Preview</h3>
              
              {/* Avatars row */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {leaderboard.slice(0, 4).map((lb, i) => (
                  <div key={i} className={`relative rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm ${i === 1 || i === 2 ? 'w-12 h-12 z-10 -mt-2' : 'w-10 h-10 opacity-80'}`}>
                    <img src={lb.avatar || `https://i.pravatar.cc/150?u=${lb.id}`} alt={lb.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Leaderboard List */}
              <div className="space-y-2">
                {leaderboard.slice(0, 4).map((lb, i) => (
                  <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800/50 rounded-xl p-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-base font-bold w-4 text-center", i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-400")}>
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src={lb.avatar || `https://i.pravatar.cc/150?u=${lb.id}`} alt={lb.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{lb.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{lb.studentsCount} students</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Challenge Card */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-[20px] p-5 border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Daily Challenge Card</h3>
              <div className="space-y-3">
                {challenges.map((ch, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800/50 rounded-xl p-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", 
                      ch.type === 'warning' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    )}>
                      {ch.type === 'warning' ? <Clock className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{ch.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <MockTestsFooter />
    </div>
  );
}
