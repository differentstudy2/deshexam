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
