import { NextResponse } from 'next/server';

const baseUrl = 'https://deshexam.com';

export function buildSitemapXml(routes: { url: string; lastModified: string; priority?: string; changefreq?: string }[]) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes.map(r => `
  <url>
    <loc>${r.url}</loc>
    <lastmod>${r.lastModified}</lastmod>
    <changefreq>${r.changefreq ?? 'weekly'}</changefreq>
    <priority>${r.priority ?? '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  });
}

export { baseUrl };
