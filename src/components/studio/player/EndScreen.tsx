import Link from "next/link";
import { toBn } from "@/lib/wb-board";
import type { StudioTest } from "./types";

/**
 * Studio result screen — dark navy + gold trophy look.
 * Live numbers only: counts, %, marks and tips all derive from the
 * run. No rank card — the studio player has no leaderboard.
 * The "বিষয়ভিত্তিক" label is not used: per-topic data does not exist,
 * the donut shows the real correct/wrong/skipped split.
 */
export default function EndScreen({
  correct,
  wrong,
  skipped,
  total,
  accuracy,
  totalMarks,
  test,
  onRetake,
  onClose,
}: {
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  accuracy: number;
  totalMarks?: number;
  test?: StudioTest;
  onRetake: () => void;
  // Closes the player back to the studio dashboard. A plain link to
  // /studio does nothing here — the player already runs on /studio.
  onClose?: () => void;
}) {
  const marks = totalMarks ?? total;
  const verdict =
    accuracy >= 80
      ? { title: "দারুণ করেছেন!", sub: "আপনি সত্যিই অসাধারণ!" }
      : accuracy >= 50
        ? { title: "ভালো করেছেন!", sub: "আরও একটু চেষ্টা করলেই সেরা হবে।" }
        : { title: "চেষ্টা চালিয়ে যান!", sub: "ভুলগুলো দেখে আবার চেষ্টা করুন।" };

  const tips: string[] = [];
  if (wrong > 0) tips.push("ভুলগুলো দেখে আবার চেষ্টা করুন।");
  if (skipped > 0) tips.push("এড়িয়ে যাওয়া প্রশ্নগুলো আবার চেষ্টা করুন।");
  if (accuracy >= 80) tips.push("পরের টেস্টের জন্য তৈরি থাকুন।");
  if (tips.length === 0) tips.push("সব প্রশ্নের উত্তর দিয়েছেন — দারুণ!");

  const pct = (n: number) =>
    total > 0 ? Math.round((n / total) * 100) : 0;

  const r = 54;
  const c = 2 * Math.PI * r;
  const done = c * (accuracy / 100);

  return (
    <div className="flex min-h-full items-center justify-center px-3 py-4 sm:px-6">
      <div
        className="w-full max-w-6xl rounded-3xl border border-amber-400/40 p-4 shadow-2xl sm:p-5"
        style={{
          background:
            "radial-gradient(ellipse at center, #0a2257 0%, #071535 70%)",
        }}
      >
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <img src="/launch/logo.png" alt="DeshExam" className="h-9 w-auto" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-base font-black text-white sm:text-lg">
              {test?.title ?? "মক টেস্ট"}
            </p>
            {test?.classLine ? (
              <p className="text-xs font-bold text-amber-400">
                {test.classLine}
              </p>
            ) : null}
          </div>
          <span className="inline-flex items-center rounded-full border border-amber-400/60 bg-amber-400/10 px-4 py-1.5 text-sm font-black text-amber-300">
            ✓ মক টেস্ট সম্পূর্ণ হলো
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Result panel */}
          <div className="rounded-3xl border border-amber-400/30 bg-white/5 p-5 shadow-xl">
            <h3 className="text-lg font-black text-amber-300">
              📊 আপনার ফলাফল
            </h3>
            <dl className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <dt className="font-semibold text-slate-300">সঠিক উত্তর</dt>
                <dd className="font-black text-white">
                  <span className="text-green-400">{toBn(correct)}</span>{" "}
                  <span className="text-sm font-bold text-slate-400">
                    ({toBn(pct(correct))}%)
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <dt className="font-semibold text-slate-300">ভুল উত্তর</dt>
                <dd className="font-black text-white">
                  <span className="text-red-400">{toBn(wrong)}</span>{" "}
                  <span className="text-sm font-bold text-slate-400">
                    ({toBn(pct(wrong))}%)
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <dt className="font-semibold text-slate-300">এড়িয়ে গেছেন</dt>
                <dd className="font-black text-white">
                  {toBn(skipped)}{" "}
                  <span className="text-sm font-bold text-slate-400">
                    ({toBn(pct(skipped))}%)
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <dt className="font-semibold text-slate-300">মোট নম্বর</dt>
                <dd className="font-black text-amber-300">
                  {toBn(correct)} / {toBn(marks)}
                </dd>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <dt className="font-semibold text-slate-300">
                    সঠিকতার হার
                  </dt>
                  <dd className="font-black text-amber-300">
                    {toBn(accuracy)}%
                  </dd>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            </dl>
          </div>

          {/* Trophy + verdict */}
          <div className="flex flex-col items-center justify-center px-2 py-4 text-center">
            <div className="text-6xl sm:text-7xl">🏆</div>
            <div className="mt-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-2 text-lg font-black text-slate-900 shadow-lg">
              {verdict.title}
            </div>
            <p className="mt-3 text-base font-bold text-slate-200">
              {verdict.sub}
            </p>
          </div>

          {/* Donut + tips */}
          <div className="rounded-3xl border border-amber-400/30 bg-white/5 p-5 shadow-xl">
            <h3 className="text-lg font-black text-amber-300">
              📊 ফলাফলের বিশ্লেষণ
            </h3>
            <div className="mt-3 flex items-center gap-4">
              <svg
                width="130"
                height="130"
                viewBox="0 0 130 130"
                className="shrink-0"
              >
                <circle
                  cx="65"
                  cy="65"
                  r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="13"
                />
                <circle
                  cx="65"
                  cy="65"
                  r={r}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeDasharray={`${done} ${c}`}
                  transform="rotate(-90 65 65)"
                />
                <text
                  x="65"
                  y="61"
                  textAnchor="middle"
                  fontSize="24"
                  fontWeight="900"
                  fill="#ffffff"
                >
                  {toBn(accuracy)}%
                </text>
                <text
                  x="65"
                  y="80"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#94a3b8"
                >
                  সঠিকতা
                </text>
              </svg>
              <ul className="flex flex-col gap-1.5 text-sm font-bold text-slate-300">
                <li>🟢 সঠিক {toBn(pct(correct))}%</li>
                <li>🔴 ভুল {toBn(pct(wrong))}%</li>
                <li>⚪ এড়িয়ে {toBn(pct(skipped))}%</li>
              </ul>
            </div>
            <div className="mt-4 rounded-2xl bg-white/5 p-4">
              <p className="text-sm font-black text-amber-300">
                💡 কী শিখলেন?
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {tips.map((t) => (
                  <li
                    key={t}
                    className="text-sm font-semibold text-slate-300"
                  >
                    • {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onRetake}
            className="rounded-full border border-white/30 bg-white/5 px-6 py-2.5 font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            ↻ পুনরায় পরীক্ষা দিন
          </button>
          {onClose ? (
            <button
              onClick={onClose}
              className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-2.5 font-black text-slate-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              ▶ আরও মক টেস্ট দেখুন
            </button>
          ) : (
            <Link
              href="/studio"
              className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-2.5 font-black text-slate-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              ▶ আরও মক টেস্ট দেখুন
            </Link>
          )}
          <span className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-6 py-2.5 font-black text-white shadow-lg">
            ▶ Subscribe • DeshExam
          </span>
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-slate-400">
          চেষ্টা চালিয়ে যান, সাফল্য একদিন আসবেই! ·{" "}
          <a
            href="https://deshexam.vercel.app/"
            className="font-bold text-amber-400 hover:underline"
          >
            🌐 deshexam.vercel.app
          </a>
        </p>
      </div>
    </div>
  );
}
