import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DeshExam',
  description: 'Learn how DeshExam collects, uses, and protects your personal information and academic data.',
  keywords: ['privacy policy', 'data protection', 'user data', 'DeshExam privacy'],
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container py-12 md:py-20">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 prose prose-slate dark:prose-invert lg:prose-lg">
          <h2>1. Introduction</h2>
          <p>
            Welcome to <strong>DeshExam</strong> ("we," "our," or "us"). We respect your privacy and are deeply committed to protecting your personal data. This Privacy Policy outlines how we collect, use, process, and disclose your information when you access or use our website, applications, and services (collectively, the "Service").
          </p>
          <p>
            By accessing or using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          
          <h3>a. Personal Data</h3>
          <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:</p>
          <ul>
            <li><strong>Contact Information:</strong> Email address, first name, and last name.</li>
            <li><strong>Academic Information:</strong> School/college name, grade/class, target exams, and study preferences.</li>
            <li><strong>Profile Information:</strong> Username, profile picture, and biography.</li>
          </ul>

          <h3>b. Usage Data & Tracking</h3>
          <p>We may also collect information on how the Service is accessed and used ("Usage Data"). This may include your device's Internet Protocol (IP) address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other diagnostic data.</p>
          <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information to enhance your experience.</p>

          <h3>c. Google API Services & Social Networks</h3>
          <p>
            If you choose to register or log in using third-party social networking sites such as Google, we will collect your name, email address, and profile picture associated with that account.
          </p>
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800/50 not-prose my-6">
            <h4 className="text-green-800 dark:text-green-400 font-semibold mb-2">Google API Services User Data Policy</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              DeshExam's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-green-900 dark:hover:text-green-200">Google API Services User Data Policy</a>, including the Limited Use requirements. We strictly use this information to authenticate your account and personalize your learning experience. We do not use your Google data for targeted advertising or share it with unauthorized third parties.
            </p>
          </div>

          <h3>d. Financial Information</h3>
          <p>
            When you purchase a premium subscription or digital goods, your payment is processed by our secure third-party payment processors (e.g., Razorpay). We do not store or collect your complete payment card details.
          </p>

          <h3>e. User-Generated Content</h3>
          <p>
            We collect data you generate on the platform, such as quiz answers, mock test results, forum posts, and inputs provided to our AI learning tools, to track your progress and provide personalized recommendations.
          </p>

          <h2>3. How We Use Your Data</h2>
          <p>DeshExam uses the collected data for various professional purposes:</p>
          <ul>
            <li>To provide, maintain, and securely operate our Service.</li>
            <li>To manage your account and registration as a user.</li>
            <li>To provide personalized AI-driven learning paths, performance analysis, and content recommendations.</li>
            <li>To process transactions and send related information, including purchase confirmations and invoices.</li>
            <li>To notify you about changes to our Service, technical notices, updates, and security alerts.</li>
            <li>To provide customer care and support.</li>
            <li>To monitor the usage of the Service and detect, prevent, and address technical issues.</li>
          </ul>

          <h2>4. Data Retention and Deletion</h2>
          <p>
            We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements.
          </p>
          <p><strong>Your Right to Deletion:</strong> You have the right to request the deletion of your personal data. You can exercise this right by:</p>
          <ul>
            <li>Navigating to your account settings and selecting "Delete Account."</li>
            <li>Contacting our support team at <strong>privacy@deshexam.com</strong> to request complete erasure of your data, including any data obtained via Google Sign-In. We will process these requests promptly within 30 days.</li>
          </ul>

          <h2>5. Disclosure of Data</h2>
          <p>We may disclose your personal data in the good faith belief that such action is necessary to:</p>
          <ul>
            <li><strong>Service Providers:</strong> We may employ third-party companies and individuals (such as Google Cloud, Firebase, Razorpay) to facilitate our Service, provide the Service on our behalf, or assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</li>
            <li><strong>Legal Requirements:</strong> To comply with a legal obligation, protect and defend the rights or property of DeshExam, or protect the personal safety of users of the Service or the public.</li>
            <li><strong>Business Transaction:</strong> If DeshExam is involved in a merger, acquisition, or asset sale, your Personal Data may be transferred with prior notice.</li>
          </ul>

          <h2>6. Security of Your Data</h2>
          <p>
            The security of your data is of paramount importance to us. We implement robust, industry-standard security measures including encryption, secure socket layer (SSL) technology, and secure cloud infrastructure to protect your personal information. However, please remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure.
          </p>

          <h2>7. Children's Privacy</h2>
          <p>
            Our Service may be used by students under the age of 13. We are committed to complying with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personally identifiable information from anyone under the age of 13 without verifiable parental consent. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
          </p>

          <h2>8. Your Privacy Rights (GDPR & CCPA)</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li>The right to access, update, or delete the information we have on you.</li>
            <li>The right of rectification if your information is inaccurate or incomplete.</li>
            <li>The right to object to or restrict our processing of your Personal Data.</li>
            <li>The right to data portability (receiving a copy of your data in a structured, machine-readable format).</li>
            <li>The right to withdraw consent at any time where we relied on your consent to process your personal information.</li>
          </ul>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>10. Contact Us</h2>
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
          <ul>
            <li>By email: <strong>privacy@deshexam.com</strong></li>
            <li>By visiting the Contact page on our website.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
