import { MetadataRoute } from 'next';
import { 
  getAllContent, 
  getAllQuestions, 
  getAllTextbooks, 
  getChaptersByTextbookId, 
  getTopicsByChapterId, 
  getKidsZoneCategories,
  getClasses
} from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://deshexam.com';

  // 1. Static Routes
  const staticRoutes = [
    '', 
    '/about',
    '/features', 
    '/leaderboard', 
    '/pricing', 
    '/contact', 
    '/faq', 
    '/terms', 
    '/privacy', 
    '/kids-zone',
    '/textbook-solutions',
    '/exams',
    '/quizzes',
    '/mock-tests',
    '/questions',
  ].map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Class Categories (e.g., /classes/primary)
  const classes = await getClasses();
  const classRoutes = classes.map(c => ({
    url: `${baseUrl}/classes/${c.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  // 3. Kids Zone Categories
  const kidsCategories = await getKidsZoneCategories();
  const kidsCategoryRoutes = kidsCategories.map(cat => ({
    url: `${baseUrl}/kids-zone/category/${(cat as any).slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  // 4. Main Content Items (Mock Tests, Quizzes, Articles)
  const allContent = await getAllContent();
  const contentRoutes = allContent.map((item: any) => {
    let type = 'content';
    if (Array.isArray(item.testType) && item.testType.length > 0) {
        type = item.testType[0];
    } else if (typeof item.testType === 'string') {
        type = item.testType;
    }
    const slug = type.toLowerCase().replace(/\s+/g, '-');
    
    let path = `/${slug}/${item.id}`;
    // Special path for Kids Zone quizzes
    if (slug === 'kids-zone' && item.category === 'Fun Quizzes') {
        path = `/kids-zone/fun-quizzes/${item.id}`;
    }

    return {
      url: `${baseUrl}${path}`,
      lastModified: item.updatedAt?.toDate?.() || item.createdAt?.toDate?.() || new Date(),
      priority: 0.7,
    };
  });

  // 5. Individual Questions (Community Q&A)
  const allQuestions = await getAllQuestions();
  const questionRoutes = allQuestions.map((q: any) => ({
    url: `${baseUrl}/question/${q.id}`,
    lastModified: q.createdAt?.toDate?.() || new Date(),
    priority: 0.6,
  }));

  // 6. Textbooks, Chapters, and Topics
  const allTextbooks = await getAllTextbooks();
  const textbookTreeRoutes: MetadataRoute.Sitemap = [];

  for (const book of allTextbooks) {
    const bookId = (book as any).id;
    textbookTreeRoutes.push({
      url: `${baseUrl}/textbook-solutions/${bookId}`,
      lastModified: new Date(),
      priority: 0.8,
    });

    const chapters = await getChaptersByTextbookId(bookId);
    for (const chapter of chapters) {
        const chapterId = (chapter as any).id;
        textbookTreeRoutes.push({
            url: `${baseUrl}/textbook-solutions/${bookId}/chapter/${chapterId}`,
            lastModified: new Date(),
            priority: 0.7,
        });

        const topics = await getTopicsByChapterId(bookId, chapterId);
        for (const topic of topics) {
            const topicId = (topic as any).id;
            textbookTreeRoutes.push({
                url: `${baseUrl}/textbook-solutions/${bookId}/chapter/${chapterId}/topic/${topicId}`,
                lastModified: new Date(),
                priority: 0.6,
            });
        }
    }
  }

  return [
    ...staticRoutes,
    ...classRoutes,
    ...kidsCategoryRoutes,
    ...contentRoutes,
    ...questionRoutes,
    ...textbookTreeRoutes,
  ];
}
