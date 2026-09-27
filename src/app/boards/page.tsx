import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import BoardClient from './BoardClient';
import { indianBoards } from '@/lib/data/indian-boards';

export const metadata: Metadata = {
  title: 'All Education Boards in India (CBSE, ICSE, State Boards) | DeshExam',
  description: 'Explore all major education boards in India including CBSE, ICSE, NIOS and state boards. Access syllabus, textbooks, notes, mock tests and exam resources for every board on DeshExam.',
  keywords: [
    'education boards in india',
    'indian school boards',
    'cbse board',
    'icse board',
    'nios board',
    'state boards india',
    'board syllabus',
    'school curriculum india',
    'board exam preparation',
    'deshexam boards'
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/boards`
  },
  openGraph: {
    title: 'All Education Boards in India | DeshExam',
    description: 'Explore CBSE, ICSE and state boards. Access comprehensive study materials and mock tests.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/boards`,
    images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-boards.jpg` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Indian Boards',
    description: 'Explore all major education boards in India including CBSE, ICSE, NIOS and state boards.',
  }
};

export default function BoardsDirectoryPage() {
  // Generate ItemList JSON-LD dynamically from our indianBoards data
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Education Boards in India",
    "numberOfItems": indianBoards.length,
    "itemListElement": indianBoards.map((board, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/guide/${board.slug}`,
      "name": board.acronym
    }))
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Explore Boards & Institutions",
    "description": "Directory of education boards in India including central and state boards.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/boards`
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Boards",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/boards`
      }
    ]
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DeshExam",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are the main education boards in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Major boards include CBSE, ICSE, NIOS and various state boards (like WBBSE, UP Board, RBSE, etc)."
        }
      },
      {
        "@type": "Question",
        "name": "Difference between CBSE and ICSE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CBSE is more focused on mathematics and science with a theoretical approach, while ICSE has a more balanced, comprehensive syllabus with equal weightage to languages, arts, and science."
        }
      },
      {
        "@type": "Question",
        "name": "Which board is best for JEE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CBSE is generally considered best for JEE and NEET as the exam syllabus heavily aligns with the NCERT curriculum followed by CBSE."
        }
      },
      {
        "@type": "Question",
        "name": "Is state board good?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, state boards are excellent for localized learning, state-level entrance exams, and they offer a strong foundation in regional languages."
        }
      },
      {
        "@type": "Question",
        "name": "Can I access board-specific textbooks?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! DeshExam provides chapter-wise textbooks, notes, and previous year questions for all major boards."
        }
      }
    ]
  };

  return (
    <>
      {/* Injecting Structured Data JSON-LDs */}
      <Script id="schema-webpage" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} strategy="beforeInteractive" />
      <Script id="schema-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} strategy="beforeInteractive" />
      <Script id="schema-itemlist" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} strategy="beforeInteractive" />
      <Script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} strategy="beforeInteractive" />
      <Script id="schema-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} strategy="beforeInteractive" />

      <BoardClient />
    </>
  );
}
