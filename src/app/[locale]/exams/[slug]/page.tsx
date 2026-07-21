import React from 'react';
import { getAssessmentBySlug, getAssessments } from '@/lib/firebase/assessment';
import { notFound } from 'next/navigation';
import { ExamPaper } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HelpCircle, ShieldCheck, PlayCircle, FileDown, BookOpen, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { UserAttemptsDisplay } from '@/components/assessment/UserAttemptsDisplay';
import { TopScorersWidget } from '@/components/assessment/TopScorersWidget';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const test = await getAssessmentBySlug('examPapers', slug) as ExamPaper | null;
  if (!test) {
    return { title: 'Exam Paper Not Found' };
  }
  return {
    title: `${formatTitleForBrowser(test.title)} | Previous Year Paper | DeshExam`,
    description: test.description || `Download and practice the official ${test.title} paper.`,
  };
}

export default async function ExamPaperLandingPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const test = await getAssessmentBySlug('examPapers', slug) as ExamPaper | null;

  if (!test || test.status !== 'Published') {
    notFound();
  }

  const allTests = await getAssessments('examPapers') as ExamPaper[];
  const related = allTests.filter(a => a.id !== test.id && a.status === 'Published').slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    'name': test.title,
    'description': test.description,
    'learningResourceType': 'Past Paper',
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
                  <Link href="/" className="hover:text-orange-600">Home</Link>
                  <span>›</span>
                  <Link href="/exams" className="hover:text-orange-600">Exams & Papers</Link>
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
                    <BookOpen className="w-4 h-4 mr-2 text-slate-500" />
                    {test.examName}
                  </div>
                  <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                    <HelpCircle className="w-4 h-4 mr-2 text-slate-500" />
                    {test.questionIds.length} Questions Available Online
                  </div>
                  <div className="flex items-center bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
                    Difficulty: {test.difficulty}
                  </div>
                </div>

                {test.verificationStatus && (
                  <div className="flex items-center text-sm font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg w-fit mt-2">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {test.verificationStatus}
                  </div>
                )}
              </div>

              {/* Downloads & Action Card */}
              <div className="w-full md:w-80 bg-white shadow-xl shadow-orange-200/50 rounded-lg p-6 border border-orange-100 flex-shrink-0">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FileDown className="w-5 h-5 mr-2 text-orange-500" /> Downloads & Practice
                </h3>
                
                <div className="space-y-3 mb-6">
                  {test.pdfUrl && (
                    <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50" asChild>
                      <a href={test.pdfUrl} target="_blank" rel="noreferrer">
                        <FileText className="w-4 h-4 mr-2 text-slate-500" /> Question Paper PDF <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                    </Button>
                  )}
                  {test.answerKeyPdfUrl && (
                    <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50" asChild>
                      <a href={test.answerKeyPdfUrl} target="_blank" rel="noreferrer">
                        <ShieldCheck className="w-4 h-4 mr-2 text-slate-500" /> Answer Key PDF <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                    </Button>
                  )}
                  {test.solutionsPdfUrl && (
                    <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50" asChild>
                      <a href={test.solutionsPdfUrl} target="_blank" rel="noreferrer">
                        <BookOpen className="w-4 h-4 mr-2 text-slate-500" /> Detailed Solutions PDF <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                    </Button>
                  )}
                </div>

                {test.questionIds.length > 0 ? (
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg rounded-lg text-white" asChild>
                    <Link href={`/exams/${test.slug}/take`}>
                      <PlayCircle className="w-5 h-5 mr-2" /> Take Online Exam
                    </Link>
                  </Button>
                ) : (
                  <div className="text-center text-sm text-slate-500 py-3 bg-slate-50 rounded-lg border border-dashed">
                    Online interactive version coming soon. Download PDFs above.
                  </div>
                )}

                <div className="mt-6">
                  <TopScorersWidget assessmentId={test.id} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-5xl mx-auto px-4 py-12 space-y-16">
          <UserAttemptsDisplay assessmentId={test.id} />

          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Previous Year Papers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(r => (
                  <AssessmentCard key={r.id} assessment={r} type="Exam" href={`/exams/${r.slug}`} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
