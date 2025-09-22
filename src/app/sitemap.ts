
import { MetadataRoute } from 'next';
import { getAllContent, getContentTypes, getAllQuestions, getBoards, getClasses, getExamTypes, getSubjects } from '@/lib/firebase/firestore';

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
  const contentItemRoutes = allContent.map((item: any) => {
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
  
  // 4. Fetch all individual questions for dynamic routes
  const allQuestions = await getAllQuestions();
  const questionItemRoutes = allQuestions.map((item: any) => {
    const path = `/question/${item.id}`;
    let lastMod;
     if (item.createdAt && typeof item.createdAt.toDate === 'function') {
        lastMod = item.createdAt.toDate();
    } else {
        lastMod = new Date();
    }
    
    return {
      url: `${baseUrl}${path}`,
      lastModified: lastMod,
      priority: 0.6,
    };
  });

  // 5. Fetch all metafields for dynamic routes
  const [boards, classes, examTypes, subjects] = await Promise.all([
      getBoards(),
      getClasses(),
      getExamTypes(),
      getSubjects()
  ]);

  const generateMetafieldRoutes = (items: any[], pathPrefix: string) => {
      return items.map(item => ({
          url: `${baseUrl}/${pathPrefix}/${item.name.toLowerCase().replace(/\s+/g, '-')}`,
          lastModified: new Date(),
          priority: 0.7
      }));
  }

  const boardRoutes = generateMetafieldRoutes(boards, 'boards');
  const classRoutes = generateMetafieldRoutes(classes, 'classes');
  const examTypeRoutes = generateMetafieldRoutes(examTypes, 'exam-types');
  const subjectRoutes = generateMetafieldRoutes(subjects, 'subjects');

  // 6. Combine all routes
  return [
    ...otherStaticRoutes, 
    ...contentTypeRoutes, 
    ...contentItemRoutes, 
    ...questionItemRoutes,
    ...boardRoutes,
    ...classRoutes,
    ...examTypeRoutes,
    ...subjectRoutes,
  ];
}
