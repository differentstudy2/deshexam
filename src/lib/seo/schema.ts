import { TaxonomyNode, ContentType } from '@/lib/firebase/taxonomy';

export function generateBreadcrumbSchema(node: TaxonomyNode, contentType?: string | null) {
  const itemListElement = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://deshexam.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Guide",
      "item": "https://deshexam.com/guide"
    }
  ];

  let position = 3;
  if (node.ancestors) {
    node.ancestors.forEach((anc) => {
      itemListElement.push({
        "@type": "ListItem",
        "position": position++,
        "name": anc.title,
        "item": `https://deshexam.com/guide/${anc.slug}` // Assumes ancestor.slug is full path
      });
    });
  }

  itemListElement.push({
    "@type": "ListItem",
    "position": position++,
    "name": node.title,
    "item": `https://deshexam.com/guide/${node.fullSlug}`
  });

  if (contentType) {
    itemListElement.push({
      "@type": "ListItem",
      "position": position++,
      "name": contentType.toUpperCase(),
      "item": `https://deshexam.com/guide/${node.fullSlug}/${contentType}`
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement
  };
}

export function generateCourseSchema(node: TaxonomyNode) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${node.title} Guide & Study Materials`,
    "description": `Comprehensive study materials, notes, and mock tests for ${node.title}.`,
    "provider": {
      "@type": "Organization",
      "name": "DeshExam",
      "sameAs": "https://deshexam.com"
    }
  };
}

export function generateBookSchema(node: TaxonomyNode) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": node.title,
    "author": {
      "@type": "Organization",
      "name": "NCTB / Relevant Board"
    },
    "description": `Textbook guide for ${node.title}.`
  };
}

export function generateArticleSchema(node: TaxonomyNode) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": node.title,
    "description": `Study notes for ${node.title}.`,
    "author": {
      "@type": "Organization",
      "name": "DeshExam"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeshExam",
      "logo": {
        "@type": "ImageObject",
        "url": "https://deshexam.com/logo.png"
      }
    }
  };
}

export function generateQuizSchema(node: TaxonomyNode) {
  // A simplified Quiz schema. A full implementation would map actual questions.
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": `${node.title} MCQ Practice`,
    "description": `Multiple choice questions for ${node.title}.`,
    "educationalAlignment": [
      {
        "@type": "AlignmentObject",
        "alignmentType": "educationalLevel",
        "educationalFramework": "Board Standard"
      }
    ]
  };
}

export function generateFAQSchema(node: TaxonomyNode) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [] // In a real scenario, map CQ questions here
  };
}
