import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practice Sets | DeshExam',
  description: 'Topic-wise casual practice to build your foundation.',
};

export default function PracticeListingPage() {
  return (
    <AssessmentClient 
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
