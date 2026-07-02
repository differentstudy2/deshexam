import { MetadataRoute } from 'next';

export const revalidate = 86400; // Cache for 24 hours (1 day)

import { 
  getAllContent, 
  getAllQuestions, 
  getAllTextbooks, 
  getChaptersByTextbookId, 
  getTopicsByChapterId, 
  getKidsZoneCategories,
  getClasses
} from '@/lib/firebase/firestore';
import { getTaxonomyNodesByType } from '@/lib/firebase/taxonomy';
import { getAssessments } from '@/lib/firebase/assessment';

export async function generateSitemaps() {
  // We return different IDs to split the sitemap into chunks
  return [
    { id: 'static' },
    { id: 'classes' },
    { id: 'kids-zone' },
    { id: 'content' },
    { id: 'questions' },
    { id: 'textbooks' },
    { id: 'institutions' },
    { id: 'assessments' }
  ];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://deshexam.com';

  if (id === 'static') {
    const staticRoutes = [
      '', 
      '/institutions',
      '/academy',
      '/videos',
      '/audios',
      '/documents',
      '/skill',
      '/course',
      '/book',
      '/features', 
      '/leaderboard', 
      '/pricing', 
      '/faqs', 
      '/terms', 
      '/privacy', 
      '/kids-zone',
      '/textbook-solutions',
      '/exams',
      '/quizzes',
      '/mock-tests',
      '/questions',
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
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));
    return staticRoutes;
  }

  if (id === 'classes') {
    const classes = await getClasses();
    return classes.map(c => ({
      url: `${baseUrl}/classes/${c.name.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
  }

  if (id === 'kids-zone') {
    const kidsCategories = await getKidsZoneCategories();
    return kidsCategories.map(cat => ({
      url: `${baseUrl}/kids-zone/category/${(cat as any).slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
  }

  if (id === 'content') {
    const allContent = await getAllContent();
    return allContent.map((item: any) => {
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
        changeFrequency: 'daily' as const,
        priority: 0.7,
      };
    });
  }

  if (id === 'questions') {
    const allQuestions = await getAllQuestions();
    return allQuestions.map((q: any) => ({
      url: `${baseUrl}/question/${q.slug || q.id}`,
      lastModified: q.createdAt?.toDate?.() || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));
  }

  if (id === 'textbooks') {
    const allTextbooks = await getAllTextbooks();
    const textbookTreeRoutes: MetadataRoute.Sitemap = [];

    for (const book of allTextbooks) {
      const bookId = (book as any).id;
      textbookTreeRoutes.push({
        url: `${baseUrl}/textbook-solutions/${bookId}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });

      const chapters = await getChaptersByTextbookId(bookId);
      for (const chapter of chapters) {
          const chapterId = (chapter as any).id;
          textbookTreeRoutes.push({
              url: `${baseUrl}/textbook-solutions/${bookId}/chapter/${chapterId}`,
              lastModified: new Date(),
              changeFrequency: 'daily' as const,
              priority: 0.7,
          });

          const topics = await getTopicsByChapterId(bookId, chapterId);
          for (const topic of topics) {
              const topicId = (topic as any).id;
              textbookTreeRoutes.push({
                  url: `${baseUrl}/textbook-solutions/${bookId}/chapter/${chapterId}/topic/${topicId}`,
                  lastModified: new Date(),
                  changeFrequency: 'daily' as const,
                  priority: 0.6,
              });
          }
      }
    }
    return textbookTreeRoutes;
  }

  if (id === 'institutions') {
    const institutions = await getTaxonomyNodesByType('academic', 'institution');
    return institutions.map(inst => ({
      url: `${baseUrl}/institutions/${inst.slug || inst.id}`,
      lastModified: inst.updatedAt?.toDate?.() || inst.createdAt?.toDate?.() || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  }

  if (id === 'assessments') {
    const collections = [
      { name: 'mockTests', prefix: '/mock-tests' },
      { name: 'practiceSets', prefix: '/practice-sets' },
      { name: 'quizzes', prefix: '/quizzes' },
      { name: 'examSeries', prefix: '/exams' },
      { name: 'examPapers', prefix: '/exam-papers' },
    ] as const;
    
    const assessmentRoutes: MetadataRoute.Sitemap = [];
    for (const { name, prefix } of collections) {
      try {
        const items = await getAssessments(name) as any[];
        for (const item of items) {
          if (item.status === 'Published') {
            assessmentRoutes.push({
              url: `${baseUrl}${prefix}/${item.slug || item.id}`,
              lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
              changeFrequency: 'daily' as const,
              priority: 0.8,
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching ${name} for sitemap:`, e);
      }
    }
    return assessmentRoutes;
  }

  return [];
}
