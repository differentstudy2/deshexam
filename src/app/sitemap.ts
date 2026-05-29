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
<<<<<<< HEAD
    '/textbook-solutions',
    '/exams',
    '/quizzes',
    '/mock-tests',
    '/questions',
=======
    '/kids-zone/learning-games',
    '/kids-zone/learning-games/math-puzzles',
    '/kids-zone/learning-games/math-puzzles/addition-adventure',
    '/kids-zone/learning-games/math-puzzles/subtraction-submarine',
    '/kids-zone/learning-games/number-recognition',
    '/kids-zone/learning-games/number-recognition/learn-numbers',
    '/kids-zone/learning-games/number-recognition/learn-numbers/0-10',
    '/kids-zone/learning-games/number-recognition/learn-numbers/11-20',
    '/kids-zone/learning-games/number-recognition/learn-numbers/21-30',
    '/kids-zone/learning-games/number-recognition/learn-numbers/31-40',
    '/kids-zone/learning-games/number-recognition/learn-numbers/41-50',
    '/kids-zone/learning-games/number-recognition/learn-numbers/51-60',
    '/kids-zone/learning-games/number-recognition/learn-numbers/61-70',
    '/kids-zone/learning-games/number-recognition/learn-numbers/71-80',
    '/kids-zone/learning-games/number-recognition/learn-numbers/81-90',
    '/kids-zone/learning-games/number-recognition/learn-numbers/91-100',
    '/kids-zone/learning-games/number-recognition/numbers-0-9',
    '/kids-zone/learning-bengali',
    '/kids-zone/learning-bengali/alphabet',
    '/kids-zone/learning-bengali/matra',
    '/kids-zone/learning-bengali/matra/matra-pronounsation',
    '/kids-zone/learning-bengali/spelling',
    '/kids-zone/learning-bengali/reading',
    '/kids-zone/learning-bengali/reading/sheyaler-chalaki',
    '/kids-zone/learning-bengali/reading/kocchop-o-khorgosh',
    '/kids-zone/learning-bengali/reading/trishnarto-kak',
    '/kids-zone/learning-bengali/reading/lion-and-mouse',
    '/kids-zone/learning-bengali/reading/two-friends-and-bear',
    '/kids-zone/learning-english',
>>>>>>> 49fc1c0c874748b5830da174a57557d18a08f292
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
