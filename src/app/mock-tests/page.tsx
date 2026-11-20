import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAssessments } from '@/lib/firebase/assessment';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { getTaxonomyNodesByType } from '@/lib/firebase/taxonomy';
import { serializeTimestamps } from '@/lib/utils';
import { MockTest } from '@/lib/assessment-types';
import { getAllHardcodedMockTests } from '@/lib/hardcoded-loader';
import {
  CLASSES,
  MEDIUMS,
  SAMPLE_MOCK_TESTS,
  SUBJECTS_BY_CLASS,
  classLabel,
  toBn,
} from '@/lib/wb-board';

const WB_PAGE_SIZE = 12;

type WbFilters = { class?: string; subject?: string; medium?: string; wbpage?: string };

function wbHref(patch: Partial<WbFilters>, current: WbFilters) {
  const next: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...current, ...patch })) {
    if (v !== undefined && v !== '' && v !== 'all') next[k] = v;
  }
  const qs = new URLSearchParams(next).toString();
  return qs ? `/mock-tests?${qs}#wb-mock-tests` : '/mock-tests#wb-mock-tests';
}

export const metadata: Metadata = {
  title: 'DeshExam Mock Tests – Free Online Practice Tests & Test Series',
  description: 'Practice free online mock tests on DeshExam. Improve speed, accuracy, and rank with AI analytics, leaderboard, and exam-style practice tests.',
  keywords: ['mock tests', 'online mock test', 'free mock test', 'mock test series', 'practice test online', 'buy mock test series', 'premium mock tests', 'best mock test platform', 'online test subscription'],
  openGraph: {
    title: 'DeshExam Mock Tests',
    description: 'Practice free mock tests online. Improve your ranking with AI analytics and real exam UI.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/mock-tests`,
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/og/mock-tests.jpg`,
        width: 1200,
        height: 630,
        alt: 'General awareness mock test card',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeshExam Mock Tests – Free Online Practice Tests',
    description: 'Practice free online mock tests on DeshExam. Improve speed, accuracy, and rank.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/og/mock-tests.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/mock-tests`,
  },
  robots: {
    index: true,
    follow: true,
  }
};

