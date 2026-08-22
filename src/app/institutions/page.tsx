import { Metadata } from 'next';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import InstitutionsClient from './institutions-client';

export const metadata: Metadata = {
  title: 'Top Schools, Colleges & Universities in India 2026 | DeshExam',
  description: 'Explore verified schools, colleges and universities across India. Compare courses, fees, admissions, facilities and reviews on DeshExam.',
  alternates: {
    canonical: 'https://deshexam.com/institutions',
  },
};

export default async function InstitutionsDirectoryPage() {
  // Fetch a few top institutions server-side for accurate ItemList schema
  let featuredInstitutions: TaxonomyNode[] = [];
  try {
    const q = query(
      collection(db, 'taxonomy_nodes'),
      where('type', '==', 'institution'),
      where('status', '==', 'published'),
      limit(6)
    );
    const snap = await getDocs(q);
    featuredInstitutions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
  } catch {
    // Non-fatal: schema will still render without ItemList items
  }

  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://deshexam.com/institutions/#webpage",
        "url": "https://deshexam.com/institutions",
        "name": "Institutions Directory in India",
        "description": "Explore verified schools, colleges and universities across India. Compare courses, fees, admissions, facilities and reviews on DeshExam.",
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://deshexam.com/institutions/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://deshexam.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Institutions",
            "item": "https://deshexam.com/institutions"
          }
        ]
      },
      // Only include ItemList if we have real institutions
      ...(featuredInstitutions.length > 0 ? [{
        "@type": "ItemList",
        "url": "https://deshexam.com/institutions",
        "name": "Featured Institutions in India",
        "description": "Top Schools, Colleges & Universities in India",
        "numberOfItems": featuredInstitutions.length,
        "itemListElement": featuredInstitutions.map((inst, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": inst.title,
          "url": `https://deshexam.com/institutions/${inst.slug || inst.id}`
        }))
      }] : []),
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How can I find the best institution on DeshExam?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can use our advanced search and filter options to narrow down institutions by type (school, college, university), state, city, and ownership. This allows you to easily discover the top-ranked educational institutions that match your specific criteria."
            }
          },
          {
            "@type": "Question",
            "name": "Are DeshExam institution profiles verified?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we prioritize authenticity. Institutions bearing the Verified badge have had their details, including official website links, contact information, and physical addresses, cross-checked with official sources and Google Maps data."
            }
          },
          {
            "@type": "Question",
            "name": "Can I compare different colleges or universities?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. Each institution's profile includes detailed information on courses offered, admission processes, fee structures, facilities, and real student reviews, making it easy to compare multiple options before making your decision."
            }
          },
          {
            "@type": "Question",
            "name": "How often is the educational directory data updated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our database is regularly updated. We continuously monitor official institution websites and student feedback to ensure that details regarding admissions, courses, and contact information remain accurate and up-to-date."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <InstitutionsClient />
    </>
  );
}
