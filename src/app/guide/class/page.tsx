import React from 'react';
import { Metadata } from 'next';
import { getTaxonomyNodesByType } from '@/lib/firebase/taxonomy';
import { ClassDashboard } from '@/components/guide/ClassDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Classes & Study Materials for All Boards | Textbooks, Notes & MCQ | DeshExam',
  description: 'Explore class-wise study materials on DeshExam Academy. Access textbooks, subjects, notes, MCQ practice, mock tests, previous year questions and smart learning resources for all boards and classes.',
  keywords: 'deshexam classes, online class textbooks, class wise study materials, board exam preparation, mcq practice, online academy india, class 10 textbook, wbchse study material, wbbse notes, competitive exam learning',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/classes`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: 'Classes & Study Materials for All Boards | DeshExam',
    description: 'Browse classes, subjects and textbooks with smart learning resources.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/classes`,
    images: [
      {
        url: '/og/academy-classes.png',
        width: 1200,
        height: 630,
        alt: 'Classes on DeshExam Academy',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classes & Study Materials | DeshExam',
    description: 'Access class-wise textbooks, MCQs and notes.',
  }
};

export default async function GuideClassPage() {
  const classes = await getTaxonomyNodesByType('academic', 'class');
  
  // Serialize to prevent Server Component serialization errors with Firestore Timestamps
  const serializedClasses = JSON.parse(JSON.stringify(classes));

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Classes on DeshExam Academy",
    "description": "Browse classes and study materials",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/classes`
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": classes.map((c: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": c.title,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/classes/${c.slug || c.id}`
    }))
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
        "name": "Academy",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Classes",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/classes`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ClassDashboard classes={serializedClasses} />
    </>
  );
}
