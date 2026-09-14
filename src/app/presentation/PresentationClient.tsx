'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Play, BookOpen, Clock, Award, ChevronRight, Search, Layers, CheckCircle2 } from 'lucide-react';

export interface Assessment {
    id: string;
    title: string;
    slug: string;
    type?: string;
    questions?: any[];
    questionIds?: string[];
    questionCount?: number;
    totalQuestions?: number;
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
    Expert: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
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

function getQuestionCount(t: Assessment): number {
    return (t.questions && t.questions.length) || (t.questionIds && t.questionIds.length) || t.questionCount || t.totalQuestions || 0;
}

export default function PresentationClient({ assessments }: { assessments: Assessment[] }) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = { all: assessments.length, 'Mock Test': 0, 'Quiz': 0, 'Practice Set': 0 };
        for (const a of assessments) {
            const t = a.type || 'Mock Test';
            counts[t] = (counts[t] || 0) + 1;
        }
        return counts;
    }, [assessments]);

    const filtered = useMemo(() => {
        return assessments.filter(t => {
            const matchesSearch =
                !search ||
                t.title?.toLowerCase().includes(search.toLowerCase()) ||
                t.subjectId?.toLowerCase().includes(search.toLowerCase()) ||
                t.chapter?.toLowerCase().includes(search.toLowerCase());

            const matchesType =
                selectedType === 'all' ||
                t.type === selectedType ||
                (selectedType === 'Mock Test' && !t.type);

            return matchesSearch && matchesType;
        });
    }, [assessments, search, selectedType]);

    const totalQuestionsCount = useMemo(() => {
        return assessments.reduce((acc, t) => acc + getQuestionCount(t), 0);
    }, [assessments]);

    return (
        <div className="w-full">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{assessments.length}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Available Assessments</p>
                </div>
                <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                        {totalQuestionsCount}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Total Slide Questions</p>
                </div>
                <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Free & Instant Present</p>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
                {/* Type Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
                    {[
                        { id: 'all', label: 'All', count: typeCounts.all },
                        { id: 'Mock Test', label: 'Mock Tests', count: typeCounts['Mock Test'] },
                        { id: 'Quiz', label: 'Quizzes', count: typeCounts['Quiz'] },
                        { id: 'Practice Set', label: 'Practice Sets', count: typeCounts['Practice Set'] },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedType(tab.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                selectedType === tab.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                selectedType === tab.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[240px] sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tests or subjects..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
                    />
                </div>
            </div>

            {/* Cards Grid: 4 columns on lg screens */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">No assessments found.</p>
                    <p className="text-gray-400 text-xs mt-1">Try modifying your search or filter keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    {filtered.map((test) => {
                        const gradient = getGradient(test.subjectId);
                        const difficulty = test.difficulty || 'Easy';
                        const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES['Easy'];
                        const qCount = getQuestionCount(test);

                        return (
                            <div
                                key={test.id || test.slug}
                                className="group flex flex-col rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Card Header Gradient Accent */}
                                <div className={`h-2 bg-gradient-to-r ${gradient}`} />

                                {/* Card Body */}
                                <div className="flex flex-col flex-1 p-4">
                                    {/* Top Row: Subject/Type + Difficulty */}
                                    <div className="flex items-center justify-between mb-3 gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r ${gradient} text-white truncate max-w-[140px]`}>
                                            {test.subjectId || test.type || 'General'}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${diffStyle}`}>
                                            {difficulty}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {test.title}
                                    </h3>

                                    {/* Chapter / Class */}
                                    {(test.chapter || test.classId) && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                                            {test.chapter || test.classId}
                                        </p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-3 mt-auto pt-2 mb-4 border-t border-gray-50 dark:border-gray-700/50">
                                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                            {qCount} Qs
                                        </span>
                                        {test.durationMin ? (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                {test.durationMin}m
                                            </span>
                                        ) : null}
                                        {test.totalMarks ? (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                <Award className="w-3.5 h-3.5 text-emerald-500" />
                                                {test.totalMarks}m
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Present Button */}
                                    <button
                                        onClick={() => router.push(`/presentation/${test.slug || test.id}`)}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r ${gradient} text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition-all group-hover:shadow-md cursor-pointer`}
                                    >
                                        <Play className="w-3.5 h-3.5 fill-white" />
                                        Present
                                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-80 group-hover:translate-x-0.5 transition-transform" />
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

