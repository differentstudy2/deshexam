import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms and conditions for using DeshExam, including user conduct, subscription terms, and intellectual property rights.',
  keywords: ['terms of service', 'user agreement', 'DeshExam terms', 'legal terms'],
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-secondary/30">
      <div className="container py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-card p-6 md:p-10 rounded-lg shadow-sm prose dark:prose-invert">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the DeshExam website and services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2>2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2>3. Subscriptions and Payments</h2>
          <p>
            Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or yearly basis, depending on the type of subscription plan you select.
          </p>
          <p>
            All payments are processed through our third-party payment processor, Razorpay. We are not responsible for any errors or issues related to the payment processing.
          </p>

          <h2>4. User Conduct</h2>
          <p>
            You agree not to use the Service to:
          </p>
          <ul>
            <li>Violate any local, state, national, or international law.</li>
            <li>Share your account credentials with any third party.</li>
            <li>Attempt to reverse engineer, decompile, or otherwise attempt to discover the source code of the Service.</li>
            <li>Use any automated means to access the Service or collect any information from the Service.</li>
            <li>Distribute, copy, or reproduce any part of the content provided on DeshExam without prior written permission.</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of DeshExam and its licensors. The content, including mock tests, quizzes, and articles, is protected by copyright and other laws.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall DeshExam, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
          
          <h2>8. Disclaimer</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us through our contact page.
          </p>
        </div>
      </div>
    </div>
  );
}
