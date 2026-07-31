import { NextResponse } from 'next/server';
import { getAssessments } from '@/lib/firebase/assessment';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours (1 day)

export async function GET() {
  const baseUrl = 'https://deshexam.com';
  const allRoutes: { url: string; lastModified: Date | string }[] = [];

  const collections = [
    { name: 'mockTests', prefix: '/mock-tests' },
    { name: 'practiceSets', prefix: '/practice-sets' },
    { name: 'quizzes', prefix: '/quizzes' },
    { name: 'examSeries', prefix: '/exams' },
    { name: 'examPapers', prefix: '/exam-papers' },
  ] as const;
  
  for (const { name, prefix } of collections) {
    try {
      const items = await getAssessments(name) as any[];
      for (const item of items) {
        if (item.status === 'Published') {
          const date = item.updatedAt ? new Date(item.updatedAt) : new Date();
          allRoutes.push({
            url: `${baseUrl}${prefix}/${item.slug || item.id}`,
            lastModified: date.toISOString(),
          });
        }
      }
    } catch (e) {
      console.error(`Error fetching ${name} for sitemap:`, e);
    }
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map(
      (route) => `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  });
}
