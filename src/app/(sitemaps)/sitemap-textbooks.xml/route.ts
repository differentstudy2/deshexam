import { getAllTextbooks, getChaptersByTextbookId, getTopicsByChapterId } from '@/lib/firebase/firestore';
import { buildSitemapXml, baseUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const routes: { url: string; lastModified: string }[] = [];
  try {
    const textbooks = await getAllTextbooks() as any[];
    for (const book of textbooks) {
      routes.push({ url: `${baseUrl}/textbook-solutions/${book.id}`, lastModified: new Date().toISOString() });

      const chapters = await getChaptersByTextbookId(book.id) as any[];
      for (const chapter of chapters) {
        routes.push({ url: `${baseUrl}/textbook-solutions/${book.id}/chapter/${chapter.id}`, lastModified: new Date().toISOString() });

        const topics = await getTopicsByChapterId(book.id, chapter.id) as any[];
        for (const topic of topics) {
          routes.push({ url: `${baseUrl}/textbook-solutions/${book.id}/chapter/${chapter.id}/topic/${topic.id}`, lastModified: new Date().toISOString() });
        }
      }
    }
  } catch (e) {
    console.error('Error generating textbooks sitemap:', e);
  }
  return buildSitemapXml(routes);
}
