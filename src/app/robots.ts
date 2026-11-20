import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-index.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-mock-tests.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-quizzes.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-practice.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-exams.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-textbooks.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-questions.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-blogs.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-videos.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-jobs.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/sitemap-institutions.xml`,
    ],
  }
}
