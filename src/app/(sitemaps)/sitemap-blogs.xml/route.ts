import { getAllContent } from '@/lib/firebase/firestore';
import { buildSitemapXml, baseUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const routes: { url: string; lastModified: string }[] = [];
  try {
    const items = await getAllContent('Blog') as any[];
    for (const item of items) {
      if ((item.status === 'Published' || item.testType?.includes?.('Blog')) && item.id) {
        const date = item.updatedAt?.toDate?.() || item.createdAt?.toDate?.() || new Date();
        routes.push({
          url: `${baseUrl}/blog/${item.id}`,
          lastModified: date.toISOString(),
        });
      }
    }
  } catch (e) {
    console.error('Error generating blogs sitemap:', e);
  }
  return buildSitemapXml(routes);
}
