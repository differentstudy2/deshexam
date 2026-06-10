import React from 'react';
import { notFound } from 'next/navigation';
import { getGuideNodeBySlugOrId, getReadingContent, getCurriculumBySubject, getGuideSubjects, getTopicHierarchy } from '@/lib/firebase/guide';
import { ReadingLayout } from '@/components/guide/ReadingLayout';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const nodeData: any = await getGuideNodeBySlugOrId('guide_topics', decodedId);

  if (!nodeData) return { title: 'Topic Not Found' };

  return {
    title: `${nodeData.seoTitle || nodeData.title || 'Topic'} - Academy Guide`,
    description: nodeData.description || `Read comprehensive guides for ${nodeData.title}`,
    openGraph: {
      title: nodeData.seoTitle || nodeData.title,
      description: nodeData.description,
      ...(nodeData.featureImage ? { images: [{ url: nodeData.featureImage }] } : {})
    }
  };
}

export default async function TopicDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const topicNode: any = await getGuideNodeBySlugOrId('guide_topics', decodedId);

  if (!topicNode) {
    notFound();
  }

  const subjects = await getGuideSubjects();
  const hierarchy = await getTopicHierarchy(topicNode.id);
  const readingData = await getReadingContent(topicNode.id);
  const fullCurriculum = await getCurriculumBySubject(hierarchy?.subjectId || subjects[0]?.id || 'sahitya-kanika');
  
  // Isolate the curriculum just for this textbook
  const curriculum = hierarchy?.textbookId 
    ? fullCurriculum.filter(c => c.id === hierarchy.textbookId)
    : fullCurriculum;

  return (
    <ReadingLayout 
      id={topicNode.id} 
      data={readingData}
      subjects={subjects} 
      curriculum={curriculum} 
      boardTitle={hierarchy?.boardTitle || 'Board'}
      classTitle={hierarchy?.classTitle || 'Class'}
      subjectTitle={hierarchy?.subjectTitle || 'Subject'}
      textbookTitle={hierarchy?.textbookTitle || 'Textbook'}
      chapterTitle={hierarchy?.chapterTitle}
    />
  );
}
