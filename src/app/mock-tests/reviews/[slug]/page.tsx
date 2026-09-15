import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { MockTest } from '@/lib/assessment-types';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { AllReviewsList } from './AllReviewsList';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const test = await getAssessmentBySlug('mockTests', params.slug) as MockTest | null;
  if (!test) return { title: 'Not Found' };

  return {
    title: `All Reviews - ${test.title} | DeshExam`,
    description: `Read all student reviews and ratings for the ${test.title} mock test.`,
  };
}

export default async function AllReviewsPage(props: PageProps) {
  const params = await props.params;
  const test = await getAssessmentBySlug('mockTests', params.slug) as MockTest;

  if (!test) {
    notFound();
  }

  const aggregateRating = test.reviewStats?.averageRating || 0;
  const totalReviews = test.reviewStats?.totalReviews || 0;

  return (
    <div className="min-h-screen bg-[#f5f7fa] dark:bg-slate-950 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/mock-tests/${test.slug}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mock Test
        </Link>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                Student Reviews
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                {test.title}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {aggregateRating.toFixed(1)} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ 5.0</span>
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Based on {totalReviews} reviews
                </p>
              </div>
            </div>
          </div>

          <AllReviewsList testId={test.id} />
        </div>
      </div>
    </div>
  );
}
