import React from 'react';
import Link from 'next/link';
import { getQuestions, getPopularQuestions } from '@/lib/firebase/question-bank';
import { Flame, Clock, BookOpen, ExternalLink, Speaker } from 'lucide-react';

export default async function QuestionSidebar() {
    const categories = [
        { name: 'Class Six (৬ষ্ঠ)', slug: 'class-6' },
        { name: 'Class Seven (৭ম)', slug: 'class-7' },
        { name: 'Class Eight (৮ম)', slug: 'class-8' },
        { name: 'Class Nine (৯ম)', slug: 'class-9' },
        { name: 'Class Ten (১০ম)', slug: 'class-10' },
        { name: 'HSC / Class 11-12', slug: 'hsc' },
        { name: 'University Admission', slug: 'university-admission' },
        { name: 'Job Preparation', slug: 'job-preparation' },
        { name: 'BCS Preparation', slug: 'bcs' },
    ];

    let popularQuestions: any[] = [];
    let recentQuestions: any[] = [];
    try {
        popularQuestions = await getPopularQuestions(5);
        recentQuestions = await getQuestions({}, 5);
    } catch(e) {
        console.error('Failed to load sidebar questions', e);
    }

    return (
        <div className="w-full space-y-6">
            <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900 rounded-[8px] border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="bg-[#107c41] px-2 py-2">
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5 tracking-tight">
                        <BookOpen className="w-5 h-5 text-white/90" /> Exam Categories
                    </h3>
                </div>
                <div className="flex flex-col space-y-1 p-2">
                    {categories.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/question/${cat.slug}`}
                            className="text-slate-600 dark:text-slate-400 hover:text-[#107c41] dark:hover:text-[#107c41] hover:bg-slate-50 dark:hover:bg-slate-900/50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {popularQuestions.length > 0 && (
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900 rounded-[8px] border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="bg-orange-500 px-2 py-2">
                        <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5 tracking-tight">
                            <Flame className="w-5 h-5 text-white/90" /> Popular Questions
                        </h3>
                    </div>
                    <div className="flex flex-col space-y-3 p-2">
                        {popularQuestions.map((q) => (
                            <Link key={q.id} href={`/question/${q.slug || q.id}`} className="group">
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {q.questionText}
                                </p>
                                <span className="text-xs text-slate-400 mt-1 block">{q.viewsCount || 0} views</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {recentQuestions.length > 0 && (
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900 rounded-[8px] border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="bg-blue-600 px-2 py-2">
                        <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5 tracking-tight">
                            <Clock className="w-5 h-5 text-white/90" /> Recent Questions
                        </h3>
                    </div>
                    <div className="flex flex-col space-y-3 p-2">
                        {recentQuestions.map((q) => (
                            <Link key={q.id} href={`/question/${q.slug || q.id}`} className="group">
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {q.questionText}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900 rounded-[8px] border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="bg-indigo-600 px-2 py-2">
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5 tracking-tight">
                        <ExternalLink className="w-5 h-5 text-white/90" /> Study Resources
                    </h3>
                </div>
                <div className="flex flex-col space-y-2 p-2">
                    <Link href="/guide" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Reading Materials & Guides</Link>
                    <Link href="/learn/video" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Video Classes</Link>
                    <Link href="/kids-zone" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Kids Zone / Quizzes</Link>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-[8px] p-2 flex flex-col items-center justify-center text-center min-h-[250px] transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                <Speaker className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Advertisement</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">Place your ad script here.</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-2">Complete Exam Preparation</h4>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-3">Learn, practice, analyze and improve</p>
                    <button className="w-full bg-blue-600 text-white text-xs font-semibold py-2 rounded shadow-sm hover:bg-blue-700 transition-colors">
                        Download App
                    </button>
                </div>
            </div>
        </div>
    );
}


