"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Clock,
  Maximize,
  Minimize,
  Music,
  NotebookPen,
  RotateCcw,
  Settings,
  X,
} from "lucide-react";
import { toBn } from "@/lib/wb-board";
import {
  STUDIO_RECORDING_QUALITIES,
  STUDIO_THEMES,
  type StudioBgTheme,
  type StudioRecordingQuality,
} from "@/lib/studio";
import { normalizeOptions, isCorrectOption, optionLetter } from "./questions";
import { formatStudioTime } from "./useStudioPlayer";
import QuestionPalette from "./QuestionPalette";
import StudioClock from "./StudioClock";
import { useStudioMusic } from "./useStudioMusic";
import { downloadQuestionShot } from "./questionShot";
import type { StudioTest } from "./types";

/**
 * Sample leaderboard + chat, taken from the reference design.
 * They are placeholders in the UI until the real leaderboard and a
 * chat backend are wired in — the panels say so in small print.
 */
const SAMPLE_SCORERS = [
  { name: "Riya Mondal", pct: 98 },
  { name: "Rahul Das", pct: 96 },
  { name: "Akash Roy", pct: 95 },
];
const SAMPLE_CHAT = [
  { name: "Sumon Roy", text: "দারুণ হচ্ছে!" },
  { name: "Priya Sarkar", text: "খুব ভালো লাগছে স্যার ❤️" },
  { name: "Debashis Paul", text: "Next question please!" },
  { name: "Mousumi Dutta", text: "Best platform for exam 🙏" },
];
const RANK_STYLE = [
  "bg-amber-400 text-slate-900",
  "bg-slate-300 text-slate-900",
  "bg-orange-400 text-white",
];

const NAVY_PANEL = "rounded-2xl border border-white/10 bg-[#0a1a3a]/90 shadow-xl";
const TOOL_BTN =
  "inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-sm font-black text-white transition-colors hover:bg-white/10 active:scale-95";

/** Countdown always as HH:MM:SS, like the reference timer. */
function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * The studio question dashboard — same layout as the reference:
 * navy header (logo + title + gold countdown), left rail (top
 * scorers, live chat, live clock, subscribe), centre (question
 * pills, question card with emblem/parliament art, 2-column
 * options, explanation with the constitution book), right rail
 * (question palette + progress, presenter frame), and the bottom
 * toolbar (next, retry, fullscreen, screenshot, notes, settings,
 * music, site link). All numbers, the timer and the marks come
 * from the live test data; only the scorers/chat/presenter still
 * are samples from the reference.
 */
