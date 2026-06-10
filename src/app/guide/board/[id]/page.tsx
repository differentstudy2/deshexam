import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuideNodeBySlugOrId, getGuideClassesByBoard } from '@/lib/firebase/guide';
import { ChevronRight, GraduationCap, Library } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const board: any = await getGuideNodeBySlugOrId('guide_boards', decodedId);
  
  if (!board) return { title: 'Board Not Found' };

  return {
    title: `${board.seoTitle || board.title || 'Board'} - Academy Guide`,
    description: board.description || `View all classes under ${board.title}`,
    openGraph: {
      title: board.seoTitle || board.title,
      description: board.description,
      ...(board.featureImage ? { images: [{ url: board.featureImage }] } : {})
    }
  };
}

export default async function BoardDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const board: any = await getGuideNodeBySlugOrId('guide_boards', decodedId);

  if (!board) {
    notFound();
  }

  const classes = await getGuideClassesByBoard(board.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/guide/board" className="hover:text-emerald-600 transition-colors">Boards</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-slate-800 dark:text-slate-200">{board.title}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <Library className="w-8 h-8 text-[#107c41]" />
            {board.title}
          </h1>
          <p className="text-slate-500">Select your class to continue.</p>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
            No classes are currently available for this board.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls: any) => (
              <ClassCard key={cls.id} classItem={cls} board={board} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClassCard({ classItem, board }: { classItem: any, board: any }) {
  return (
    <Link href={`/guide/class/${classItem.slug || classItem.id}`} className="block h-full">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-[#107c41]/50 h-full">
        <div className="bg-[#f0f9f4] dark:bg-emerald-900/20 p-5 border-b border-[#e2f0e8] dark:border-emerald-900/30 flex items-center gap-3">
          <div className="bg-[#107c41] p-2.5 rounded-lg text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              {classItem.title || classItem.name || 'Unnamed Class'}
            </h2>
            <p className="text-xs text-slate-500">{board.title}</p>
          </div>
        </div>
        <div className="p-5 flex-1 flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          View subjects <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}
