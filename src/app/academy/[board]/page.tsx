import { Metadata } from 'next';
import Script from 'next/script';
import AcademyClient from '../AcademyClient';

type Props = {
  params: Promise<{ board: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const boardParam = decodeURIComponent(params.board);
  const boardSlug = boardParam.toUpperCase(); // e.g. "wbbse" -> "WBBSE"

  const title = `${boardSlug} Academy – All Classes, Subjects & Notes | DeshExam`;
  const description = `Access ${boardSlug} textbooks, chapter-wise notes, MCQs, SAQ, LAQ, mock tests, and practice materials for better exam preparation.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/${params.board}`;

  return {
    title,
    description,
    keywords: [
      `${boardSlug} textbook`,
      `${boardSlug} guide`,
      `${boardSlug} notes`,
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
          alt: `DeshExam ${boardSlug} Academy`,
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

export default async function BoardAcademyPage(props: Props) {
  const params = await props.params;
  const boardParam = decodeURIComponent(params.board);
  const boardSlug = boardParam.toUpperCase();
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/academy/${boardParam}`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${boardSlug} Academy`,
    "description": `Academic resources and textbooks for ${boardSlug} students.`,
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
        "name": boardSlug,
        "item": url
      }
    ]
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${boardSlug} Curriculum`,
    "provider": {
      "@type": "Organization",
      "name": "DeshExam",
      "sameAs": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
    }
  };

  return (
    <>
      <Script
        id={`board-collection-schema-${params.board}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Script
        id={`board-breadcrumb-schema-${params.board}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id={`board-course-schema-${params.board}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <AcademyClient preSelectedBoardSlug={boardParam} />
    </>
  );
}
