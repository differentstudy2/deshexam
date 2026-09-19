'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function QuestionSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to a dedicated search page (could be Meilisearch powered)
      router.push(`/questions/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto flex items-center shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-[#00a651] transition-all">
      <div className="pl-4 text-slate-400">
        <Search className="h-5 w-5" />
      </div>
      <Input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for questions, boards, topics..."
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-12 text-base"
      />
      <Button type="submit" className="h-12 rounded-none px-6 bg-[#00a651] hover:bg-[#009045]">
        Search
      </Button>
    </form>
  );
}
