import React from 'react';
import { notFound } from 'next/navigation';
import { getGuideNodeBySlugOrId, getCurriculumBySubject, getGuideSubjects, getTopicHierarchy } from '@/lib/firebase/guide';
import { SubjectDashboard } from '@/components/guide/SubjectDashboard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const nodeData: any = await getGuideNodeBySlugOrId('guide_chapters', decodedId);

  if (!nodeData) return { title: 'Chapter Not Found' };

  return {
    title: `${nodeData.seoTitle || nodeData.title || 'Chapter'} - Academy Guide`,
    description: nodeData.description || `Read comprehensive guides for ${nodeData.title}`,
    openGraph: {
      title: nodeData.seoTitle || nodeData.title,
      description: nodeData.description,
      ...(nodeData.featureImage ? { images: [{ url: nodeData.featureImage }] } : {})
    }
  };
}

export default async function ChapterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const chapterNode: any = await getGuideNodeBySlugOrId('guide_chapters', decodedId);

  if (!chapterNode) {
    notFound();
  }

  const subjects = await getGuideSubjects();
  const hierarchy = await getTopicHierarchy(chapterNode.id);
  const fullCurriculum = await getCurriculumBySubject(hierarchy?.subjectId || subjects[0]?.id || 'sahitya-kanika');
  
  // Isolate the curriculum just for this textbook/chapter
  const curriculum = hierarchy?.textbookId 
    ? fullCurriculum.filter(c => c.id === hierarchy.textbookId)
    : fullCurriculum;

  return (
    <SubjectDashboard 
      id={chapterNode.id} 
      pageType="chapter"
      subjects={subjects} 
      curriculum={curriculum} 
      boardTitle={hierarchy?.boardTitle || 'Board'}
      classTitle={hierarchy?.classTitle || 'Class'}
      subjectTitle={hierarchy?.subjectTitle || 'Subject'}
      chapterTitle={chapterNode.title}
    />
  );
}
