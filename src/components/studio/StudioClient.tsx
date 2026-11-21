'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import StudioSidebar, { getStudioSection, type StudioSection } from './StudioSidebar';
import StudioStats from './StudioStats';
import StudioSettingsCard from './StudioSettingsCard';
import StudioCardGrid from './StudioCardGrid';
import StudioPlayer from './player/StudioPlayer';
import type { StudioTest } from './player/types';
import {
    STUDIO_THEMES,
    STUDIO_RECORDING_QUALITIES,
    getStudioQuestionCount,
    getStudioTaxonomyTitle,
    type StudioBgTheme,
    type StudioRecordingQuality,
} from '@/lib/studio';
import { toBn } from '@/lib/wb-board';

const THEME_KEY = 'deshexam-studio-theme';
const RECORDING_KEY = 'deshexam-studio-recording';

const TYPE_LABEL: Record<string, string> = {
    'Mock Test': 'মক টেস্ট',
    Quiz: 'কুইজ',
    'Practice Set': 'প্র্যাকটিস সেট',
};

/**
 * Studio dashboard — a small composer only.
 * Sidebar, stats, settings and cards each live in their own file;
 * presenting opens the studio's OWN player (player/StudioPlayer),
 * never the main PresentationOverlay.
 */
export default function StudioClient({ assessments }: { assessments: any[] }) {
    const [section, setSection] = useState<StudioSection>('presentations');
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [theme, setTheme] = useState<StudioBgTheme>('grid');
    const [recording, setRecording] = useState<StudioRecordingQuality>('high');
    const [active, setActive] = useState<{ test: StudioTest; questions: any[] } | null>(null);
    const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);

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

    const taxonomyLine = (test: any, fields: string[]) =>
        fields
            .map((f) => getStudioTaxonomyTitle(test[f], test.language) || test[f])
            .filter(Boolean)
            .join(' • ');

    const toStudioTest = (test: any): StudioTest => ({
        title: test.title,
        slug: test.slug || test.id,
        type: test.type || 'Mock Test',
        classLine: taxonomyLine(test, ['boardId', 'classId', 'subjectId']),
        topicLine: taxonomyLine(test, ['textbookId', 'chapterId', 'topicId']),
        language: test.language,
        durationMin: test.durationMin ?? test.timeLimitMin ?? undefined,
        totalMarks: test.totalMarks ?? undefined,
        negativeMarking: test.negativeMarking ?? undefined,
    });

    const handlePresent = async (test: any) => {
        const studioTest = toStudioTest(test);
        if (test.questions && test.questions.length > 0) {
            setActive({ test: studioTest, questions: test.questions });
            return;
        }
        if (test.questionIds && test.questionIds.length > 0) {
            setIsLoadingPlayer(true);
            try {
                const { getQuestionsByIds } = await import('@/lib/firebase/question-bank');
                const questions = await getQuestionsByIds(test.questionIds);
                setActive({ test: studioTest, questions });
            } catch (e) {
                console.error('Failed to load questions', e);
            } finally {
                setIsLoadingPlayer(false);
            }
        }
    };

    const activeSection = getStudioSection(section);

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <StudioSidebar section={section} onSelect={setSection} />

            <div className="min-w-0 flex-1">
                {section === 'presentations' ? (
                    <div className="flex flex-col gap-5">
                        <StudioStats totalPresentations={assessments.length} totalQuestions={totalQuestions} />
                        <StudioSettingsCard theme={theme} recording={recording} onTheme={saveTheme} onRecording={saveRecording} />

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

                        <StudioCardGrid tests={filtered} loading={isLoadingPlayer} onPresent={handlePresent} />
                    </div>
                ) : (
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

            {active && (
                <StudioPlayer
                    questions={active.questions}
                    test={active.test}
                    theme={theme}
                    onClose={() => setActive(null)}
                />
            )}
        </div>
    );
}
