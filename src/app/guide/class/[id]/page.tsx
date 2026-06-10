import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuideNodeBySlugOrId, getGuideSubjectsByClass } from '@/lib/firebase/guide';
import { ChevronRight, BookOpen } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const classItem: any = await getGuideNodeBySlugOrId('guide_classes', decodedId);
  
  if (!classItem) return { title: 'Class Not Found' };

  return {
    title: `${classItem.seoTitle || classItem.title || 'Class'} - Academy Guide`,
    description: classItem.description || `View all subjects under ${classItem.title}`,
    openGraph: {
      title: classItem.seoTitle || classItem.title,
      description: classItem.description,
      ...(classItem.featureImage ? { images: [{ url: classItem.featureImage }] } : {})
    }
  };
}

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const classItem: any = await getGuideNodeBySlugOrId('guide_classes', decodedId);

  if (!classItem) {
    notFound();
  }

  const subjects = await getGuideSubjectsByClass(classItem.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/guide/class" className="hover:text-emerald-600 transition-colors">Classes</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-slate-800 dark:text-slate-200">{classItem.title}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-[#107c41]" />
            {classItem.title}
          </h1>
          <p className="text-slate-500">Select your subject to continue.</p>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
            No subjects are currently available for this class.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub: any) => (
              <SubjectCard key={sub.id} subject={sub} classItem={classItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubjectCard({ subject, classItem }: { subject: any, classItem: any }) {
  return (
    <Link href={`/guide/subject/${subject.slug || subject.id}`} className="block h-full">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-[#107c41]/50 h-full">
        <div className="bg-[#f0f9f4] dark:bg-emerald-900/20 p-5 border-b border-[#e2f0e8] dark:border-emerald-900/30 flex items-center gap-3">
          <div className="bg-[#107c41] p-2.5 rounded-lg text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              {subject.title || subject.name || 'Unnamed Subject'}
            </h2>
            <p className="text-xs text-slate-500">{classItem.title}</p>
          </div>
        </div>
        <div className="p-5 flex-1 flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          View textbooks <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}
