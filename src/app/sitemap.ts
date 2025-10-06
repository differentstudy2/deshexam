
import { MetadataRoute } from 'next';
import { getAllContent, getContentTypes, getAllQuestions, getBoards, getClasses, getExamTypes, getSubjects, getAllTextbooks, getChaptersByTextbookId, getTopicsByChapterId, getAllUsers, getPracticeSetsByTopicId } from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://deshexam.com';

  // 1. Statically defined routes
  const staticRoutes = [
    '', 
    '/features', 
    '/leaderboard', 
    '/pricing', 
    '/contact', 
    '/faq', 
    '/terms', 
    '/privacy', 
    '/about',
    '/kids-zone',
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
  ].map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Fetch all content types to generate category pages
  const contentTypes = await getContentTypes();
  const contentTypeRoutes = contentTypes.map((type) => {
    const slug = type.name.toLowerCase().replace(/\s+/g, '-');
    return {
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      priority: 0.8,
    };
  });

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

  // 6. Fetch all textbook and their chapter/topic/practice set routes
  const allTextbooks = await getAllTextbooks();
  const textbookRoutes = allTextbooks.map(book => ({
    url: `${baseUrl}/textbook-solutions/${(book as any).id}`,
    lastModified: new Date(), // Assuming textbook document has no lastModified timestamp
    priority: 0.8,
  }));

  const textbookChapterTopicRoutes: MetadataRoute.Sitemap = [];
  const practiceSetRoutes: MetadataRoute.Sitemap = [];

  for (const book of allTextbooks) {
      const chapters = await getChaptersByTextbookId((book as any).id);
      for (const chapter of chapters) {
          const topics = await getTopicsByChapterId((book as any).id, (chapter as any).id);
          for (const topic of topics) {
              textbookChapterTopicRoutes.push({
                  url: `${baseUrl}/textbook-solutions/${(book as any).id}?chapter=${(chapter as any).id}&amp;topic=${(topic as any).id}`,
                  lastModified: new Date(),
                  priority: 0.6
              });
              
              const practiceSets = await getPracticeSetsByTopicId((book as any).id, (chapter as any).id, (topic as any).id);
              for (const practiceSet of practiceSets) {
                  practiceSetRoutes.push({
                      url: `${baseUrl}/textbook-solutions/practice-set/${(practiceSet as any).id}?textbook=${(book as any).id}&amp;chapter=${(chapter as any).id}&amp;topic=${(topic as any).id}`,
                      lastModified: new Date(),
                      priority: 0.5,
                  });
              }
          }
      }
  }

  // 7. Fetch all user profiles for dynamic routes
  const allUsers = await getAllUsers();
  const userProfileRoutes = allUsers.map((user: any) => ({
      url: `${baseUrl}/profile/${user.username}`,
      lastModified: new Date(user.createdAt),
      priority: 0.5,
  }));


  // 8. Combine all routes
  return [
    ...staticRoutes, 
    ...contentTypeRoutes, 
    ...contentItemRoutes, 
    ...questionItemRoutes,
    ...boardRoutes,
    ...classRoutes,
    ...examTypeRoutes,
    ...subjectRoutes,
    ...textbookRoutes,
    ...textbookChapterTopicRoutes,
    ...practiceSetRoutes,
    ...userProfileRoutes,
  ];
}
