
'use client';

import Link from "next/link";
import { DeshExamLogo } from "@/components/icons";
import { Github, Twitter, Linkedin } from "lucide-react";
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
    <footer className="bg-[#0b1120] text-slate-300 font-body py-5">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-sm">
          {/* PLATFORM */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/e-question-builder" className="hover:text-white transition-colors">E-Question Builder</Link></li>
              <li><Link href="/mock-tests" className="hover:text-white transition-colors">Mock Tests</Link></li>
              <li><Link href="/quizzes" className="hover:text-white transition-colors">Quizzes</Link></li>
              <li><Link href="/assessment" className="hover:text-white transition-colors">Assessment</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* STUDY MATERIALS */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-4">Study Materials</h4>
            <ul className="space-y-3">
              <li><Link href="/questions" className="hover:text-white transition-colors">Question Bank</Link></li>
              <li><Link href="/previous-year-papers" className="hover:text-white transition-colors">Previous Papers</Link></li>
              <li><Link href="/course" className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/textbook-solutions" className="hover:text-white transition-colors">Textbook Solutions</Link></li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/videos" className="hover:text-white transition-colors">Video Lessons</Link></li>
              <li><Link href="/audio" className="hover:text-white transition-colors">Audio Lessons</Link></li>
              <li><Link href="/documents" className="hover:text-white transition-colors">Documents & PDFs</Link></li>
              <li><Link href="/guide" className="hover:text-white transition-colors">Student Guide</Link></li>
              <li><Link href="/skill" className="hover:text-white transition-colors">Skill Development</Link></li>
            </ul>
          </div>

          {/* PROGRAMS */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-4">Programs</h4>
            <ul className="space-y-3">
              <li><Link href="/academy" className="hover:text-white transition-colors">Academy</Link></li>
              <li><Link href="/classes" className="hover:text-white transition-colors">Live Classes</Link></li>
              <li><Link href="/kids-zone" className="hover:text-white transition-colors">Kids Zone</Link></li>
              <li><Link href="/learn" className="hover:text-white transition-colors">Learn</Link></li>
              <li><Link href="/practice" className="hover:text-white transition-colors">Practice Area</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/faqs" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/privacy`} className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/terms`} className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/refund-policy`} className="hover:text-white transition-colors">Refund Policy</a></li>
              <li><a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cookie-policy`} className="hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/disclaimer`} className="hover:text-white transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <DeshExamLogo />
          </div>
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} DeshExam. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="#" className="hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
