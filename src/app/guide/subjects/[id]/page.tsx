import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Library, ArrowRight } from 'lucide-react';
import { getTaxonomyNodeById, getTaxonomyNodesByParent } from '@/lib/firebase/taxonomy';
import { getCurriculumBySubject, getGuideSubjects } from '@/lib/firebase/guide';
import { SubjectDashboard } from '@/components/guide/SubjectDashboard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const node = await getTaxonomyNodeById(decodedId);

  if (!node) return { title: 'Not Found' };

  if (node.type === 'subject') {
    return {
      title: `${node.seoTitle || node.title} - Academy Guide`,
      description: node.description || `Explore the complete syllabus and guide for ${node.title}.`,
      openGraph: {
        title: node.seoTitle || node.title,
        description: node.description,
        ...(node.featureImage ? { images: [{ url: node.featureImage }] } : {})
      }
    };
  }

  return {
    title: `Subjects for ${node.acronym || node.title} - Academy Guide`,
    description: `Browse all subjects available for ${node.acronym || node.title}.`,
  };
}

export default async function SubjectsOrSingleSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  
  // 1. Fetch the node
  const node = await getTaxonomyNodeById(decodedId);
  if (!node || (node.type !== 'class' && node.type !== 'subject')) {
    notFound();
  }

  // 2. If it's a subject, render the single subject view (SubjectDashboard)
  if (node.type === 'subject') {
    let subjects: any[] = [];
    if (node.parentId) {
      const classNodes = await getTaxonomyNodesByParent(node.parentId);
      const relevantNodes = classNodes.filter(n => n.type === 'subject' || n.type === 'textbook');
      subjects = relevantNodes.map(n => ({
        id: n.id,
        title: n.title || (n as any).name,
        countStr: ''
      }));
    } else {
      subjects = await getGuideSubjects();
    }
    const fullCurriculum = await getCurriculumBySubject(node.id);
    
    // Attempt to get class details if parentId exists
    let classTitle = 'Class';
    let boardTitle = 'Board';
    if (node.parentId) {
      const classNode = await getTaxonomyNodeById(node.parentId);
      if (classNode) {
        classTitle = classNode.title;
        if (classNode.parentId) {
          const boardNode = await getTaxonomyNodeById(classNode.parentId);
          if (boardNode) boardTitle = boardNode.title;
        }
      }
    }

    return (
      <SubjectDashboard 
        id={node.id} 
        pageType="subject"
        subjects={subjects} 
        curriculum={fullCurriculum} 
        boardTitle={boardTitle}
        classTitle={classTitle}
        subjectTitle={node.title}
      />
    );
  }

  // 3. If it's a class, fetch the subjects belonging to this class
  const classNode = node;
  const subjects = await getTaxonomyNodesByParent(decodedId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">
      
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex flex-wrap items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <Link href="/guide/board" className="hover:text-emerald-600 transition-colors">Boards</Link>
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-slate-800 dark:text-slate-200">{classNode.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="bg-[#dcefe2] dark:bg-emerald-900/20 px-8 py-10 rounded-2xl mb-10 text-center md:text-left relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] dark:text-slate-100 mb-3">
              {classNode.title} Subjects
            </h2>
            <p className="text-base text-[#5c7a6b] dark:text-emerald-200/70 max-w-2xl">
              Select a subject below to view its complete curriculum, read textbooks, chapters, and practice topics.
            </p>
          </div>
          <Library className="absolute -right-6 -bottom-6 w-48 h-48 text-[#107c41] opacity-5 dark:opacity-10 transform -rotate-12 pointer-events-none" />
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">No subjects found</h3>
            <p className="text-sm text-slate-500 mt-1">Subjects have not been added to this class yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <Link 
                href={`/guide/${subject.slug || subject.id}`} 
                key={subject.id}
                className="group relative flex flex-col bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all duration-200 ease-in-out hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Library className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {subject.title}
                </h3>
                
                {subject.description ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {subject.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Explore the complete syllabus, notes, and questions for {subject.title}.
                  </p>
                )}

                <div className="mt-auto flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-500">
                  <span>View Curriculum</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
