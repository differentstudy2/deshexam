import type { Metadata } from 'next';
import PricingClientPage from './pricing-client';

export const metadata: Metadata = {
  title: 'DeshExam Pricing – Buy Pass Pro for Mock Tests & Premium Learning',
  description: 'Unlock premium learning with DeshExam Pass Pro. Access unlimited mock tests, previous year papers, AI analytics, and advanced performance reports.',
  keywords: ['deshexam pricing', 'deshexam pass pro', 'mock test subscription', 'online mock test membership', 'exam preparation subscription', 'buy mock test subscription', 'buy test series online', 'premium exam membership'],
  openGraph: {
    title: 'DeshExam Pass Pro Pricing',
    description: 'Access 70,000+ mock tests with Pass Pro. Unlock AI analytics, previous year papers, and premium content.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og/pricing-banner.jpg`,
        width: 1200,
        height: 630,
        alt: 'DeshExam Pass Pro premium pricing plans for mock tests',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeshExam Pass Pro Pricing',
    description: 'Unlock premium learning with DeshExam Pass Pro. Access unlimited mock tests, previous year papers, and AI analytics.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og/pricing-banner.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
  },
  robots: {
    index: true,
    follow: true,
  }
};

const jsonLdProduct = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DeshExam Pass Pro",
  "description": "Premium subscription for unlimited mock tests and AI analytics, previous year papers, and structured practice sets.",
  "brand": {
    "@type": "Brand",
    "name": "DeshExam"
  },
  "offers": {
    "@type": "Offer",
    "price": "599",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
    "priceValidUntil": "2027-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "12500"
  }
};

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is DeshExam Pass Pro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DeshExam Pass Pro is our premium subscription plan that gives you unlimited access to 70,000+ mock tests, 30,000+ previous year papers, and advanced AI-driven performance analytics."
      }
    },
    {
      "@type": "Question",
      "name": "Are there any hidden charges?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No! The price you see is the final price (exclusive of standard platform fees and GST). There are no hidden subscription charges."
      }
    },
    {
      "@type": "Question",
      "name": "Can I access the tests on my mobile phone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DeshExam Pass Pro works seamlessly across desktops, tablets, and native mobile apps. Your progress is synced instantly."
      }
    }
  ]
};

const jsonLdBreadcrumb = {
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
      "name": "Pricing",
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`
    }
  ]
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`
};

export default function PricingPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
            <PricingClientPage />
        </>
    );
}