export default function QuestionSlide({
  question,
  index,
  total,
  selected,
  recordedKey,
  dark,
  elapsed,
  correctCount,
  wrongCount,
  test,
  answers,
  onPick,
  onNext,
  onJump,
  onRetry,
  theme,
  recordingQuality,
  onThemeChange,
  onRecordingQualityChange,
  isRecording,
  recording,
}: {
  question: any;
  index: number;
  total: number;
  selected: string | null;
  recordedKey: string | null;
  dark: boolean;
  elapsed: number;
  correctCount: number;
  wrongCount: number;
  test: StudioTest;
  answers: Record<number, { key: string; correct: boolean }>;
  onPick: (key: string, isCorrect: boolean) => void;
  onNext: () => void;
  onJump: (i: number) => void;
  onRetry: () => void;
  theme: StudioBgTheme;
  recordingQuality: StudioRecordingQuality;
  onThemeChange?: (t: StudioBgTheme) => void;
  onRecordingQualityChange?: (q: StudioRecordingQuality) => void;
  isRecording?: boolean;
  recording?: ReactNode;
}) {
  const opts = normalizeOptions(question);
  const revealed = selected !== null || recordedKey !== null;
  const activeKey = selected ?? recordedKey;
  const answeredCount = Object.keys(answers).length;

  const marksPerQ =
    test.totalMarks && total > 0 && test.totalMarks % total === 0
      ? test.totalMarks / total
      : null;

  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  const toggleFs = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  const music = useStudioMusic();

  const [notesOpen, setNotesOpen] = useState(false);
  const noteKey = `deshexam-studio-note-${test.slug}-${index}`;
  const [note, setNote] = useState("");
  useEffect(() => {
    try {
      setNote(window.localStorage.getItem(noteKey) ?? "");
    } catch {
      setNote("");
    }
  }, [noteKey]);
  const saveNote = (v: string) => {
    setNote(v);
    try {
      window.localStorage.setItem(noteKey, v);
    } catch {
      /* ignore */
    }
  };

  const [chat, setChat] = useState(SAMPLE_CHAT);
  const [chatDraft, setChatDraft] = useState("");
  const sendChat = (e: FormEvent) => {
    e.preventDefault();
    const text = chatDraft.trim();
    if (!text) return;
    setChat((c) => [...c, { name: "আপনি", text }]);
    setChatDraft("");
  };

  const [settingsOpen, setSettingsOpen] = useState(false);

  const doShot = () => {
    downloadQuestionShot({
      testTitle: test.title,
      questionNo: index + 1,
      total,
      questionText: String(question?.questionText ?? ""),
      options: opts.map((opt, oIdx) => ({
        letter: optionLetter(oIdx, opt.key),
        text: opt.text,
        correct: isCorrectOption(question, opt.key),
        picked: activeKey === opt.key,
      })),
      revealed,
    });
  };

  const chromePill = dark
    ? "border-white/10 bg-white/10 text-white"
    : "border-gray-200 bg-white text-slate-700 shadow-sm";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1600px] flex-col px-3 py-3 sm:px-4">
      {/* ── Header bar ── pr-14 clears the absolute close (X) button */}
      <header
        className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-amber-400/30 px-4 py-2.5 pr-14 shadow-xl"
        style={{ background: "linear-gradient(90deg,#0a2257,#071535)" }}
      >
        <span className="flex items-center gap-2">
          <img src="/launch/logo.png" alt="DeshExam" className="h-9 w-auto" />
          <span className="leading-none">
            <span className="block text-xl font-black text-white">
              Desh<span className="text-amber-400">Exam</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-bold tracking-widest text-slate-300">
              LEARN • PRACTICE • SUCCEED
            </span>
          </span>
        </span>
        <span className="hidden h-10 w-px bg-white/15 sm:block" />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <BookOpen className="h-6 w-6 shrink-0 text-amber-400" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-black text-white sm:text-lg">
              {test.title}
            </span>
            {test.topicLine ? (
              <span className="block truncate text-xs font-bold text-slate-300">
                অধ্যায় : {test.topicLine}
              </span>
            ) : null}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2 text-sm font-black text-slate-900 shadow-lg sm:text-base">
          <Clock className="h-5 w-5" />
          {test.durationMin
            ? `সময় বাকি ${toBn(formatCountdown(test.durationMin * 60 - elapsed))}`
            : toBn(formatStudioTime(elapsed))}
        </span>
      </header>

      {/* ── Dashboard grid ── */}
      <div className="grid flex-1 gap-3 lg:grid-cols-[230px_minmax(0,1fr)_280px]">
        {/* LEFT RAIL */}
        <aside className="order-2 flex flex-col gap-3 lg:order-1">
          <section className={`${NAVY_PANEL} p-3`}>
            <h3 className="flex items-center gap-2 text-sm font-black text-amber-300">
              🏆 TOP SCORERS
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {SAMPLE_SCORERS.map((s, i) => (
                <li
                  key={s.name}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${RANK_STYLE[i]}`}
                  >
                    {toBn(i + 1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">
                    {s.name}
                  </span>
                  <span className="text-sm font-black text-amber-300">
                    {toBn(s.pct)}%
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              নমুনা তালিকা — আসল লিডারবোর্ড পরে যুক্ত হবে।
            </p>
          </section>

          <section className={`${NAVY_PANEL} p-3`}>
            <h3 className="flex items-center gap-2 text-sm font-black text-white">
              💬
              <span className="h-2 w-2 rounded-full bg-red-500" />
              LIVE CHAT
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              {chat.map((m, i) => (
                <li key={i} className="text-[13px] leading-snug text-slate-200">
                  <span className="font-black text-amber-300">{m.name}: </span>
                  {m.text}
                </li>
              ))}
            </ul>
            <form onSubmit={sendChat} className="mt-2 flex gap-1.5">
              <input
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                placeholder="মেসেজ লিখুন…"
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="মেসেজ পাঠান"
                className="rounded-full bg-amber-400 px-3 py-1.5 text-sm font-black text-slate-900"
              >
                ➤
              </button>
            </form>
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              নমুনা চ্যাট — আপনার মেসেজ শুধু এই ডিভাইসে দেখাবে।
            </p>
          </section>

          <section
            className={`${NAVY_PANEL} flex flex-col items-center p-3`}
          >
            <StudioClock />
          </section>

          <span className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 font-black text-white shadow-lg">
            ▶ SUBSCRIBE 🔔
          </span>
        </aside>

        {/* CENTRE */}
        <main className="order-1 min-w-0 lg:order-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white shadow">
              প্রশ্ন {toBn(index + 1)} / {toBn(total)}
            </span>
            {marksPerQ !== null ? (
              <span className="rounded-full bg-green-600 px-4 py-2 text-sm font-black text-white shadow">
                ★ +{toBn(marksPerQ)} নম্বর
              </span>
            ) : null}
            {test.negativeMarking !== undefined &&
            test.negativeMarking !== null ? (
              <span
                className={`rounded-full px-4 py-2 text-sm font-black text-white shadow ${
                  test.negativeMarking > 0 ? "bg-red-600" : "bg-slate-500"
                }`}
              >
                {test.negativeMarking > 0
                  ? `−${toBn(test.negativeMarking)} নেগেটিভ`
                  : "নেগেটিভ নেই"}
              </span>
            ) : null}
            {test.difficulty ? (
              <span className="rounded-full bg-slate-500 px-4 py-2 text-sm font-black text-white shadow">
                📊 {test.difficulty}
              </span>
            ) : null}
            <span
              className={`ml-auto rounded-full border px-3 py-2 text-sm font-black ${chromePill}`}
            >
              ✓ {toBn(correctCount)} | ✗ {toBn(wrongCount)}
            </span>
          </div>

          {/* Question card */}
          <div className="relative overflow-hidden rounded-3xl border-t-4 border-amber-400 bg-white p-5 shadow-xl sm:p-7">
            <img
              src="/studio/emblem.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -left-4 bottom-0 h-40 w-auto opacity-15 mix-blend-multiply sm:h-52"
            />
            <img
              src="/studio/parliament.jpg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-6 bottom-0 h-40 w-auto rounded-2xl opacity-20 sm:h-52"
            />
            <p className="relative text-xl font-black leading-relaxed text-slate-900 sm:text-2xl">
              {question?.questionText}
            </p>
          </div>

          {/* Options — 2 columns on desktop */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {opts.map((opt, oIdx) => {
              const correct = isCorrectOption(question, opt.key);
              const isActive = activeKey === opt.key;
              let rowClass =
                "border-gray-200 bg-white text-slate-800 shadow-sm";
              let letterClass = "bg-[#0f2447] text-white";
              let mark = null;
              if (revealed) {
                if (correct) {
                  rowClass =
                    "border-[#34A853] bg-[#f0fdf4] text-slate-900 ring-2 ring-[#34A853]/40";
                  letterClass = "bg-[#34A853] text-white";
                  mark = <Check className="h-5 w-5 shrink-0 text-[#34A853]" />;
                } else if (isActive) {
                  rowClass =
                    "border-[#EA4335] bg-[#fce8e6] text-slate-900 ring-2 ring-[#EA4335]/40";
                  letterClass = "bg-[#EA4335] text-white";
                  mark = <X className="h-5 w-5 shrink-0 text-[#EA4335]" />;
                }
              }
              return (
                <button
                  key={opt.key}
                  disabled={revealed}
                  onClick={() => onPick(opt.key, correct)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-150 ${rowClass} ${
                    revealed ? "" : "hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black ${letterClass}`}
                  >
                    {optionLetter(oIdx, opt.key)}
                  </span>
                  <span className="flex-1 text-base font-bold leading-snug sm:text-lg">
                    {opt.text}
                  </span>
                  {mark}
                </button>
              );
            })}
          </div>

          {/* Explanation — only when the question really has one */}
          {revealed &&
          typeof question?.explanation === "string" &&
          question.explanation.trim() ? (
            <div className="mt-4 flex gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-amber-800">💡 ব্যাখ্যা</p>
                <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-700">
                  {question.explanation}
                </p>
              </div>
              <img
                src="/studio/constitution-book.jpg"
                alt="ভারতের সংবিধান"
                className="hidden h-28 w-auto shrink-0 rounded-xl object-cover sm:block"
              />
            </div>
          ) : null}

          {/* Notes panel */}
          {notesOpen ? (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-black text-blue-800">
                ✎ নোট — প্রশ্ন {toBn(index + 1)}
              </p>
              <textarea
                value={note}
                onChange={(e) => saveNote(e.target.value)}
                rows={3}
                placeholder="এই প্রশ্নের নোট লিখুন…"
                className="mt-2 w-full rounded-xl border border-blue-200 bg-white p-3 text-sm font-semibold text-slate-700 focus:outline-none"
              />
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                নোট এই ডিভাইসে সংরক্ষিত থাকে।
              </p>
            </div>
          ) : null}
        </main>

        {/* RIGHT RAIL */}
        <aside className="order-3 flex flex-col gap-3">
          <div className={`${NAVY_PANEL} p-3`}>
            <QuestionPalette
              total={total}
              index={index}
              answers={answers}
              onJump={onJump}
              dark
            />
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-300">
                <span>মোট প্রশ্ন: {toBn(total)}</span>
                <span className="text-amber-300">
                  {toBn(answeredCount)}/{toBn(total)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width: `${total > 0 ? (answeredCount / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <img
              src="/studio/presenter.jpg"
              alt="প্রেজেন্টার"
              className="h-44 w-full object-cover lg:h-52"
            />
            <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-black text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              LIVE
            </span>
            <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-[11px] font-bold text-white/90">
              প্রেজেন্টার ভিডিও — নমুনা ছবি
            </p>
          </div>
        </aside>
      </div>

      {/* ── Bottom toolbar (sticky) ── */}
      <div className="sticky bottom-0 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0a1a3a]/95 px-3 py-2.5 shadow-2xl backdrop-blur">
        <span className="mr-1 hidden items-center gap-2 text-sm font-black text-amber-300 xl:inline-flex">
          🎓 DeshExam Mock Test Studio
        </span>
        <button
          onClick={onNext}
          disabled={!revealed}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-2.5 font-black text-slate-900 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          {index + 1 >= total ? "ফলাফল দেখুন" : "▶ পরবর্তী প্রশ্ন"}
          {index + 1 < total ? (
            <ArrowRight className="h-4 w-4" />
          ) : null}
        </button>
        <button onClick={onRetry} className={TOOL_BTN}>
          <RotateCcw className="h-4 w-4" />
          পুনরায় চেষ্টা
        </button>
        <button
          onClick={toggleFs}
          aria-label={isFs ? "পূর্ণ পর্দা থেকে বের হোন" : "পূর্ণ পর্দা"}
          className={TOOL_BTN}
        >
          {isFs ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
          পূর্ণ পর্দা
        </button>
        <button onClick={doShot} className={TOOL_BTN}>
          <Camera className="h-4 w-4" />
          স্ক্রিনশট
        </button>
        <button
          onClick={() => setNotesOpen((v) => !v)}
          aria-pressed={notesOpen}
          className={`${TOOL_BTN} ${notesOpen ? "bg-amber-400 !text-slate-900" : ""}`}
        >
          <NotebookPen className="h-4 w-4" />
          নোট
        </button>
        <div className="relative">
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            aria-pressed={settingsOpen}
            className={TOOL_BTN}
          >
            <Settings className="h-4 w-4" />
            সেটিংস
          </button>
          {settingsOpen ? (
            <div className="absolute bottom-12 left-0 w-64 rounded-2xl border border-white/15 bg-[#0a1a3a] p-3 shadow-2xl">
              <label className="block text-xs font-black text-slate-300">
                থিম
              </label>
              <select
                value={theme}
                onChange={(e) =>
                  onThemeChange?.(e.target.value as StudioBgTheme)
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white focus:outline-none"
              >
                {STUDIO_THEMES.map((t) => (
                  <option key={t.id} value={t.id} className="text-slate-900">
                    {t.label}
                  </option>
                ))}
              </select>
              <label className="mt-3 block text-xs font-black text-slate-300">
                রেকর্ডিং গুণমান
              </label>
              <select
                value={recordingQuality}
                onChange={(e) =>
                  onRecordingQualityChange?.(
                    e.target.value as StudioRecordingQuality,
                  )
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white focus:outline-none"
              >
                {STUDIO_RECORDING_QUALITIES.map((q) => (
                  <option key={q.id} value={q.id} className="text-slate-900">
                    {q.label} — {q.hint}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] font-semibold text-slate-400">
                রেকর্ডিং গুণমান পরের রেকর্ডিং থেকে কার্যকর হবে।
              </p>
            </div>
          ) : null}
        </div>
        <button
          onClick={music.toggle}
          aria-pressed={music.playing}
          className={`${TOOL_BTN} ${music.playing ? "bg-amber-400 !text-slate-900" : ""}`}
        >
          <Music className="h-4 w-4" />
          সঙ্গীত{ music.playing ? " • চালু" : ""}
        </button>
        {isRecording ? recording : null}
        <a
          href="https://deshexam.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 px-3.5 py-2 text-sm font-black text-amber-300 transition-colors hover:bg-amber-400/10"
        >
          🌐 deshexam.vercel.app
        </a>
      </div>
    </div>
  );
}
