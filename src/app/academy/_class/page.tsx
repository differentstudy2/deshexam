import { Metadata } from 'next';
import Script from 'next/script';
import AcademyClient from '../AcademyClient';

type Props = {
  params: Promise<{ class: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const classSlug = params.class;
  const formattedClass = classSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = `${formattedClass} Academy – Textbooks, Guides, MCQ & Practice | DeshExam`;
  const description = `Access ${formattedClass} textbooks, chapter-wise notes, MCQs, SAQ, LAQ, mock tests, and practice materials for better exam preparation.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/${classSlug}`;

  return {
    title,
    description,
    keywords: [
      `${formattedClass} textbook`,
      `${formattedClass} guide`,
      `${formattedClass} notes`,
      'chapter wise mcq',
      'board exam preparation',
      'DeshExam'
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: 'DeshExam',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-academy.png`, 
          width: 1200,
          height: 630,
          alt: `DeshExam ${formattedClass} Academy`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-academy.png`],
    },
    alternates: {
      canonical: url,
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
  };
}

export default async function ClassAcademyPage(props: Props) {
  const params = await props.params;
  const classSlug = params.class;
  const formattedClass = classSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/${classSlug}`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${formattedClass} Academy`,
    "description": `Academic resources and textbooks for ${formattedClass} students.`,
    "url": url
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": formattedClass,
        "item": url
      }
    ]
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${formattedClass} Curriculum`,
    "provider": {
      "@type": "Organization",
      "name": "DeshExam",
      "sameAs": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
    }
  };

  return (
    <>
      <Script
        id={`class-collection-schema-${classSlug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Script
        id={`class-breadcrumb-schema-${classSlug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id={`class-course-schema-${classSlug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <AcademyClient preSelectedClassSlug={classSlug} />
    </>
  );
}
