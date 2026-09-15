'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Play, BookOpen, Clock, Award, ChevronRight, Search, Layers, CheckCircle2, Eye, Printer, FileEdit, Users, Target, Unlock, Lock } from 'lucide-react';
import PresentationOverlay from '@/components/assessment/PresentationOverlay';
import { getHardcodedTaxonomyNodes } from '@/data/hardcoded/taxonomy';

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
    textbookId?: string;
    chapter?: string;
    chapterId?: string;
    topic?: string;
    topicId?: string;
    subjectId?: string;
    boardId?: string;
    difficulty?: string;
    durationMin?: number;
    totalMarks?: number;
    language?: string;
    thumbnail?: string;
    tags?: string[];
    description?: string;
    accessType?: string;
    attemptCount?: number;
    averageScore?: number;
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

    // Resolve taxonomy node titles once
    const taxonomyNodes = useMemo(() => getHardcodedTaxonomyNodes(), []);
    const getTaxonomyTitle = (id?: string, language?: string) => {
        if (!id) return null;
        if (/^[a-zA-Z0-9]{20}$/.test(id)) return null; // Ignore raw Firebase IDs

        const node = taxonomyNodes.find(n => n.id === id);
        let title = node ? node.title : id;

        if (language === 'Bengali') {
            const translations: Record<string, string> = {
                'Class 1': 'প্রথম শ্রেণি',
                'Class 2': 'দ্বিতীয় শ্রেণি',
                'Class 3': 'তৃতীয় শ্রেণি',
                'Class 4': 'চতুর্থ শ্রেণি',
                'Class 5': 'পঞ্চম শ্রেণি',
                'Class 6': 'ষষ্ঠ শ্রেণি',
                'Class 7': 'সপ্তম শ্রেণি',
                'Class 8': 'অষ্টম শ্রেণি',
                'Class 9': 'নবম শ্রেণি',
                'Class 10': 'দশম শ্রেণি',
                'Class 11': 'একাদশ শ্রেণি',
                'Class 12': 'দ্বাদশ শ্রেণি',
                'Bengali Literature': 'বাংলা',
                'Bengali': 'বাংলা',
                'English': 'ইংরেজি',
                'Mathematics': 'গণিত',
                'Environmental Science': 'পরিবেশ বিজ্ঞান',
                'Life Science': 'জীবন বিজ্ঞান',
                'Physical Science': 'ভৌত বিজ্ঞান',
                'History': 'ইতিহাস',
                'Geography': 'ভূগোল',
                'WBBSE': 'WBBSE',
                'WBBPE': 'WBBPE',
                'WBCHSE': 'WBCHSE',
                'Sahaj Path': 'সহজ পাঠ',
                'Sahaj Path Pratham Bhag': 'সহজ পাঠ প্রথম ভাগ',
                'Sahaj Path Dwitiyo Bhag': 'সহজ পাঠ দ্বিতীয় ভাগ',
                'Amar Ganit': 'আমার গণিত',
                'Amader Paribesh': 'আমাদের পরিবেশ',
                'Bhasha Path': 'ভাষা পাঠ',
                'Sahityamela': 'সাহিত্যমেলা',
                'Pata Bahar': 'পাতাবাহার'
            };
            if (translations[title]) {
                title = translations[title];
            }
        }

        return title;
    };

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

    const [previewTest, setPreviewTest] = useState<any>(null);
    const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

    const handleQuickView = async (test: Assessment) => {
        if (test.questions && test.questions.length > 0) {
            setPreviewTest(test);
            return;
        }
        if (test.questionIds && test.questionIds.length > 0) {
            setIsLoadingOverlay(true);
            try {
                const { getQuestionsByIds } = await import('@/lib/firebase/question-bank');
                const questions = await getQuestionsByIds(test.questionIds);
                setPreviewTest({ ...test, questions });
            } catch (e) {
                console.error('Failed to load questions', e);
            } finally {
                setIsLoadingOverlay(false);
            }
        }
    };

    const handlePrintRedirect = async (test: Assessment) => {
        let printQuestions = test.questions || [];
        if (printQuestions.length === 0 && test.questionIds && test.questionIds.length > 0) {
            setIsLoadingOverlay(true);
            try {
                const { getQuestionsByIds } = await import('@/lib/firebase/question-bank');
                printQuestions = await getQuestionsByIds(test.questionIds);
            } catch (e) {
                console.error('Failed to load questions for printing', e);
            } finally {
                setIsLoadingOverlay(false);
            }
        }

        if (printQuestions.length > 0) {
            localStorage.setItem('deshexam_print_test', JSON.stringify({
                title: test.title,
                classId: test.classId,
                subjectId: test.subjectId,
                questions: printQuestions
            }));
            window.open('/e-question-builder/create-question?load_print_test=1', '_blank');
        } else {
            alert('No questions found to print.');
        }
    };

    return (
        <div className="w-full relative">
            {/* Loading Overlay */}
            {isLoadingOverlay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center gap-3 shadow-2xl">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Loading questions...</p>
                    </div>
                </div>
            )}

            {/* Quick View Modal */}
            {previewTest && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900">
                    <PresentationOverlay
                        questions={previewTest.questions}
                        classLine={previewTest.title}
                        chapterName={[
                            getTaxonomyTitle(previewTest.boardId) || previewTest.boardId,
                            getTaxonomyTitle(previewTest.classId) || previewTest.classId,
                            getTaxonomyTitle(previewTest.subjectId) || previewTest.subjectId
                        ].filter(Boolean).join(' • ')}
                        topicName={[
                            getTaxonomyTitle(previewTest.textbookId) || previewTest.textbookId,
                            previewTest.chapter || getTaxonomyTitle(previewTest.chapterId) || previewTest.chapterId,
                            previewTest.topic || getTaxonomyTitle(previewTest.topicId) || previewTest.topicId
                        ].filter(Boolean).join(' • ')}
                        autoStart={true}
                        onClose={() => setPreviewTest(null)}
                    />
                </div>
            )}

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
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedType === tab.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedType === tab.id
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
                    {filtered.map((test, index) => {
                        const CARD_GRADIENTS = [
                            'from-indigo-500 to-violet-600',
                            'from-emerald-500 to-teal-600',
                            'from-amber-500 to-orange-600',
                            'from-rose-500 to-pink-600',
                            'from-cyan-500 to-blue-600'
                        ];
                        const gradient = CARD_GRADIENTS[index % 5];
                        const difficulty = test.difficulty || 'Easy';
                        const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES['Easy'];
                        const qCount = getQuestionCount(test);

                        const boardTitle = getTaxonomyTitle(test.boardId, test.language);
                        const classTitle = getTaxonomyTitle(test.classId, test.language);
                        const subjectTitle = getTaxonomyTitle(test.subjectId, test.language);
                        const textbookTitle = getTaxonomyTitle(test.textbookId, test.language);
                        const chapterTitle = test.chapter || getTaxonomyTitle(test.chapterId, test.language);
                        const topicTitle = test.topic || getTaxonomyTitle(test.topicId, test.language);

                        const line1 = [subjectTitle, textbookTitle].filter(Boolean).join(' • ');
                        const line2 = [chapterTitle, topicTitle].filter(Boolean).join(' • ');

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
                                        <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r ${gradient} text-white shrink-0`}>
                                                {test.type || 'Mock Test'}
                                            </span>
                                            {boardTitle && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${CARD_GRADIENTS[(index + 1) % 5]} text-white shrink-0 opacity-95`}>
                                                    {boardTitle}
                                                </span>
                                            )}
                                            {classTitle && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${CARD_GRADIENTS[(index + 2) % 5]} text-white shrink-0 opacity-95`}>
                                                    {classTitle}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${diffStyle}`}>
                                            {difficulty}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {test.title}
                                    </h3>

                                    {/* Subject / Textbook / Chapter / Topic */}
                                    {(line1 || line2) && (
                                        <div className="mb-3 mt-1.5">
                                            {line1 && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1">{line1}</p>}
                                            {line2 && <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 font-medium mt-0.5">{line2}</p>}
                                        </div>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-1 mt-auto pt-2 mb-4 border-t border-gray-50 dark:border-gray-700/50 flex-wrap">
                                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
                                            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                            {qCount} Qs
                                        </span>
                                        {test.durationMin ? (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                {test.durationMin}m
                                            </span>
                                        ) : null}
                                        {test.totalMarks ? (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
                                                <Award className="w-3.5 h-3.5 text-emerald-500" />
                                                {test.totalMarks}
                                            </span>
                                        ) : null}
                                        {test.attemptCount !== undefined ? (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
                                                <Users className="w-3.5 h-3.5 text-sky-500" />
                                                {test.attemptCount >= 1000 ? (test.attemptCount / 1000).toFixed(1) + 'k' : test.attemptCount}
                                            </span>
                                        ) : null}
                                        {test.averageScore !== undefined ? (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
                                                <Target className="w-3.5 h-3.5 text-rose-500" />
                                                {test.averageScore}%
                                            </span>
                                        ) : null}
                                        {test.accessType ? (
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0 capitalize">
                                                {test.accessType === 'free' ? <Unlock className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
                                                {test.accessType}
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <button
                                            onClick={() => router.push(`/presentation/${test.slug || test.id}`)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r ${gradient} text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition-all group-hover:shadow-md cursor-pointer`}
                                        >
                                            <Play className="w-3.5 h-3.5 fill-white" />
                                            Present
                                        </button>
                                        <a
                                            href={`/${(test.type || 'mock-test').toLowerCase().replace(' set', '').replace(/\s+/g, '-')}/${test.slug || test.id}/take`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer shrink-0 inline-flex border border-indigo-100 dark:border-indigo-500/20"
                                            title="Take Exam in new tab"
                                        >
                                            <FileEdit className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => handleQuickView(test)}
                                            className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors cursor-pointer shrink-0"
                                            title="Quick View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handlePrintRedirect(test)}
                                            className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors cursor-pointer shrink-0"
                                            title="Print Questions"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

