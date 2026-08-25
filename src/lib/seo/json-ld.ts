export function getCollectionPageSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Practice Questions",
    description: "Question directory for exam preparation",
    url
  };
}

export function getItemListSchema(questions: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: questions.length,
    itemListElement: questions.map((q, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/question/${q.slug || q.id}`
    }))
  };
}

export function getBreadcrumbSchema(items: {name: string, url: string}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function getFAQSchema(faqs: {q: string, a: string}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  };
}

export function getSearchActionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/questions?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DeshExam",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`
  };
}

export function getQuestionSchema(questionText: string, answerText: string, url?: string, datePublished?: string) {
  const author = {
    "@type": "Organization",
    name: "DeshExam",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
  };
  const publishedDate = datePublished || "2024-01-01T00:00:00Z";
  const questionUrl = url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`;

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: questionText.substring(0, 100),
      text: questionText,
      answerCount: 1,
      author: author,
      datePublished: publishedDate,
      acceptedAnswer: {
        "@type": "Answer",
        text: answerText,
        url: questionUrl + "#answer",
        author: author,
        datePublished: publishedDate,
        upvoteCount: 1
      }
    }
  };
}

export function getCourseSchema(courseName: string, description: string, url: string, providerName: string = "DeshExam") {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: courseName,
    description: description,
    url: url,
    provider: {
      "@type": "Organization",
      name: providerName,
      sameAs: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
    }
  };
}
