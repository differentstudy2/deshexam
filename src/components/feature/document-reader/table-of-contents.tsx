import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { List } from 'lucide-react';
import Link from 'next/link';

export function TableOfContents() {
  const sections = [
    { title: "Introduction", link: "#introduction" },
    { title: "Summary", link: "#summary" },
    { title: "Important Questions", link: "#important-questions" },
    { title: "Revision Notes", link: "#revision-notes" },
    { title: "Practice Questions", link: "#practice-questions" },
  ];

  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <List className="w-5 h-5 text-[#107c41]" /> Table of Contents
      </h3>
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="p-4 md:p-6">
          <ul className="space-y-3">
            {sections.map((section, idx) => (
              <li key={idx}>
                <Link href={section.link} className="flex items-center text-slate-700 dark:text-slate-300 hover:text-[#107c41] dark:hover:text-[#107c41] font-medium transition-colors">
                  <span className="w-6 text-slate-400 text-sm">{idx + 1}.</span>
                  {section.title}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
