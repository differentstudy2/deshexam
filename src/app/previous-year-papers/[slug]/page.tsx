import { redirect } from 'next/navigation';

export default async function PreviousYearPaperRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  redirect(`/exams/${resolvedParams.slug}`);
}
