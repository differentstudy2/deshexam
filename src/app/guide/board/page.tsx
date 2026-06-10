import React from 'react';
import Link from 'next/link';
import { getGuideBoards, getGuideClassesByBoard } from '@/lib/firebase/guide';
import { ChevronRight, GraduationCap, BookOpen, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Boards - Academy Guide',
  description: 'Select your educational board to view classes and curriculum.'
};

export default async function BoardsIndexPage() {
  const boards = await getGuideBoards();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/academy" className="hover:text-emerald-600 transition-colors">Academy</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-slate-800 dark:text-slate-200">Boards</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <Library className="w-8 h-8 text-[#107c41]" />
            Educational Boards
          </h1>
          <p className="text-slate-500">Select your educational board to get started with the curriculum.</p>
        </div>

        {boards.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
            No boards are currently available. Please check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board: any) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function BoardCard({ board }: { board: any }) {
  const classes = await getGuideClassesByBoard(board.id);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <Link href={`/guide/board/${board.slug || board.id}`} className="block">
        <div className="bg-[#f0f9f4] dark:bg-emerald-900/20 p-5 border-b border-[#e2f0e8] dark:border-emerald-900/30 flex items-center gap-3 hover:bg-[#e6f4ec] dark:hover:bg-emerald-900/30 transition-colors">
          <div className="bg-[#107c41] p-2.5 rounded-lg text-white">
            <Library className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
            {board.title || board.name || 'Unnamed Board'}
          </h2>
        </div>
      </Link>
      
      <div className="p-5 flex-1">
        {classes.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-2">No classes added yet.</p>
        ) : (
          <ul className="space-y-2">
            {classes.slice(0, 5).map((cls: any) => (
              <li key={cls.id}>
                <Link 
                  href={`/guide/class/${cls.slug || cls.id}`} 
                  className="group flex items-center text-[14px] text-slate-600 dark:text-slate-300 hover:text-[#107c41] dark:hover:text-emerald-400 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#107c41] dark:group-hover:text-emerald-400 mr-2 transition-colors" />
                  {cls.title || cls.name}
                </Link>
              </li>
            ))}
            {classes.length > 5 && (
              <li className="pt-2">
                <Link 
                  href={`/guide/board/${board.slug || board.id}`}
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View all {classes.length} classes
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
