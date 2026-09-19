'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqSectionProps {
  documentTitle: string;
  pages: number;
}

export function FaqSection({ documentTitle, pages }: FaqSectionProps) {
  const faqs = [
    {
      question: `What is included in the ${documentTitle} notes?`,
      answer: `These comprehensive notes include chapter summaries, important questions, exam preparation materials, and revision notes specifically designed for your curriculum.`
    },
    {
      question: `Can I download the PDF?`,
      answer: `Yes, you can easily download the PDF by clicking the 'Download PDF' button above. You can also read it online using our native document reader.`
    },
    {
      question: `Is this useful for exam preparation?`,
      answer: `Absolutely! The materials are curated to help you score better in your exams by focusing on key topics and frequently asked questions.`
    },
    {
      question: `How many pages does this document contain?`,
      answer: `This document contains exactly ${pages || 'several'} pages of high-quality educational content.`
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="mb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-[#107c41]" /> Frequently Asked Questions
      </h3>
      <Accordion type="single" collapsible className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className="px-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <AccordionTrigger className="text-left font-medium text-slate-800 dark:text-slate-200 hover:text-[#107c41] dark:hover:text-[#107c41]">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 dark:text-slate-400">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
