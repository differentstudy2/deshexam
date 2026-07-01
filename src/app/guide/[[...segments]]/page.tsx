import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getTaxonomyNodeBySlug, getTaxonomyNodeById, VALID_CONTENT_TYPES, ContentType } from '@/lib/firebase/taxonomy';
import { getReadingContent, getCurriculumBySubject, getCurriculumByClass, getCurriculumByBoard, getGuideSubjects, findGuideNodeAnyLevel } from '@/lib/firebase/guide';
import { getTaxonomyNodesByParent } from '@/lib/firebase/taxonomy';
import { generateHybridSeo } from '@/lib/seo';
import { ReadingLayout } from '@/components/guide/ReadingLayout';
import { SubjectDashboard } from '@/components/guide/SubjectDashboard';
import { BoardDashboard } from '@/components/guide/BoardDashboard';
import AcademyClient from '@/app/academy/AcademyClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ segments?: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const segments = resolvedParams.segments || [];
  if (segments.length === 0) return { title: 'Academy Guide' };

  const requestedPath = segments.join('/');
  
  if (requestedPath === 'academy') {
    return { title: 'Academy | DeshExam' };
  }

  let node = await getTaxonomyNodeBySlug(requestedPath);
  let contentType: ContentType | null = null;

  if (!node) {
    const lastSegment = segments[segments.length - 1];
    if (VALID_CONTENT_TYPES.includes(lastSegment as ContentType)) {
      const parentPath = segments.slice(0, -1).join('/');
      node = await getTaxonomyNodeBySlug(parentPath);
      
      // Fallback for ID-based URL with content type (e.g. /12345/mcq)
      if (!node && segments.length === 2) {
        const result = await findGuideNodeAnyLevel(segments[0]);
        if (result) node = result.node;
      }
      
      if (node) contentType = lastSegment as ContentType;
    } else if (segments.length === 1) {
      // Fallback for single segment ID-based URL (e.g. /12345)
      const result = await findGuideNodeAnyLevel(segments[0]);
      if (result) node = result.node;
    }
  }

  if (!node) return { title: 'Not Found' };

  let boardNode = null;
  if (node.type === 'board') {
    boardNode = node;
  } else {
    const boardAncestor = node.ancestors?.find(a => a.type === 'board');
    if (boardAncestor?.id) {
      boardNode = await getTaxonomyNodeById(boardAncestor.id);
    }
  }

  const metadata = generateHybridSeo({ node, contentType, boardNode });
  
  if (node.featureImage && metadata.openGraph) {
    metadata.openGraph.images = [{ url: node.featureImage }];
  }
  
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: metadata.alternates?.canonical || `https://deshexam.com/guide/${requestedPath}`
    }
  };
}

