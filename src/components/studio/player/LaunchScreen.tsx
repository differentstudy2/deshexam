import { toBn } from "@/lib/wb-board";
import type { StudioTest } from "./types";

/**
 * Studio launch screen — the player's own first screen.
 * Same card style as the question slides (white card, blue accents),
 * live data only: rows render only when the value exists.
 */
export default function LaunchScreen({
  test,
  questionCount,
  onStart,
}: {
  test: StudioTest;
  questionCount: number;
  onStart: () => void;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "মোট প্রশ্ন", value: `${toBn(questionCount)}টি` },
  ];
  if (test.durationMin) {
    rows.push({ label: "সময়", value: `${toBn(test.durationMin)} মিনিট` });
  }
  if (test.negativeMarking !== undefined && test.negativeMarking !== null) {
    rows.push({
      label: "নেগেটিভ মার্কিং",
      value:
        test.negativeMarking === 0
          ? "নেই"
          : `−${toBn(test.negativeMarking)}`,
    });
  }
  if (test.totalMarks) {
    rows.push({ label: "মোট নম্বর", value: toBn(test.totalMarks) });
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-2xl sm:p-10">
        {test.type ? (
          <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white">
            {test.type === "Mock Test"
              ? "Mock Test"
              : test.type === "Quiz"
                ? "Quiz"
                : "Practice Set"}
          </span>
        ) : null}
        <h1 className="mt-4 text-2xl font-black leading-snug text-slate-900 sm:text-4xl">
          {test.title}
        </h1>
        {test.classLine ? (
          <h2 className="mt-2 text-base font-bold text-blue-600 sm:text-lg">
            {test.classLine}
          </h2>
        ) : null}
        {test.topicLine ? (
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {test.topicLine}
          </p>
        ) : null}
        <p className="mt-3 text-base text-slate-500">
          নিজেকে যাচাই করুন, এগিয়ে যান আরও দূরে...
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-slate-50 p-4 text-left">
          <p className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
            📋 পরীক্ষার তথ্য
          </p>
          <dl className="flex flex-col gap-2">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-sm font-semibold text-slate-500">
                  {r.label}
                </dt>
                <dd className="text-base font-black text-blue-700">
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          onClick={onStart}
          className="mt-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-lg font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          ▶ টেস্ট শুরু করো »
        </button>
      </div>
    </div>
  );
}
