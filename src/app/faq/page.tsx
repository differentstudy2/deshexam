
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
