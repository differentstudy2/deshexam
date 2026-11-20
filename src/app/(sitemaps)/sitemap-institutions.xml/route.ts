import { getTaxonomyNodesByType } from '@/lib/firebase/taxonomy';
import { buildSitemapXml, baseUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const routes: { url: string; lastModified: string }[] = [];
  try {
    const institutions = await getTaxonomyNodesByType('academic', 'institution') as any[];
    for (const inst of institutions) {
      const date = inst.updatedAt?.toDate?.() || inst.createdAt?.toDate?.() || new Date();
      routes.push({
        url: `${baseUrl}/institutions/${inst.slug || inst.id}`,
        lastModified: date.toISOString(),
      });
    }
  } catch (e) {
    console.error('Error generating institutions sitemap:', e);
  }
  return buildSitemapXml(routes);
}
