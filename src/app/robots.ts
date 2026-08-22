import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: [
      'https://deshexam.com/sitemap-index.xml',
      'https://deshexam.com/sitemap.xml',
      'https://deshexam.com/sitemap-mock-tests.xml',
      'https://deshexam.com/sitemap-quizzes.xml',
      'https://deshexam.com/sitemap-practice.xml',
      'https://deshexam.com/sitemap-exams.xml',
      'https://deshexam.com/sitemap-textbooks.xml',
      'https://deshexam.com/sitemap-questions.xml',
      'https://deshexam.com/sitemap-blogs.xml',
      'https://deshexam.com/sitemap-videos.xml',
      'https://deshexam.com/sitemap-jobs.xml',
      'https://deshexam.com/sitemap-institutions.xml',
    ],
  }
}
