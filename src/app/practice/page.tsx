import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import { getAssessments } from '@/lib/firebase/assessment';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { serializeTimestamps } from '@/lib/utils';
import { MockTest } from '@/lib/assessment-types';

export const metadata: Metadata = {
  title: 'Practice Sets | DeshExam',
  description: 'Practice questions by topic and chapter to improve your knowledge.',
};

export const dynamic = 'force-dynamic';

export default async function PracticeListingPage() {
  const [data, lbData, chData] = await Promise.all([
    getAssessments('practiceSets'),
    getTopLeaderboard(4),
    getDailyChallenges()
  ]);

  const publishedPracticeSets = (data as MockTest[]).filter(a => a.status === 'Published');
  const initialAssessments = serializeTimestamps(publishedPracticeSets);
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
