import React from 'react';
import Link from 'next/link';
import { getTaxonomyNodesByType } from '@/lib/firebase/taxonomy';

export const dynamic = 'force-dynamic';

export default async function GuideClassPage() {
  const classes = await getTaxonomyNodesByType('academic', 'class');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Classes</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Select a class to view its subjects and curriculum.
        </p>
        
        {classes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">No classes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
              <Link key={cls.id} href={`/guide/${cls.slug || cls.id}`} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-600 transition-colors group">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{cls.title}</h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
