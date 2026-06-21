import React from 'react';
import { notFound } from 'next/navigation';
import { findGuideNodeAnyLevel, getReadingContent, getCurriculumBySubject, getGuideSubjects, getTopicHierarchy } from '@/lib/firebase/guide';
import { getTaxonomyNodeById } from '@/lib/firebase/taxonomy';
import { ReadingLayout } from '@/components/guide/ReadingLayout';
import { SubjectDashboard } from '@/components/guide/SubjectDashboard';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  let result = await findGuideNodeAnyLevel(decodedId);

  if (!result || !result.node) {
    const taxNode = await getTaxonomyNodeById(decodedId);
    if (taxNode) result = { node: taxNode, level: taxNode.type };
  }

  if (!result || !result.node) return { title: 'Not Found' };

  const { node } = result;

  return {
    title: `${node.seoTitle || node.title || 'Guide'} - Academy Guide`,
    description: node.description || `Read comprehensive guides for ${node.title}`,
    openGraph: {
      title: node.seoTitle || node.title,
      description: node.description,
      ...(node.featureImage ? { images: [{ url: node.featureImage }] } : {})
    }
  };
}

export default async function GenericGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  let result = await findGuideNodeAnyLevel(decodedId);

  if (!result || !result.node) {
    const taxNode = await getTaxonomyNodeById(decodedId);
    if (taxNode) result = { node: taxNode, level: taxNode.type };
  }

  if (!result || !result.node) {
    notFound();
  }

  const { node, level } = result;
  const hierarchy = await getTopicHierarchy(node.id);

  const classId = hierarchy?.classId || (level === 'class' ? node.id : null);
  let subjects: any[] = [];
  if (classId) {
    const { getTaxonomyNodesByParent } = await import('@/lib/firebase/taxonomy');
    const classNodes = await getTaxonomyNodesByParent(classId);
    const relevantNodes = classNodes.filter(n => n.type === 'subject' || n.type === 'textbook');
    subjects = relevantNodes.map(n => ({
      id: n.id,
      title: n.title || (n as any).name,
      countStr: ''
    }));
  } else {
    subjects = await getGuideSubjects();
  }
  
  // Try to find curriculum starting from the closest known subject
  // If hierarchy is missing (e.g. for taxonomy_nodes), fallback to node.id if it's a subject
  const subjectId = hierarchy?.subjectId || (level === 'subject' ? node.id : null) || subjects[0]?.id || 'sahitya-kanika';
  const fullCurriculum = await getCurriculumBySubject(subjectId);
  
  // If it's a topic or chapter, we show the ReadingLayout
  if (level === 'topic' || level === 'chapter') {
    const readingData = await getReadingContent(node.id);
    
    const curriculum = hierarchy?.textbookId 
      ? fullCurriculum.filter(c => c.id === hierarchy.textbookId)
      : fullCurriculum;

    return (
      <ReadingLayout 
        id={node.id} 
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

  // If it's any other level (board, class, subject, textbook), we show the SubjectDashboard
  const curriculum = (level === 'textbook' || level === 'chapter') && hierarchy?.textbookId 
    ? fullCurriculum.filter(c => c.id === hierarchy.textbookId)
    : fullCurriculum;

  return (
    <SubjectDashboard 
      id={node.id} 
      pageType={level as "chapter" | "textbook" | "subject"}
      subjects={subjects} 
      curriculum={curriculum} 
      boardTitle={hierarchy?.boardTitle || 'Board'}
      classTitle={hierarchy?.classTitle || 'Class'}
      subjectTitle={hierarchy?.subjectTitle || 'Subject'}
      textbookTitle={level === 'textbook' ? node.title : hierarchy?.textbookTitle}
      chapterTitle={level === 'chapter' ? node.title : hierarchy?.chapterTitle}
    />
  );
}
