import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const baseUrl = 'https://deshexam.com';

  const sitemaps = [
    { url: `${baseUrl}/sitemap.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-mock-tests.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-quizzes.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-practice.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-exams.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-textbooks.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-questions.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-blogs.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-videos.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-jobs.xml`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/sitemap-institutions.xml`, lastmod: new Date().toISOString() },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.map(s => `
  <sitemap>
    <loc>${s.url}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  });
}
