'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SupportFAQ() {
  const faqs1 = [
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login screen. Enter your registered email address, and we'll send you a link to securely reset your password."
    },
    {
      question: "Payment failed, what should I do?",
      answer: "Don't worry! If a payment fails but the amount is debited, it usually automatically refunds to your source account within 5-7 business days."
    },
    {
      question: "How to upgrade to premium?",
      answer: "Navigate to the Pricing page, select the Pass Pro plan that suits your needs, and click 'Upgrade'."
    }
  ];

  const faqs2 = [
    {
      question: "Mock test not loading?",
      answer: "This is usually caused by network issues or cached data. Please try hard refreshing your browser (Ctrl+F5) or clearing your browser cache."
    },
    {
      question: "Can I get refund?",
      answer: "We offer a 3-day money-back guarantee for our premium subscriptions if you have attempted fewer than 2 premium mock tests."
    },
    {
      question: "How to report bug?",
      answer: "Please select 'Report Bug' in the contact form above, provide details, and attach a screenshot if possible."
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-extrabold text-[#0F172A] mb-8">Frequently Asked Questions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs1.map((faq, index) => (
            <AccordionItem key={`col1-${index}`} value={`col1-${index}`} className="border border-[#E2E8F0] rounded-lg px-4 bg-white shadow-sm data-[state=open]:border-[#16A34A] transition-colors">
              <AccordionTrigger className="text-left font-semibold text-[#0F172A] hover:no-underline py-4 text-sm hover:text-[#16A34A] transition-colors">
                  {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#64748B] text-sm leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs2.map((faq, index) => (
            <AccordionItem key={`col2-${index}`} value={`col2-${index}`} className="border border-[#E2E8F0] rounded-lg px-4 bg-white shadow-sm data-[state=open]:border-[#16A34A] transition-colors">
              <AccordionTrigger className="text-left font-semibold text-[#0F172A] hover:no-underline py-4 text-sm hover:text-[#16A34A] transition-colors">
                  {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#64748B] text-sm leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
