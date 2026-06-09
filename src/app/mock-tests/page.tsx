import { AssessmentListing } from '@/components/assessment/AssessmentListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mock Tests | DeshExam',
  description: 'Full-length mock tests to simulate real exam environments.',
};

export default function MockTestsListingPage() {
  return (
    <AssessmentListing 
      collectionName="mockTests"
      title="Mock Tests"
      description="Simulate real exam environments with strict negative marking, total duration, and exact passing marks. Find out where you stand before the real exam."
      type="Mock Test"
      baseHref="/mock-tests"
    />
  );
}
