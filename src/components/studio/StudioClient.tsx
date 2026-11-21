'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    LayoutGrid,
    Palette,
    Mic,
    Video,
    Play,
    Search,
    Clock,
    FileText,
    ChevronRight,
    Eye,
    Settings2,
} from 'lucide-react';
import PresentationOverlay from '@/components/assessment/PresentationOverlay';
import {
    STUDIO_THEMES,
    STUDIO_RECORDING_QUALITIES,
    getStudioQuestionCount,
    getStudioTaxonomyTitle,
    type StudioBgTheme,
    type StudioRecordingQuality,
} from '@/lib/studio';
import { toBn } from '@/lib/wb-board';

type Section = 'presentations' | 'templates' | 'voices' | 'recordings';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; ready: boolean; blurb: string }[] = [
    { id: 'presentations', label: 'প্রেজেন্টেশন', icon: <LayoutGrid className="h-5 w-5" />, ready: true, blurb: '' },
    { id: 'templates', label: 'টেমপ্লেট', icon: <Palette className="h-5 w-5" />, ready: false, blurb: 'প্রেজেন্টেশনের থিম ও লেআউট টেমপ্লেট এখানে থাকবে — লঞ্চ, প্রশ্ন ও রেজাল্ট স্ক্রিনের তৈরি ডিজাইন।' },
    { id: 'voices', label: 'ভয়েস', icon: <Mic className="h-5 w-5" />, ready: false, blurb: 'ন্যারেশন ও প্রশ্ন পড়ার ভয়েস এখান থেকে বাছা যাবে — বাংলা পুরুষ/মহিলা কণ্ঠ, গতি ও স্বর।' },
    { id: 'recordings', label: 'রেকর্ডিং', icon: <Video className="h-5 w-5" />, ready: false, blurb: 'আগের রেকর্ড করা প্রেজেন্টেশনগুলো এখানে জমা থাকবে — দেখা, ডাউনলোড ও শেয়ার করা যাবে।' },
];

const TYPE_LABEL: Record<string, string> = {
    'Mock Test': 'মক টেস্ট',
    Quiz: 'কুইজ',
    'Practice Set': 'প্র্যাকটিস সেট',
};

