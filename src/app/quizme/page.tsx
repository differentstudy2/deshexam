import { AssessmentListing } from '@/components/assessment/AssessmentListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quizzes | DeshExam',
  description: 'Interactive timed quizzes to test your speed and accuracy.',
};

export default function QuizListingPage() {
  return (
    <AssessmentListing 
      collectionName="quizzes"
      title="Interactive Quizzes"
      description="Timed challenges to test your speed and accuracy. Compete against the clock, earn points, and climb the leaderboard."
      type="Quiz"
      baseHref="/quizme"
    />
  );
}
