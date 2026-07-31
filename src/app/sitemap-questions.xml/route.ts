import { NextResponse } from 'next/server';
import { getAllQuestionBankEntries } from '@/lib/firebase/question-bank';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours (1 day)

export async function GET() {
  const baseUrl = 'https://deshexam.com';
  const allRoutes: { url: string; lastModified: Date | string }[] = [];

  try {
    const allQuestions = await getAllQuestionBankEntries();
    
    // For extreme scale, you would add pagination here using a cursor, 
    // but for now, we just fetch all and chunk if necessary.
    // If questions exceed 40,000, we should split them, but this handles up to ~45k safely.
    
    allRoutes.push(...allQuestions.map((q: any) => {
      const date = q.createdAt?.toDate?.() || new Date();
      return {
        url: `${baseUrl}/question/${q.slug || q.id}`,
        lastModified: date.toISOString(),
      };
    }));
  } catch (err) {
    console.error('Error generating questions sitemap:', err);
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
