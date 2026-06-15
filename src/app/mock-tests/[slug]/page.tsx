import React from 'react';
import { getAssessmentBySlug, getAssessments } from '@/lib/firebase/assessment';
import { notFound } from 'next/navigation';
import { MockTest } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import { Clock, HelpCircle, ShieldCheck, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { StartTestButton } from './StartTestButton';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const test = await getAssessmentBySlug('mockTests', slug) as MockTest | null;
  if (!test) {
    return { title: 'Mock Test Not Found' };
  }
  return {
    title: `${formatTitleForBrowser(test.title)} | Mock Test | DeshExam`,
    description: test.description || `Take the mock test: ${test.title}.`,
  };
}

export default async function MockTestLandingPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const test = await getAssessmentBySlug('mockTests', slug) as MockTest | null;

  if (!test || test.status !== 'Published') {
    notFound();
  }

  const allTests = await getAssessments('mockTests') as MockTest[];
  const related = allTests.filter(a => a.id !== test.id && a.status === 'Published').slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    'name': test.title,
    'description': test.description,
    'learningResourceType': 'Mock Exam',
    'educationalLevel': test.difficulty,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-white border-b">
          <div className="container max-w-5xl mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
              <div className="space-y-6 flex-1">
                <div className="flex flex-wrap gap-2 text-sm text-slate-500 font-medium">
                  <Link href="/" className="hover:text-blue-600">Home</Link>
                  <span>›</span>
                  <Link href="/mock-tests" className="hover:text-blue-600">Mock Tests</Link>
                  <span>›</span>
                  <span className="text-slate-900">{test.title}</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                  {test.title}
                </h1>
                
                {test.description && (
                  <p className="text-lg text-slate-600 max-w-2xl">
                    {test.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm font-medium">
                  <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                    <HelpCircle className="w-4 h-4 mr-2 text-slate-500" />
                    {test.questionIds.length} Questions
                  </div>
                  <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                    {test.durationMin} Mins
                  </div>
                  <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                    <FileText className="w-4 h-4 mr-2 text-slate-500" />
                    {test.totalMarks} Marks
                  </div>
                  <div className="flex items-center bg-red-50 text-red-700 px-3 py-1.5 rounded-full">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    -{test.negativeMarking} Negative
                  </div>
                </div>

                {test.verificationBadges && test.verificationBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {test.verificationBadges.map((badge, idx) => (
                      <div key={idx} className="flex items-center text-xs font-semibold text-[#00a651] bg-[#00a651]/10 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                        {badge}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 bg-white shadow-xl shadow-blue-200/50 rounded-2xl p-6 border border-blue-100 flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Mock Test</h3>
                  </div>
                </div>
                <ul className="text-sm text-slate-600 mb-6 space-y-2">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Passing Marks: {test.passingMarks}</li>
                  <li className="flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-red-500" /> Negative Marking applies</li>
                  <li className="flex items-center"><Clock className="w-4 h-4 mr-2 text-slate-400" /> Strictly timed exam</li>
                </ul>
                <StartTestButton slug={test.slug} />
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-5xl mx-auto px-4 py-12 space-y-16">
          <section>
            <h2 className="text-2xl font-bold mb-6">Instructions</h2>
            <div className="prose prose-slate max-w-none text-slate-600">
              <p>{test.instructions || "Please read the exam rules carefully before starting. Make sure you have a stable internet connection."}</p>
              {test.examRules && (
                <div className="mt-4 p-4 bg-slate-100 rounded-lg whitespace-pre-wrap">
                  {test.examRules}
                </div>
              )}
            </div>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Mock Tests</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(r => (
                  <AssessmentCard key={r.id} assessment={r} type="Mock Test" href={`/mock-tests/${r.slug}`} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
