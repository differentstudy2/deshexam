import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | DeshExam',
  description: 'Read the legal disclaimer for DeshExam. Understand the limitations of liability, accuracy of educational content, and third-party links on our platform.',
  keywords: ['disclaimer', 'legal disclaimer', 'DeshExam disclaimer', 'liability', 'educational content'],
  openGraph: {
    title: 'Disclaimer | DeshExam',
    description: 'Read the legal disclaimer for DeshExam. Understand the limitations of liability, accuracy of educational content, and third-party links on our platform.',
    url: 'https://deshexam.com/disclaimer',
    siteName: 'DeshExam',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Disclaimer | DeshExam',
    description: 'Read the legal disclaimer for DeshExam. Understand the limitations of liability, accuracy of educational content, and third-party links on our platform.',
  },
  alternates: {
    canonical: 'https://deshexam.com/disclaimer',
  }
};

export default function DisclaimerPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container py-12 md:py-20">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Disclaimer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 prose prose-slate dark:prose-invert lg:prose-lg">
          <h2>1. General Information</h2>
          <p>
            The information provided by <strong>DeshExam</strong> ("we," "us," or "our") on our website, mobile application, and related platforms (the "Service") is for general educational and informational purposes only. All information on the Service is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Service.
          </p>

          <h2>2. Educational and Test Preparation Disclaimer</h2>
          <p>
            DeshExam is an educational platform designed to assist students in their academic preparation for various exams (including but not limited to WBBSE Madhyamik, WBCHSE Uccha Madhyamik, WBJEE, CBSE, ICSE, ISC, JEE Main, NEET, CUET, State Public Service Commissions such as WBPSC, UPSC, SSC, Banking, and other University Admission and Government Job exams in India).
          </p>
          <ul>
            <li><strong>No Guarantee of Success:</strong> While our mock tests, question banks, and courses are curated by subject matter experts, using our platform does not guarantee admission to any university, passing any board exam, or securing any job. Success depends on individual effort, actual exam difficulty, and other external factors.</li>
            <li><strong>Syllabus Changes:</strong> Educational boards and examination authorities frequently change their syllabi and question patterns. We strive to keep our content updated, but we do not warrant that our materials perfectly align with the most recent, unannounced changes made by these authorities.</li>
            <li><strong>Not an Official Body:</strong> DeshExam is a private, independent educational technology company. We are not affiliated with, endorsed by, or officially connected to any government education board, university, or public service commission.</li>
          </ul>

          <h2>3. User-Generated Content Disclaimer</h2>
          <p>
            Our platform may allow users to post questions, answers, comments, and other content in forums or discussion boards. DeshExam does not endorse, support, represent, or guarantee the truthfulness, accuracy, or reliability of any user-generated content. You acknowledge that any reliance on material posted by other users will be at your own risk.
          </p>

          <h2>4. External Links Disclaimer</h2>
          <p>
            The Service may contain (or you may be sent through the Service) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
          </p>
          <p>
            We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site or any website or feature linked in any banner or other advertising. We will not be a party to or in any way be responsible for monitoring any transaction between you and third-party providers of products or services.
          </p>

          <h2>5. Professional Disclaimer</h2>
          <p>
            The Service cannot and does not contain legal, financial, or professional advice. The educational information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the Service or reliance on any information provided on the Service. Your use of the Service and your reliance on any information on the Service is solely at your own risk.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at <strong>support@deshexam.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
