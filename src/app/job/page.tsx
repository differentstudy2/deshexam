import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import { getAllContent } from '@/lib/firebase/firestore';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { serializeTimestamps } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'DeshExam Jobs – Latest Government & Private Job Updates',
  description: 'Stay updated with the latest government job notifications, admit cards, exam dates, and private sector opportunities.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/job`,
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const dynamic = 'force-dynamic';

export default async function JobListingPage() {
  const [data, lbData, chData] = await Promise.all([
    getAllContent('Job'),
    getTopLeaderboard(4),
    getDailyChallenges()
  ]);

  const publishedPosts = (data as any[]).filter(a => a.status === 'Published' || a.testType?.includes('Job'));
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
        type="Job"
        heroBadgeText="Latest Job Notifications"
        heroTitle={<>Government & Private <br className="hidden lg:block" /> Job Updates</>}
        heroDescription="Find the latest job circulars, admit card releases, exam dates, and results."
        primaryButtonText="Explore Jobs"
        baseHref="/job"
        stats={{
          total: "5,000+",
          attempts: "2M+",
          rating: "4.8",
          successRate: "N/A"
        }}
      />
    </>
  );
}