const jsonLdCollection = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "DeshExam Mock Tests",
  "description": "Online mock tests for students preparing for school boards and competitive exams.",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/mock-tests`
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}`
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Mock Tests",
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/mock-tests`
    }
  ]
};

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are mock tests free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer both free and premium mock tests. Free tests give you a feel of the interface, while premium unlocks all tests and advanced analytics."
      }
    },
    {
      "@type": "Question",
      "name": "Can I retake tests?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! You can retake any mock test multiple times to track your improvement over time."
      }
    },
    {
      "@type": "Question",
      "name": "Are explanations included?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. Every question comes with a detailed step-by-step solution immediately after you complete the test."
      }
    },
    {
      "@type": "Question",
      "name": "Is ranking live?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our leaderboard and rank prediction are updated in real-time as thousands of students take the same test."
      }
    },
    {
      "@type": "Question",
      "name": "Is it mobile supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can take tests seamlessly on both your desktop and your smartphone."
      }
    },
    {
      "@type": "Question",
      "name": "Can I download tests for offline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Currently, mock tests require an active internet connection to securely track your analytics and timing."
      }
    }
  ]
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}`,
  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/logo.png`
};

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DeshExam Mock Tests",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  }
};

export const dynamic = 'force-dynamic';

export default async function MockTestsListingPage({
  searchParams,
}: {
  searchParams: Promise<WbFilters>;
}) {
  const wbParams = await searchParams;
  const wbClassNum = wbParams.class ? Number(wbParams.class) : undefined;
  const wbClass =
    wbClassNum !== undefined && (CLASSES as readonly number[]).includes(wbClassNum)
      ? wbClassNum
      : undefined;
  const wbMedium =
    wbParams.medium === 'bn' || wbParams.medium === 'en' ? wbParams.medium : undefined;
  const wbSubjectOptions = wbClass
    ? SUBJECTS_BY_CLASS[wbClass]
    : [...new Set(Object.values(SUBJECTS_BY_CLASS).flat())];
  const wbSubject =
    wbParams.subject && wbSubjectOptions.includes(wbParams.subject)
      ? wbParams.subject
      : undefined;
  const wbFiltered = SAMPLE_MOCK_TESTS.filter(
    (t) =>
      (wbClass === undefined || t.class === wbClass) &&
      (wbMedium === undefined || t.medium === wbMedium) &&
      (wbSubject === undefined || t.subject === wbSubject),
  );
  const wbTotalPages = Math.max(1, Math.ceil(wbFiltered.length / WB_PAGE_SIZE));
  const wbPage = Math.min(wbTotalPages, Math.max(1, Number(wbParams.wbpage) || 1));
  const wbPageItems = wbFiltered.slice(
    (wbPage - 1) * WB_PAGE_SIZE,
    wbPage * WB_PAGE_SIZE,
  );

  const [data, lbData, chData, boards, classes, subjects] = await Promise.all([
    getAssessments('mockTests'),
    getTopLeaderboard(4),
    getDailyChallenges(),
    getTaxonomyNodesByType('academic', 'board'),
    getTaxonomyNodesByType('academic', 'class'),
    getTaxonomyNodesByType('academic', 'subject')
  ]);

  const publishedMockTests = (data as MockTest[]).filter(a => a.status === 'Published');
  const hardcodedMockTests = getAllHardcodedMockTests() as MockTest[];
  
  // Combine and remove duplicates by slug (preferring Firebase if slug matches)
  const combinedMockTests = [...publishedMockTests];
  for (const ht of hardcodedMockTests) {
    if (!combinedMockTests.find(t => t.slug === ht.slug)) {
      combinedMockTests.push(ht);
    }
  }

  const initialAssessments = serializeTimestamps(combinedMockTests);
  const initialLeaderboard = serializeTimestamps(lbData);
  const initialChallenges = serializeTimestamps(chData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }} />

      {/* WB Board — নমুনা মক টেস্ট: class / subject / medium ফিল্টার + পেজিনেশন (URL-synced) */}
      <section id="wb-mock-tests" className="scroll-mt-20 bg-[#040d1a] py-12 text-slate-100 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <p className="text-xs font-bold tracking-wide text-amber-300">WBBSE · WBCHSE · ক্লাস ৫–১২</p>
            <h2 className="mt-1 font-headline text-2xl font-extrabold text-white md:text-3xl">
              পশ্চিমবঙ্গ বোর্ড — নমুনা মক টেস্ট
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-300">
              ক্লাস, বিষয় ও মাধ্যম বেছে নিন। এগুলো নমুনা টেস্ট — আসল প্রশ্নভান্ডার ক্লাস অনুযায়ী তৈরি হচ্ছে।
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-bold text-amber-200">ক্লাস:</span>
              <Link href={wbHref({ class: undefined, subject: undefined, wbpage: undefined }, wbParams)} className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${wbClass === undefined ? 'bg-amber-400 text-[#042f2e]' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>সব ক্লাস</Link>
              {CLASSES.map((n) => (
                <Link key={n} href={wbHref({ class: String(n), subject: undefined, wbpage: undefined }, wbParams)} className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${wbClass === n ? 'bg-amber-400 text-[#042f2e]' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>{toBn(n)}</Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-bold text-amber-200">মাধ্যম:</span>
              <Link href={wbHref({ medium: undefined, wbpage: undefined }, wbParams)} className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${wbMedium === undefined ? 'bg-amber-400 text-[#042f2e]' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>সব মাধ্যম</Link>
              {MEDIUMS.map((m) => (
                <Link key={m.id} href={wbHref({ medium: m.id, wbpage: undefined }, wbParams)} className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${wbMedium === m.id ? 'bg-amber-400 text-[#042f2e]' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>{m.label}</Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-bold text-amber-200">বিষয়:</span>
              <Link href={wbHref({ subject: undefined, wbpage: undefined }, wbParams)} className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${wbSubject === undefined ? 'bg-amber-400 text-[#042f2e]' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>সব বিষয়</Link>
              {wbSubjectOptions.map((s) => (
                <Link key={s} href={wbHref({ subject: s, wbpage: undefined }, wbParams)} className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${wbSubject === s ? 'bg-amber-400 text-[#042f2e]' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>{s}</Link>
              ))}
            </div>
            {(wbClass !== undefined || wbMedium !== undefined || wbSubject !== undefined) && (
              <Link href="/mock-tests#wb-mock-tests" className="mt-4 inline-flex min-h-[40px] items-center rounded-full border border-amber-300/50 px-4 text-sm font-bold text-amber-200 hover:bg-white/10">✕ ফিল্টার মুছুন</Link>
            )}
          </div>

          <p className="mt-6 text-sm text-slate-400">
            {toBn(wbFiltered.length)}টি নমুনা টেস্ট পাওয়া গেছে
            {wbClass !== undefined ? ` · ${classLabel(wbClass)}` : ''}
            {wbSubject ? ` · ${wbSubject}` : ''}
          </p>

          {wbPageItems.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center">
              <p className="text-lg font-bold text-white">কোনো নমুনা টেস্ট পাওয়া যায়নি</p>
              <p className="mt-2 text-sm text-slate-400">ফিল্টার বদলে আবার দেখুন।</p>
              <Link href="/mock-tests#wb-mock-tests" className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-amber-400 px-6 text-sm font-bold text-[#042f2e]">সব টেস্ট দেখুন</Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wbPageItems.map((t) => (
                <article key={t.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] transition-all hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-lg">
                  <div className="bg-[linear-gradient(135deg,#0b3b39,#042f2e)] p-5">
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-200">নমুনা · মক টেস্ট</span>
                    <h3 className="mt-3 min-h-[3rem] font-headline text-lg font-bold leading-snug text-white">{t.title}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-300">
                      {classLabel(t.class)} · {t.subject} · {t.medium === 'bn' ? 'বাংলা মাধ্যম' : 'English Medium'}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {toBn(t.questions ?? 0)}টি প্রশ্ন · {toBn(t.minutes ?? 0)} মিনিট · {t.difficulty ?? ''}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-lg font-extrabold text-white">{t.price === 0 ? 'ফ্রি' : `₹${t.price}`}</span>
                      <Link href={`/mock-tests?class=${t.class}#wb-mock-tests`} className="inline-flex min-h-[40px] items-center rounded-full bg-amber-400 px-5 text-sm font-bold text-[#042f2e] hover:bg-amber-300">শুরু করুন</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {wbTotalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="পৃষ্ঠা">
              {wbPage > 1 ? (
                <Link href={wbHref({ wbpage: String(wbPage - 1) }, wbParams)} className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-slate-200 hover:bg-white/10">← আগের</Link>
              ) : (
                <span className="inline-flex min-h-[44px] cursor-not-allowed items-center rounded-full border border-white/5 px-5 text-sm font-bold text-slate-600">← আগের</span>
              )}
              {Array.from({ length: wbTotalPages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={wbHref({ wbpage: String(n) }, wbParams)} aria-current={n === wbPage ? 'page' : undefined} className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-4 text-sm font-bold ${n === wbPage ? 'bg-amber-400 text-[#042f2e]' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>{toBn(n)}</Link>
              ))}
              {wbPage < wbTotalPages ? (
                <Link href={wbHref({ wbpage: String(wbPage + 1) }, wbParams)} className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-slate-200 hover:bg-white/10">পরের →</Link>
              ) : (
                <span className="inline-flex min-h-[44px] cursor-not-allowed items-center rounded-full border border-white/5 px-5 text-sm font-bold text-slate-600">পরের →</span>
              )}
            </nav>
          )}
        </div>
      </section>

      <AssessmentClient 
        initialAssessments={initialAssessments}
        initialLeaderboard={initialLeaderboard}
        initialChallenges={initialChallenges}
        boards={boards}
        classes={classes}
        subjects={subjects}
        collectionName="mockTests"
        type="Mock Test"
        heroBadgeText={`${combinedMockTests.length} Mock Tests Available`}
        heroTitle={<>Online Mock Tests for <br className="hidden lg:block" /> Smarter Exam Preparation</>}
        heroDescription="Practice exam-style mock tests, improve speed, accuracy, and boost rank with AI-powered analytics."
        primaryButtonText="Start Free Test"
        baseHref="/mock-tests"
        stats={{
          total: String(combinedMockTests.length),
        }}
      />

      {/* SEO Contextual Content Block */}
      <div className="container max-w-5xl mx-auto px-4 py-16 text-slate-700 dark:text-slate-300">
        <div className="prose dark:prose-invert max-w-none space-y-12">
            
            <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Online Mock Tests for Smarter Exam Preparation</h2>
                <p className="leading-relaxed">
                    Preparing for a crucial exam? Reading textbooks and memorizing formulas is only half the battle. To truly excel, you must simulate the actual exam environment. That's exactly what our <strong>online mock tests</strong> are designed to do. Whether you are a school student preparing for board exams, or an aspirant aiming for competitive government jobs like WBCS, JEE, or NEET, our platform provides the rigorous practice you need.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What is a Mock Test?</h2>
                <p className="leading-relaxed mb-4">
                    A mock test is a practice paper modeled entirely on the exact pattern of the real examination. It replicates the syllabus, difficulty level, marking scheme, and time constraints of the actual test. Taking a <strong>free mock test</strong> helps you identify your current preparation level before you step into the real exam hall.
                </p>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">Benefits of Mock Tests</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Speed and Time Management:</strong> Learn how to allocate time per question effectively.</li>
                    <li><strong>Accuracy:</strong> Reduce silly mistakes through repeated, timed practice.</li>
                    <li><strong>Exam Temperament:</strong> Build confidence and reduce exam-day anxiety.</li>
                    <li><strong>Identify Weaknesses:</strong> Pinpoint exact chapters where you lose marks.</li>
                </ul>
            </section>

            <section className="bg-indigo-50 dark:bg-indigo-950/30 p-8 rounded-2xl my-10 border border-indigo-100 dark:border-indigo-900/50 text-center">
                <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">Unlock Unlimited Mock Tests with Pass Pro</h3>
                <p className="text-indigo-700 dark:text-indigo-300 mb-6 max-w-2xl mx-auto">
                    Why stop at free tests? Get the ultimate edge with DeshExam Pass Pro. Access premium mock tests, advanced AI analytics, and priority doubt solving.
                </p>
                <Link href="/pricing" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
                    Explore Premium Plans
                </Link>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Practice with DeshExam?</h2>
                <p className="leading-relaxed mb-4">
                    We are recognized as the <strong>best mock test platform</strong> because we go beyond just providing questions. Our ecosystem is built on:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Real Exam UI:</strong> Our test interface perfectly mirrors exactly what you will see on the final exam day.</li>
                    <li><strong>AI Analysis:</strong> We analyze your time-per-question, accuracy rate, and peer comparison.</li>
                    <li><strong>Live Leaderboard Rankings:</strong> See your All-India rank instantly among thousands of competitors.</li>
                    <li><strong>Detailed Explanations:</strong> Every question includes a deep-dive solution, linking back to core concepts.</li>
                </ul>
                <p className="mt-6">
                    Looking for subject-specific practice? Dive into our comprehensive <Link href="/question-bank" className="text-indigo-600 hover:underline font-medium">Question Bank</Link> or take a quick <Link href="/quiz" className="text-indigo-600 hover:underline font-medium">Daily Quiz</Link> to keep your skills sharp.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Who Should Use Our Test Series?</h2>
                <p className="leading-relaxed mb-4">
                    Our platform is scalable and programmatic, meaning we have test categories for everyone. If you are exploring our <Link href="/exams" className="text-indigo-600 hover:underline font-medium">Exams Directory</Link>, you will find:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>School Students:</strong> Perfect for Class 10 and Class 12 board preparations.</li>
                    <li><strong>Govt Exam Aspirants:</strong> Essential for highly competitive exams where cutoff margins are razor-thin.</li>
                    <li><strong>Parents & Teachers:</strong> Use our analytics dashboard to track student progress and intervene early.</li>
                </ul>
            </section>
            
            <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Are mock tests free?</h4>
                        <p className="mt-1">We offer a robust selection of free mock tests for all users. For unlimited access to our entire test library, a premium subscription is required.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Can I retake tests?</h4>
                        <p className="mt-1">Yes, you can retake practice tests to improve your accuracy and review your mistakes via our <Link href="/features" className="text-indigo-600 hover:underline">Mistake Vault feature</Link>.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Is live ranking supported?</h4>
                        <p className="mt-1">Yes, upon completing a mock test, your score is immediately calculated and placed on our live leaderboard so you can see where you stand among peers.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Are detailed solutions included?</h4>
                        <p className="mt-1">Yes, every mock test comes with comprehensive step-by-step solutions and conceptual explanations for every question.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Is mobile supported?</h4>
                        <p className="mt-1">Absolutely. Our platform is 100% responsive, meaning you can take full-length mock tests directly on your smartphone seamlessly.</p>
                    </div>
                </div>
            </section>

        </div>
      </div>
    </>
  );
}
