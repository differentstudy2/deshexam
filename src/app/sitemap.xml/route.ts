import { NextResponse } from 'next/server';
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

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours (1 day)

export async function GET() {
  const baseUrl = 'https://deshexam.com';
  const allRoutes: { url: string; lastModified: Date | string }[] = [];

  // 1. Static Routes
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
    '/blog',
    '/job',
    '/news',
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
      lastModified: new Date().toISOString(),
  }));
  allRoutes.push(...staticRoutes);

  try {
    // 2. Classes
    const classes = await getClasses();
    allRoutes.push(...classes.map(c => ({
      url: `${baseUrl}/classes/${c.name.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date().toISOString(),
    })));

    // 3. Kids Zone Categories
    const kidsCategories = await getKidsZoneCategories();
    allRoutes.push(...kidsCategories.map(cat => ({
      url: `${baseUrl}/kids-zone/category/${(cat as any).slug}`,
      lastModified: new Date().toISOString(),
    })));

    // 4. Content
    const allContent = await getAllContent();
    allRoutes.push(...allContent.map((item: any) => {
      let type = 'content';
      if (Array.isArray(item.testType) && item.testType.length > 0) {
          type = item.testType[0];
      } else if (typeof item.testType === 'string') {
          type = item.testType;
      }
      const slug = type.toLowerCase().replace(/\s+/g, '-');
      
      let path = `/${slug}/${item.id}`;
      if (slug === 'kids-zone' && item.category === 'Fun Quizzes') {
          path = `/kids-zone/fun-quizzes/${item.id}`;
      }

      const date = item.updatedAt?.toDate?.() || item.createdAt?.toDate?.() || new Date();
      return {
        url: `${baseUrl}${path}`,
        lastModified: date.toISOString(),
      };
    }));

    // 5. Questions
    const allQuestions = await getAllQuestions();
    allRoutes.push(...allQuestions.map((q: any) => {
      const date = q.createdAt?.toDate?.() || new Date();
      return {
        url: `${baseUrl}/question/${q.slug || q.id}`,
        lastModified: date.toISOString(),
      };
    }));

    // 6. Textbooks, Chapters, Topics
    const allTextbooks = await getAllTextbooks();
    for (const book of allTextbooks) {
      const bookId = (book as any).id;
      allRoutes.push({
        url: `${baseUrl}/textbook-solutions/${bookId}`,
        lastModified: new Date().toISOString(),
      });

      const chapters = await getChaptersByTextbookId(bookId);
      for (const chapter of chapters) {
          const chapterId = (chapter as any).id;
          allRoutes.push({
              url: `${baseUrl}/textbook-solutions/${bookId}/chapter/${chapterId}`,
              lastModified: new Date().toISOString(),
          });

          const topics = await getTopicsByChapterId(bookId, chapterId);
          for (const topic of topics) {
              const topicId = (topic as any).id;
              allRoutes.push({
                  url: `${baseUrl}/textbook-solutions/${bookId}/chapter/${chapterId}/topic/${topicId}`,
                  lastModified: new Date().toISOString(),
              });
          }
      }
    }

    // 7. Institutions
    const institutions = await getTaxonomyNodesByType('academic', 'institution');
    allRoutes.push(...institutions.map(inst => {
      const date = inst.updatedAt?.toDate?.() || inst.createdAt?.toDate?.() || new Date();
      return {
        url: `${baseUrl}/institutions/${inst.slug || inst.id}`,
        lastModified: date.toISOString(),
      };
    }));

    // 8. Assessments
    const collections = [
      { name: 'mockTests', prefix: '/mock-tests' },
      { name: 'practiceSets', prefix: '/practice-sets' },
      { name: 'quizzes', prefix: '/quizzes' },
      { name: 'examSeries', prefix: '/exams' },
      { name: 'examPapers', prefix: '/exam-papers' },
    ] as const;
    
    for (const { name, prefix } of collections) {
      try {
        const items = await getAssessments(name) as any[];
        for (const item of items) {
          if (item.status === 'Published') {
            const date = item.updatedAt ? new Date(item.updatedAt) : new Date();
            allRoutes.push({
              url: `${baseUrl}${prefix}/${item.slug || item.id}`,
              lastModified: date.toISOString(),
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching ${name} for sitemap:`, e);
      }
    }
  } catch (err) {
    console.error('Error generating some sitemaps:', err);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map(
      (route) => `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route.url === baseUrl ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  });
}
