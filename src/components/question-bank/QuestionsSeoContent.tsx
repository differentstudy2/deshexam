import React from 'react';
import Link from 'next/link';

export default function QuestionsSeoContent() {
  return (
    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
      <div className="grid md:grid-cols-3 gap-12">
        {/* Section 1: Why Practice Matters */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Why Practice Questions Matter</h2>
          <p className="text-sm leading-relaxed mb-4">
            Consistent practice is the key to exam success. Practicing questions helps you understand exam patterns, 
            identify your weak areas, and improve your time management skills. DeshExam provides a massive library 
            of exam-ready questions designed to simulate real testing environments.
          </p>
          <p className="text-sm leading-relaxed">
            By solving <Link href="/questions/previous-year" className="text-blue-600 dark:text-blue-400 hover:underline">previous year questions</Link> and 
            taking <Link href="/mock-tests" className="text-blue-600 dark:text-blue-400 hover:underline">mock tests</Link>, 
            you significantly boost your chances of achieving a top rank.
          </p>
        </section>

        {/* Section 2: Question Types */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Question Types</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/questions/mcq" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Multiple Choice Questions (MCQ)
              </Link>
            </li>
            <li>
              <Link href="/questions/descriptive" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Descriptive / Creative Questions
              </Link>
            </li>
            <li>
              <Link href="/questions/short-answer" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Short Answer Questions
              </Link>
            </li>
            <li>
              <Link href="/questions/long-answer" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Long Answer Questions
              </Link>
            </li>
            <li>
              <Link href="/questions/previous-year" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Previous Year Papers (PYQ)
              </Link>
            </li>
          </ul>
        </section>

        {/* Section 3: Supported Exams */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Supported Exams</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'WBBSE', url: '/questions/wbbse' },
              { name: 'WBCHSE', url: '/questions/wbchse' },
              { name: 'CBSE', url: '/questions/cbse' },
              { name: 'ICSE', url: '/questions/icse' },
              { name: 'SSC', url: '/questions/ssc' },
              { name: 'Railway', url: '/questions/railway' },
              { name: 'NEET', url: '/questions/neet' },
              { name: 'JEE', url: '/questions/jee' },
              { name: 'UPSC', url: '/questions/upsc' },
            ].map((exam) => (
              <Link 
                key={exam.name}
                href={exam.url}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {exam.name}
              </Link>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Study Resources</h3>
            <div className="flex gap-4 text-sm">
              <Link href="/books" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">Books</Link>
              <Link href="/notes" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">Notes</Link>
              <Link href="/documents" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">Documents</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
