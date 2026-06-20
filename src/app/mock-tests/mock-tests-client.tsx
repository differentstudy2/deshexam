'use client';

import React, { useState, useEffect } from 'react';
import { MockTest } from '@/lib/assessment-types';
import { getAssessments } from '@/lib/firebase/assessment';
import { FeaturedMockTestCard } from '@/components/assessment/FeaturedMockTestCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MockTestsClient() {
  const [assessments, setAssessments] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [board, setBoard] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [language, setLanguage] = useState('All');
  const [sort, setSort] = useState('Popularity');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAssessments('mockTests');
        setAssessments((data as MockTest[]).filter(a => a.status === 'Published'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['All', 'WBBSE', 'WBCHSE', 'ICSE', 'WBCS', 'NEET', 'JEE', 'GK', 'Math', 'Science'];

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
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          (a.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || (a.tags || []).includes(category);
    const matchesDiff = difficulty === 'All' || a.difficulty === difficulty;
    // Add other filters as needed when taxonomies exist
    return matchesSearch && matchesCategory && matchesDiff;
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-semibold mb-6 shadow-xl">
                <span>🔥</span> 70,000+ Mock Tests Available
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                Online Mock Tests for <br className="hidden lg:block" /> Smarter Exam Preparation
              </h1>
              <p className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Practice exam-style mock tests, improve speed, accuracy, and boost rank with AI-powered analytics.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                <Button className="h-14 px-8 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white font-bold text-lg shadow-lg shadow-green-600/20 transition-all hover:scale-105">
                  Start Free Test
                </Button>
                <Button variant="outline" className="h-14 px-8 rounded-xl border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-md transition-all">
                  Explore Categories
                </Button>
              </div>

              {/* Trust Checks */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm font-medium text-blue-100/90">
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
                    <span className="text-blue-100 text-lg font-medium">Mock Tests:</span>
                    <span className="text-white text-2xl font-bold">70,000+</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-blue-100 text-lg font-medium">Daily Attempts:</span>
                    <span className="text-white text-2xl font-bold">120K+</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-blue-100 text-lg font-medium">Avg Rating:</span>
                    <span className="text-white text-2xl font-bold">4.8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 text-lg font-medium">Success Rate:</span>
                    <span className="text-white text-2xl font-bold">92%</span>
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
              placeholder="Search by exam, class, subject, topic..." 
              className="w-full h-12 pl-12 pr-4 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-[15px] font-medium placeholder:text-slate-400 focus-visible:ring-[#16A34A]"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 w-full xl:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Board</label>
              <Select value={board} onValueChange={setBoard}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="All">Select</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Class</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="All">Select</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-semibold"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="All">Select</SelectItem></SelectContent>
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
                <SelectContent><SelectItem value="All">All</SelectItem></SelectContent>
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

      {/* --- FEATURED MOCK TESTS GRID --- */}
      <div className="container max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">Featured Mock Tests</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#16A34A]" />
            <p className="font-medium">Loading premium mock tests...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No mock tests found matching your criteria.</p>
            <Button onClick={handleReset} variant="outline" className="mt-4 border-slate-300">Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sorted.map(assessment => (
              <FeaturedMockTestCard 
                key={assessment.id} 
                mockTest={assessment} 
                baseHref="/mock-tests" 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
