import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how DeshExam collects, uses, and protects your personal information and academic data.',
  keywords: ['privacy policy', 'data protection', 'user data', 'DeshExam privacy'],
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-secondary/30">
      <div className="container py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-card p-6 md:p-10 rounded-lg shadow-sm prose dark:prose-invert">
          <h2>1. Introduction</h2>
          <p>
            Welcome to DeshExam. We are committed to protecting your privacy and handling your personal data in an open and transparent manner. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
          </p>
          <h4>a. Personal Data</h4>
          <p>
            Personally identifiable information, such as your name, email address, and demographic information like your school, class, and target exam, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as taking tests or creating content.
          </p>
          <h4>b. User-Generated Content</h4>
          <p>
            We collect information that you provide when you use our services, including:
          </p>
          <ul>
            <li>Answers and performance data from mock tests, quizzes, and other assessments.</li>
            <li>Content you create, including questions, tests, or articles, if you are a contributor.</li>
            <li>Prompts and images you upload for our AI-powered features like the AI Learning Path and Solved Textbooks.</li>
          </ul>
          <h4>c. Financial Data</h4>
          <p>
            We may collect data related to your payment method (e.g., valid credit card number, card brand, expiration date) when you purchase a subscription. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, Razorpay, and you are encouraged to review their privacy policy and contact them directly for responses to your questions.
          </p>
          <h4>d. Data from Social Networks and Google APIs</h4>
          <p>
            User information from social networking sites, such as Google, including your name, email address, and profile picture, if you connect your account using Google Sign-In.
          </p>
          <p className="mt-2">
            <strong>Google API Services User Data Policy:</strong> DeshExam's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements. We only use this information to authenticate your account and personalize your experience. We do not use your Google data for targeted advertising or share it with unauthorized third parties.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Generate a personal profile of you to make future visits to the Site more personalized.</li>
            <li>Generate personalized learning paths and analyze your performance on tests.</li>
            <li>Process payments and refunds.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable user-to-user communications.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            <li>Notify you of updates to the Site.</li>
          </ul>

          <h2>4. Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <h4>a. By Law or to Protect Rights</h4>
          <p>
            If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
          </p>
          <h4>b. Third-Party Service Providers</h4>
          <p>
            We may share your information with third parties that perform services for us or on our behalf, including payment processing (Razorpay), data analysis (Firebase), and artificial intelligence services (Google AI / Genkit).
          </p>
          <h4>c. User Profile and Leaderboards</h4>
          <p>
            Your display name, profile picture, and your scores may be visible to other users on the platform, especially in features like leaderboards.
          </p>

          <h2>5. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2>6. Your Rights and Data Deletion</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You can review or change the information in your account or terminate your account and request full data deletion by:
          </p>
          <ul>
            <li>Logging into your account settings and updating or deleting your account.</li>
            <li>Contacting us to request complete erasure of your data, including any data obtained via Google Sign-In. We will process data deletion requests promptly in accordance with applicable laws.</li>
          </ul>

          <h2>7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us through our contact page.
          </p>
        </div>
      </div>
    </div>
  );
}
