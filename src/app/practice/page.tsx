import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import { getAssessments } from '@/lib/firebase/assessment';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { serializeTimestamps } from '@/lib/utils';
import { MockTest } from '@/lib/assessment-types';
import { getAllHardcodedPracticeSets } from '@/lib/hardcoded-loader';

export const metadata: Metadata = {
  title: 'Free Practice Sets & Chapter-wise Questions | DeshExam',
  description: 'Boost your exam preparation with topic-wise and chapter-wise practice sets. Practice without time limits, review detailed explanations, and track your progress daily on DeshExam.',
  keywords: [
    'practice sets',
    'topic-wise questions',
    'chapter-wise practice',
    'deshexam practice',
    'free exam practice',
    'online practice questions',
    'foundation building',
    'study practice',
    'concept building questions'
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/practice`
  },
  openGraph: {
    title: 'Free Practice Sets & Chapter-wise Questions | DeshExam',
    description: 'Practice topic-wise questions at your own pace. Build your foundation with instant explanations and daily challenges.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/practice`,
    images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-practice.jpg` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Practice Sets & Questions | DeshExam',
    description: 'Boost your exam preparation with chapter-wise practice sets and instant explanations.',
  }
};

export const dynamic = 'force-dynamic';

export default async function PracticeListingPage() {
  const [data, lbData, chData] = await Promise.all([
    getAssessments('practiceSets'),
    getTopLeaderboard(4),
    getDailyChallenges()
  ]);

  const publishedPracticeSets = (data as MockTest[]).filter(a => a.status === 'Published');
  const hardcodedPracticeSets = getAllHardcodedPracticeSets() as MockTest[];

  const combinedPracticeSets = [...publishedPracticeSets];
  for (const ht of hardcodedPracticeSets) {
    if (!combinedPracticeSets.find(t => t.slug === ht.slug)) {
      combinedPracticeSets.push(ht);
    }
  }

  const initialAssessments = serializeTimestamps(combinedPracticeSets);
  const initialLeaderboard = serializeTimestamps(lbData);
  const initialChallenges = serializeTimestamps(chData);

  return (
    <AssessmentClient 
      initialAssessments={initialAssessments}
      initialLeaderboard={initialLeaderboard}
      initialChallenges={initialChallenges} 
      collectionName="practiceSets"
      type="Practice"
      heroBadgeText="Comprehensive Practice Sets"
      heroTitle={<>Topic-wise Casual Practice <br className="hidden lg:block" /> to Build Your Foundation</>}
      heroDescription="Practice without the stress of a timer and get instant explanations for your mistakes."
      primaryButtonText="Start Practice"
      baseHref="/practice"
      stats={{
        total: "25,000+",
        attempts: "80K+",
        rating: "4.9",
        successRate: "95%"
      }}
    />
  );
}
