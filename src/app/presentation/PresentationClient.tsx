'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, BookOpen, Clock, BarChart2, Award, ChevronRight, Search, Filter } from 'lucide-react';

interface Assessment {
    id: string;
    title: string;
    slug: string;
    questions: any[];
    classId?: string;
    chapter?: string;
    topic?: string;
    subjectId?: string;
    difficulty?: string;
    language?: string;
    durationMin?: number;
    totalMarks?: number;
    thumbnail?: string;
    tags?: string[];
    description?: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
    Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    Hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
};

const SUBJECT_GRADIENTS: Record<string, string> = {
    'বাংলা': 'from-violet-500 to-purple-600',
    'বিজ্ঞান': 'from-sky-500 to-blue-600',
    'গণিত': 'from-orange-500 to-red-600',
    'English': 'from-teal-500 to-cyan-600',
    'Science': 'from-sky-500 to-blue-600',
    'default': 'from-indigo-500 to-violet-600',
};

function getGradient(subject?: string): string {
    if (!subject) return SUBJECT_GRADIENTS['default'];
    return SUBJECT_GRADIENTS[subject] || SUBJECT_GRADIENTS['default'];
}

export default function PresentationClient({ assessments }: { assessments: Assessment[] }) {
    const router = useRouter();
    const [search, setSearch] = useState('');

    const filtered = assessments.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.subjectId?.toLowerCase().includes(search.toLowerCase()) ||
        t.chapter?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full">
            {/* Search Bar */}
            <div className="relative mt-2 mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search tests..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{assessments.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Tests</p>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {assessments.reduce((acc, t) => acc + (t.questions?.length || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Questions</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Free</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Access</p>
                </div>
            </div>

            {/* Cards Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No tests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    {filtered.map((test) => {
                        const gradient = getGradient(test.subjectId);
                        const difficulty = test.difficulty || 'Easy';
                        const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES['Easy'];

                        return (
                            <div
                                key={test.id || test.slug}
                                className="group flex flex-col rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                            >
                                {/* Card Header Gradient */}
                                <div className={`h-2 bg-gradient-to-r ${gradient}`} />

                                {/* Card Body */}
                                <div className="flex flex-col flex-1 p-4">
                                    {/* Top Row: Subject + Difficulty */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white`}>
                                            {test.subjectId || 'General'}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${diffStyle}`}>
                                            {difficulty}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1">
                                        {test.title}
                                    </h3>

                                    {/* Chapter / Class */}
                                    {(test.chapter || test.classId) && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                                            {test.chapter || test.classId}
                                        </p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-3 mt-auto mb-4">
                                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            {test.questions?.length || 0} Qs
                                        </span>
                                        {test.durationMin && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                {test.durationMin} min
                                            </span>
                                        )}
                                        {test.totalMarks && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Award className="w-3.5 h-3.5" />
                                                {test.totalMarks} marks
                                            </span>
                                        )}
                                    </div>

                                    {/* Present Button */}
                                    <button
                                        onClick={() => router.push(`/presentation/${test.slug || test.id}`)}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-all group-hover:shadow-md`}
                                    >
                                        <Play className="w-4 h-4 fill-white" />
                                        Present
                                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
