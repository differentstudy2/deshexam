'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { LayoutTemplate, BrainCircuit, Target, Trophy, FileText, Clock, Smartphone, Bot } from 'lucide-react';

export function MockTestsFooter() {
  const features = [
    {
      icon: <LayoutTemplate className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      title: "Real Exam Interface",
      description: "Familiarize yourself with the exact same interface used in actual competitive exams to reduce test-day anxiety.",
      tag: "Essential"
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      title: "AI Analytics",
      description: "Get detailed AI-driven insights into your performance, pacing, and historical improvement trends.",
      tag: "Smart"
    },
    {
      icon: <Target className="w-5 h-5 text-fuchsia-600" />,
      bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
      title: "Weak Topic Detection",
      description: "Automatically identify and focus on areas needing improvement with our targeted algorithms.",
      tag: "Popular"
    },
    {
      icon: <Trophy className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-100 dark:bg-amber-900/30",
      title: "Rank Prediction",
      description: "See where you stand among thousands of other aspirants with real-time state and national rank estimates.",
      tag: "Live"
    },
    {
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      title: "Detailed Solutions",
      description: "Comprehensive, step-by-step text and video explanations for every single question after you finish.",
      tag: "New"
    },
    {
      icon: <Clock className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      title: "Time Tracking",
      description: "Analyze exactly how much time you spend on each section and question to optimize your speed.",
      tag: null
    },
    {
      icon: <Smartphone className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-100 dark:bg-purple-900/30",
      title: "Mobile Friendly",
      description: "Practice anywhere, anytime with our fully responsive interface designed for mobile and tablet devices.",
      tag: null
    },
    {
      icon: <Bot className="w-5 h-5 text-violet-600" />,
      bg: "bg-violet-100 dark:bg-violet-900/30",
      title: "Reattempt Mode",
      description: "Easily filter and re-take incorrectly answered questions to reinforce learning and fix mistakes.",
      tag: "Pro"
    }
  ];

  const faqs = [
    { question: "Are mock tests free?", answer: "We offer both free and premium mock tests. Free tests give you a feel of the interface, while premium unlocks all tests and advanced analytics." },
    { question: "Can I retake tests?", answer: "Yes! You can retake any mock test multiple times to track your improvement over time." },
    { question: "Are explanations included?", answer: "Absolutely. Every question comes with a detailed step-by-step solution immediately after you complete the test." },
    { question: "Is ranking live?", answer: "Our leaderboard and rank prediction are updated in real-time as thousands of students take the same test." },
    { question: "Is it mobile supported?", answer: "Yes, you can take tests seamlessly on both your desktop and your smartphone." },
    { question: "Can I download tests for offline?", answer: "Currently, mock tests require an active internet connection to securely track your analytics and timing." }
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 mt-20 mb-20 space-y-20">
      
      {/* Features Section */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Why Practice with DeshExam?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 mt-6">
          {features.map((feat, i) => (
            <div key={i} className="relative bg-white dark:bg-slate-900 rounded-[10px] p-6 pt-10 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
              
              {/* Background glow constrained within the card */}
              <div className="absolute inset-0 overflow-hidden rounded-[10px] pointer-events-none z-0">
                <div className={`absolute -top-10 -right-10 w-32 h-32 opacity-20 rounded-full blur-3xl transition-opacity group-hover:opacity-40 ${feat.bg}`}></div>
              </div>

              {feat.tag && (
                <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full z-10">
                  {feat.tag}
                </span>
              )}

              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 dark:border-slate-700/50 backdrop-blur-md z-10 transition-transform group-hover:-translate-y-1 ${feat.bg}`}>
                {feat.icon}
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-3 mt-1 z-10 text-center w-full">{feat.title}</h3>
              <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 flex-grow z-10">
                {feat.description}
              </p>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-4 z-10"></div>
              
              <button className="text-[12px] font-bold text-[#16A34A] hover:text-green-700 transition-colors flex items-center gap-1 z-10">
                Explore feature <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">70,000+</h3>
            <p className="text-sm font-medium text-slate-500">Mock Tests</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50/50 to-blue-100/50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-[10px] p-6 text-center border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
            <h3 className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mb-1">50K+</h3>
            <p className="text-sm font-medium text-indigo-600/70 dark:text-indigo-300/70">Students</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50/50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-[10px] p-6 text-center border border-amber-100 dark:border-amber-800/30 shadow-sm">
            <h3 className="text-3xl font-extrabold text-amber-900 dark:text-amber-100 mb-1">4.8/5</h3>
            <p className="text-sm font-medium text-amber-600/70 dark:text-amber-300/70">Rating</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-[10px] p-6 text-center border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
            <h3 className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-1">120K+</h3>
            <p className="text-sm font-medium text-emerald-600/70 dark:text-emerald-300/70">Attempts Daily</p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Mock Test FAQs</h2>
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b-0 px-4">
                <AccordionTrigger className="hover:no-underline py-4 text-[15px] font-bold text-slate-800 dark:text-slate-200 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 dark:text-slate-400 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-[24px] p-10 sm:p-14 text-center text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Ready to Improve Your Rank?</h2>
            <p className="text-emerald-50 text-base sm:text-lg mb-8 font-medium">Start practicing today with DeshExam mock tests.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="w-full sm:w-auto h-12 px-8 bg-white text-emerald-700 hover:bg-slate-50 font-bold text-[15px] rounded-xl shadow-sm">
                Start Free Test
              </Button>
              <Button variant="outline" className="w-full sm:w-auto h-12 px-8 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white font-bold text-[15px] rounded-xl">
                Upgrade Pro
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
