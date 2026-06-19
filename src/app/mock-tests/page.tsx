import { AssessmentListing } from '@/components/assessment/AssessmentListing';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DeshExam Mock Tests – Free Online Practice Tests & Test Series',
  description: 'Practice free online mock tests on DeshExam. Improve speed, accuracy, and rank with AI analytics, leaderboard, and exam-style practice tests.',
  keywords: ['mock tests', 'online mock test', 'free mock test', 'mock test series', 'practice test online', 'buy mock test series', 'premium mock tests', 'best mock test platform', 'online test subscription'],
  openGraph: {
    title: 'DeshExam Mock Tests',
    description: 'Practice free mock tests online. Improve your ranking with AI analytics and real exam UI.',
    url: 'https://deshexam.com/mock-tests',
    type: 'website',
    images: [
      {
        url: 'https://deshexam.com/og/mock-tests.jpg',
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
    images: ['https://deshexam.com/og/mock-tests.jpg'],
  },
  alternates: {
    canonical: 'https://deshexam.com/mock-tests',
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
  "url": "https://deshexam.com/mock-tests"
};

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
      "name": "Mock Tests",
      "item": "https://deshexam.com/mock-tests"
    }
  ]
};

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are mock tests free on DeshExam?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer a wide variety of free mock tests across different categories. For unlimited access and advanced AI analytics, you can upgrade to Pass Pro."
      }
    },
    {
      "@type": "Question",
      "name": "Can I retake the mock tests?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. You can retake mock tests to improve your score and track your progress over time."
      }
    },
    {
      "@type": "Question",
      "name": "Is the ranking live?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, upon completing a mock test, your score is immediately calculated and placed on our live leaderboard so you can see where you stand among peers."
      }
    },
    {
      "@type": "Question",
      "name": "Are detailed solutions included?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, every mock test comes with comprehensive step-by-step solutions and conceptual explanations for every question."
      }
    }
  ]
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DeshExam",
  "url": "https://deshexam.com"
};

export default function MockTestsListingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      
      {/* Hero SEO Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="container max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Free Online Mock Tests for All Major Exams</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                Practice exam-style mock tests, improve accuracy, and track your performance with AI-powered analytics. 
                Join 50,000+ students actively preparing for success.
            </p>
        </div>
      </div>

      <AssessmentListing 
        collectionName="mockTests"
        title="Browse by Category"
        description="Select your target exam and start practicing immediately. Use the filters to find tests that match your difficulty level and subject."
        type="Mock Test"
        baseHref="/mock-tests"
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
