'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: "Is DeshExam free?",
    a: "Yes, many of our practice questions, mock tests, and study materials are completely free. We also offer premium plans for advanced features, detailed analytics, and ad-free experiences."
  },
  {
    q: "Can I practice MCQ online?",
    a: "Absolutely! DeshExam provides an interactive platform to practice Multiple Choice Questions (MCQ) for various board and competitive exams with instant feedback."
  },
  {
    q: "Are solutions available?",
    a: "Yes, we provide detailed step-by-step solutions and explanations for most of our questions to help you understand the core concepts."
  },
  {
    q: "Which exams are supported?",
    a: "We currently support state boards (WBBSE, WBCHSE), central boards (CBSE, ICSE), and major competitive exams including SSC, Railway, NEET, JEE, and UPSC."
  },
  {
    q: "Can I save questions for later?",
    a: "Yes! If you create a free account, you can bookmark and save any question to your personal dashboard for quick revision later."
  }
];

export default function QuestionsFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-12 mb-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                )}
              </button>
              <div 
                className={cn(
                  "px-4 text-slate-600 dark:text-slate-400 text-sm overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                {faq.a}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
