
import type { Metadata } from 'next';
import KidsZoneClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Kids Zone | Fun Learning Games & Educational Activities | DeshExam',
  description: 'Welcome to the DeshExam Kids Zone! A safe and exciting world of interactive games, fun quizzes, and engaging activities designed to make learning languages and math an adventure for children.',
  keywords: ['kids learning', 'educational games for kids', 'fun learning', 'kids zone', 'online learning for children', 'math games for kids', 'language learning for kids', 'interactive activities for kids'],
};

export default function KidsZonePage() {
    const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DeshExam",
    "url": "https://deshexam.com",
    "logo": "https://deshexam.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-123-456-7890",
      "contactType": "Customer Service"
    }
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DeshExam",
    "url": "https://deshexam.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://deshexam.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <KidsZoneClientPage />
    </>
  );
}
