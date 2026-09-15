import { Metadata } from 'next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import InstitutionsClient from '../institutions-client';

// This catch-all handles:
//   /institutions/west-bengal                → state filter
//   /institutions/west-bengal/kolkata        → state + city filter
//   /institutions/west-bengal/kolkata/extra  → (404 — too many segments)

function parseSlugSegments(slug: string[]): {
  stateSlug: string | null;
  citySlug: string | null;
  stateName: string | null;
  cityName: string | null;
} {
  const toName = (s: string) =>
    s
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  if (slug.length === 1) {
    return {
      stateSlug: slug[0],
      citySlug: null,
      stateName: toName(slug[0]),
      cityName: null,
    };
  }
  if (slug.length === 2) {
    return {
      stateSlug: slug[0],
      citySlug: slug[1],
      stateName: toName(slug[0]),
      cityName: toName(slug[1]),
    };
  }
  // 3+ segments — we don't handle these
  return { stateSlug: null, citySlug: null, stateName: null, cityName: null };
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { stateName, cityName } = parseSlugSegments(slug);

  if (!stateName) {
    return { title: 'Institutions | DeshExam' };
  }

  const location = cityName ? `${cityName}, ${stateName}` : stateName;
  const title = `Top Schools, Colleges & Universities in ${location} 2026 | DeshExam`;
  const description = `Explore verified schools, colleges, universities and coaching institutes in ${location}. Compare courses, fees, admissions, facilities and reviews on DeshExam.`;
  const canonical = cityName
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${slug[0]}/${slug[1]}`
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${slug[0]}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function InstitutionsFilterPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const { stateSlug, citySlug, stateName, cityName } = parseSlugSegments(slug);

  // Too many slug segments → 404-style empty state handled in client
  if (!stateName) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Page not found.
      </div>
    );
  }

  // Determine locationFilter to pass into InstitutionsClient
  // Client uses this for both the search pre-fill & the actual filter logic
  const locationFilter = cityName ?? stateName;

  // ── Structured JSON-LD ──────────────────────────────────────────────────────
  const location = cityName ? `${cityName}, ${stateName}` : stateName;
  const canonicalUrl = cityName
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${stateSlug}/${citySlug}`
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${stateSlug}`;

  const breadcrumbItems: { name: string; item: string }[] = [
    { name: 'Home', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}` },
    { name: 'Institutions', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions` },
    { name: stateName, item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${stateSlug}` },
  ];
  if (cityName && citySlug) {
    breadcrumbItems.push({
      name: cityName,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${stateSlug}/${citySlug}`,
    });
  }

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}/#webpage`,
        url: canonicalUrl,
        name: `Institutions Directory in ${location}`,
        description: `Find verified schools, colleges, universities and coaching institutes in ${location} on DeshExam.`,
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}/#breadcrumb`,
        itemListElement: breadcrumbItems.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: item.item,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <InstitutionsClient initialLocationFilter={locationFilter} />
    </>
  );
}
