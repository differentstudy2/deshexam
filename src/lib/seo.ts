import { Metadata } from 'next';
import { TaxonomyNode, ContentType } from './firebase/taxonomy';

interface SeoParams {
  node: TaxonomyNode;
  contentType?: ContentType | null;
  siteName?: string;
  boardNode?: TaxonomyNode | null;
}

/**
 * Generates Hybrid SEO Metadata based on Custom Overrides, Dynamic Content, and Fallbacks.
 */
export function generateHybridSeo({ node, contentType, siteName = 'DeshExam', boardNode }: SeoParams): Metadata {
  const seo = node.seo || {};
  const isCustomSeo = seo.useCustomSeo;

  const getAncestorTitle = (type: string) => node.ancestors?.find(a => a.type === type)?.title || '';
  const actualBoardNode = node.type === 'board' ? node : boardNode;
  const boardName = actualBoardNode?.acronym || actualBoardNode?.title || getAncestorTitle('board');
  const className = getAncestorTitle('class') || node.classSlug?.replace('-', ' ') || '';
  const subjectName = getAncestorTitle('subject');

  const truncate = (text: string, maxLen: number) => 
    text.length > maxLen ? text.substring(0, maxLen - 3) + '...' : text;

  // 1. Title Priority Logic
  let baseTitle = '';
  const customTitle = node.seoTitle || seo.customTitle;

  if (isCustomSeo && customTitle) {
    baseTitle = customTitle;
  } else {
    if (contentType) {
      let contentTypeName = contentType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (contentType === 'questions') contentTypeName = 'Important Questions & Answers';
      if (contentType === 'mcq') contentTypeName = 'MCQ Questions and Answers';
      if (contentType === 'cq') contentTypeName = 'Creative Questions (CQ)';
      
      const parentName = getAncestorTitle('textbook') || subjectName;
      const classPrefix = className ? `Class ${className.replace(/class\s+/i, '')} ` : '';
      baseTitle = `${classPrefix}${node.title} ${contentTypeName} | ${parentName || 'Guide'}`;
    } else if (node.type === 'board') {
      baseTitle = `${boardName} Study Materials, Notes & Questions`;
    } else if (node.type === 'class') {
      baseTitle = `${boardName} ${className} Study Materials & Notes`;
    } else if (node.type === 'subject') {
      const boardPrefix = boardName ? `${boardName} ` : '';
      baseTitle = `${boardPrefix}Class ${className.replace(/class\s+/i, '')} ${node.title} Notes, MCQ & Guide`;
    } else if (node.type === 'textbook') {
      baseTitle = `${node.title} | Class ${className.replace(/class\s+/i, '')} ${subjectName} Notes, MCQ & Guide`;
    } else if (node.type === 'chapter') {
      const parentName = getAncestorTitle('textbook') || subjectName;
      const boardPrefix = boardName ? `${boardName} ` : '';
      const cleanClassName = className.replace(/wbbse\s+/i, '').replace(/cbse\s+/i, '').replace(/class\s+/i, '');
      const classPrefix = cleanClassName ? `Class ${cleanClassName} ` : '';
      baseTitle = `${boardPrefix}${classPrefix}${node.title} Question Answer | ${parentName}`;
    } else if (node.type === 'topic' || node.type === 'section') {
      baseTitle = `${node.title} Summary & Notes`;
    } else {
      baseTitle = node.title || 'Academy Guide';
    }

    // Dynamic Keyword Injection
    if (seo.focusKeyword && !baseTitle.toLowerCase().includes(seo.focusKeyword.toLowerCase())) {
      baseTitle = `${seo.focusKeyword}: ${baseTitle}`;
    }
  }

  // Fallback to strict custom title if provided as a generic override without useCustomSeo
  if (!isCustomSeo && customTitle) {
    baseTitle = customTitle;
  }

  // Ensure brand name is appended and length is managed (50-65 chars target)
  let title = baseTitle.includes(siteName) ? baseTitle : `${baseTitle} | ${siteName}`;
  // If title is way too long, try to truncate baseTitle gracefully
  if (title.length > 70 && !customTitle) {
    title = `${truncate(baseTitle, 55)} | ${siteName}`;
  }

  // 2. Description Rules: 140–160 chars, compelling click intent
  let description = '';
  if (isCustomSeo && seo.customDescription) {
    description = seo.customDescription;
  } else {
    if (contentType) {
      let contentTypeName = contentType.toUpperCase();
      if (contentType === 'questions') contentTypeName = 'important questions, MCQ, and CQ';
      if (contentType === 'mcq') contentTypeName = 'multiple choice questions (MCQ)';
      if (contentType === 'cq') contentTypeName = 'creative questions (CQ)';

      description = `Practice top ${contentTypeName} on ${node.title} for ${className || 'your class'}. Verify your knowledge, read solutions, and prepare for your exams effectively with DeshExam.`;
    } else if (node.type === 'board') {
      description = `Get the best study materials, syllabus, notes, and mock tests for ${node.title}. Prepare effectively for your board exams with our comprehensive resources.`;
    } else if (node.type === 'class') {
      description = `Complete curriculum guide for ${node.title}. Explore subjects, textbooks, notes, and chapter-wise study materials tailored for academic excellence.`;
    } else if (node.type === 'textbook') {
      // Read {Textbook Name} for {Board} Class {Class}. Access chapter-wise notes, MCQ, CQ, SAQ, LAQ, summaries, solutions and board exam preparation resources on DeshExam.
      description = `Read ${node.title} for ${boardName} ${className}. Access chapter-wise notes, MCQ, CQ, SAQ, LAQ, summaries, solutions and board exam preparation resources on DeshExam.`;
    } else if (node.type === 'chapter') {
      description = `Read detailed notes and guide for ${node.title}. Master the concepts of ${className || 'this class'} with our extensive study resources.`;
    } else {
      description = node.description || `Read comprehensive guides and study materials for ${node.title}.`;
    }

    if (seo.focusKeyword && !description.toLowerCase().includes(seo.focusKeyword.toLowerCase())) {
      description = `Looking for ${seo.focusKeyword}? ${description}`;
    }

    description = truncate(description, 155);
  }

  if (!isCustomSeo && seo.customDescription) {
    description = seo.customDescription;
  }

  let dynamicKeywords = seo.keywords || [];
  if (dynamicKeywords.length === 0) {
    if (contentType) {
      const typeName = contentType.toUpperCase();
      dynamicKeywords = [
        `${node.title} ${typeName}`,
        `${node.title} ${typeName} questions`,
        `${className} ${node.title} ${typeName}`,
        `important questions for ${node.title}`,
        `${node.title} question bank`
      ].filter(Boolean);
    } else if (node.type === 'textbook') {
      dynamicKeywords = [
        `${boardName} ${className} ${node.title}`,
        `${boardName} ${className} ${subjectName} guide`,
        `${className} ${node.title} notes`,
        `chapter wise ${node.title} solution`,
        `${boardName} ${subjectName} textbook class ${className.replace(/Class /i, '')}`
      ].filter(Boolean);
    } else if (node.type === 'subject') {
      dynamicKeywords = [
        `${node.title} notes`,
        `${className} ${node.title}`,
        `${boardName} ${node.title} syllabus`,
        `${node.title} question bank`,
        `${className} ${node.title} guide`
      ].filter(Boolean);
    } else if (node.type === 'class') {
      dynamicKeywords = [
        `${node.title} syllabus`,
        `${boardName} ${node.title} guide`,
        `${node.title} notes`,
        `${boardName} ${node.title} subjects`,
        `${node.title} study materials`
      ].filter(Boolean);
    } else if (node.type === 'board') {
      dynamicKeywords = [
        `${node.title} syllabus`,
        `${node.title} board exams`,
        `${node.title} study materials`,
        `${node.title} question papers`,
        `${node.title} notes`
      ].filter(Boolean);
    } else if (node.type === 'chapter') {
      dynamicKeywords = [
        `${node.title} notes`,
        `${className} ${subjectName} ${node.title}`,
        `${node.title} questions and answers`,
        `${node.title} mcq`,
        `${node.title} summary`
      ].filter(Boolean);
    }
  }

  // Build Metadata Object
  const metadata: Metadata = {
    title,
    description,
    keywords: dynamicKeywords,
  };

  if (seo.robotsIndex === false) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  if (seo.canonicalUrl) {
    metadata.alternates = {
      canonical: seo.canonicalUrl,
    };
  }

  // OpenGraph
  metadata.openGraph = {
    title: seo.ogTitle || title,
    description: seo.ogDescription || description,
    siteName,
    type: 'website',
  };

  if (seo.ogImage) {
    metadata.openGraph.images = [
      {
        url: seo.ogImage,
      },
    ];
  }

  return metadata;
}
