import type { Metadata } from 'next';
import Link from 'next/link';
import { ManageCookiesButton } from "@/components/layout/manage-cookies-button";

export const metadata: Metadata = {
  title: 'Cookie Policy | How We Use Cookies – DeshExam',
  description: 'Learn how DeshExam uses cookies to improve performance, personalize experience, and ensure secure access to learning features and mock tests.',
  keywords: [
    'cookie policy', 
    'cookies policy', 
    'what are cookies in website', 
    'website cookie usage policy', 
    'cookie consent policy',
    'cookie policy for educational website',
    'how websites use cookies for login tracking',
    'GDPR cookie policy explanation',
    'cookie usage in online learning platforms',
    'exam preparation website privacy cookies'
  ],
  openGraph: {
    title: 'Cookie Policy | How We Use Cookies – DeshExam',
    description: 'Learn how DeshExam uses cookies to improve performance, personalize experience, and ensure secure access to learning features and mock tests.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cookie-policy`,
    siteName: 'DeshExam',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | How We Use Cookies – DeshExam',
    description: 'Learn how DeshExam uses cookies to improve performance, personalize experience, and ensure secure access to learning features and mock tests.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cookie-policy`,
  }
};

export default function CookiePolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Cookie Policy",
    "description": "Cookie usage policy for DeshExam",
    "publisher": {
      "@type": "Organization",
      "name": "DeshExam"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container py-12 md:py-20">
          <header className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Cookie Policy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
              Last Updated: v1.0 (June 19, 2026)
            </p>
          </header>

          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 prose prose-slate dark:prose-invert lg:prose-lg">
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
              This Cookie Policy is part of our broader privacy practices. For more information on how we protect your data, please review our <Link href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Privacy Policy</Link> and <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Terms and Conditions</Link>. You can also <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn more about DeshExam features</Link> or visit our <Link href="/faqs" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">FAQ page</Link>.
            </p>

            <h2>What Are Cookies</h2>
            <p>
              Cookies are small pieces of text sent to your web browser by a website you visit. They are safely stored on your device and allow educational platforms like DeshExam or a third-party to recognize you, making your next visit easier and the learning experience more personalized.
            </p>

            <h2>How We Use Cookies</h2>
            <p>
              DeshExam uses cookies to ensure our online learning platform functions seamlessly. We use them for:
            </p>
            <ul>
              <li><strong>Login sessions:</strong> Keeping your account authenticated while you take mock tests.</li>
              <li><strong>User preferences:</strong> Remembering your theme choices (dark/light mode) or selected language.</li>
              <li><strong>Analytics:</strong> Using tools like Google Analytics to understand which educational pages are most helpful to our students.</li>
              <li><strong>Performance tracking:</strong> Ensuring our servers deliver fast mock tests and smooth navigation.</li>
            </ul>

            <h2>Types of Cookies We Use</h2>
            <ul>
              <li><strong>Essential cookies:</strong> Required for the website to function (e.g., logging in).</li>
              <li><strong>Functional cookies:</strong> Used to recognize you when you return and remember your settings.</li>
              <li><strong>Analytics cookies:</strong> Used to collect anonymous data on how visitors interact with the site.</li>
              <li><strong>Performance cookies:</strong> Used to monitor website speed and technical performance.</li>
            </ul>

            <h2>Why We Use Cookies in DeshExam</h2>
            <p>
              As an exam preparation website, maintaining a reliable user session is critical. We use cookies to:
            </p>
            <ul>
              <li>Keep users logged in securely.</li>
              <li>Save test progress during long mock exams.</li>
              <li>Improve the mock test experience by reducing load times.</li>
              <li>Provide personalization, such as recommending relevant tests based on past activity.</li>
            </ul>

            <h2>Managing Cookies</h2>
            <p>
              You have full control over your cookie choices. If you wish to withdraw your consent for non-essential cookies (such as analytics and targeting cookies), you can easily do so right here:
            </p>
            <p className="my-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <ManageCookiesButton />
            </p>
            <p>
              Alternatively, you can instruct your web browser to delete or refuse cookies entirely via its settings. Please note that disabling essential cookies may prevent you from logging into your account or taking mock tests.
            </p>
            <ul>
              <li><a href="https://support.google.com/accounts/answer/32050" target="_blank" rel="noopener noreferrer">Clear cache & cookies in Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer">Clear cookies and site data in Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Manage cookies in Safari</a></li>
            </ul>

            <h2>Third-party Cookies</h2>
            <p>
              We partner with trusted third-party services to enhance our platform:
            </p>
            <ul>
              <li><strong>Analytics tools:</strong> We use Google Analytics to measure site traffic and improve our educational content.</li>
              <li><strong>Payment gateways:</strong> We use secure payment processors (like Razorpay/Stripe) that use essential cookies for fraud prevention during subscription checkouts.</li>
            </ul>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in legal or operational requirements. We encourage you to review this page periodically. (Current Version: v1.0)
            </p>

            <hr className="my-10 border-slate-200 dark:border-slate-800" />

            {/* People Also Ask FAQ Section for SEO */}
            <h2>Frequently Asked Questions</h2>
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0 mb-2">Do cookies store my personal data?</h3>
                <p className="m-0 text-slate-600 dark:text-slate-400">
                  Most of our cookies do not collect personally identifiable information. Essential cookies only use secure, encrypted tokens to verify your login session, while analytics cookies collect anonymous, aggregated traffic data.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0 mb-2">Can I disable cookies on DeshExam?</h3>
                <p className="m-0 text-slate-600 dark:text-slate-400">
                  Yes. You can manage your preferences using our Cookie Consent tool to disable non-essential cookies. You can also block all cookies via your browser settings, though this will restrict your ability to log in.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0 mb-2">Why do I need to accept cookies to use mock tests?</h3>
                <p className="m-0 text-slate-600 dark:text-slate-400">
                  Essential cookies are required to link your mock test answers to your specific user account. Without them, our system cannot securely verify your identity or save your test progress.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}