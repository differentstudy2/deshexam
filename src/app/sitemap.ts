import { MetadataRoute } from 'next';
import { 
  getAllContent, 
  getAllQuestions, 
  getSubjects, 
  getAllTextbooks, 
  getChaptersByTextbookId, 
  getTopicsByChapterId, 
  getKidsZoneCategories,
  getPracticeSetsByTopicId 
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

  // 2. Kids Zone Categories & Specific Pages
  const kidsCategories = await getKidsZoneCategories();
  const kidsCategoryRoutes = kidsCategories.map(cat => ({
    url: `${baseUrl}/kids-zone/category/${(cat as any).slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  const kidsSpecificRoutes = [
    '/kids-zone/fun-quizzes',
    '/kids-zone/learning-games',
    '/kids-zone/learning-games/math-puzzles',
    '/kids-zone/learning-games/math-puzzles/addition-adventure',
    '/kids-zone/learning-games/number-recognition',
    '/kids-zone/learning-games/number-recognition/learn-numbers',
    '/kids-zone/learning-bengali',
    '/kids-zone/learning-bengali/alphabet',
    '/kids-zone/learning-bengali/matra',
    '/kids-zone/learning-bengali/matra/matra-pronounsation',
    '/kids-zone/learning-bengali/spelling',
    '/kids-zone/learning-bengali/reading',
    '/kids-zone/learning-english',
    '/kids-zone/learning-arabic',
    '/kids-zone/learning-hindi',
    '/kids-zone/learning-urdu',
  ].map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      priority: 0.7,
  }));

  // 3. Main Content Items (Mock Tests, Quizzes, Articles)
  const allContent = await getAllContent();
  const contentRoutes = allContent.map((item: any) => {
    let type = 'content';
    if (Array.isArray(item.testType) && item.testType.length > 0) {
        type = item.testType[0];
    } else if (typeof item.testType === 'string') {
        type = item.testType;
    }
    const slug = type.toLowerCase().replace(/\s+/g, '-');
    
    // Map to friendly URLs used in rewrites
    let path = `/${slug}/${item.id}`;
    if (slug === 'kids-zone' && item.category === 'Fun Quizzes') {
        path = `/kids-zone/fun-quizzes/${item.id}`;
    }

    return {
      url: `${baseUrl}${path}`,
      lastModified: item.updatedAt?.toDate?.() || item.createdAt?.toDate?.() || new Date(),
      priority: 0.7,
    };
  });

  // 4. Individual Questions
  const allQuestions = await getAllQuestions();
  const questionRoutes = allQuestions.map((q: any) => ({
    url: `${baseUrl}/question/${q.id}`,
    lastModified: q.createdAt?.toDate?.() || new Date(),
    priority: 0.6,
  }));

  // 5. Textbooks, Chapters, Topics, and Practice Sets
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
            
            const practiceSets = await getPracticeSetsByTopicId(bookId, chapterId, topicId);
            for (const ps of practiceSets) {
                 textbookTreeRoutes.push({
                    url: `${baseUrl}/textbook-solutions/practice-set/${(ps as any).id}/textbook/${bookId}/chapter/${chapterId}/topic/${topicId}`,
                    lastModified: new Date(),
                    priority: 0.5,
                });
            }
        }
        
        // Handle chapter-level practice sets (no specific topic)
        const chapterDoc = await getDoc(doc(db, `textbooks/${bookId}/chapters`, chapterId));
        const chapterData = chapterDoc.data();
        const chapterPracticeSets = (chapterData as any)?.practiceSets || [];
        for (const ps of chapterPracticeSets) {
             textbookTreeRoutes.push({
                url: `${baseUrl}/textbook-solutions/practice-set/${(ps as any).id}/textbook/${bookId}/chapter/${chapterId}/topic/null`,
                lastModified: new Date(),
                priority: 0.5,
            });
        }
    }
  }

  return [
    ...staticRoutes,
    ...kidsCategoryRoutes,
    ...kidsSpecificRoutes,
    ...contentRoutes,
    ...questionRoutes,
    ...textbookTreeRoutes,
  ];
}
