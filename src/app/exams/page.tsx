import { AssessmentListing } from '@/components/assessment/AssessmentListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Previous Year Papers & Exams | DeshExam',
  description: 'Official past papers verified by our expert team.',
};

export default function ExamsListingPage() {
  return (
    <AssessmentListing 
      collectionName="examPapers"
      title="Exams & Papers"
      description="Access official previous year papers, board exams, and admission tests. View detailed solutions and take them as online exams."
      type="Exam"
      baseHref="/exams"
    />
  );
}