const TYPE_STYLE: Record<string, string> = {
    'Mock Test': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Quiz: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    'Practice Set': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const THEME_KEY = 'deshexam-studio-theme';
const RECORDING_KEY = 'deshexam-studio-recording';

export default function StudioClient({ assessments }: { assessments: any[] }) {
    const [section, setSection] = useState<Section>('presentations');
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [theme, setTheme] = useState<StudioBgTheme>('grid');
    const [recording, setRecording] = useState<StudioRecordingQuality>('high');
    const [activeTest, setActiveTest] = useState<any>(null);
    const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

    // Restore the studio's own settings (theme + recording quality).
    useEffect(() => {
        try {
            const t = window.localStorage.getItem(THEME_KEY);
            if (t && STUDIO_THEMES.some((x) => x.id === t)) setTheme(t as StudioBgTheme);
            const r = window.localStorage.getItem(RECORDING_KEY);
            if (r && STUDIO_RECORDING_QUALITIES.some((x) => x.id === r)) setRecording(r as StudioRecordingQuality);
        } catch {
            // Private mode etc. — defaults stay.
        }
    }, []);

    const saveTheme = (t: StudioBgTheme) => {
        setTheme(t);
        try { window.localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
    };
    const saveRecording = (r: StudioRecordingQuality) => {
        setRecording(r);
        try { window.localStorage.setItem(RECORDING_KEY, r); } catch { /* ignore */ }
    };

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = { all: assessments.length, 'Mock Test': 0, Quiz: 0, 'Practice Set': 0 };
        for (const a of assessments) {
            const t = a.type || 'Mock Test';
            counts[t] = (counts[t] || 0) + 1;
        }
        return counts;
    }, [assessments]);

    const totalQuestions = useMemo(
        () => assessments.reduce((acc, t) => acc + getStudioQuestionCount(t), 0),
        [assessments],
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return assessments.filter((t) => {
            const matchesSearch =
                !q ||
                (t.title || '').toLowerCase().includes(q) ||
                (t.subjectId || '').toLowerCase().includes(q) ||
                (t.chapter || '').toLowerCase().includes(q);
            const matchesType = selectedType === 'all' || (t.type || 'Mock Test') === selectedType;
            return matchesSearch && matchesType;
        });
    }, [assessments, search, selectedType]);

    const handlePresent = async (test: any) => {
        if (test.questions && test.questions.length > 0) {
            setActiveTest(test);
            return;
        }
        if (test.questionIds && test.questionIds.length > 0) {
            setIsLoadingOverlay(true);
            try {
                const { getQuestionsByIds } = await import('@/lib/firebase/question-bank');
                const questions = await getQuestionsByIds(test.questionIds);
                setActiveTest({ ...test, questions });
            } catch (e) {
                console.error('Failed to load questions', e);
            } finally {
                setIsLoadingOverlay(false);
            }
        }
    };

    const taxonomyLine = (test: any, fields: string[]) => {
        return fields
            .map((f) => getStudioTaxonomyTitle(test[f], test.language) || test[f])
            .filter(Boolean)
            .join(' • ');
    };

    const activeSection = SECTIONS.find((s) => s.id === section)!;

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* ── Sidebar ── */}
            <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-60">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="px-2 pb-3 pt-2">
                        <h1 className="text-2xl font-black text-white">
                            🎬 DeshExam <span className="text-amber-300">Studio</span>
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            প্রেজেন্টেশন স্টুডিও — সাজান, থিম বাছুন, প্রেজেন্ট করুন।
                        </p>
                    </div>
                    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                        {SECTIONS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSection(s.id)}
                                className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-bold transition-colors ${
                                    section === s.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                                }`}
                            >
                                {s.icon}
                                <span className="flex-1">{s.label}</span>
                                {!s.ready && (
                                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300">
                                        শীঘ্রই
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="min-w-0 flex-1">
                {section === 'presentations' ? (
                    <div className="flex flex-col gap-5">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center sm:p-5">
                                <p className="text-3xl font-black text-blue-400 sm:text-4xl">{toBn(assessments.length)}</p>
                                <p className="mt-1 text-sm font-semibold text-slate-400">মোট প্রেজেন্টেশন</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center sm:p-5">
                                <p className="text-3xl font-black text-violet-400 sm:text-4xl">{toBn(totalQuestions)}</p>
                                <p className="mt-1 text-sm font-semibold text-slate-400">মোট প্রশ্ন</p>
                            </div>
                        </div>

                        {/* Studio settings — real, applied when presenting from here */}
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                            <h2 className="flex items-center gap-2 text-lg font-black text-white">
                                <Settings2 className="h-5 w-5 text-blue-400" />
                                স্টুডিও সেটিংস
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                এই সেটিংস শুধু স্টুডিও থেকে Present করলে প্রযোজ্য হবে — মনে রাখা থাকবে।
                            </p>
                            <div className="mt-4">
                                <p className="text-sm font-bold text-slate-300">থিম</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {STUDIO_THEMES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => saveTheme(t.id)}
                                            aria-pressed={theme === t.id}
                                            className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                                                theme === t.id
                                                    ? 'border-blue-400 bg-blue-600 text-white'
                                                    : 'border-white/15 bg-white/[0.04] text-slate-300 hover:border-white/30 hover:text-white'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-bold text-slate-300">রেকর্ডিং কোয়ালিটি</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {STUDIO_RECORDING_QUALITIES.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => saveRecording(r.id)}
                                            aria-pressed={recording === r.id}
                                            className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                                                recording === r.id
                                                    ? 'border-blue-400 bg-blue-600 text-white'
                                                    : 'border-white/15 bg-white/[0.04] text-slate-300 hover:border-white/30 hover:text-white'
                                            }`}
                                        >
                                            {r.label} <span className="font-semibold opacity-70">({r.hint})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Search + type filter */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="প্রেজেন্টেশন খুঁজুন…"
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-base text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'Mock Test', 'Quiz', 'Practice Set'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedType(t)}
                                        className={`rounded-full border px-3 py-2 text-sm font-bold transition-colors ${
                                            selectedType === t
                                                ? 'border-blue-400 bg-blue-600 text-white'
                                                : 'border-white/15 bg-white/[0.04] text-slate-300 hover:border-white/30 hover:text-white'
                                        }`}
                                    >
                                        {t === 'all' ? `সব (${toBn(typeCounts.all)})` : `${TYPE_LABEL[t]} (${toBn(typeCounts[t] || 0)})`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cards */}
                        {filtered.length === 0 ? (
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
                                <p className="text-xl font-black text-white">কোনো প্রেজেন্টেশন পাওয়া যায়নি।</p>
                                <p className="mt-2 text-slate-400">অন্য কিছু লিখে খুঁজুন, বা ফিল্টার বদলান।</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {filtered.map((test) => {
                                    const slug = test.slug || test.id;
                                    const qCount = getStudioQuestionCount(test);
                                    const duration = test.durationMin ?? test.timeLimitMin ?? null;
                                    return (
                                        <div
                                            key={slug}
                                            className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-sm transition-colors hover:border-white/25"
                                        >
                                            <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${TYPE_STYLE[test.type || 'Mock Test'] || TYPE_STYLE['Mock Test']}`}>
                                                {TYPE_LABEL[test.type || 'Mock Test'] || test.type}
                                            </span>
                                            <h3 className="mt-3 line-clamp-2 min-h-[3.25rem] text-lg font-black leading-snug text-white">
                                                {test.title}
                                            </h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-slate-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <FileText className="h-4 w-4" />
                                                    {toBn(qCount)}টি প্রশ্ন
                                                </span>
                                                {duration ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {toBn(duration)} মিনিট
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="mt-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => handlePresent(test)}
                                                    disabled={isLoadingOverlay}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-base font-black text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    {isLoadingOverlay ? 'লোড হচ্ছে…' : 'Present'}
                                                </button>
                                                <Link
                                                    href={`/presentation/${slug}`}
                                                    className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:border-white/30 hover:text-white"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    পেজে খুলুন
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Future sections — honest empty state, no fake content */
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
                        <p className="text-4xl">{activeSection.icon}</p>
                        <h2 className="mt-4 text-2xl font-black text-white">{activeSection.label}</h2>
                        <p className="mx-auto mt-2 max-w-md text-slate-400">{activeSection.blurb}</p>
                        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 text-sm font-bold text-amber-300">
                            শীঘ্রই আসছে
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => setSection('presentations')}
                                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                প্রেজেন্টেশনে ফিরে যান
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Player overlay ── */}
            {activeTest && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900">
                    <PresentationOverlay
                        questions={activeTest.questions}
                        classLine={activeTest.title}
                        chapterName={taxonomyLine(activeTest, ['boardId', 'classId', 'subjectId'])}
                        topicName={taxonomyLine(activeTest, ['textbookId', 'chapterId', 'topicId'])}
                        testLanguage={activeTest.language}
                        autoStart={true}
                        onClose={() => setActiveTest(null)}
                        durationMin={activeTest.durationMin}
                        totalMarks={activeTest.totalMarks}
                        negativeMarking={activeTest.negativeMarking}
                        typeLabel={activeTest.type || 'Mock Test'}
                        initialBgTheme={theme}
                        initialRecordingQuality={recording}
                    />
                </div>
            )}
        </div>
    );
}
