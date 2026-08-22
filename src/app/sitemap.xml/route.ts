import { NextResponse } from 'next/server';
import { buildSitemapXml, baseUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const staticRoutes = [
    { url: baseUrl, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/mock-tests`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/quiz`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/practice`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/exams`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/textbook-solutions`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/questions`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/blog`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/videos`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/audios`, priority: '0.7', changefreq: 'weekly' },
    { url: `${baseUrl}/documents`, priority: '0.7', changefreq: 'weekly' },
    { url: `${baseUrl}/job`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/news`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/academy`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/skill`, priority: '0.7', changefreq: 'weekly' },
    { url: `${baseUrl}/course`, priority: '0.7', changefreq: 'weekly' },
    { url: `${baseUrl}/book`, priority: '0.7', changefreq: 'weekly' },
    { url: `${baseUrl}/institutions`, priority: '0.7', changefreq: 'weekly' },
    { url: `${baseUrl}/leaderboard`, priority: '0.7', changefreq: 'weekly' },
    { url: `${baseUrl}/pricing`, priority: '0.8', changefreq: 'monthly' },
    { url: `${baseUrl}/faqs`, priority: '0.6', changefreq: 'monthly' },
    { url: `${baseUrl}/about`, priority: '0.6', changefreq: 'monthly' },
    { url: `${baseUrl}/contact`, priority: '0.6', changefreq: 'monthly' },
    { url: `${baseUrl}/terms`, priority: '0.4', changefreq: 'yearly' },
    { url: `${baseUrl}/privacy`, priority: '0.4', changefreq: 'yearly' },
    { url: `${baseUrl}/refund-policy`, priority: '0.4', changefreq: 'yearly' },
    { url: `${baseUrl}/kids-zone`, priority: '0.8', changefreq: 'weekly' },
  ].map(r => ({ url: r.url, lastModified: new Date().toISOString(), priority: r.priority, changefreq: r.changefreq }));

  return buildSitemapXml(staticRoutes);
}
