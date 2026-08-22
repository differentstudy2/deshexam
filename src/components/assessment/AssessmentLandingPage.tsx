import React from 'react';
import { getAssessmentBySlug, getAssessments } from '@/lib/firebase/assessment';
import { getTaxonomyNodeById } from '@/lib/firebase/taxonomy';
import { notFound } from 'next/navigation';
import { MockTest } from '@/lib/assessment-types';
import { Metadata, ResolvingMetadata } from 'next';
import { formatTitleForBrowser, cn } from '@/lib/utils';
import {
  Clock, HelpCircle, ShieldCheck, FileText, CheckCircle2,
  AlertTriangle, BookOpen, Target, Award, ChevronRight, ArrowRight,
  Zap, Users, BarChart3, Brain, Star, Maximize, LayoutGrid, ShieldAlert, MonitorPlay,
  Trophy, Sparkles, LineChart, History, RotateCcw, PieChart, BookCheck, Smartphone, Lock, Crown
} from 'lucide-react';
import Link from 'next/link';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { StartTestButton } from '@/components/assessment/StartTestButton';
import { MockTestReviews } from '@/components/assessment/MockTestReviews';
import { UserAttemptsDisplay } from '@/components/assessment/UserAttemptsDisplay';
import { TopScorersWidget } from '@/components/assessment/TopScorersWidget';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = { params: Promise<{ slug: string }> };

import { CACHE_SETTINGS } from '@/lib/cache-settings';

interface AssessmentLandingPageProps {
  test: MockTest;
  collectionName: 'quizzes' | 'practiceSets' | 'mockTests' | 'examPapers';
  basePath: string; // e.g., '/quiz'
  titlePrefix: string; // e.g., 'Quiz'
}

