import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-index.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-mock-tests.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-quizzes.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-practice.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-exams.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-textbooks.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-questions.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-blogs.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-videos.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-jobs.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap-institutions.xml`,
    ],
  }
}
