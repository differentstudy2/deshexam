import React from 'react';
import { notFound } from 'next/navigation';
import { findGuideNodeAnyLevel, getReadingContent, getCurriculumBySubject, getGuideSubjects, getTopicHierarchy } from '@/lib/firebase/guide';
import { ReadingLayout } from '@/components/guide/ReadingLayout';
import { SubjectDashboard } from '@/components/guide/SubjectDashboard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const result = await findGuideNodeAnyLevel(decodedId);

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
  const result = await findGuideNodeAnyLevel(decodedId);

  if (!result || !result.node) {
    notFound();
  }

  const { node, level } = result;
  const subjects = await getGuideSubjects();
  const hierarchy = await getTopicHierarchy(node.id);
  
  // Try to find curriculum starting from the closest known subject
  const subjectId = hierarchy?.subjectId || subjects[0]?.id || 'sahitya-kanika';
  const fullCurriculum = await getCurriculumBySubject(subjectId);
  
  // If it's a topic or chapter, we show the ReadingLayout
  if (level === 'topic' || level === 'chapter') {
    const readingData = await getReadingContent(node.id);
    
    // Dynamically import to avoid cyclic deps if any, or just import at the top
    const { getAssessmentsByTopic } = await import('@/lib/firebase/assessment');
    const practiceSets = await getAssessmentsByTopic('practiceSets', node.id);
    const quizzes = await getAssessmentsByTopic('quizzes', node.id);
    const mockTests = await getAssessmentsByTopic('mockTests', node.id);
    const examPapers = await getAssessmentsByTopic('examPapers', node.id);

    const assessments = { practiceSets, quizzes, mockTests, examPapers };
    
    const curriculum = hierarchy?.textbookId 
      ? fullCurriculum.filter(c => c.id === hierarchy.textbookId)
      : fullCurriculum;

    return (
      <ReadingLayout 
        id={node.id} 
        data={readingData}
        assessments={assessments}
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
