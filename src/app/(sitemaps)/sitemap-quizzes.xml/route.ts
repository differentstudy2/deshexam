import { getAssessments } from '@/lib/firebase/assessment';
import { buildSitemapXml, baseUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const routes: { url: string; lastModified: string }[] = [];
  try {
    const items = await getAssessments('quizzes') as any[];
    for (const item of items) {
      if (item.status === 'Published' && item.slug) {
        routes.push({
          url: `${baseUrl}/quiz/${item.slug}`,
          lastModified: (item.updatedAt ? new Date(item.updatedAt) : new Date()).toISOString(),
        });
      }
    }
  } catch (e) {
    console.error('Error generating quizzes sitemap:', e);
  }
  return buildSitemapXml(routes);
}
