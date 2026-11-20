
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 text-sm">
          {/* PLATFORM */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-xs uppercase mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/e-question-builder" className="hover:text-[#d4af37] transition-colors">E-Question Builder</Link></li>
              <li><Link href="/mock-tests" className="hover:text-[#d4af37] transition-colors">Mock Tests</Link></li>
              <li><Link href="/quizzes" className="hover:text-[#d4af37] transition-colors">Quizzes</Link></li>
              <li><Link href="/assessment" className="hover:text-[#d4af37] transition-colors">Assessment</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#d4af37] transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* STUDY MATERIALS */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-xs uppercase mb-4">Study Materials</h4>
            <ul className="space-y-3">
              <li><Link href="/questions" className="hover:text-[#d4af37] transition-colors">Question Bank</Link></li>
              <li><Link href="/previous-year-papers" className="hover:text-[#d4af37] transition-colors">Previous Papers</Link></li>
              <li><Link href="/course" className="hover:text-[#d4af37] transition-colors">Courses</Link></li>
              <li><Link href="/textbook-solutions" className="hover:text-[#d4af37] transition-colors">Textbook Solutions</Link></li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-xs uppercase mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/videos" className="hover:text-[#d4af37] transition-colors">Video Lessons</Link></li>
              <li><Link href="/audio" className="hover:text-[#d4af37] transition-colors">Audio Lessons</Link></li>
              <li><Link href="/documents" className="hover:text-[#d4af37] transition-colors">Documents & PDFs</Link></li>
              <li><Link href="/guide" className="hover:text-[#d4af37] transition-colors">Student Guide</Link></li>
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

          {/* PROGRAMS */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-xs uppercase mb-4">Programs</h4>
            <ul className="space-y-3">
              <li><Link href="/academy" className="hover:text-[#d4af37] transition-colors">Academy</Link></li>
              <li><Link href="/classes" className="hover:text-[#d4af37] transition-colors">Live Classes</Link></li>
              <li><Link href="/learn" className="hover:text-[#d4af37] transition-colors">Learn</Link></li>
              <li><Link href="/practice" className="hover:text-[#d4af37] transition-colors">Practice Area</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-xs uppercase mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="hover:text-[#d4af37] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#d4af37] transition-colors">Contact Us</Link></li>
              <li><Link href="/pricing" className="hover:text-[#d4af37] transition-colors">Pricing</Link></li>
              <li><Link href="/features" className="hover:text-[#d4af37] transition-colors">Features</Link></li>
              <li><Link href="/faqs" className="hover:text-[#d4af37] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-[#d4af37] tracking-wider text-xs uppercase mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="hover:text-[#d4af37] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#d4af37] transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-[#d4af37] transition-colors">Refund Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-[#d4af37] transition-colors">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-[#d4af37] transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#d4af37]/25 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <DeshExamLogo />
          </div>
          <div className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} DeshExam. All rights reserved.
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          DeshExam is not affiliated with WBBSE or WBCHSE. / DeshExam WBBSE বা WBCHSE-এর সঙ্গে সংযুক্ত নয়।
        </p>
      </div>
    </footer>
  );
}
