import React from 'react';
import { notFound } from 'next/navigation';
import { getTaxonomyNodeBySlug, VALID_CONTENT_TYPES, ContentType } from '@/lib/firebase/taxonomy';
import { getReadingContent, getCurriculumBySubject, getGuideSubjects } from '@/lib/firebase/guide';
import { getTaxonomyNodesByParent } from '@/lib/firebase/taxonomy';
import { ReadingLayout } from '@/components/guide/ReadingLayout';
import { SubjectDashboard } from '@/components/guide/SubjectDashboard';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ segments?: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const segments = resolvedParams.segments || [];
  if (segments.length === 0) return { title: 'Academy Guide' };

  const requestedPath = segments.join('/');
  let node = await getTaxonomyNodeBySlug(requestedPath);
  let contentType: ContentType | null = null;

  if (!node) {
    const lastSegment = segments[segments.length - 1];
    if (VALID_CONTENT_TYPES.includes(lastSegment as ContentType)) {
      const parentPath = segments.slice(0, -1).join('/');
      node = await getTaxonomyNodeBySlug(parentPath);
      if (node) contentType = lastSegment as ContentType;
    }
  }

  if (!node) return { title: 'Not Found' };

  let title = node.seoTitle || node.title;
  let description = node.seoDescription || node.description || `Read comprehensive guides for ${node.title}`;

  if (contentType) {
    title = `${node.title} ${contentType.toUpperCase()} - ${node.classSlug?.replace('-', ' ') || 'Guide'} | DeshExam`;
    description = `Practice ${contentType.toUpperCase()} for ${node.title}. Comprehensive guide and questions.`;
  } else if (node.type === 'board') {
    title = `${node.title} Study Materials, Notes & Mock Tests | DeshExam`;
  } else if (node.type === 'chapter') {
    title = `${node.title} Guide & Notes - ${node.classSlug?.replace('-', ' ') || 'Class'} | DeshExam`;
  }

  return {
    title: `${title} - Academy Guide`,
    description,
    alternates: {
      canonical: `https://deshexam.com/guide/${requestedPath}`
    },
    robots: {
      index: node.isIndexable !== false,
      follow: true
    },
    openGraph: {
      title,
      description,
      type: contentType || node.type === 'chapter' ? 'article' : 'website',
      ...(node.featureImage ? { images: [{ url: node.featureImage }] } : {})
    }
  };
}

export default async function GuidePage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const resolvedParams = await params;
  const segments = (resolvedParams.segments || []).map(decodeURIComponent);
  
  if (segments.length === 0) {
    // Redirect or show guide home
    const { redirect } = await import('next/navigation');
    redirect('/guide/board');
  }

  const requestedPath = segments.join('/');
  let node = await getTaxonomyNodeBySlug(requestedPath);
  let contentType: ContentType | null = null;

  if (!node) {
    const lastSegment = segments[segments.length - 1];
    if (VALID_CONTENT_TYPES.includes(lastSegment as ContentType)) {
      const parentPath = segments.slice(0, -1).join('/');
      node = await getTaxonomyNodeBySlug(parentPath);
      if (node) contentType = lastSegment as ContentType;
    }
  }

  if (!node) {
    notFound();
  }

  // Helper to extract titles from ancestors array for Dashboard/ReadingLayout props
  const getAncestorTitle = (type: string) => node.ancestors?.find(a => a.type === type)?.title;
  
  const boardTitle = getAncestorTitle('board');
  const classTitle = getAncestorTitle('class');
  const subjectTitle = getAncestorTitle('subject');
  const textbookTitle = node.type === 'textbook' ? node.title : getAncestorTitle('textbook');
  const chapterTitle = node.type === 'chapter' ? node.title : getAncestorTitle('chapter');

  // Fetch subjects for sidebar
  let subjects: any[] = [];
  const classNode = node.ancestors?.find(a => a.type === 'class') || (node.type === 'class' ? node : null);
  if (classNode) {
    const classNodes = await getTaxonomyNodesByParent(classNode.id);
    const relevantNodes = classNodes.filter(n => n.type === 'subject' || n.type === 'textbook');
    subjects = relevantNodes.map(n => ({
      id: n.fullSlug || n.id, // Used for routing in sidebar
      dbId: n.id,             // Used for database queries
      title: n.title || (n as any).name,
      countStr: ''
    }));
  } else {
    subjects = await getGuideSubjects();
  }

  // Fetch curriculum for SubjectDashboard / ReadingLayout
  const subjectNode = node.ancestors?.find(a => a.type === 'subject') || (node.type === 'subject' ? node : null);
  
  let fullCurriculum: any[] = [];
  
  if (subjectNode) {
    fullCurriculum = await getCurriculumBySubject(subjectNode.id);
  } else if (node.type === 'class') {
    const { getCurriculumByClass } = await import('@/lib/firebase/guide');
    fullCurriculum = await getCurriculumByClass(node.id);
  } else {
    // Fallback if somehow no subject or class is determined
    const fallbackId = subjects[0]?.dbId || subjects[0]?.id || 'sahitya-kanika';
    fullCurriculum = await getCurriculumBySubject(fallbackId);
  }

  // If it's a content page (contentType exists) OR topic/chapter
  if (contentType || node.type === 'topic' || node.type === 'chapter') {
    // Provide reading layout with the content
    const readingData = await getReadingContent(node.id);
    // If it's a specific content type like MCQ, we might want to filter readingData or show a specific UI.
    // For now, pass to ReadingLayout. ReadingLayout can handle the specific views.
    
    const curriculum = textbookTitle 
      ? fullCurriculum.filter(c => c.title === textbookTitle) // using title as a fallback match since we only have ancestor titles
      : fullCurriculum;

    return (
      <ReadingLayout 
        id={node.id} 
        data={readingData}
        subjects={subjects} 
        curriculum={curriculum} 
        boardTitle={boardTitle || 'Board'}
        classTitle={classTitle || 'Class'}
        subjectTitle={subjectTitle || 'Subject'}
        textbookTitle={textbookTitle || 'Textbook'}
        chapterTitle={chapterTitle}
      />
    );
  }

  // If it's board, class, subject, textbook, show SubjectDashboard
  const curriculum = node.type === 'textbook'
    ? fullCurriculum.filter(c => c.title === node.title)
    : fullCurriculum;

  return (
    <SubjectDashboard 
      id={node.id} 
      pageType={node.type as "chapter" | "textbook" | "subject"}
      subjects={subjects} 
      curriculum={curriculum} 
      boardTitle={boardTitle || 'Board'}
      classTitle={classTitle || 'Class'}
      subjectTitle={subjectTitle || 'Subject'}
      textbookTitle={textbookTitle || 'Textbook'}
      chapterTitle={chapterTitle}
    />
  );
}
