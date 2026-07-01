import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import { getAssessments } from '@/lib/firebase/assessment';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { serializeTimestamps } from '@/lib/utils';
import { MockTest } from '@/lib/assessment-types';

export const metadata: Metadata = {
  title: 'Quizzes | DeshExam',
  description: 'Interactive timed quizzes to test your speed and accuracy.',
};

export const dynamic = 'force-dynamic';

export default async function QuizListingPage() {
  const [data, lbData, chData] = await Promise.all([
    getAssessments('quizzes'),
    getTopLeaderboard(4),
    getDailyChallenges()
  ]);

  const publishedQuizzes = (data as MockTest[]).filter(a => a.status === 'Published');
  const initialAssessments = serializeTimestamps(publishedQuizzes);
  const initialLeaderboard = serializeTimestamps(lbData);
  const initialChallenges = serializeTimestamps(chData);

  return (
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
  );
}
