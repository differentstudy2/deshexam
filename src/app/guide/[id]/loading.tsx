import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Loading Content...</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2">Fetching from the powerful backend</p>
    </div>
  );
}
