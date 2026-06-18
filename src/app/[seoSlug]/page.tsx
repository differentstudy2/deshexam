import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InstitutionsClient from '@/app/institutions/institutions-client';

// Mapping URL slug types to our internal boardType filters
const typeMap: Record<string, string> = {
  'colleges': 'College',
  'universities': 'University',
  'schools': 'School',
  'public-schools': 'Public School',
  'private-schools': 'Private School',
  'institutions': 'All',
  'coaching': 'Coaching Institute',
};

// Helper to convert 'west-bengal' to 'West Bengal'
function formatLocationName(slugLocation: string) {
  if (slugLocation === 'india') return ''; // 'india' means no specific location filter
  return slugLocation
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const validTypes = Object.keys(typeMap);
const typesRegex = validTypes.join('|');
// Pattern matches: [prefix-]-?[type]-in-[location]
const routeRegex = new RegExp(`^(?:([a-z-]+)-)?(${typesRegex})-in-([a-z-]+)$`);

// Helper to parse the slug
function parseSeoSlug(slug: string) {
  const match = slug.match(routeRegex);
  if (!match) return null;

  const urlPrefix = match[1]; // optional prefix like 'government' or 'bsc'
  const urlType = match[2];
  const urlLocation = match[3];

  if (!typeMap[urlType]) return null;

  return {
    urlPrefix,
    urlType,
    urlLocation,
    filterPrefix: urlPrefix ? formatLocationName(urlPrefix) : undefined,
    filterType: typeMap[urlType],
    filterLocation: formatLocationName(urlLocation),
  };
}

export async function generateMetadata({ params }: { params: { seoSlug: string } }): Promise<Metadata> {
  const parsed = parseSeoSlug(params.seoSlug);
  if (!parsed) return {}; // Will be 404

  const typeName = parsed.urlType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const prefixName = parsed.filterPrefix ? `${parsed.filterPrefix} ` : '';
  const locName = parsed.filterLocation || 'India';

  return {
    title: `Top ${prefixName}${typeName} in ${locName} 2026 | DeshExam`,
    description: `Explore verified ${prefixName.toLowerCase()}${typeName.toLowerCase()} in ${locName}. Compare courses, fees, admissions, facilities and reviews on DeshExam.`,
    alternates: {
      canonical: `https://deshexam.com/${params.seoSlug}`,
    },
  };
}

export default function SeoDirectoryPage({ params }: { params: { seoSlug: string } }) {
  const parsed = parseSeoSlug(params.seoSlug);
  
  if (!parsed) {
    // If it doesn't match our programmatic SEO patterns, it's likely a missing page.
    notFound();
  }

  const { urlType, filterType, filterLocation, filterPrefix } = parsed;
  const typeName = urlType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const prefixName = filterPrefix ? `${filterPrefix} ` : '';
  const locName = filterLocation || 'India';

  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://deshexam.com/${params.seoSlug}/#webpage`,
        "url": `https://deshexam.com/${params.seoSlug}`,
        "name": `${prefixName}${typeName} in ${locName}`,
        "description": `Explore verified ${prefixName.toLowerCase()}${typeName.toLowerCase()} in ${locName}.`,
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://deshexam.com/${params.seoSlug}/#breadcrumb`,
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
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `${prefixName}${typeName} in ${locName}`,
            "item": `https://deshexam.com/${params.seoSlug}`
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
      {/* We reuse the awesome client component but pass the parsed filters! */}
      <InstitutionsClient 
        initialTypeFilter={filterType} 
        initialLocationFilter={filterLocation}
        initialPrefixFilter={filterPrefix}
      />
    </>
  );
}
