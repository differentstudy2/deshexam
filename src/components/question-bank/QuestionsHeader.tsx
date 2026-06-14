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
      router.push(`/questions/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#eaf7f0] via-[#f2fdf7] to-[#ffffff] py-16 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        
        <div className="space-y-3">
          <h1 className="text-4xl md:text-[40px] font-bold tracking-tight text-slate-900 font-sans">
            Practice Questions Smarter
          </h1>
          <p className="text-base md:text-lg text-slate-700 font-medium">
            Explore board and competitive exam questions with instant answer checking
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-slate-700 shadow-sm border border-slate-100">
            <strong className="font-semibold text-slate-900">1M+</strong> Questions
          </span>
          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-slate-700 shadow-sm border border-slate-100">
            <strong className="font-semibold text-slate-900">500+</strong> Exams
          </span>
          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-slate-700 shadow-sm border border-slate-100">
            <strong className="font-semibold text-slate-900">100K+</strong> Learners
          </span>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-[650px] mx-auto">
          <div className="flex items-center bg-white rounded-full shadow-sm border border-slate-200 p-1.5 pl-5 transition-all focus-within:ring-2 focus-within:ring-[#00a651] focus-within:ring-opacity-50">
            <Search className="h-5 w-5 text-slate-500 mr-2 flex-shrink-0" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by question, board, topic, exam..." 
              className="flex-1 outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-slate-700 placeholder:text-slate-400 text-[15px] h-10 px-0"
            />
            <Button type="button" variant="secondary" className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 h-10 flex items-center gap-2 font-medium">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center items-center gap-2 mt-8 max-w-[850px] mx-auto">
          <Button variant="default" className="rounded-full h-8 px-4 text-[13px] bg-[#3a9662] hover:bg-[#2d764d] text-white font-medium border-0">Academic</Button>
          <Button variant="secondary" className="rounded-full h-8 px-4 text-[13px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">Competitive</Button>
          <Button variant="secondary" className="rounded-full h-8 px-4 text-[13px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">MCQ</Button>
          <Button variant="secondary" className="rounded-full h-8 px-4 text-[13px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">Short Questions</Button>
          <Button variant="secondary" className="rounded-full h-8 px-4 text-[13px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">Mock Test</Button>
          <Button variant="secondary" className="rounded-full h-8 px-4 text-[13px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">WBBSE</Button>
          <Button variant="secondary" className="rounded-full h-8 px-4 text-[13px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">CBSE</Button>
          <Button variant="secondary" className="rounded-full h-8 px-4 text-[13px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">SSC</Button>
          <Button variant="secondary" className="rounded-full h-8 px-4 text-[13px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">Railway</Button>
          
          <Button variant="outline" className="rounded-full h-8 px-4 text-[13px] bg-white border-slate-200 text-slate-800 flex items-center gap-1.5 font-medium shadow-sm hover:bg-slate-50">
            Subject <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
          <Button variant="outline" className="rounded-full h-8 px-4 text-[13px] bg-white border-slate-200 text-slate-800 flex items-center gap-1.5 font-medium shadow-sm hover:bg-slate-50">
            Difficulty <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </div>

      </div>
    </div>
  )
}
