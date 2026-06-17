import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | DeshExam',
  description: 'Understand how DeshExam uses cookies and similar tracking technologies to improve your experience, authenticate your account, and serve personalized content.',
  keywords: ['cookie policy', 'tracking technologies', 'DeshExam cookies', 'web cookies'],
  openGraph: {
    title: 'Cookie Policy | DeshExam',
    description: 'Understand how DeshExam uses cookies and similar tracking technologies to improve your experience, authenticate your account, and serve personalized content.',
    url: 'https://deshexam.com/cookie-policy',
    siteName: 'DeshExam',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | DeshExam',
    description: 'Understand how DeshExam uses cookies and similar tracking technologies to improve your experience, authenticate your account, and serve personalized content.',
  },
  alternates: {
    canonical: 'https://deshexam.com/cookie-policy',
  }
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container py-12 md:py-20">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cookie Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 prose prose-slate dark:prose-invert lg:prose-lg">
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
          </p>
          <p>
            Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your personal computer or mobile device when you go offline, while session cookies are deleted as soon as you close your web browser.
          </p>

          <h2>2. How DeshExam Uses Cookies</h2>
          <p>
            When you use and access the Service, we may place a number of cookie files in your web browser. We use cookies for the following purposes:
          </p>
          <ul>
            <li><strong>Authentication & Security (Essential Cookies):</strong> We use cookies to authenticate users and prevent fraudulent use of user accounts. For example, Firebase Authentication uses tokens stored in your browser to keep you logged in.</li>
            <li><strong>Preferences (Functionality Cookies):</strong> We use cookies to remember information that changes the way the Service behaves or looks, such as your "remember me" functionality, selected language preference, or dark/light theme choice.</li>
            <li><strong>Analytics (Performance Cookies):</strong> We use cookies to track information on how the Service is used so that we can make improvements. We may also use cookies to test new pages, features, or new functionality of the Service to see how our users react to them.</li>
            <li><strong>Advertising (Targeting Cookies):</strong> We and our third-party advertising partners (like Google AdSense) may use cookies to report on the performance of advertisements and to deliver ads that are relevant to your interests.</li>
          </ul>

          <h2>3. Third-Party Cookies</h2>
          <p>
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service and deliver advertisements on and through the Service.
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> We use Google Analytics to analyze the use of our website. Google Analytics gathers information about website use by means of cookies.</li>
            <li><strong>Google AdSense:</strong> Google uses cookies to help serve the ads it displays on the websites of its partners. When users visit a Google partner's website, a cookie may be dropped on that end user's browser.</li>
          </ul>

          <h2>4. Your Choices Regarding Cookies</h2>
          <p>
            If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
          </p>
          <ul>
            <li>For the <strong>Chrome</strong> web browser, please visit this page from Google: <a href="https://support.google.com/accounts/answer/32050" target="_blank" rel="noopener noreferrer">Clear cache & cookies</a></li>
            <li>For the <strong>Firefox</strong> web browser, please visit this page from Mozilla: <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer">Clear cookies and site data in Firefox</a></li>
            <li>For the <strong>Safari</strong> web browser, please visit this page from Apple: <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Manage cookies and website data in Safari on Mac</a></li>
          </ul>
          <p>For any other web browser, please visit your web browser's official web pages.</p>

          <h2>5. More Information about Cookies</h2>
          <p>
            You can learn more about cookies and the following third-party websites:
          </p>
          <ul>
            <li><a href="http://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer">AllAboutCookies</a></li>
            <li><a href="http://www.networkadvertising.org/" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a></li>
          </ul>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about our Cookie Policy, please contact us by email at <strong>privacy@deshexam.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
