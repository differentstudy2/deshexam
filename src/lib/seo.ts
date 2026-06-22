import { Metadata } from 'next';
import { TaxonomyNode, ContentType } from './firebase/taxonomy';

interface SeoParams {
  node: TaxonomyNode;
  contentType?: ContentType | null;
  siteName?: string;
}

/**
 * Generates Hybrid SEO Metadata based on Custom Overrides, Dynamic Content, and Fallbacks.
 */
export function generateHybridSeo({ node, contentType, siteName = 'DeshExam' }: SeoParams): Metadata {
  const seo = node.seo || {};
  const isCustomSeo = seo.useCustomSeo;

  const truncate = (text: string, maxLen: number) => 
    text.length > maxLen ? text.substring(0, maxLen - 3) + '...' : text;

  // 1. Title Rules: keyword near start, under 65 chars, high CTR, append | DeshExam
  let title = '';
  if (isCustomSeo && seo.customTitle) {
    title = seo.customTitle;
  } else {
    if (contentType) {
      title = `${node.title} ${contentType.toUpperCase()} - ${node.classSlug?.replace('-', ' ') || 'Guide'}`;
    } else if (node.type === 'board') {
      title = `${node.title} Study Materials, Notes & Mock Tests`;
    } else if (node.type === 'class') {
      title = `${node.title} Curriculum Guide & Syllabus`;
    } else if (node.type === 'subject') {
      title = `${node.title} Notes & Question Bank`;
    } else if (node.type === 'chapter') {
      title = `${node.title} Guide & Notes - ${node.classSlug?.replace('-', ' ') || 'Class'}`;
    } else {
      title = node.title || 'Academy Guide';
    }

    // Dynamic Keyword Injection
    if (seo.focusKeyword && !title.toLowerCase().includes(seo.focusKeyword.toLowerCase())) {
      title = `${seo.focusKeyword}: ${title}`;
    }

    title = truncate(title, 50); // Leave room for " | DeshExam"
    title = `${title} | ${siteName}`;
  }

  // Fallback to strict custom title if provided as a generic override without useCustomSeo
  if (!isCustomSeo && seo.customTitle) {
    title = seo.customTitle.includes(siteName) ? seo.customTitle : `${seo.customTitle} | ${siteName}`;
  }

  // 2. Description Rules: 140–160 chars, compelling click intent
  let description = '';
  if (isCustomSeo && seo.customDescription) {
    description = seo.customDescription;
  } else {
    if (contentType) {
      description = `Practice ${contentType.toUpperCase()} for ${node.title}. Comprehensive guide, questions, and solutions to boost your exam prep for ${node.classSlug?.replace('-', ' ') || 'your class'}.`;
    } else if (node.type === 'board') {
      description = `Get the best study materials, syllabus, notes, and mock tests for ${node.title}. Prepare effectively for your board exams with our comprehensive resources.`;
    } else if (node.type === 'class') {
      description = `Complete curriculum guide for ${node.title}. Explore subjects, textbooks, notes, and chapter-wise study materials tailored for academic excellence.`;
    } else if (node.type === 'chapter') {
      description = `Read detailed notes and guide for ${node.title}. Master the concepts of ${node.classSlug?.replace('-', ' ') || 'this class'} with our extensive study resources.`;
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

  // Build Metadata Object
  const metadata: Metadata = {
    title,
    description,
    keywords: seo.keywords || [],
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
