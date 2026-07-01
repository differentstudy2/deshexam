import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quizzes | DeshExam',
  description: 'Interactive timed quizzes to test your speed and accuracy.',
};

export default function QuizListingPage() {
  return (
    <AssessmentClient 
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
