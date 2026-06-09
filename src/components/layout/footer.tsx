
'use client';

import Link from "next/link";
import { DeshExamLogo } from "@/components/icons";
import { Github, Twitter, Linkedin } from "lucide-react";
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  const hideFooterOnPaths = [
    '/quiz/',
    '/admin'
  ];

  const shouldHideFooter = hideFooterOnPaths.some(path => pathname.startsWith(path));

  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="bg-[#0b1120] text-slate-300 font-body py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-sm">
          {/* EDUCATION */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-6">Education</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">Class 10 Notes</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">HSC Preparation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">WBCS Guide</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">MCQ Library</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Exam Updates</Link></li>
            </ul>
          </div>

          {/* KNOWLEDGE */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-6">Knowledge</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">Science & Tech</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">History Hub</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">GK Daily</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Glossary Index</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Academic Dictionary</Link></li>
            </ul>
          </div>

          {/* SCHOLARSHIPS */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-6">Scholarships</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">Govt Scholarships</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Study Abroad</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Private Grants</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Scholarship News</Link></li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-6">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">Question Papers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Syllabus Guide</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">PDF Downloads</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Carrier Roadmap</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-6">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Success Stories</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Work with Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-400 tracking-wider text-xs uppercase mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Disclaimer</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