export default async function AssessmentLandingPage({
  test,
  collectionName,
  basePath,
  titlePrefix
}: AssessmentLandingPageProps) {

  const allTests = await getAssessments(collectionName) as MockTest[];
  const rawRelated = allTests.filter(a => a.id !== test.id && a.status === 'Published').slice(0, 4);
  const related = await Promise.all(rawRelated.map(async (r) => {
    let tBoard = '', tClass = '', tSubject = '';
    if (r.boardId) { const node = await getTaxonomyNodeById(r.boardId); if (node) tBoard = node.acronym || node.title; }
    if (r.classId) { const node = await getTaxonomyNodeById(r.classId); if (node) tClass = node.title; }
    if (r.subjectId) { const node = await getTaxonomyNodeById(r.subjectId); if (node) tSubject = node.title; }
    const taxonomyString = [tBoard, tClass, tSubject].filter(Boolean).join(' • ');
    return { ...r, taxonomyString };
  }));

  let boardName = '';
  let className = '';
  let subjectName = '';
  let textbookName = '';
  let chapterName = '';

  if (test.boardId) { const node = await getTaxonomyNodeById(test.boardId); if (node) boardName = node.acronym || node.title; }
  if (test.classId) { const node = await getTaxonomyNodeById(test.classId); if (node) className = node.title; }
  if (test.subjectId) { const node = await getTaxonomyNodeById(test.subjectId); if (node) subjectName = node.title; }
  if (test.textbookId) { const node = await getTaxonomyNodeById(test.textbookId); if (node) textbookName = node.title; }
  if (test.chapterId) { const node = await getTaxonomyNodeById(test.chapterId); if (node) chapterName = node.title; }

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
        "name": titlePrefix + "s",
        "item": `https://deshexam.com${basePath}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": test.title,
        "item": `https://deshexam.com${basePath}/${test.slug}`
      }
    ]
  };

  const jsonLdCourse = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": test.title,
    "description": test.description || `${titlePrefix} for ${test.title}`,
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
    "description": test.description || `Take the ${test.title} ${titlePrefix} on DeshExam.`,
    "image": (Array.isArray(test.thumbnail) ? test.thumbnail[0] : test.thumbnail) || `https://deshexam.com/og/${basePath.replace("/", "")}.jpg`,
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
      "url": `https://deshexam.com${basePath}/${test.slug}`,
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

            <div className="flex flex-col lg:flex-row gap-10 items-stretch">
              {/* Left: title + meta */}
              <div className="flex-1 space-y-4 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <Link href="/" className="hover:text-white transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link href={basePath} className="hover:text-white transition-colors">{titlePrefix}s</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-300 truncate max-w-[200px]">{test.title}</span>
                </nav>
                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> {titlePrefix}
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

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                  {test.title}
                </h1>

                {test.description && (
                  <p className="text-slate-400 text-base lg:text-lg leading-relaxed mt-4">
                    {test.description}
                  </p>
                )}

                {/* Academic Details */}
                {(boardName || className || subjectName || textbookName || chapterName) && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10 mt-6 shadow-sm">
                    <BookOpen className="w-4 h-4 text-emerald-400 mr-1" />
                    {boardName && <span className="bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded-md text-xs font-medium">{boardName}</span>}
                    {className && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span className="bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded-md text-xs font-medium">{className}</span>
                      </>
                    )}
                    {subjectName && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span className="bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded-md text-xs font-medium">{subjectName}</span>
                      </>
                    )}
                    {textbookName && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span className="bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded-md text-xs font-medium">{textbookName}</span>
                      </>
                    )}
                    {chapterName && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span className="bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded-md text-xs font-medium">{chapterName}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Stats strip */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  {[
                    { icon: HelpCircle, label: `${test.questionCount ?? (test.questionIds?.length || 0)} Questions`, color: 'text-blue-400', borderHover: 'hover:border-blue-500/30', bgHover: 'hover:bg-blue-500/10', show: true },
                    { icon: Clock, label: `${test.durationMin ?? 0} Minutes`, color: 'text-violet-400', borderHover: 'hover:border-violet-500/30', bgHover: 'hover:bg-violet-500/10', show: true },
                    { icon: FileText, label: `${test.totalMarks ?? 0} Marks`, color: 'text-amber-400', borderHover: 'hover:border-amber-500/30', bgHover: 'hover:bg-amber-500/10', show: true },
                    { icon: AlertTriangle, label: `${test.negativeMarking ?? 0} Negative`, color: 'text-red-400', borderHover: 'hover:border-red-500/30', bgHover: 'hover:bg-red-500/10', show: !!test.negativeMarking && test.negativeMarking > 0 },
                  ].filter(item => item.show !== false).map(({ icon: Icon, label, color, borderHover, bgHover }) => (
                    <div key={label} className={`flex items-center justify-center sm:justify-start gap-2 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md shadow-lg transition-all duration-300 ${borderHover} ${bgHover} cursor-default`}>
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${color}`} />
                      <span className="truncate">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile CTA */}
                <div className="lg:hidden">
                  <StartTestButton slug={test.slug} accessType={test.accessType} price={test.price} allowedSubscriptionPlans={test.allowedSubscriptionPlans} testType={collectionName === "mockTests" ? "mock-test" : "quiz"} basePath={basePath} />
                </div>
              </div>

              {/* Right: CTA card (desktop — floats into content below) */}
              <div className="hidden lg:block w-80 shrink-0 mb-4 relative z-10 group">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-indigo-500/10 dark:shadow-black/40 border border-slate-200/60 dark:border-slate-700/50 overflow-hidden transition-all duration-500 hover:shadow-indigo-500/20 hover:-translate-y-1.5 ring-1 ring-black/5 dark:ring-white/5">
                  {/* Card header */}
                  <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Header shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>

                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg shrink-0">
                        <Brain className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-indigo-100 font-extrabold tracking-widest uppercase mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-300" /> Start Now
                        </p>
                        <h3 className="text-lg font-black text-white leading-[1.2] drop-shadow-md line-clamp-2" title={test.title}>
                          {test.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-6 py-5 space-y-3.5">
                    {[
                      { icon: HelpCircle, label: 'Questions', value: `${test.questionCount ?? (test.questionIds?.length || 0)}`, show: true },
                      { icon: Clock, label: 'Duration', value: `${test.durationMin ?? 0} min`, show: true },
                      { icon: Target, label: 'Total Marks', value: `${test.totalMarks ?? 0}`, show: true },
                      { icon: CheckCircle2, label: 'Passing Marks', value: `${test.passingMarks ?? 0}`, show: true },
                      { icon: AlertTriangle, label: 'Negative Marks', value: `${test.negativeMarking ?? 0}`, show: !!test.negativeMarking && test.negativeMarking > 0 },
                    ].filter(item => item.show !== false).map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-medium">
                          <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          {label}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 pt-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100/80 dark:border-slate-800/80">
                    <StartTestButton slug={test.slug} accessType={test.accessType} price={test.price} allowedSubscriptionPlans={test.allowedSubscriptionPlans} testType={collectionName === "mockTests" ? "mock-test" : "quiz"} basePath={basePath} />

                    <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Lock className="w-3 h-3" />
                      <p>Strictly timed · Negative marking applies</p>
                    </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
                {[
                  { icon: HelpCircle, label: 'Questions', value: `${test.questionCount ?? (test.questionIds?.length || 0)}`, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' },
                  { icon: Clock, label: 'Duration', value: `${test.durationMin ?? 0} min`, color: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400' },
                  { icon: Award, label: 'Total Marks', value: `${test.totalMarks ?? 0}`, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' },
                  { icon: Target, label: 'Pass Marks', value: `${test.passingMarks ?? 0}`, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' },
                  { icon: Users, label: 'Total Attempts', value: Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(test.attemptCount || 0), color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-400' },
                  { icon: BarChart3, label: 'Average Score', value: test.averageScore ? `${test.averageScore}%` : 'N/A', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' },
                  { icon: LayoutGrid, label: 'Question Type', value: test.questionType || 'MCQ', color: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400' },
                  { icon: BookOpen, label: 'Subject', value: subjectName || 'Mixed', color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg border text-center transition-colors duration-300 ${color}`}>
                    <Icon className="w-5 h-5 mb-0.5 opacity-70" />
                    <p className="text-xl sm:text-2xl font-extrabold dark:text-slate-100">{value}</p>
                    <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
                  </div>
                ))}
              </div>


              {/* Instructions */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-emerald-100/50 dark:border-emerald-900/20 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Instructions</h2>
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
                      {test.instructions || `* এই পরীক্ষায় মোট প্রশ্ন সংখ্যা এবং তার জন্য বরাদ্দ সময় নির্দিষ্ট করা থাকবে।
* প্রতিটি সঠিক উত্তরের জন্য 1 নম্বর পাবেন।
${test.negativeMarking && test.negativeMarking > 0 ? `* প্রতিটি ভুল উত্তরের জন্য ${test.negativeMarking} নম্বর কাটা যাবে (নেগেটিভ মার্কিং).\n` : ''}* সমস্ত প্রশ্নের উত্তর দেওয়া বাধ্যতামূলক নয়, তবে চেষ্টা করুন যতটা সম্ভব সঠিক উত্তর দিতে।
* প্রশ্নগুলি মনোযোগ সহকারে পড়ুন এবং তারপর উত্তর নির্বাচন করুন।
* পরীক্ষা শেষ হওয়ার পর আপনার স্কোর এবং সঠিক উত্তরগুলি দেখতে পাবেন।
* কোনো ইলেকট্রনিক ডিভাইস বা বই ব্যবহার করা যাবে না।
* আপনার পরীক্ষার জন্য শুভকামনা রইল!`}
                    </ReactMarkdown>
                  </div>
                  {test.examRules && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg">
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
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-amber-100/50 dark:border-amber-900/20 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                    {test.language === 'Bengali' ? 'কী আশা করবেন' : test.language === 'Hindi' ? 'क्या उम्मीद करें' : 'What to Expect'}
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Trophy,
                      title: test.language === 'Bengali' ? 'জাতীয় স্তরের র‍্যাঙ্কিং' : test.language === 'Hindi' ? 'राष्ट्रीय स्तर की रैंकिंग' : 'National Level Ranking',
                      desc: test.language === 'Bengali' ? 'হাজার হাজার প্রতিযোগীর সাথে আপনার স্কোর তুলনা করুন এবং নিজের অবস্থান যাচাই করুন।' : test.language === 'Hindi' ? 'हज़ारों उम्मीदवारों के साथ अपने स्कोर की तुलना करें और देखें कि आप कहाँ खड़े हैं।' : 'Compare your score against thousands of aspirants and see exactly where you stand.',
                      show: true
                    },
                    {
                      icon: MonitorPlay,
                      title: test.language === 'Bengali' ? 'পরীক্ষার অনুরূপ ইন্টারফেস' : test.language === 'Hindi' ? 'परीक्षा-अनुकारित इंटरफ़ेस' : 'Exam-Simulated Interface',
                      desc: test.language === 'Bengali' ? 'আসল পরীক্ষার মতো পরিবেশ ও চাপ অনুভব করে পরীক্ষার দিনের ভয় দূর করুন।' : test.language === 'Hindi' ? 'परीक्षा के दिन की चिंता को दूर करने के लिए वास्तविक परीक्षा के सटीक रूप और दबाव का अनुभव करें।' : 'Experience the exact look and pressure of the real exam to conquer test-day anxiety.',
                      show: true
                    },
                    {
                      icon: BookCheck,
                      title: test.language === 'Bengali' ? '১০০% লেটেস্ট সিলেবাস' : test.language === 'Hindi' ? '100% नवीनतम पाठ्यक्रम' : '100% Latest Syllabus',
                      desc: test.language === 'Bengali' ? 'প্রতিটি প্রশ্ন সাম্প্রতিক পরীক্ষার প্যাটার্ন এবং অফিসিয়াল নির্দেশিকা অনুসারে তৈরি করা হয়েছে।' : test.language === 'Hindi' ? 'प्रत्येक प्रश्न को नवीनतम परीक्षा पैटर्न और आधिकारिक दिशानिर्देशों के अनुसार तैयार किया गया है।' : 'Every question is strictly mapped to the latest exam pattern and official guidelines.',
                      show: true
                    },
                    {
                      icon: History,
                      title: test.language === 'Bengali' ? 'বিগত বছরের প্রশ্ন' : test.language === 'Hindi' ? 'पिछले वर्ष के प्रश्न' : 'Previous Year Questions',
                      desc: test.language === 'Bengali' ? 'বিগত বছরগুলোর বাছাই করা প্রশ্ন অন্তর্ভুক্ত করা হয়েছে, যা আপনাকে আসল পরীক্ষার ধারণা দেবে।' : test.language === 'Hindi' ? 'आपको एक प्रामाणिक अनुभव देने के लिए पिछले वर्षों के चुने हुए प्रश्न शामिल हैं।' : 'Includes handpicked questions from past years to give you an authentic experience.',
                      show: true
                    },
                    {
                      icon: LineChart,
                      title: test.language === 'Bengali' ? 'গভীর এআই বিশ্লেষণ' : test.language === 'Hindi' ? 'गहन एआई एनालिटिक्स' : 'In-Depth AI Analytics',
                      desc: test.language === 'Bengali' ? 'বিষয়ভিত্তিক পারফরম্যান্স এবং স্পিড ইনসাইট দিয়ে আপনার দুর্বল দিকগুলো চিহ্নিত করুন।' : test.language === 'Hindi' ? 'अनुभाग-वार प्रदर्शन और गति अंतर्दृष्टि के साथ अपने कमजोर क्षेत्रों की खोज करें।' : 'Discover your weak areas with deep, section-wise performance and speed insights.',
                      show: true
                    },
                    {
                      icon: PieChart,
                      title: test.language === 'Bengali' ? 'দুর্বলতা এবং দক্ষতা' : test.language === 'Hindi' ? 'ताकत और कमजोरियां' : 'Strengths & Weaknesses',
                      desc: test.language === 'Bengali' ? 'টপিকগুলো স্বয়ংক্রিয়ভাবে ভাগ হয়ে যায়, যাতে আপনি জানেন পরবর্তীতে কী পড়তে হবে।' : test.language === 'Hindi' ? 'विषयों को स्वचालित रूप से वर्गीकृत करता है ताकि आप जान सकें कि आगे क्या पढ़ना है।' : 'Automatically categorizes topics so you know exactly what to study next.',
                      show: true
                    },
                    {
                      icon: Sparkles,
                      title: test.language === 'Bengali' ? 'বিশেষজ্ঞদের তৈরি সমাধান' : test.language === 'Hindi' ? 'विशेषज्ञों द्वारा तैयार किए गए समाधान' : 'Expert-Crafted Solutions',
                      desc: test.language === 'Bengali' ? 'সেরা শিক্ষকদের তৈরি করা ধাপে ধাপে বিস্তৃত সমাধান এবং ব্যাখ্যা দেখুন।' : test.language === 'Hindi' ? 'शीर्ष शिक्षकों द्वारा डिज़ाइन किए गए व्यापक, चरण-दर-चरण स्पष्टीकरण तक पहुंचें।' : 'Access comprehensive, step-by-step explanations designed by top educators.',
                      show: true
                    },
                    {
                      icon: Smartphone,
                      title: test.language === 'Bengali' ? 'মোবাইল-বান্ধব টেস্টিং' : test.language === 'Hindi' ? 'मोबाइल-अनुकूलित परीक्षण' : 'Mobile-Optimized Testing',
                      desc: test.language === 'Bengali' ? 'সম্পূর্ণ মোবাইল-বান্ধব ইন্টারফেসের সাহায্যে যেকোনো স্থানে, যেকোনো সময় পরীক্ষা দিন।' : test.language === 'Hindi' ? 'पूरी तरह से मोबाइल-अनुकूलित इंटरफ़ेस के साथ कहीं भी, कभी भी परीक्षा दें।' : 'Take the test anywhere, anytime with a flawlessly optimized mobile interface.',
                      show: true
                    },
                    {
                      icon: Clock,
                      title: test.language === 'Bengali' ? 'কঠোর সময় ব্যবস্থাপনা' : test.language === 'Hindi' ? 'सख्त समय प्रबंधन' : 'Strict Time Management',
                      desc: test.language === 'Bengali' ? 'একটি কঠোর কাউন্টডাউন টাইমার দিয়ে আপনার সময় ব্যবস্থাপনার দক্ষতা বাড়ান।' : test.language === 'Hindi' ? 'एक सख्त उलटी गिनती टाइमर के साथ अपनी गति में महारत हासिल करें।' : 'Master your speed with a relentless countdown timer that keeps you on your toes.',
                      show: true
                    },
                    {
                      icon: ShieldAlert,
                      title: test.language === 'Bengali' ? 'অ্যান্টি-চিট ফুলস্ক্রিন' : test.language === 'Hindi' ? 'एंटी-चीट फुलस्क्रीन' : 'Anti-Cheat Fullscreen',
                      desc: test.language === 'Bengali' ? 'একটি কঠোর ফুলস্ক্রিন পরিবেশ নিশ্চিত করে একটি সুষ্ঠু ও মনোযোগ ব্যাহত না হওয়ার মতো পরীক্ষা।' : test.language === 'Hindi' ? 'एक सख्त, लॉक-डाउन फुलस्क्रीन वातावरण एक निष्पक्ष और व्याकुलता-मुक्त परीक्षण सुनिश्चित करता है।' : 'A strict, lock-down fullscreen environment ensures a fair and distraction-free test.',
                      show: true
                    },
                    {
                      icon: AlertTriangle,
                      title: test.language === 'Bengali' ? 'নেগেটিভ মার্কিং' : test.language === 'Hindi' ? 'नेगेटिव मार्किंग' : 'Negative Marking',
                      desc: test.language === 'Bengali' ? `ভুল উত্তরের জন্য ${test.negativeMarking ?? 0} নম্বর কাটা যাবে — তাই ভেবেচিন্তে উত্তর দিন।` : test.language === 'Hindi' ? `गलत उत्तरों पर ${test.negativeMarking ?? 0} अंक कटेंगे — इसलिए सोच-समझकर चुनें।` : `Incorrect answers deduct ${test.negativeMarking ?? 0} marks — forcing you to choose wisely.`,
                      show: !!test.negativeMarking && test.negativeMarking > 0
                    },
                    {
                      icon: Zap,
                      title: test.language === 'Bengali' ? 'তাত্ক্ষণিক ফলাফল' : test.language === 'Hindi' ? 'तत्काल परिणाम' : 'Instant Results',
                      desc: test.language === 'Bengali' ? 'কোনো অপেক্ষা নেই। সাবমিট করার সাথে সাথেই আপনার বিস্তারিত রিপোর্ট এবং সঠিকতা দেখে নিন।' : test.language === 'Hindi' ? 'कोई प्रतीक्षा नहीं। सबमिट करते ही अपनी सटीकता और विस्तृत रिपोर्ट देखें।' : 'No waiting around. Review your accuracy and detailed report the second you hit submit.',
                      show: true
                    },
                    {
                      icon: RotateCcw,
                      title: test.language === 'Bengali' ? 'একাধিকবার পরীক্ষা দেওয়া' : test.language === 'Hindi' ? 'एकाधिक प्रयास' : 'Multiple Attempts',
                      desc: test.language === 'Bengali' ? 'আপনার স্কোর উন্নত করতে এবং ভুল থেকে শিখতে যতবার খুশি পরীক্ষাটি পুনরায় দিন।' : test.language === 'Hindi' ? 'अपने स्कोर में सुधार करने और अपनी गलतियों से सीखने के लिए जितनी बार चाहें परीक्षा दोबारा दें।' : 'Retake the test as many times as you need to improve your score and learn from your mistakes.',
                      show: true
                    },
                  ].filter(item => item.show !== false).map(({ icon: IconComponent, title, desc }, index) => {
                    const Icon = IconComponent as any;
                    const gradients = [
                      "from-blue-500 to-indigo-500 shadow-blue-500/20",
                      "from-emerald-400 to-teal-500 shadow-emerald-500/20",
                      "from-violet-500 to-purple-500 shadow-violet-500/20",
                      "from-pink-500 to-rose-500 shadow-pink-500/20",
                      "from-amber-400 to-orange-500 shadow-amber-500/20",
                      "from-cyan-400 to-blue-500 shadow-cyan-500/20"
                    ];
                    const colorClass = gradients[index % gradients.length];

                    return (
                      <div key={index} className="flex items-start gap-3.5 group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-110 duration-300`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Reviews Section */}
              <MockTestReviews
                testId={test.id}
                slug={test.slug}
                stats={test.reviewStats}
                testTitle={test.title}
                testType={test.questionType || 'Mock Test'}
                testLanguage={test.language}
              />

              {/* Mobile Top Scorers */}
              <div className="mt-8 lg:hidden">
                <TopScorersWidget assessmentId={test.id} />
              </div>

            </div>

            {/* Desktop sticky sidebar (repeats CTA below the hero card on scroll) */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-6 space-y-4">
                <div className={cn(
                  "rounded-xl border shadow-lg overflow-hidden transition-colors duration-300",
                  (test.accessType === 'subscription' || test.accessType === 'both' || test.accessType === 'one_time')
                    ? "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 shadow-amber-500/10"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                )}>
                  <div className={cn(
                    "px-5 py-3 border-b flex justify-between items-center",
                    (test.accessType === 'subscription' || test.accessType === 'both' || test.accessType === 'one_time')
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 border-amber-600"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-700/50"
                  )}>
                    <p className={cn(
                      "text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                      (test.accessType === 'subscription' || test.accessType === 'both' || test.accessType === 'one_time')
                        ? "text-white"
                        : "text-blue-100"
                    )}>
                      <Zap className={cn("w-4 h-4", (test.accessType === 'subscription' || test.accessType === 'both' || test.accessType === 'one_time') ? "text-amber-100 fill-amber-100" : "text-amber-300 fill-amber-300")} />
                      Quick Summary
                    </p>
                    {(test.accessType === 'subscription' || test.accessType === 'both' || test.accessType === 'one_time') && (
                      <span className="flex items-center gap-1 text-[9px] uppercase font-black text-amber-700 dark:text-amber-600 bg-amber-100 dark:bg-amber-200 px-1.5 py-0.5 rounded shadow-sm">
                        <Crown className="w-2.5 h-2.5" /> Premium
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="space-y-2.5">
                      {[
                        { label: 'Type', value: titlePrefix },
                        { label: 'Difficulty', value: test.difficulty || 'Mixed' },
                        { label: 'Language', value: test.language || 'English' },
                        { label: 'Questions', value: `${test.questionCount ?? test.questionIds?.length ?? 0}` },
                        { label: 'Duration', value: `${test.durationMin ?? 0} minutes` },
                        { label: 'Total Marks', value: `${test.totalMarks ?? 0}` },
                        { label: 'Pass Marks', value: `${test.passingMarks ?? 0}` },
                        { label: 'Negative', value: `${test.negativeMarking ?? 0} per wrong answer`, show: !!test.negativeMarking && test.negativeMarking > 0 },
                      ].filter(item => item.show !== false).map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm border-b border-slate-50 dark:border-slate-800/50 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                      <StartTestButton slug={test.slug} accessType={test.accessType} price={test.price} allowedSubscriptionPlans={test.allowedSubscriptionPlans} testType={collectionName === "mockTests" ? "mock-test" : collectionName === "practiceSets" ? "practice" : "quiz"} basePath={basePath} />
                    </div>
                  </div>
                  {test.accessType !== 'subscription' && test.accessType !== 'both' && test.accessType !== 'one_time' && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3" /> Free · Log in to save your progress
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <TopScorersWidget assessmentId={test.id} />
                  {/* Grading Scale */}
                  {test.totalMarks && test.totalMarks > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-4 transition-colors duration-300">
                      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-violet-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Grading Scale</p>
                      </div>
                      <div className="p-4 space-y-2">
                        {[
                          { label: 'Excellent', min: Math.round(test.totalMarks * 0.85), color: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
                          { label: 'Good', min: Math.round(test.totalMarks * 0.70), color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
                          { label: 'Pass', min: test.passingMarks ?? Math.round(test.totalMarks * 0.40), color: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
                          { label: 'Fail', min: 0, color: 'bg-red-400', textColor: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' },
                        ].map(({ label, min, color, textColor, bgColor }) => (
                          <div key={label} className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${bgColor}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${color}`} />
                              <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
                            </div>
                            <span className={`text-xs font-bold ${textColor}`}>{min}+</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Tests */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Related {titlePrefix}s</h2>
                <Link href={basePath} className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map(r => (
                  <AssessmentCard key={r.id} assessment={r as any} type={titlePrefix as "Mock Test" | "Quiz" | "Practice"} href={`${basePath}/${r.slug}`} taxonomyString={r.taxonomyString} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Mobile sticky bottom CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xl transition-colors duration-300">
          <StartTestButton slug={test.slug} accessType={test.accessType} price={test.price} allowedSubscriptionPlans={test.allowedSubscriptionPlans} testType={collectionName === "mockTests" ? "mock-test" : collectionName === "practiceSets" ? "practice" : "quiz"} basePath={basePath} />
        </div>
      </div>
    </>
  );
}
