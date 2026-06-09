import { AssessmentListing } from '@/components/assessment/AssessmentListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practice Sets | DeshExam',
  description: 'Topic-wise casual practice to build your foundation.',
};

export default function PracticeListingPage() {
  return (
    <AssessmentListing 
      collectionName="practiceSets"
      title="Practice Sets"
      description="Topic-wise casual practice to build your foundation. Practice without the stress of a timer and get instant explanations for your mistakes."
      type="Practice"
      baseHref="/practice"
    />
  );
}
