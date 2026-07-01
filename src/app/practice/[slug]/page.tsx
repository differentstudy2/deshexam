import React from 'react';
import { getAssessmentBySlug, getAssessments } from '@/lib/firebase/assessment';
import { notFound } from 'next/navigation';
import { MockTest } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser } from '@/lib/utils';
import {
  Clock, HelpCircle, ShieldCheck, FileText, CheckCircle2,
  AlertTriangle, BookOpen, Target, Award, ChevronRight, ArrowRight,
  Zap, Users, BarChart3, Brain, Star, Maximize, LayoutGrid, ShieldAlert, MonitorPlay,
  Trophy, Sparkles, LineChart, BookCheck, History, Smartphone, PieChart
} from 'lucide-react';
import Link from 'next/link';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { StartTestButton } from '@/components/assessment/StartTestButton';
import { MockTestReviews } from '@/components/assessment/MockTestReviews';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 0;

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const test = await getAssessmentBySlug('practiceSets', slug) as MockTest | null;
  if (!test) return { title: 'Practice Set Not Found' };
  const imageUrl = test.thumbnail || "https://deshexam.com/og/practice.jpg";
  const title = `${formatTitleForBrowser(test.title)} | Practice Set | DeshExam`;
  const description = test.description || `Take the practice set: ${test.title}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  };
}

export default async function PracticeLandingPage({ params }: Props) {
  const { slug } = await params;
  const test = await getAssessmentBySlug('practiceSets', slug) as MockTest | null;

  if (!test || test.status !== 'Published') notFound();

  const allTests = await getAssessments('practiceSets') as MockTest[];
  const related = allTests.filter(a => a.id !== test.id && a.status === 'Published').slice(0, 3);

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://deshexam.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Practice Sets",
        "item": "https://deshexam.com/practice"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": test.title,
        "item": `https://deshexam.com/practice/${test.slug}`
      }
    ]
  };

  const jsonLdCourse = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": test.title,
    "description": test.description || `practice set for ${test.title}`,
    "provider": {
      "@type": "Organization",
      "name": "DeshExam",
      "sameAs": "https://deshexam.com"
    }
  };

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": test.title,
    "description": test.description || `Take the ${test.title} practice set on DeshExam.`,
    "image": test.thumbnail || "https://deshexam.com/og/practice.jpg",
    "brand": {
      "@type": "Brand",
      "name": "DeshExam"
    },
    ...(test.reviewStats && test.reviewStats.totalReviews > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": test.reviewStats.averageRating.toString(),
        "ratingCount": test.reviewStats.totalReviews.toString()
      }
    } : {}),
    "offers": {
      "@type": "Offer",
      "price": test.price ? test.price.toString() : "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `https://deshexam.com/practice/${test.slug}`,
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 0,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 0,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
      }
    }
  };

  const DIFFICULTY_COLOR: Record<string, string> = {
    Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Medium: 'text-amber-700 bg-amber-50 border-amber-200',
    Hard: 'text-red-700 bg-red-50 border-red-200',
    Expert: 'text-purple-700 bg-purple-50 border-purple-200',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCourse) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }} />

      <div className="min-h-screen bg-[#f5f7fa] dark:bg-slate-950 transition-colors duration-300">

        {/* ═══════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════ */}
        <div className="relative bg-slate-950 overflow-hidden border-b border-white/5">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-[20%] right-[0%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen" />
            <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
            <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[100px] mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />
          </div>

          <div className="relative container max-w-6xl mx-auto px-4 pt-6 pb-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/practice" className="hover:text-white transition-colors">Practice Sets</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-300 truncate max-w-[200px]">{test.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
              {/* Left: title + meta */}
              <div className="flex-1 space-y-6 pb-12">
                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> Practice Set
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
                  {test.reviewStats && test.reviewStats.totalReviews > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {test.reviewStats.averageRating} ({test.reviewStats.totalReviews} Reviews)
                    </span>
                  )}
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
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  {[
                    { icon: HelpCircle, label: `${test.questionIds?.length ?? 0} Questions`, color: 'text-blue-400', borderHover: 'hover:border-blue-500/30', bgHover: 'hover:bg-blue-500/10' },
                    { icon: Clock, label: `${test.durationMin ?? 0} Minutes`, color: 'text-violet-400', borderHover: 'hover:border-violet-500/30', bgHover: 'hover:bg-violet-500/10' },
                    { icon: FileText, label: `${test.totalMarks ?? 0} Marks`, color: 'text-amber-400', borderHover: 'hover:border-amber-500/30', bgHover: 'hover:bg-amber-500/10' },
                    { icon: AlertTriangle, label: `${test.negativeMarking ?? 0} Negative`, color: 'text-red-400', borderHover: 'hover:border-red-500/30', bgHover: 'hover:bg-red-500/10' },
                  ].map(({ icon: Icon, label, color, borderHover, bgHover }) => (
                    <div key={label} className={`flex items-center justify-center sm:justify-start gap-2 bg-white/5 border border-white/10 rounded-xl px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md shadow-lg transition-all duration-300 ${borderHover} ${bgHover} cursor-default`}>
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${color}`} />
                      <span className="truncate">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile CTA */}
                <div className="lg:hidden">
                  <StartTestButton slug={test.slug} accessType={test.accessType} price={test.price} allowedSubscriptionPlans={test.allowedSubscriptionPlans} basePath="/practice" />
                </div>
              </div>

              {/* Right: CTA card (desktop — floats into content below) */}
              <div className="hidden lg:block w-80 shrink-0 -mb-16 relative z-10 group">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/30 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-500 hover:shadow-violet-500/10 hover:-translate-y-1">
                  {/* Card header */}
                  <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-6 relative overflow-hidden">
                    {/* Header shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                    <div className="relative flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-100 font-bold tracking-wider uppercase">Start Now</p>
                        <h3 className="text-lg font-extrabold text-white leading-tight drop-shadow-sm line-clamp-2">{test.title}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-3">
                    {[
                      { icon: HelpCircle, label: 'Questions', value: `${test.questionIds?.length ?? 0}` },
                      { icon: Clock, label: 'Duration', value: `${test.durationMin ?? 0} min` },
                      { icon: Target, label: 'Total Marks', value: `${test.totalMarks ?? 0}` },
                      { icon: CheckCircle2, label: 'Passing Marks', value: `${test.passingMarks ?? 0}` },
                      { icon: AlertTriangle, label: 'Negative Marks', value: `${test.negativeMarking ?? 0}` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                          <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          {label}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{value}</span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <StartTestButton slug={test.slug} accessType={test.accessType} price={test.price} allowedSubscriptionPlans={test.allowedSubscriptionPlans} basePath="/practice" />
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
                  { icon: HelpCircle, label: 'Questions', value: `${test.questionIds?.length ?? 0}`, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' },
                  { icon: Clock, label: 'Duration', value: `${test.durationMin ?? 0} min`, color: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400' },
                  { icon: Award, label: 'Total Marks', value: `${test.totalMarks ?? 0}`, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' },
                  { icon: Target, label: 'Pass Marks', value: `${test.passingMarks ?? 0}`, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-colors duration-300 ${color}`}>
                    <Icon className="w-5 h-5 mb-1 opacity-70" />
                    <p className="text-2xl font-extrabold dark:text-slate-100">{value}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <BookOpen className="w-5 h-5 text-[#107c41] dark:text-[#22c55e]" />
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Instructions</h2>
                </div>
                <div className="p-6">
                  <div className="prose prose-slate dark:prose-invert max-w-none !prose-p:my-0 !prose-p:text-[1rem] !prose-p:leading-relaxed prose-ol:list-decimal prose-strong:font-semibold">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        ul: ({ node, ...props }) => <ul className="space-y-3 my-4" {...props} />,
                        li: ({ node, children, ...props }) => (
                          <li className="flex items-start gap-3" {...props}>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-slate-700 dark:text-slate-300 font-medium">{children}</div>
                          </li>
                        )
                      }}
                    >
                      {test.instructions || `* **Stable Connection Required:** Ensure you have a reliable and fast internet connection before starting.
* **Do Not Refresh:** Never refresh the page or press F5 during the exam. Doing so may cause data loss or premature submission.
* **Fullscreen Enforcement:** This test must be taken in strict fullscreen mode. Exiting fullscreen will trigger an anti-cheat violation.
* **Navigation Palette:** Use the question palette on the right to easily track your progress and jump between questions.
* **Mark for Review:** If you are unsure about an answer, you can mark the question for review and revisit it before the final submission.
* **Auto-Submission:** The exam will automatically submit your recorded answers the moment the countdown timer reaches zero.`}
                    </ReactMarkdown>
                  </div>
                  {test.examRules && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Exam Rules</span>
                      </div>
                      <div className="prose prose-sm prose-amber dark:prose-invert max-w-none text-amber-800 dark:text-amber-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{test.examRules}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* What to expect */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">What to Expect</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Trophy, title: 'National Level Ranking', desc: 'Compare your score against thousands of aspirants and see exactly where you stand.' },
                    { icon: MonitorPlay, title: 'Exam-Simulated Interface', desc: 'Experience the exact look and pressure of the real exam to conquer test-day anxiety.' },
                    { icon: BookCheck, title: '100% Latest Syllabus', desc: 'Every question is strictly mapped to the latest exam pattern and official guidelines.' },
                    { icon: History, title: 'Previous Year Questions', desc: 'Includes handpicked questions from past years to give you an authentic experience.' },
                    { icon: LineChart, title: 'In-Depth AI Analytics', desc: 'Discover your weak areas with deep, section-wise performance and speed insights.' },
                    { icon: PieChart, title: 'Strengths & Weaknesses', desc: 'Automatically categorizes topics so you know exactly what to study next.' },
                    { icon: Sparkles, title: 'Expert-Crafted Solutions', desc: 'Access comprehensive, step-by-step explanations designed by top educators.' },
                    { icon: Smartphone, title: 'Mobile-Optimized Testing', desc: 'Take the test anywhere, anytime with a flawlessly optimized mobile interface.' },
                    { icon: Clock, title: 'Strict Time Management', desc: 'Master your speed with a relentless countdown timer that keeps you on your toes.' },
                    { icon: ShieldAlert, title: 'Anti-Cheat Fullscreen', desc: 'A strict, lock-down fullscreen environment ensures a fair and distraction-free test.' },
                    { icon: AlertTriangle, title: 'Negative Marking', desc: `Incorrect answers deduct ${test.negativeMarking ?? 0} marks — forcing you to choose wisely.` },
                    { icon: Zap, title: 'Instant Results', desc: 'No waiting around. Review your accuracy and detailed report the second you hit submit.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <MockTestReviews testId={test.id} slug={test.slug} stats={test.reviewStats} />

            </div>

            {/* Desktop sticky sidebar (repeats CTA below the hero card on scroll) */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-300">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Summary</p>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Type', value: 'Practice Set' },
                      { label: 'Difficulty', value: test.difficulty || 'Mixed' },
                      { label: 'Language', value: 'English' },
                      { label: 'Questions', value: `${test.questionIds?.length ?? 0}` },
                      { label: 'Duration', value: `${test.durationMin ?? 0} minutes` },
                      { label: 'Total Marks', value: `${test.totalMarks ?? 0}` },
                      { label: 'Pass Marks', value: `${test.passingMarks ?? 0}` },
                      { label: 'Negative', value: `${test.negativeMarking ?? 0} per wrong answer` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm border-b border-slate-50 dark:border-slate-800/50 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <StartTestButton slug={test.slug} accessType={test.accessType} price={test.price} allowedSubscriptionPlans={test.allowedSubscriptionPlans} basePath="/practice" />

                {test.accessType !== 'subscription' && test.accessType !== 'both' && test.accessType !== 'one_time' && (
                  <p className="text-center text-[11px] text-slate-400">Free · No sign-up required to start</p>
                )}
              </div>
            </div>
          </div>

          {/* Related Tests */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Related Practice Sets</h2>
                <Link href="/practice" className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map(r => (
                  <AssessmentCard key={r.id} assessment={r} type="Practice" href={`/practice/${r.slug}`} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Mobile sticky bottom CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xl transition-colors duration-300">
          <StartTestButton slug={test.slug} accessType={test.accessType} price={test.price} allowedSubscriptionPlans={test.allowedSubscriptionPlans} basePath="/practice" />
        </div>
      </div>
    </>
  );
}
