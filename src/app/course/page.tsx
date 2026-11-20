import Link from "next/link";
import {
  CLASSES,
  MEDIUMS,
  SAMPLE_COURSES,
  SUBJECTS_BY_CLASS,
  classLabel,
  toBn,
} from "@/lib/wb-board";

const PAGE_SIZE = 12;

type Filters = { class?: string; subject?: string; medium?: string; page?: string };

function buildHref(patch: Partial<Filters>, current: Filters, base = "/course") {
  const next: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...current, ...patch })) {
    if (v !== undefined && v !== "" && v !== "all") next[k] = v;
  }
  const qs = new URLSearchParams(next).toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function CoursePage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const params = await searchParams;
  const classNum = params.class ? Number(params.class) : undefined;
  const validClass =
    classNum !== undefined && (CLASSES as readonly number[]).includes(classNum)
      ? classNum
      : undefined;
  const medium =
    params.medium === "bn" || params.medium === "en" ? params.medium : undefined;
  const subjectOptions = validClass
    ? SUBJECTS_BY_CLASS[validClass]
    : [...new Set(Object.values(SUBJECTS_BY_CLASS).flat())];
  const subject =
    params.subject && subjectOptions.includes(params.subject)
      ? params.subject
      : undefined;

  const filtered = SAMPLE_COURSES.filter(
    (c) =>
      (validClass === undefined || c.class === validClass) &&
      (medium === undefined || c.medium === medium) &&
      (subject === undefined || c.subject === subject),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(
    totalPages,
    Math.max(1, Number(params.page) || 1),
  );
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#040d1a] pb-20 text-slate-100">
      {/* Hero — premium dark, blue glow + gold accent */}
      <div className="relative overflow-hidden bg-[radial-gradient(700px_320px_at_15%_0%,rgba(37,99,235,0.35),transparent),linear-gradient(180deg,#04122b,#040d1a)] px-4 py-14 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 inline-block rounded-full border border-amber-300/40 bg-white/5 px-3 py-1 text-xs font-bold tracking-wide text-amber-200">
            WBBSE · WBCHSE · ক্লাস ৫–১২
          </p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            কোর্স
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-300">
            ক্লাস ও বিষয় অনুযায়ী ভিডিও কোর্স বেছে নিন — বাংলা ও English মাধ্যমে।
          </p>
          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Filters — synced to URL (?class=&subject=&medium=&page=) */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold text-amber-200">ক্লাস:</span>
            <Link
              href={buildHref({ class: undefined, subject: undefined, page: undefined }, params)}
              className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${validClass === undefined ? "bg-amber-400 text-[#042f2e]" : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}
            >
              সব ক্লাস
            </Link>
            {CLASSES.map((n) => (
              <Link
                key={n}
                href={buildHref({ class: String(n), subject: undefined, page: undefined }, params)}
                className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${validClass === n ? "bg-amber-400 text-[#042f2e]" : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}
              >
                {toBn(n)}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold text-amber-200">মাধ্যম:</span>
            <Link
              href={buildHref({ medium: undefined, page: undefined }, params)}
              className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${medium === undefined ? "bg-amber-400 text-[#042f2e]" : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}
            >
              সব মাধ্যম
            </Link>
            {MEDIUMS.map((m) => (
              <Link
                key={m.id}
                href={buildHref({ medium: m.id, page: undefined }, params)}
                className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${medium === m.id ? "bg-amber-400 text-[#042f2e]" : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}
              >
                {m.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold text-amber-200">বিষয়:</span>
            <Link
              href={buildHref({ subject: undefined, page: undefined }, params)}
              className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${subject === undefined ? "bg-amber-400 text-[#042f2e]" : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}
            >
              সব বিষয়
            </Link>
            {subjectOptions.map((s) => (
              <Link
                key={s}
                href={buildHref({ subject: s, page: undefined }, params)}
                className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${subject === s ? "bg-amber-400 text-[#042f2e]" : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}
              >
                {s}
              </Link>
            ))}
          </div>

          {(validClass !== undefined || medium !== undefined || subject !== undefined) && (
            <Link
              href="/course"
              className="mt-4 inline-flex min-h-[40px] items-center rounded-full border border-amber-300/50 px-4 text-sm font-bold text-amber-200 hover:bg-white/10"
            >
              ✕ ফিল্টার মুছুন
            </Link>
          )}
        </div>

        <p className="mt-6 text-sm text-slate-400">
          {toBn(filtered.length)}টি কোর্স পাওয়া গেছে
          {validClass !== undefined ? ` · ${classLabel(validClass)}` : ""}
          {subject ? ` · ${subject}` : ""} — নমুনা কনটেন্ট, আসল কোর্স ক্লাস অনুযায়ী তৈরি হচ্ছে।
        </p>

        {pageItems.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center">
            <p className="text-lg font-bold text-white">কোনো কোর্স পাওয়া যায়নি</p>
            <p className="mt-2 text-sm text-slate-400">
              ফিল্টার বদলে আবার দেখুন, অথবা সব ফিল্টার মুছে ফেলুন।
            </p>
            <Link
              href="/course"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-amber-400 px-6 text-sm font-bold text-[#042f2e]"
            >
              সব কোর্স দেখুন
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((c) => (
              <article
                key={c.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-sm transition-all hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-lg"
              >
                <div className="bg-[linear-gradient(135deg,#0b3b39,#042f2e)] p-5">
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-200">
                    নমুনা · কোর্স
                  </span>
                  <h3 className="mt-3 min-h-[3rem] font-headline text-lg font-bold leading-snug text-white">
                    {c.title}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-300">
                    {classLabel(c.class)} · {c.subject} ·{" "}
                    {c.medium === "bn" ? "বাংলা মাধ্যম" : "English Medium"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    শিক্ষক: DeshExam Faculty · {toBn(c.lessons ?? 0)}টি পাঠ
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-lg font-extrabold text-white">
                      {c.price === 0 ? "ফ্রি" : `₹${c.price}`}
                    </span>
                    <Link
                      href="/pricing"
                      className="inline-flex min-h-[40px] items-center rounded-full border border-amber-300/50 px-5 text-sm font-bold text-amber-200 hover:bg-white/10"
                    >
                      বিস্তারিত
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination — 12 per page, page in URL */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="পৃষ্ঠা">
            {page > 1 ? (
              <Link
                href={buildHref({ page: String(page - 1) }, params)}
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-slate-200 hover:bg-white/10"
              >
                ← আগের
              </Link>
            ) : (
              <span className="inline-flex min-h-[44px] cursor-not-allowed items-center rounded-full border border-white/5 px-5 text-sm font-bold text-slate-600">
                ← আগের
              </span>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={buildHref({ page: String(n) }, params)}
                aria-current={n === page ? "page" : undefined}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-4 text-sm font-bold ${n === page ? "bg-amber-400 text-[#042f2e]" : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}
              >
                {toBn(n)}
              </Link>
            ))}
            {page < totalPages ? (
              <Link
                href={buildHref({ page: String(page + 1) }, params)}
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-slate-200 hover:bg-white/10"
              >
                পরের →
              </Link>
            ) : (
              <span className="inline-flex min-h-[44px] cursor-not-allowed items-center rounded-full border border-white/5 px-5 text-sm font-bold text-slate-600">
                পরের →
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
