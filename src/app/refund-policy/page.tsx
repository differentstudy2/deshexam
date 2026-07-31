import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | DeshExam',
  description: 'Read the DeshExam refund and cancellation policy. Understand our terms for subscription cancellations, refunds on premium purchases, and dispute resolution.',
  keywords: ['refund policy', 'cancellation policy', 'DeshExam refund', 'subscription cancellation'],
  openGraph: {
    title: 'Refund & Cancellation Policy | DeshExam',
    description: 'Read the DeshExam refund and cancellation policy. Understand our terms for subscription cancellations, refunds on premium purchases, and dispute resolution.',
    url: 'https://deshexam.com/refund-policy',
    siteName: 'DeshExam',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund & Cancellation Policy | DeshExam',
    description: 'Read the DeshExam refund and cancellation policy. Understand our terms for subscription cancellations, refunds on premium purchases, and dispute resolution.',
  },
  alternates: {
    canonical: 'https://deshexam.com/refund-policy',
  }
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container py-12 md:py-20">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Refund & Cancellation Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 prose prose-slate dark:prose-invert lg:prose-lg">
          <h2>1. Introduction</h2>
          <p>
            Thank you for purchasing our courses and premium subscriptions at <strong>DeshExam</strong>. We want to ensure you have a rewarding experience while you discover, assess, and purchase our educational materials.
          </p>
          <p>
            As with any online purchase experience, there are terms and conditions that apply to transactions. By making a purchase on DeshExam, you agree to our Privacy Policy, Terms of Service, and this Refund Policy.
          </p>

          <h2>2. Digital Products and Subscriptions</h2>
          <p>
            DeshExam offers digital products, including but not limited to online courses, premium question banks, mock tests, and PDF materials. Due to the nature of digital products, which are immediately accessible upon purchase, we generally do not offer refunds once the purchase is completed and access has been granted.
          </p>

          <h2>3. Refund Eligibility</h2>
          <p>
            We may issue a refund in the following exceptional circumstances:
          </p>
          <ul>
            <li><strong>Duplicate Payment:</strong> If you were incorrectly charged multiple times for the same subscription or product.</li>
            <li><strong>Technical Issues:</strong> If you are completely unable to access the purchased content due to a technical fault on our end, and our support team is unable to resolve the issue within 7 business days of your report.</li>
            <li><strong>Fraudulent Charges:</strong> If the purchase was made fraudulently using your payment method. (You must provide proof from your bank/card issuer).</li>
          </ul>

          <h2>4. 7-Day Money-Back Guarantee (Specific Courses Only)</h2>
          <p>
            Certain premium instructor-led courses may be explicitly marked with a "7-Day Money-Back Guarantee" badge on their sales page. For these specific courses only, you may request a full refund within 7 days of purchase, provided that:
          </p>
          <ul>
            <li>You have completed less than 15% of the course content.</li>
            <li>You have not downloaded the course certificates or supplementary PDF materials.</li>
            <li>Your account has not violated our Terms of Service.</li>
          </ul>
          <p>Subscriptions (Monthly/Yearly Passes) and Mock Test packages are strictly excluded from this 7-day guarantee.</p>

          <h2>5. Cancellation Policy</h2>
          <p>
            <strong>Subscription Cancellation:</strong> If you are enrolled in an auto-renewing subscription (e.g., Monthly Pro Pass), you may cancel your subscription at any time from your Account Settings. 
          </p>
          <p>
            Canceling your subscription prevents future recurring charges. However, cancellation does not grant a refund for the current billing cycle. You will continue to have access to your premium features until the end of your current paid billing period.
          </p>

          <h2>6. How to Request a Refund</h2>
          <p>
            To request a refund under the eligible circumstances mentioned above, please email our support team at <strong>support@deshexam.com</strong>.
          </p>
          <p>Your request must include:</p>
          <ul>
            <li>The email address associated with your DeshExam account.</li>
            <li>The order or transaction ID (found in your receipt email).</li>
            <li>A detailed explanation of why you are requesting a refund.</li>
          </ul>

          <h2>7. Processing Time</h2>
          <p>
            Once we receive your refund request, our team will review it within 3-5 business days. If approved, the refund will be initiated immediately. Please note that it may take an additional 5-10 business days for the funds to appear in your bank account or credit card statement, depending on your financial institution and our payment gateway (Razorpay).
          </p>

          <h2>8. Changes to this Policy</h2>
          <p>
            DeshExam reserves the right to modify or update this Refund & Cancellation Policy at any time without prior notice. Any changes will be effective immediately upon posting to this page.
          </p>
        </div>
      </div>
    </div>
  );
}
