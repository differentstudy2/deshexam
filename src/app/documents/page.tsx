import { Metadata } from 'next';
import DocumentsClient from './DocumentsClient';

export const metadata: Metadata = {
  title: 'Educational Documents & Study Materials | DeshExam',
  description: 'Access our comprehensive library of educational documents, chapter notes, model papers, question banks, and study suggestions to boost your exam preparation.',
  keywords: ['study materials', 'chapter notes', 'model papers', 'question bank', 'exam prep', 'education'],
  openGraph: {
    title: 'Study Materials & Documents | DeshExam',
    description: 'Download and read chapter notes, model papers, and question banks directly from DeshExam.',
    type: 'website',
    siteName: 'DeshExam',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Materials & Documents | DeshExam',
    description: 'Download and read chapter notes, model papers, and question banks directly from DeshExam.',
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

export default function DocumentsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Educational Documents & Study Materials | DeshExam',
    description: 'Access our comprehensive library of educational documents, chapter notes, model papers, question banks, and study suggestions to boost your exam preparation.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/documents`,
    publisher: {
      '@type': 'Organization',
      name: 'DeshExam'
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">DeshExam Documents & Study Materials Library</h1>
      <DocumentsClient />
    </main>
  );
}
