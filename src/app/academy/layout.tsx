import { Metadata } from 'next';
import React from 'react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Academy – Textbooks, Guides, Chapters & Practice Questions | DeshExam',
  description: 'Explore all academic resources on DeshExam including textbooks, chapter-wise guides, MCQ practice, board exam questions, notes, and solutions for every class and subject.',
  keywords: ['class 10 textbook', 'wbbse guide', 'madhyamik notes', 'chapter wise mcq', 'board exam preparation', 'DeshExam'],
  openGraph: {
    title: 'Academy – Textbooks, Guides, Chapters & Practice Questions | DeshExam',
    description: 'Explore all academic resources on DeshExam including textbooks, chapter-wise guides, MCQ practice, board exam questions, notes, and solutions for every class and subject.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy`,
    siteName: 'DeshExam',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-academy.png`, 
        width: 1200,
        height: 630,
        alt: 'DeshExam Academy Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academy – Textbooks, Guides, Chapters & Practice Questions | DeshExam',
    description: 'Explore all academic resources on DeshExam including textbooks, chapter-wise guides, MCQ practice, board exam questions, notes, and solutions for every class and subject.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-academy.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy`,
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Academy",
    "description": "Explore all academic resources on DeshExam including textbooks, chapter-wise guides, MCQ practice, board exam questions, notes, and solutions.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy`
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Academy",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy`
      }
    ]
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "DeshExam Curriculum",
    "provider": {
      "@type": "Organization",
      "name": "DeshExam",
      "sameAs": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
    }
  };

  return (
    <>
      <Script
        id="academy-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Script
        id="academy-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="academy-course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {children}
    </>
  );
}
