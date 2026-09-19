'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function QuestionsHeader() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/questions?q=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickFilter = (term: string) => {
    router.push(`/questions?q=${encodeURIComponent(term)}`);
  };

  return (
    <section className="w-full relative overflow-hidden bg-white dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800">
      {/* Premium Soft Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-blue-900/10 dark:via-indigo-900/5 dark:to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans drop-shadow-sm">
            Practice Questions <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Smarter</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto">
            Explore board and competitive exam questions with instant answer checking and detailed explanations.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 py-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm border border-white/40 dark:border-slate-700/50">
            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            <strong className="font-bold text-slate-900 dark:text-white">1M+</strong> Questions Solved
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm border border-white/40 dark:border-slate-700/50">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            <strong className="font-bold text-slate-900 dark:text-white">500+</strong> Subjects
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm border border-white/40 dark:border-slate-700/50">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <strong className="font-bold text-slate-900 dark:text-white">100K+</strong> Learners
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto pt-4">
          <div className="flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-2 pl-6 transition-all hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3 flex-shrink-0" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, topic, or exam..." 
              className="flex-1 outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base h-12 px-0"
            />
            <Button 
              type="submit" 
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 h-12 flex items-center gap-2 font-semibold shadow-md transition-all hover:shadow-lg"
            >
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center items-center gap-2 mt-8 max-w-3xl mx-auto">
          {['Academic', 'Competitive', 'MCQ', 'WBBSE', 'CBSE', 'SSC', 'NEET', 'JEE'].map((filter) => (
            <button 
              key={filter}
              onClick={() => handleQuickFilter(filter)} 
              className="rounded-full h-9 px-5 text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
            >
              {filter}
            </button>
          ))}
          <button className="rounded-full h-9 px-5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <SlidersHorizontal className="h-4 w-4 opacity-70" />
            More Filters
          </button>
        </div>

      </div>
    </section>
  )
}
