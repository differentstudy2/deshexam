import { AssessmentClient } from '@/components/assessment/AssessmentClient';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAssessments } from '@/lib/firebase/assessment';
import { getTopLeaderboard, getDailyChallenges } from '@/lib/firebase/student-analytics';
import { serializeTimestamps } from '@/lib/utils';
import { MockTest } from '@/lib/assessment-types';
import { getAllHardcodedMockTests } from '@/lib/hardcoded-loader';

export const metadata: Metadata = {
  title: 'DeshExam Mock Tests – Free Online Practice Tests & Test Series',
  description: 'Practice free online mock tests on DeshExam. Improve speed, accuracy, and rank with AI analytics, leaderboard, and exam-style practice tests.',
  keywords: ['mock tests', 'online mock test', 'free mock test', 'mock test series', 'practice test online', 'buy mock test series', 'premium mock tests', 'best mock test platform', 'online test subscription'],
  openGraph: {
    title: 'DeshExam Mock Tests',
    description: 'Practice free mock tests online. Improve your ranking with AI analytics and real exam UI.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/mock-tests`,
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og/mock-tests.jpg`,
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
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og/mock-tests.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/mock-tests`,
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
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/mock-tests`
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Mock Tests",
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/mock-tests`
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
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`
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
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "120000"
  }
};

export const dynamic = 'force-dynamic';

export default async function MockTestsListingPage() {
  const [data, lbData, chData] = await Promise.all([
    getAssessments('mockTests'),
    getTopLeaderboard(4),
    getDailyChallenges()
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
      
      <AssessmentClient 
        initialAssessments={initialAssessments}
        initialLeaderboard={initialLeaderboard}
        initialChallenges={initialChallenges}
        collectionName="mockTests"
        type="Mock Test"
        heroBadgeText="70,000+ Mock Tests Available"
        heroTitle={<>Online Mock Tests for <br className="hidden lg:block" /> Smarter Exam Preparation</>}
        heroDescription="Practice exam-style mock tests, improve speed, accuracy, and boost rank with AI-powered analytics."
        primaryButtonText="Start Free Test"
        baseHref="/mock-tests"
        stats={{
          total: "70,000+",
          attempts: "120K+",
          rating: "4.8",
          successRate: "92%"
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
                    Why stop at free tests? Get the ultimate edge with DeshExam Pass Pro. Access 70,000+ premium mock tests, advanced AI analytics, and priority doubt solving.
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
                        <p className="mt-1">We offer a robust selection of free mock tests for all users. For unlimited access to our entire 70,000+ test library, a premium subscription is required.</p>
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
