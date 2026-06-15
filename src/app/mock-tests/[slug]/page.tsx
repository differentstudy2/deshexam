import React from 'react';
import { getAssessmentBySlug, getAssessments } from '@/lib/firebase/assessment';
import { notFound } from 'next/navigation';
import { MockTest } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import {
  Clock, HelpCircle, ShieldCheck, FileText, CheckCircle2,
  AlertTriangle, BookOpen, Target, Award, ChevronRight, ArrowRight,
  Zap, Users, BarChart3, Brain, Star
} from 'lucide-react';
import Link from 'next/link';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { StartTestButton } from './StartTestButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const test = await getAssessmentBySlug('mockTests', slug) as MockTest | null;
  if (!test) return { title: 'Mock Test Not Found' };
  return {
    title: `${formatTitleForBrowser(test.title)} | Mock Test | DeshExam`,
    description: test.description || `Take the mock test: ${test.title}.`,
  };
}

export default async function MockTestLandingPage({ params }: Props) {
  const { slug } = await params;
  const test = await getAssessmentBySlug('mockTests', slug) as MockTest | null;

  if (!test || test.status !== 'Published') notFound();

  const allTests = await getAssessments('mockTests') as MockTest[];
  const related = allTests.filter(a => a.id !== test.id && a.status === 'Published').slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: test.title,
    description: test.description,
    learningResourceType: 'Mock Exam',
    educationalLevel: test.difficulty,
  };

  const DIFFICULTY_COLOR: Record<string, string> = {
    Easy:   'text-emerald-700 bg-emerald-50 border-emerald-200',
    Medium: 'text-amber-700 bg-amber-50 border-amber-200',
    Hard:   'text-red-700 bg-red-50 border-red-200',
    Expert: 'text-purple-700 bg-purple-50 border-purple-200',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[#f5f7fa]">

        {/* ═══════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════ */}
        <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f2444] overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
          </div>

          <div className="relative container max-w-6xl mx-auto px-4 pt-6 pb-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/mock-tests" className="hover:text-white transition-colors">Mock Tests</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-300 truncate max-w-[200px]">{test.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
              {/* Left: title + meta */}
              <div className="flex-1 space-y-6 pb-12">
                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> Mock Test
                  </span>
                  {test.difficulty && (
                    <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${DIFFICULTY_COLOR[test.difficulty] || DIFFICULTY_COLOR.Medium}`}>
                      {test.difficulty}
                    </span>
                  )}
                  {test.verificationBadges?.map((badge, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> {badge}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {test.title}
                </h1>

                {test.description && (
                  <p className="text-slate-400 text-base lg:text-lg max-w-xl leading-relaxed">
                    {test.description}
                  </p>
                )}

                {/* Stats strip */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: HelpCircle, label: `${test.questionIds?.length ?? 0} Questions`, color: 'text-blue-400' },
                    { icon: Clock,       label: `${test.durationMin ?? 0} Minutes`,           color: 'text-violet-400' },
                    { icon: FileText,   label: `${test.totalMarks ?? 0} Marks`,              color: 'text-amber-400' },
                    { icon: AlertTriangle, label: `${test.negativeMarking ?? 0} Negative`,   color: 'text-red-400' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                      <Icon className={`w-4 h-4 ${color}`} />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Mobile CTA */}
                <div className="lg:hidden">
                  <StartTestButton slug={test.slug} />
                </div>
              </div>

              {/* Right: CTA card (desktop — floats into content below) */}
              <div className="hidden lg:block w-80 shrink-0 -mb-16 relative z-10">
                <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 border border-slate-100 overflow-hidden">
                  {/* Card header */}
                  <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-5">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-100 font-semibold">Start Now</p>
                        <h3 className="text-lg font-extrabold text-white leading-tight">{test.title}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-3">
                    {[
                      { icon: HelpCircle,    label: 'Questions',      value: `${test.questionIds?.length ?? 0}` },
                      { icon: Clock,          label: 'Duration',       value: `${test.durationMin ?? 0} min` },
                      { icon: Target,         label: 'Total Marks',    value: `${test.totalMarks ?? 0}` },
                      { icon: CheckCircle2,   label: 'Passing Marks',  value: `${test.passingMarks ?? 0}` },
                      { icon: AlertTriangle,  label: 'Negative Marks', value: `${test.negativeMarking ?? 0}` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-500 font-medium">
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          {label}
                        </span>
                        <span className="font-bold text-slate-800">{value}</span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-slate-100">
                      <StartTestButton slug={test.slug} />
                    </div>

                    <p className="text-center text-[11px] text-slate-400">Strictly timed · Negative marking applies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            CONTENT AREA
        ═══════════════════════════════════════════════ */}
        <div className="container max-w-6xl mx-auto px-4 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Main column */}
            <div className="flex-1 space-y-8">

              {/* Quick facts strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: HelpCircle, label: 'Questions',   value: `${test.questionIds?.length ?? 0}`, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { icon: Clock,       label: 'Duration',    value: `${test.durationMin ?? 0} min`,     color: 'bg-violet-50 border-violet-200 text-violet-700' },
                  { icon: Award,       label: 'Total Marks', value: `${test.totalMarks ?? 0}`,          color: 'bg-amber-50 border-amber-200 text-amber-700' },
                  { icon: Target,      label: 'Pass Marks',  value: `${test.passingMarks ?? 0}`,        color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center ${color}`}>
                    <Icon className="w-5 h-5 mb-1 opacity-70" />
                    <p className="text-2xl font-extrabold">{value}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <BookOpen className="w-5 h-5 text-[#107c41]" />
                  <h2 className="text-base font-bold text-slate-800">Instructions</h2>
                </div>
                <div className="p-6">
                  <div className="prose prose-slate prose-sm max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-strong:font-semibold">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {test.instructions || "Please read the exam rules carefully before starting. Make sure you have a stable internet connection. Do not refresh the page during the exam."}
                    </ReactMarkdown>
                  </div>
                  {test.examRules && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-bold text-amber-700">Exam Rules</span>
                      </div>
                      <div className="prose prose-sm prose-amber max-w-none text-amber-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{test.examRules}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* What to expect */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-800">What to Expect</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: BarChart3,    title: 'Detailed Score Report',  desc: 'Get a section-wise breakdown of your performance immediately after completion.' },
                    { icon: Clock,        title: 'Timed Exam Mode',         desc: 'Simulate real exam pressure with a countdown timer for the full duration.' },
                    { icon: AlertTriangle,title: 'Negative Marking',        desc: `Incorrect answers deduct ${test.negativeMarking ?? 0} marks — choose wisely.` },
                    { icon: CheckCircle2, title: 'Instant Results',         desc: 'Review your answers and explanations right after you submit the test.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Desktop sticky sidebar (repeats CTA below the hero card on scroll) */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Summary</p>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Type',        value: 'Mock Test' },
                      { label: 'Difficulty',  value: test.difficulty || 'Mixed' },
                      { label: 'Language',    value: 'English' },
                      { label: 'Questions',   value: `${test.questionIds?.length ?? 0}` },
                      { label: 'Duration',    value: `${test.durationMin ?? 0} minutes` },
                      { label: 'Total Marks', value: `${test.totalMarks ?? 0}` },
                      { label: 'Pass Marks',  value: `${test.passingMarks ?? 0}` },
                      { label: 'Negative',    value: `${test.negativeMarking ?? 0} per wrong answer` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-slate-500 font-medium">{label}</span>
                        <span className="font-bold text-slate-800 text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href={`/mock-tests/${test.slug}/take`}>
                  <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Start Test Now <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>

                <p className="text-center text-[11px] text-slate-400">Free · No sign-up required to start</p>
              </div>
            </div>
          </div>

          {/* Related Tests */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Related Mock Tests</h2>
                <Link href="/mock-tests" className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map(r => (
                  <AssessmentCard key={r.id} assessment={r} type="Mock Test" href={`/mock-tests/${r.slug}`} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Mobile sticky bottom CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-xl">
          <Link href={`/mock-tests/${test.slug}/take`}>
            <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
              Start Mock Test <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
