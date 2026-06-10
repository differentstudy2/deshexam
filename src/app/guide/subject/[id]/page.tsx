import React from 'react';
import { notFound } from 'next/navigation';
import { getGuideNodeBySlugOrId, getCurriculumBySubject, getGuideSubjects, getTopicHierarchy } from '@/lib/firebase/guide';
import { SubjectDashboard } from '@/components/guide/SubjectDashboard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const nodeData: any = await getGuideNodeBySlugOrId('guide_subjects', decodedId);

  if (!nodeData) return { title: 'Subject Not Found' };

  return {
    title: `${nodeData.seoTitle || nodeData.title || 'Subject'} - Academy Guide`,
    description: nodeData.description || `Read comprehensive guides for ${nodeData.title}`,
    openGraph: {
      title: nodeData.seoTitle || nodeData.title,
      description: nodeData.description,
      ...(nodeData.featureImage ? { images: [{ url: nodeData.featureImage }] } : {})
    }
  };
}

export default async function SubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const subjectNode: any = await getGuideNodeBySlugOrId('guide_subjects', decodedId);

  if (!subjectNode) {
    notFound();
  }

  const subjects = await getGuideSubjects();
  const curriculum = await getCurriculumBySubject(subjectNode.id);
  const hierarchy = await getTopicHierarchy(subjectNode.id);

  return (
    <SubjectDashboard 
      id={subjectNode.id} 
      pageType="subject"
      subjects={subjects} 
      curriculum={curriculum} 
      boardTitle={hierarchy?.boardTitle || 'Board'}
      classTitle={hierarchy?.classTitle || 'Class'}
      subjectTitle={subjectNode.title}
    />
  );
}
