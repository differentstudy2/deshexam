import Link from "next/link";
import { toBn } from "@/lib/wb-board";

/**
 * Studio result screen — live numbers only.
 * Rank is intentionally absent: the studio player has no leaderboard yet.
 */
export default function EndScreen({
  correct,
  wrong,
  skipped,
  total,
  accuracy,
  totalMarks,
  onRetake,
}: {
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  accuracy: number;
  totalMarks?: number;
  onRetake: () => void;
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

  const r = 54;
  const c = 2 * Math.PI * r;
  const done = c * (accuracy / 100);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-4 py-8">
      <div className="mb-5 text-center">
        <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-sm font-black text-blue-700">
          ✓ মক টেস্ট সম্পূর্ণ হলো
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Result panel */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl">
          <h3 className="text-lg font-black text-slate-900">📊 আপনার ফলাফল</h3>
          <dl className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <dt className="font-semibold text-slate-500">সঠিক</dt>
              <dd className="font-black text-slate-900">
                {toBn(correct)}{" "}
                <span className="text-sm font-bold text-slate-400">
                  ({toBn(total > 0 ? Math.round((correct / total) * 100) : 0)}%)
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <dt className="font-semibold text-slate-500">ভুল</dt>
              <dd className="font-black text-slate-900">
                {toBn(wrong)}{" "}
                <span className="text-sm font-bold text-slate-400">
                  ({toBn(total > 0 ? Math.round((wrong / total) * 100) : 0)}%)
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <dt className="font-semibold text-slate-500">এড়িয়ে</dt>
              <dd className="font-black text-slate-900">
                {toBn(skipped)}{" "}
                <span className="text-sm font-bold text-slate-400">
                  ({toBn(total > 0 ? Math.round((skipped / total) * 100) : 0)}%)
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <dt className="font-semibold text-slate-500">মোট নম্বর</dt>
              <dd className="font-black text-blue-700">
                {toBn(correct)} / {toBn(marks)}
              </dd>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-500">সঠিকতার হার</dt>
                <dd className="font-black text-blue-700">
                  {toBn(accuracy)}%
                </dd>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          </dl>
        </div>

        {/* Trophy + verdict */}
        <div className="flex flex-col items-center justify-center px-2 py-4 text-center">
          <div className="text-7xl">🏆</div>
          <div className="mt-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-lg font-black text-white shadow-lg">
            {verdict.title}
          </div>
          <p className="mt-3 text-base font-bold text-slate-700">
            {verdict.sub}
          </p>
        </div>

        {/* Donut + tips */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl">
          <h3 className="text-lg font-black text-slate-900">
            📊 ফলাফলের বিশ্লেষণ
          </h3>
          <div className="mt-3 flex items-center gap-4">
            <svg width="130" height="130" viewBox="0 0 130 130" className="shrink-0">
              <circle cx="65" cy="65" r={r} fill="none" stroke="#e2e8f0" strokeWidth="13" />
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
              <text x="65" y="61" textAnchor="middle" fontSize="24" fontWeight="900" fill="#0f172a">
                {toBn(accuracy)}%
              </text>
              <text x="65" y="80" textAnchor="middle" fontSize="11" fill="#64748b">
                সঠিকতা
              </text>
            </svg>
            <ul className="flex flex-col gap-1.5 text-sm font-bold text-slate-600">
              <li>🟢 সঠিক {toBn(total > 0 ? Math.round((correct / total) * 100) : 0)}%</li>
              <li>🔴 ভুল {toBn(total > 0 ? Math.round((wrong / total) * 100) : 0)}%</li>
              <li>⚪ এড়িয়ে {toBn(total > 0 ? Math.round((skipped / total) * 100) : 0)}%</li>
            </ul>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-700">💡 কী শিখলেন?</p>
            <ul className="mt-2 flex flex-col gap-1">
              {tips.map((t) => (
                <li key={t} className="text-sm font-semibold text-slate-600">
                  • {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRetake}
          className="rounded-full border border-gray-300 bg-white px-6 py-2.5 font-black text-slate-700 shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          ↻ পুনরায় পরীক্ষা দিন
        </button>
        <Link
          href="/presentation"
          className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          ▶ আরও মক টেস্ট দেখুন
        </Link>
        <span className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-6 py-2.5 font-black text-white shadow-lg">
          ▶ Subscribe • DeshExam
        </span>
      </div>

      <p className="mt-6 text-center text-sm font-semibold text-slate-500">
        চেষ্টা চালিয়ে যান, সাফল্য একদিন আসবেই! ·{" "}
        <a
          href="https://deshexam.vercel.app/"
          className="font-bold text-blue-600 hover:underline"
        >
          🌐 deshexam.vercel.app
        </a>
      </p>
    </div>
  );
}
