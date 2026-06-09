import React from 'react';
import { getAssessmentBySlug, getAssessments } from '@/lib/firebase/assessment';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { notFound } from 'next/navigation';
import { PracticeSet } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, HelpCircle, ShieldCheck, PlayCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const set = await getAssessmentBySlug('practiceSets', slug) as PracticeSet | null;
  if (!set) {
    return { title: 'Practice Set Not Found' };
  }
  return {
    title: `${formatTitleForBrowser(set.title)} | Practice Set | DeshExam`,
    description: set.description || `Test your knowledge with the practice set: ${set.title}.`,
  };
}

export default async function PracticeSetLandingPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const set = await getAssessmentBySlug('practiceSets', slug) as PracticeSet | null;

  if (!set || set.status !== 'Published') {
    notFound();
  }

  // Fetch some related sets (just random/latest for now)
  const allSets = await getAssessments('practiceSets') as PracticeSet[];
  const related = allSets.filter(a => a.id !== set.id && a.status === 'Published').slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    'name': set.title,
    'description': set.description,
    'learningResourceType': 'Practice Test',
    'educationalLevel': set.difficulty,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-slate-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="container max-w-5xl mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
              <div className="space-y-6 flex-1">
                {/* Breadcrumbs could go here */}
                <div className="flex flex-wrap gap-2 text-sm text-slate-500 font-medium">
                  <Link href="/" className="hover:text-[#00a651]">Home</Link>
                  <span>›</span>
                  <Link href="/practice" className="hover:text-[#00a651]">Practice Sets</Link>
                  <span>›</span>
                  <span className="text-slate-900">{set.title}</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                  {set.title}
                </h1>
                
                {set.description && (
                  <p className="text-lg text-slate-600 max-w-2xl">
                    {set.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm font-medium">
                  <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                    <HelpCircle className="w-4 h-4 mr-2 text-slate-500" />
                    {set.questionIds.length} Questions
                  </div>
                  {set.estimatedTimeMin && (
                    <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                      <Clock className="w-4 h-4 mr-2 text-slate-500" />
                      ~{set.estimatedTimeMin} Minutes
                    </div>
                  )}
                  <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                    Difficulty: {set.difficulty}
                  </div>
                </div>

                {set.verificationBadges && set.verificationBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {set.verificationBadges.map((badge, idx) => (
                      <div key={idx} className="flex items-center text-xs font-semibold text-[#00a651] bg-[#00a651]/10 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                        {badge}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Action Card */}
              <div className="w-full md:w-80 bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 border border-slate-100 flex-shrink-0">
                <h3 className="text-xl font-bold mb-4">Ready to practice?</h3>
                <p className="text-sm text-slate-500 mb-6">You can pause and resume this practice set anytime.</p>
                <Button className="w-full bg-[#00a651] hover:bg-[#009045] h-14 text-lg rounded-xl" asChild>
                  {/* For now, just link to a /take subroute or state. I will make a /take route for the actual quiz. */}
                  <Link href={`/practice/${set.slug}/take`}>
                    <PlayCircle className="w-5 h-5 mr-2" /> Start Practice
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* SEO & Additional Content */}
        <div className="container max-w-5xl mx-auto px-4 py-12 space-y-16">
          <section>
            <h2 className="text-2xl font-bold mb-6">About this Practice Set</h2>
            <div className="prose prose-slate max-w-none text-slate-600">
              <p>
                This practice set is designed to help you master the concepts covered in <strong>{set.title}</strong>. 
                It contains {set.questionIds.length} carefully curated questions that match the latest exam patterns.
              </p>
              <h3>Why take this practice?</h3>
              <ul>
                <li>Get instant feedback and detailed explanations for every question.</li>
                <li>Identify your weak areas and improve them.</li>
                <li>Build confidence before taking timed mock tests.</li>
              </ul>
            </div>
          </section>

          {/* Related Assessments */}
          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Practice Sets</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(r => (
                  <AssessmentCard key={r.id} assessment={r} type="Practice" href={`/practice/${r.slug}`} />
                ))}
              </div>
            </section>
          )}

          {/* FAQ Schema */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border">
                <h4 className="font-semibold text-lg mb-2">Can I take this practice set multiple times?</h4>
                <p className="text-slate-600">Yes, you can attempt this practice set as many times as you want to improve your score.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border">
                <h4 className="font-semibold text-lg mb-2">Are there negative marks in practice mode?</h4>
                <p className="text-slate-600">No, practice mode does not have negative marking. It is meant for learning and concept building.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
