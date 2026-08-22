import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import { getAssessments } from '@/lib/firebase/assessment';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { serializeTimestamps } from '@/lib/utils';
import { MockTest } from '@/lib/assessment-types';
import { getAllHardcodedQuizzes } from '@/lib/hardcoded-loader';

export const metadata: Metadata = {
  title: 'Free Online Quizzes & MCQs for Govt Job Exams (WBCS, PSC, SSC) | DeshExam',
  description: 'Boost your exam preparation with interactive online quizzes, daily challenges, and mock tests for WBCS, PSC, SSC, TET, and WBP. Test your speed, earn points, and check your rank on the leaderboard.',
  keywords: 'online quiz, mcq test, mock test, wbcs preparation quiz, psc mcq, ssc quiz, west bengal govt job exam, free online test, daily quiz, deshexam quizzes, bengali quiz',
  alternates: {
    canonical: 'https://deshexam.com/quiz',
  },
  openGraph: {
    title: 'Free Online Quizzes & MCQs for Govt Job Exams | DeshExam',
    description: 'Boost your exam preparation with interactive online quizzes, daily challenges, and mock tests. Test your speed, earn points, and check your rank.',
    url: 'https://deshexam.com/quiz',
    siteName: 'DeshExam',
    images: [
      {
        url: 'https://deshexam.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DeshExam Quizzes and Leaderboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Quizzes & MCQs for Govt Job Exams | DeshExam',
    description: 'Boost your exam preparation with interactive online quizzes, daily challenges, and mock tests. Test your speed, earn points, and check your rank.',
    images: ['https://deshexam.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const dynamic = 'force-dynamic';

export default async function QuizListingPage() {
  const [data, lbData, chData] = await Promise.all([
    getAssessments('quizzes'),
    getTopLeaderboard(4),
    getDailyChallenges()
  ]);

  const publishedQuizzes = (data as MockTest[]).filter(a => a.status === 'Published');
  const hardcodedQuizzes = getAllHardcodedQuizzes() as MockTest[];

  const combinedQuizzes = [...publishedQuizzes];
  for (const ht of hardcodedQuizzes) {
    if (!combinedQuizzes.find(t => t.slug === ht.slug)) {
      combinedQuizzes.push(ht);
    }
  }

  const initialAssessments = serializeTimestamps(combinedQuizzes);
  const initialLeaderboard = serializeTimestamps(lbData);
  const initialChallenges = serializeTimestamps(chData);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Free Online Quizzes & MCQs for Govt Job Exams | DeshExam',
      description: 'Boost your exam preparation with interactive online quizzes, daily challenges, and mock tests for WBCS, PSC, SSC, TET, and WBP.',
      url: 'https://deshexam.com/quiz',
      publisher: {
        '@type': 'Organization',
        name: 'DeshExam',
        logo: {
          '@type': 'ImageObject',
          url: 'https://deshexam.com/favicon-bg.png'
        }
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://deshexam.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Quizzes',
          item: 'https://deshexam.com/quiz'
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: publishedQuizzes.slice(0, 10).map((quiz, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://deshexam.com/quiz/${quiz.slug}`
      }))
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AssessmentClient 
        initialAssessments={initialAssessments}
        initialLeaderboard={initialLeaderboard}
        initialChallenges={initialChallenges} 
        collectionName="quizzes"
        type="Quiz"
        heroBadgeText="Daily Interactive Quizzes"
        heroTitle={<>Test Your Speed and <br className="hidden lg:block" /> Accuracy with Quizzes</>}
        heroDescription="Timed challenges to test your speed and accuracy. Compete against the clock, earn points, and climb the leaderboard."
        primaryButtonText="Start Quiz"
        baseHref="/quiz"
        stats={{
          total: "15,000+",
          attempts: "50K+",
          rating: "4.7",
          successRate: "88%"
        }}
      />
    </>
  );
}
