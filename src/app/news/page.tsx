import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import { getAllContent } from '@/lib/firebase/firestore';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { serializeTimestamps } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'DeshExam News – Educational News & Updates',
  description: 'Get the latest news on education policies, board results, university admissions, and exam schedules.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/news`,
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const dynamic = 'force-dynamic';

export default async function NewsListingPage() {
  const [data, lbData, chData] = await Promise.all([
    getAllContent('News'),
    getTopLeaderboard(4),
    getDailyChallenges()
  ]);

  const publishedPosts = (data as any[]).filter(a => a.status === 'Published' || a.testType?.includes('News'));
  const initialAssessments = serializeTimestamps(publishedPosts);
  const initialLeaderboard = serializeTimestamps(lbData);
  const initialChallenges = serializeTimestamps(chData);

  return (
    <>
      <AssessmentClient 
        initialAssessments={initialAssessments}
        initialLeaderboard={initialLeaderboard}
        initialChallenges={initialChallenges}
        collectionName="content"
        type="News"
        heroBadgeText="Educational News"
        heroTitle={<>Breaking News & <br className="hidden lg:block" /> Educational Updates</>}
        heroDescription="Stay informed with real-time updates on exam schedules, syllabus changes, and education policies."
        primaryButtonText="Read News"
        baseHref="/news"
        stats={{
          total: "10,000+",
          attempts: "1M+",
          rating: "4.7",
          successRate: "N/A"
        }}
      />
    </>
  );
}
