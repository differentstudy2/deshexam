import React from 'react';
import Link from 'next/link';
import { getGuideClasses, getGuideSubjectsByClass } from '@/lib/firebase/guide';
import { ChevronRight, GraduationCap } from 'lucide-react';

export const metadata = {
  title: 'Classes - Academy Guide',
  description: 'Select your class to view subjects and curriculum.'
};

export default async function ClassesIndexPage() {
  const classes = await getGuideClasses();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/academy" className="hover:text-emerald-600 transition-colors">Academy</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-slate-800 dark:text-slate-200">Classes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-[#107c41]" />
            All Classes
          </h1>
          <p className="text-slate-500">Select your class to get started with the curriculum.</p>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
            No classes are currently available. Please check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls: any) => (
              <ClassCard key={cls.id} classItem={cls} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function ClassCard({ classItem }: { classItem: any }) {
  const subjects = await getGuideSubjectsByClass(classItem.id);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <Link href={`/guide/class/${classItem.slug || classItem.id}`} className="block">
        <div className="bg-[#f0f9f4] dark:bg-emerald-900/20 p-5 border-b border-[#e2f0e8] dark:border-emerald-900/30 flex items-center gap-3 hover:bg-[#e6f4ec] dark:hover:bg-emerald-900/30 transition-colors">
          <div className="bg-[#107c41] p-2.5 rounded-lg text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
            {classItem.title || classItem.name || 'Unnamed Class'}
          </h2>
        </div>
      </Link>
      
      <div className="p-5 flex-1">
        {subjects.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-2">No subjects added yet.</p>
        ) : (
          <ul className="space-y-2">
            {subjects.slice(0, 5).map((sub: any) => (
              <li key={sub.id}>
                <Link 
                  href={`/guide/subject/${sub.slug || sub.id}`} 
                  className="group flex items-center text-[14px] text-slate-600 dark:text-slate-300 hover:text-[#107c41] dark:hover:text-emerald-400 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#107c41] dark:group-hover:text-emerald-400 mr-2 transition-colors" />
                  {sub.title || sub.name}
                </Link>
              </li>
            ))}
            {subjects.length > 5 && (
              <li className="pt-2">
                <Link 
                  href={`/guide/class/${classItem.slug || classItem.id}`}
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View all {subjects.length} subjects
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
