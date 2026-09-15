import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { buildSitemapXml, baseUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const routes: { url: string; lastModified: string }[] = [];
  try {
    // Videos are stored in 'guide_videos' collection
    const q = query(collection(db, 'guide_videos'), where('status', '==', 'Published'));
    const snap = await getDocs(q);
    snap.docs.forEach(doc => {
      const data = doc.data();
      const date = data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date();
      routes.push({
        url: `${baseUrl}/video/${doc.id}`,
        lastModified: date.toISOString(),
      });
    });
  } catch (e) {
    console.error('Error generating videos sitemap:', e);
  }
  return buildSitemapXml(routes);
}
