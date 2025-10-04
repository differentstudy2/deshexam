
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ)',
  description: "Find answers to common questions about DeshExam, including subscriptions, features like AI Learning Path, payment methods, and account management.",
  keywords: ['faq', 'deshexam faq', 'frequently asked questions', 'exam help', 'subscription questions'],
};


const faqData = [
    { 
        question: "What is DeshExam?", 
        answer: "DeshExam is a comprehensive online learning platform designed to help students prepare for competitive exams like NEET, JEE, UPSC, and more. We offer mock tests, quizzes, AI-powered learning paths, and detailed analytics to help you succeed." 
    },
    {
        question: "How do I sign up for an account?",
        answer: "You can create a free account by clicking the 'Sign Up' button in the top right corner. You can sign up using your email address and password, or by using your Google account for a faster process."
    },
    { 
        question: "What is the difference between Pass and Pass Pro?", 
        answer: "DeshExam Pass gives you access to our vast library of mock tests. Pass Pro is our premium subscription that unlocks all features, including Pro Live Tests, Previous Year Papers, unlimited re-attempts, and access to our exclusive Practice Pro Questions." 
    },
    { 
        question: "Can I try the platform before purchasing a subscription?", 
        answer: "Yes! We offer a range of free quizzes and some free mock tests for you to experience the platform. Simply sign up for a free account to get started." 
    },
    { 
        question: "How does the AI Learning Path work?", 
        answer: "After you complete a mock test, our AI analyzes your performance to identify your strengths and weaknesses. It then generates a personalized study plan with recommended topics, articles, and quizzes to help you focus your efforts where they're needed most." 
    },
    { 
        question: "What payment methods do you accept?", 
        answer: "We support a variety of payment methods through our secure payment partner, Razorpay. This includes credit/debit cards, net banking, UPI, and various digital wallets." 
    },
    {
        question: "Is my personal information secure?",
        answer: "Yes, protecting your privacy is a top priority for us. We use industry-standard security measures to safeguard your data. For more details, please read our Privacy Policy."
    },
    {
        question: "What happens after I complete a test?",
        answer: "Immediately after you submit a test, you will receive a detailed results page showing your score, a question-by-question review of your answers, and explanations for each question. This data is also used to update your personalized AI Learning Path."
    },
    {
        question: "How does the leaderboard work?",
        answer: "The leaderboard ranks users based on their performance in mock tests and quizzes. It's a great way to see how you stack up against other aspirants and stay motivated."
    },
    {
        question: "What is the 'Solved Textbooks' feature?",
        answer: "This AI-powered tool allows you to get help with your physical textbooks. Simply upload a photo of a textbook page, and our AI will provide summaries, explain complex concepts, and even offer solutions to the problems on that page."
    },
    {
        question: "How do I use a coupon code?",
        answer: "You can apply a coupon code on the payment page when you are purchasing a Pass or Pass Pro subscription. There will be a field to enter your code, and the discount will be applied to your total before payment."
    },
    {
        question: "Can I access my tests and results on multiple devices?",
        answer: "Absolutely! Your account and all your progress are synced across all devices. You can start a test on your laptop and review the results on your phone."
    },
    {
        question: "What exams do you offer content for?",
        answer: "We offer a wide range of content for major Indian competitive exams, including NEET, JEE, UPSC, Banking exams, and more. Our library is constantly expanding."
    },
    {
        question: "How do I report an error in a question or its solution?",
        answer: "While we strive for accuracy, we appreciate user feedback. You can use the 'Contact Us' form to report any issues. Please include the test name and question number for a faster resolution."
    },
    {
        question: "Can I retake a test I have already completed?",
        answer: "Yes, re-attempting tests is a key feature, especially for our Pass Pro subscribers who get unlimited re-attempts. This helps in tracking improvement and reinforcing learning."
    }
];

export default function FaqPage() {
  return (
    <div className="bg-secondary/30">
      <div className="container py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Have questions? We've got answers. Find what you're looking for below.
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-card p-4 rounded-lg shadow-sm">
            <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-left text-lg hover:no-underline">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                        {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </div>
    </div>
  );
}
