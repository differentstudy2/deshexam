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
      url: `https://deshexam.com/question/${q.slug || q.id}`
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
    url: "https://deshexam.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://deshexam.com/questions?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DeshExam",
    url: "https://deshexam.com",
    logo: "https://deshexam.com/logo.png"
  };
}

export function getQuestionSchema(questionText: string, answerText: string, url?: string, datePublished?: string) {
  const author = {
    "@type": "Organization",
    name: "DeshExam",
    url: "https://deshexam.com"
  };
  const publishedDate = datePublished || "2024-01-01T00:00:00Z";
  const questionUrl = url || "https://deshexam.com";

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
      sameAs: "https://deshexam.com"
    }
  };
}
