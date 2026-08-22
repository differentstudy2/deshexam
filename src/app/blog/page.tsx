import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import { getAllContent } from '@/lib/firebase/firestore';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { serializeTimestamps } from '@/lib/utils';
import { MockTest } from '@/lib/assessment-types';

export const metadata: Metadata = {
  title: 'DeshExam Blog – Preparation Tips & Updates',
  description: 'Read the latest educational updates, preparation strategies, and student success stories on the DeshExam Blog.',
  alternates: {
    canonical: 'https://deshexam.com/blog',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const dynamic = 'force-dynamic';

export default async function BlogListingPage() {
  const [data, lbData, chData] = await Promise.all([
    getAllContent('Blog'),
    getTopLeaderboard(4),
    getDailyChallenges()
  ]);

  const publishedPosts = (data as any[]).filter(a => a.status === 'Published' || a.testType?.includes('Blog'));
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
        type="Blog"
        heroBadgeText="Latest Blog Posts"
        heroTitle={<>Educational Updates & <br className="hidden lg:block" /> Preparation Strategies</>}
        heroDescription="Read our expertly crafted articles to stay ahead in your exam preparation journey."
        primaryButtonText="Read Latest"
        baseHref="/blog"
        stats={{
          total: "1,000+",
          attempts: "50K+",
          rating: "4.9",
          successRate: "95%"
        }}
      />
    </>
  );
}
