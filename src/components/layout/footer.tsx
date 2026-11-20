
'use client';

import Link from "next/link";
import { DeshExamLogo } from "@/components/icons";
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  const hideFooterOnPaths = [
    '/quiz/',
    '/admin',
    '/e-question-builder/create-question'
  ];

  const shouldHideFooter = hideFooterOnPaths.some(path => pathname.startsWith(path));

  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="section-dark-blue text-slate-300 font-body py-5">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 text-base">
          {/* প্ল্যাটফর্ম */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-sm uppercase mb-4">প্ল্যাটফর্ম</h4>
            <ul className="space-y-3">
              <li><Link href="/e-question-builder" className="hover:text-[#d4af37] transition-colors">ই-প্রশ্ন তৈরি</Link></li>
              <li><Link href="/mock-tests" className="hover:text-[#d4af37] transition-colors">মক টেস্ট</Link></li>
              <li><Link href="/quizzes" className="hover:text-[#d4af37] transition-colors">কুইজ</Link></li>
              <li><Link href="/assessment" className="hover:text-[#d4af37] transition-colors">মূল্যায়ন</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#d4af37] transition-colors">লিডারবোর্ড</Link></li>
            </ul>
          </div>

          {/* পড়ার উপকরণ */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-sm uppercase mb-4">পড়ার উপকরণ</h4>
            <ul className="space-y-3">
              <li><Link href="/questions" className="hover:text-[#d4af37] transition-colors">প্রশ্ন ব্যাংক</Link></li>
              <li><Link href="/previous-year-papers" className="hover:text-[#d4af37] transition-colors">আগের বছরের প্রশ্নপত্র</Link></li>
              <li><Link href="/course" className="hover:text-[#d4af37] transition-colors">কোর্স</Link></li>
              <li><Link href="/textbook-solutions" className="hover:text-[#d4af37] transition-colors">পাঠ্যবইয়ের সমাধান</Link></li>
            </ul>
          </div>

          {/* রিসোর্স */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-sm uppercase mb-4">রিসোর্স</h4>
            <ul className="space-y-3">
              <li><Link href="/videos" className="hover:text-[#d4af37] transition-colors">ভিডিও ক্লাস</Link></li>
              <li><Link href="/audio" className="hover:text-[#d4af37] transition-colors">অডিও ক্লাস</Link></li>
              <li><Link href="/documents" className="hover:text-[#d4af37] transition-colors">ডকুমেন্ট ও PDF</Link></li>
              <li><Link href="/guide" className="hover:text-[#d4af37] transition-colors">শিক্ষার্থী গাইড</Link></li>
            </ul>
          </div>

          {/* CLASSES */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-xs uppercase mb-4">Classes</h4>
            <ul className="space-y-3">
              <li><Link href="/class/5" className="hover:text-[#d4af37] transition-colors">Class 5</Link></li>
              <li><Link href="/class/6" className="hover:text-[#d4af37] transition-colors">Class 6</Link></li>
              <li><Link href="/class/7" className="hover:text-[#d4af37] transition-colors">Class 7</Link></li>
              <li><Link href="/class/8" className="hover:text-[#d4af37] transition-colors">Class 8</Link></li>
              <li><Link href="/class/9" className="hover:text-[#d4af37] transition-colors">Class 9</Link></li>
              <li><Link href="/class/10" className="hover:text-[#d4af37] transition-colors">Class 10</Link></li>
              <li><Link href="/class/11" className="hover:text-[#d4af37] transition-colors">Class 11</Link></li>
              <li><Link href="/class/12" className="hover:text-[#d4af37] transition-colors">Class 12</Link></li>
            </ul>
          </div>

          {/* প্রোগ্রাম */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-sm uppercase mb-4">প্রোগ্রাম</h4>
            <ul className="space-y-3">
              <li><Link href="/academy" className="hover:text-[#d4af37] transition-colors">অ্যাকাডেমি</Link></li>
              <li><Link href="/classes" className="hover:text-[#d4af37] transition-colors">লাইভ ক্লাস</Link></li>
              <li><Link href="/learn" className="hover:text-[#d4af37] transition-colors">শিখুন</Link></li>
              <li><Link href="/practice" className="hover:text-[#d4af37] transition-colors">অনুশীলন</Link></li>
            </ul>
          </div>

          {/* কোম্পানি */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-sm uppercase mb-4">কোম্পানি</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="hover:text-[#d4af37] transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><Link href="/contact" className="hover:text-[#d4af37] transition-colors">যোগাযোগ</Link></li>
              <li><Link href="/pricing" className="hover:text-[#d4af37] transition-colors">মূল্য</Link></li>
              <li><Link href="/features" className="hover:text-[#d4af37] transition-colors">সুবিধা</Link></li>
              <li><Link href="/faqs" className="hover:text-[#d4af37] transition-colors">জিজ্ঞাসা</Link></li>
            </ul>
          </div>

          {/* আইনি */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-sm uppercase mb-4">আইনি</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="hover:text-[#d4af37] transition-colors">গোপনীয়তা নীতি</Link></li>
              <li><Link href="/terms" className="hover:text-[#d4af37] transition-colors">শর্তাবলী</Link></li>
              <li><Link href="/refund-policy" className="hover:text-[#d4af37] transition-colors">রিফান্ড নীতি</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-[#d4af37] transition-colors">কুকি নীতি</Link></li>
              <li><Link href="/disclaimer" className="hover:text-[#d4af37] transition-colors">দাবিত্যাগ</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#d4af37]/25 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <DeshExamLogo />
          </div>
          <div className="text-slate-300 text-sm">
            &copy; {new Date().getFullYear()} DeshExam. All rights reserved.
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-300">
          DeshExam is not affiliated with WBBSE or WBCHSE. / DeshExam WBBSE বা WBCHSE-এর সঙ্গে সংযুক্ত নয়।
        </p>
      </div>
    </footer>
  );
}
