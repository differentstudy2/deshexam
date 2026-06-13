import React from 'react';
import Link from 'next/link';

export default function GuideBoardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Educational Boards</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Select a board to view its classes and curriculum.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/guide/class" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-colors group">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">CBSE</h2>
          </Link>
          <Link href="/guide/class" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-colors group">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">ICSE</h2>
          </Link>
          <Link href="/guide/class" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-colors group">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">WBBSE</h2>
          </Link>
        </div>
      </div>
    </div>
  );
}
