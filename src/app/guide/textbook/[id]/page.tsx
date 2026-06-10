import React from 'react';
import { notFound } from 'next/navigation';
import { getGuideNodeBySlugOrId, getCurriculumBySubject, getGuideSubjects, getTopicHierarchy } from '@/lib/firebase/guide';
import { SubjectDashboard } from '@/components/guide/SubjectDashboard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const nodeData: any = await getGuideNodeBySlugOrId('guide_textbooks', decodedId);

  if (!nodeData) return { title: 'Textbook Not Found' };

  return {
    title: `${nodeData.seoTitle || nodeData.title || 'Textbook'} - Academy Guide`,
    description: nodeData.description || `Read comprehensive guides for ${nodeData.title}`,
    openGraph: {
      title: nodeData.seoTitle || nodeData.title,
      description: nodeData.description,
      ...(nodeData.featureImage ? { images: [{ url: nodeData.featureImage }] } : {})
    }
  };
}

export default async function TextbookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const textbookNode: any = await getGuideNodeBySlugOrId('guide_textbooks', decodedId);

  if (!textbookNode) {
    notFound();
  }

  const subjects = await getGuideSubjects();
  const hierarchy = await getTopicHierarchy(textbookNode.id);
  const fullCurriculum = await getCurriculumBySubject(hierarchy?.subjectId || subjects[0]?.id || 'sahitya-kanika');
  
  // Isolate the curriculum just for this textbook
  const curriculum = fullCurriculum.filter(c => c.id === textbookNode.id);

  return (
    <SubjectDashboard 
      id={textbookNode.id} 
      pageType="textbook"
      subjects={subjects} 
      curriculum={curriculum} 
      boardTitle={hierarchy?.boardTitle || 'Board'}
      classTitle={hierarchy?.classTitle || 'Class'}
      subjectTitle={hierarchy?.subjectTitle || 'Subject'}
      chapterTitle={textbookNode.title}
    />
  );
}
