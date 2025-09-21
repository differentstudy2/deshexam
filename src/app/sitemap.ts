
import { MetadataRoute } from 'next';
import { getAllContent } from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://deshexam.com';

  // Static pages
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/features`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/mock-tests`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/quizzes`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/learn`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.5 },
  ];

  // Dynamic content pages
  const allContent = await getAllContent();

  const contentRoutes = allContent.map((item) => {
    const typeSlug = (item.testType || 'content').toLowerCase().replace(/\s+/g, '-');
    const path = `/${typeSlug}/${item.id}`;
    let lastMod;
    if (item.updatedAt && typeof item.updatedAt.toDate === 'function') {
        lastMod = item.updatedAt.toDate();
    } else if (item.createdAt && typeof item.createdAt.toDate === 'function') {
        lastMod = item.createdAt.toDate();
    } else {
        lastMod = new Date();
    }
    
    return {
      url: `${baseUrl}${path}`,
      lastModified: lastMod,
      priority: 0.7,
    };
  });
  

  return [...staticRoutes, ...contentRoutes];
}
