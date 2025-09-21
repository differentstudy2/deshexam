
import { MetadataRoute } from 'next';
import { getAllContent, getContentTypes } from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://deshexam.com';

  // 1. Fetch all content types to generate category pages
  const contentTypes = await getContentTypes();
  const contentTypeRoutes = contentTypes.map((type) => {
    const slug = type.name.toLowerCase().replace(/\s+/g, '-');
    return {
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      priority: 0.8,
    };
  });

  // 2. Define other truly static pages
  const otherStaticRoutes = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/features`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.5 },
  ];

  // 3. Fetch all individual content items for dynamic routes
  const allContent = await getAllContent();
  const contentItemRoutes = allContent.map((item) => {
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
  
  // 4. Combine all routes
  return [...otherStaticRoutes, ...contentTypeRoutes, ...contentItemRoutes];
}
