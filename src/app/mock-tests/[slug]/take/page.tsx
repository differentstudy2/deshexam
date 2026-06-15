import { ExamClient } from './exam-client';

export const metadata = {
  title: 'Exam Environment - DeshExam',
  description: 'Full-screen mock test environment for DeshExam',
};

export default async function TakeMockTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  return <ExamClient testId={unwrappedParams.slug} />;
}
