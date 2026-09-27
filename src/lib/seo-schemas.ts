export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.item
    }))
  };
}

export function generateBookSchema({
  name,
  inLanguage = 'bn',
  educationalLevel,
  publisherName = 'DeshExam',
  authorName
}: {
  name: string;
  inLanguage?: string;
  educationalLevel?: string;
  publisherName?: string;
  authorName?: string;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": name,
    "inLanguage": inLanguage,
    "publisher": {
      "@type": "Organization",
      "name": publisherName
    }
  };

  if (educationalLevel) {
    schema["educationalLevel"] = educationalLevel;
  }
  
  if (authorName) {
    schema["author"] = {
      "@type": "Person",
      "name": authorName
    };
  }

  return schema;
}

export function generateLearningResourceSchema({
  name,
  learningResourceType = 'Textbook Guide',
  educationalLevel
}: {
  name: string;
  learningResourceType?: string;
  educationalLevel?: string;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": name,
    "learningResourceType": learningResourceType
  };

  if (educationalLevel) {
    schema["educationalLevel"] = educationalLevel;
  }

  return schema;
}

export function generateItemListSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "url": item.url
    }))
  };
}

export function generateFAQPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
