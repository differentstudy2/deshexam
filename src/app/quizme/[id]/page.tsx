import React from 'react';
import { getAssessmentBySlug, getAssessments } from '@/lib/firebase/assessment';
import { notFound } from 'next/navigation';
import { Quiz } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, HelpCircle, ShieldCheck, PlayCircle, Trophy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const quiz = await getAssessmentBySlug('quizzes', id) as Quiz | null;
  if (!quiz) {
    return { title: 'Quiz Not Found' };
  }
  return {
    title: `${formatTitleForBrowser(quiz.title)} | Quiz | DeshExam`,
    description: quiz.description || `Take the quiz: ${quiz.title}.`,
  };
}

export const dynamic = 'force-dynamic';

export default async function QuizLandingPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Try finding by slug first
  let quiz = await getAssessmentBySlug('quizzes', id) as Quiz | null;

  // If not found by slug, it might be the ID (for older new-format quizzes where slug wasn't set)
  if (!quiz) {
    const { getAssessment } = await import('@/lib/firebase/assessment');
    quiz = await getAssessment('quizzes', id) as Quiz | null;
  }

  // LEGACY FALLBACK: If entirely not found in the new Assessment Center,
  // it might be an old content-based quiz (e.g. 'bullo')
  if (!quiz) {
    const { getContentById } = await import('@/lib/firebase/firestore');
    const legacyQuizData = await getContentById(id);
    
    if (legacyQuizData && legacyQuizData.testType === 'Quiz') {
      // Serialize the timestamps for the client component
      const serializeTimestamps = (data: any): any => {
          if (!data) return data;
          if (Array.isArray(data)) return data.map(item => serializeTimestamps(item));
          if (typeof data === 'object' && data !== null) {
              if (data.hasOwnProperty('seconds') && typeof (data as any).toDate === 'function') {
                  return (data as any).toDate().toISOString();
              }
              const newObj: { [key: string]: any } = {};
              for (const key in data) newObj[key] = serializeTimestamps(data[key]);
              return newObj;
          }
          return data;
      };

      const serializedLegacyQuiz = serializeTimestamps(legacyQuizData);
      
      // We must dynamically import the legacy client component so it doesn't break the server code
      // We can also just render it directly since it's a client component.
      const OldQuizClientPage = (await import('@/components/legacy/OldQuizClientPage')).default;
      
      return (
        <div className="legacy-wrapper">
          <OldQuizClientPage quiz={serializedLegacyQuiz} />
        </div>
      );
    }
  }

  // If it's still null, then it really doesn't exist
  if (!quiz) {
    notFound();
  }

  // Fetch related quizzes
  const allQuizzes = await getAssessments('quizzes') as Quiz[];
  const related = allQuizzes.filter(a => a.id !== quiz?.id && a.status === 'Published').slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    'name': quiz.title,
    'description': quiz.description,
    'learningResourceType': 'Quiz',
    'educationalLevel': quiz.difficulty,
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
                <div className="flex flex-wrap gap-2 text-sm text-slate-500 font-medium">
                  <Link href="/" className="hover:text-purple-600">Home</Link>
                  <span>›</span>
                  <Link href="/quiz" className="hover:text-purple-600">Quizzes</Link>
                  <span>›</span>
                  <span className="text-slate-900">{quiz.title}</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                  {quiz.title}
                </h1>
                
                {quiz.description && (
                  <p className="text-lg text-slate-600 max-w-2xl">
                    {quiz.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm font-medium">
                  <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                    <HelpCircle className="w-4 h-4 mr-2 text-slate-500" />
                    {quiz.questionIds.length} Questions
                  </div>
                  <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                    {quiz.timeLimitMin} Minutes Limit
                  </div>
                  <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Pass: {quiz.passingScorePercent}%
                  </div>
                  <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full">
                    Difficulty: {quiz.difficulty}
                  </div>
                </div>

                {quiz.verificationBadges && quiz.verificationBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {quiz.verificationBadges.map((badge, idx) => (
                      <div key={idx} className="flex items-center text-xs font-semibold text-[#00a651] bg-[#00a651]/10 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                        {badge}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Action Card */}
              <div className="w-full md:w-80 bg-white shadow-xl shadow-purple-200/50 rounded-2xl p-6 border border-purple-100 flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Ready for the Quiz?</h3>
                  </div>
                </div>
                <ul className="text-sm text-slate-600 mb-6 space-y-2">
                  <li className="flex items-center"><Clock className="w-4 h-4 mr-2 text-slate-400" /> Time limit is strictly enforced</li>
                  <li className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-slate-400" /> Points awarded based on speed</li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg rounded-xl" asChild>
                  <Link href={`/quizme/${quiz.slug}/take`}>
                    <PlayCircle className="w-5 h-5 mr-2" /> Start Quiz
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* SEO & Additional Content */}
        <div className="container max-w-5xl mx-auto px-4 py-12 space-y-16">
          <section>
            <h2 className="text-2xl font-bold mb-6">About this Quiz</h2>
            <div className="prose prose-slate max-w-none text-slate-600">
              <p>
                Challenge yourself with the <strong>{quiz.title}</strong> quiz. 
                This quiz consists of {quiz.questionIds.length} multiple-choice questions.
                You will have {quiz.timeLimitMin} minutes to complete it, and you need to score at least {quiz.passingScorePercent}% to pass.
              </p>
            </div>
          </section>

          {/* Related Assessments */}
          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Quizzes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(r => (
                  <AssessmentCard key={r.id} assessment={r} type="Quiz" href={`/quizme/${r.slug}`} />
                ))}
              </div>
            </section>
          )}

          {/* FAQ Schema */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border">
                <h4 className="font-semibold text-lg mb-2">Can I pause the timer?</h4>
                <p className="text-slate-600">No, once you start the quiz, the timer will continue running until the time limit is reached or you submit the quiz.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border">
                <h4 className="font-semibold text-lg mb-2">How many attempts do I get?</h4>
                <p className="text-slate-600">
                  {quiz.attemptsAllowed === 0 ? "You have unlimited attempts for this quiz." : `You are allowed a maximum of ${quiz.attemptsAllowed} attempts.`}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