export default async function GuidePage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const resolvedParams = await params;
  const segments = (resolvedParams.segments || []).map(decodeURIComponent);
  
  if (segments.length === 0) {
    // Redirect or show guide home
    redirect('/guide/academy');
  }

  const requestedPath = segments.join('/');
  
  if (requestedPath === 'academy') {
    return <AcademyClient />;
  }

  let node = await getTaxonomyNodeBySlug(requestedPath);
  let contentType: ContentType | null = null;

  if (!node) {
    const lastSegment = segments[segments.length - 1];
    if (VALID_CONTENT_TYPES.includes(lastSegment as ContentType)) {
      const parentPath = segments.slice(0, -1).join('/');
      node = await getTaxonomyNodeBySlug(parentPath);
      
      // Fallback for ID-based URL with content type (e.g. /12345/mcq)
      if (!node && segments.length === 2) {
        const result = await findGuideNodeAnyLevel(segments[0]);
        if (result) node = result.node;
      }

      if (node) contentType = lastSegment as ContentType;
    } else if (segments.length === 1) {
      // Fallback for single segment ID-based URL (e.g. /12345)
      const result = await findGuideNodeAnyLevel(segments[0]);
      if (result) node = result.node;
    }
  }

  if (!node) {
    notFound();
  }

  const getAncestorTitle = (type: string) => node.ancestors?.find(a => a.type === type)?.title;
  
  const uiBreadcrumbs: { name: string, url: string }[] = [
    { name: 'Home', url: '/' },
    { name: 'Academy', url: '/guide/board' }
  ];
  let currentRelUrl = '/guide';
  node.ancestors?.forEach((anc: any) => {
    currentRelUrl += `/${anc.slug || anc.id}`;
    uiBreadcrumbs.push({ name: anc.title, url: currentRelUrl });
  });
  
  if (contentType) {
    uiBreadcrumbs.push({ name: node.title, url: `/guide/${node.fullSlug || node.id}` });
    uiBreadcrumbs.push({ name: contentType.toUpperCase(), url: `/guide/${node.fullSlug || node.id}/${contentType}` });
  } else {
    uiBreadcrumbs.push({ name: node.title, url: `/guide/${node.fullSlug || node.id}` });
  }
  
  const boardTitle = node.type === 'board' ? node.title : getAncestorTitle('board');
  const classTitle = node.type === 'class' ? node.title : getAncestorTitle('class');
  const subjectTitle = node.type === 'subject' ? node.title : getAncestorTitle('subject');
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
  } else if (node.type?.toLowerCase() === 'board') {
    const boardNodes = await getTaxonomyNodesByParent(node.id);
    const classes = boardNodes.filter(n => n.type === 'class');
    // Sort classes by orderIndex if available
    classes.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    subjects = classes.map(n => ({
      id: n.fullSlug || n.id,
      dbId: n.id,
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
    fullCurriculum = await getCurriculumByClass(node.id);
  } else if (node.type?.toLowerCase() === 'board') {
    fullCurriculum = await getCurriculumByBoard(node.id);
  } else {
    // Fallback if somehow no subject or class or board is determined
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

    const readingBreadcrumbs = [...uiBreadcrumbs];
    if (readingData && readingData.title && readingData.title !== node.title && !contentType) {
       readingBreadcrumbs.push({ name: readingData.title, url: '#' });
    }

    const assessmentTypes = ['practice', 'practice-set', 'practice-sets', 'mock-test', 'mock-tests', 'model-test', 'quiz', 'quizzes', 'exam-papers'];
    if (contentType && assessmentTypes.includes(contentType)) {
      const { NodeAssessmentListPage } = await import('@/components/guide/NodeAssessmentListPage');
      return (
        <NodeAssessmentListPage 
          node={JSON.parse(JSON.stringify(node))} 
          contentType={contentType} 
          breadcrumbs={uiBreadcrumbs} 
        />
      );
    }

    return (
      <ReadingLayout 
        id={node.id} 
        data={JSON.parse(JSON.stringify(readingData))}
        subjects={subjects} 
        curriculum={curriculum} 
        boardTitle={boardTitle}
        classTitle={classTitle}
        subjectTitle={subjectTitle}
        textbookTitle={textbookTitle}
        chapterTitle={chapterTitle}
        breadcrumbs={readingBreadcrumbs}
      />
    );
  }

  // If it's board, class, subject, textbook, show SubjectDashboard
  const curriculum = node.type === 'textbook'
    ? fullCurriculum.filter(c => c.title === node.title)
    : fullCurriculum;

  if (node.type?.toLowerCase() === 'board') {
    return (
      <BoardDashboard 
        id={node.id}
        node={JSON.parse(JSON.stringify(node))}
        classes={subjects} // At board level, subjects array contains classes
        boardTitle={boardTitle || node.title}
        breadcrumbs={uiBreadcrumbs}
      />
    );
  }

  return (
    <SubjectDashboard 
      id={node.id} 
      pageType={node.type as "board" | "class" | "subject" | "textbook" | "chapter"}
      subjects={subjects} 
      curriculum={curriculum} 
      boardTitle={boardTitle}
      classTitle={classTitle}
      subjectTitle={subjectTitle}
      textbookTitle={textbookTitle}
      chapterTitle={chapterTitle}
      node={JSON.parse(JSON.stringify(node))}
      breadcrumbs={uiBreadcrumbs}
    />
  );
}
