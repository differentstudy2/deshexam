import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  boardForClass,
  classLabel,
  CLASSES,
  MEDIUMS,
  SAMPLE_COURSES,
  SAMPLE_MOCK_TESTS,
  SAMPLE_NOTES,
  SUBJECTS_BY_CLASS,
  toBn,
  type ContentType,
  type Medium,
} from "@/lib/wb-board";
import { EmptyState, PriceTag, SectionHeader, Thumbnail } from "@/components/wb/ui";

export function generateStaticParams() {
  return CLASSES.map((n) => ({ n: String(n) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  const num = Number(n);
  if (!CLASSES.includes(num as (typeof CLASSES)[number])) return {};
  return {
    title: `${classLabel(num)} — DeshExam | WBBSE ও WBCHSE প্রস্তুতি`,
    description: `${classLabel(num)}-এর বিষয়ভিত্তিক MCQ, মক টেস্ট, আগের বছরের প্রশ্নপত্র, সাজেশন ও নোট — বাংলা ও English মাধ্যমে।`,
    alternates: { canonical: `/class/${num}` },
  };
}

const CONTENT_TYPES: ContentType[] = ["Chapter MCQ", "Mock Test", "Previous Year Paper", "Suggestion", "Notes", "Video"];

export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ medium?: string; subject?: string; type?: string }>;
}) {
  const { n } = await params;
  const num = Number(n);
  if (!CLASSES.includes(num as (typeof CLASSES)[number])) notFound();
  const sp = await searchParams;
  const medium: Medium = sp.medium === "en" ? "en" : "bn";
  const subject = sp.subject ?? "";
  const type = (sp.type as ContentType | undefined) ?? "";
  const subjects = SUBJECTS_BY_CLASS[num];

  const all = [...SAMPLE_MOCK_TESTS, ...SAMPLE_COURSES, ...SAMPLE_NOTES].filter(
    (c) => c.class === num && (medium === "bn" ? true : c.medium === "en" || c.medium === "bn")
  );
  const filtered = all.filter(
    (c) =>
      (!subject || c.subject === subject) &&
      (!type || c.contentType === type || (type === "Chapter MCQ" && c.contentType === "Mock Test"))
  );

  const typeLabel: Record<string, string> = {
    "Chapter MCQ": "অধ্যায়ভিত্তিক MCQ",
    "Mock Test": "মক টেস্ট",
    "Previous Year Paper": "আগের বছরের প্রশ্নপত্র",
    Suggestion: "সাজেশন",
    Notes: "নোট",
    Video: "ভিডিও",
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
      <nav aria-label="ব্রেডক্রাম্ব" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:underline">হোম</Link> / <span className="font-semibold text-slate-800 dark:text-slate-200">{classLabel(num)}</span>
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
        {classLabel(num)}
      </h1>
      <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
        {boardForClass(num) === "WBBSE" ? "WBBSE (মাধ্যমিক)" : "WBCHSE (উচ্চমাধ্যমিক)"} ·{" "}
        {medium === "bn" ? "বাংলা মাধ্যম" : "English Medium"}
      </p>

      {/* Medium toggle */}
      <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" role="group" aria-label="মাধ্যম বেছে নিন">
        {MEDIUMS.map((m) => (
          <Link
            key={m.id}
            href={`/class/${num}?medium=${m.id}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`}
            aria-current={medium === m.id ? "true" : undefined}
            className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-bold ${
              medium === m.id ? "bg-brand-green text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {m.label}
          </Link>
        ))}
      </div>

      {/* Subject chips */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">বিষয় বেছে নিন</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/class/${num}?medium=${medium}`}
            className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-bold ${
              !subject ? "border-brand-green bg-brand-green text-white" : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            সব বিষয়
          </Link>
          {subjects.map((s) => (
            <Link
              key={s}
              href={`/class/${num}?medium=${medium}&subject=${encodeURIComponent(s)}${type ? `&type=${encodeURIComponent(type)}` : ""}`}
              aria-pressed={subject === s}
              className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-bold ${
                subject === s
                  ? "border-brand-green bg-brand-green text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-brand-green dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Content type filter */}
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="কনটেন্টের ধরন">
        <Link
          href={`/class/${num}?medium=${medium}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`}
          className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-bold ${!type ? "border-brand-gold bg-brand-gold/20 text-brand-golddark dark:text-amber-400" : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}
        >
          সব ধরন
        </Link>
        {CONTENT_TYPES.map((t) => (
          <Link
            key={t}
            href={`/class/${num}?medium=${medium}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}&type=${encodeURIComponent(t)}`}
            aria-pressed={type === t}
            className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-bold ${
              type === t ? "border-brand-gold bg-brand-gold/20 text-brand-golddark dark:text-amber-400" : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {typeLabel[t]}
          </Link>
        ))}
      </div>

      {/* Content list */}
      <div className="mt-8">
        <SectionHeader
          eyebrow={subject || "সব বিষয়"}
          title={type ? typeLabel[type] ?? "কনটেন্ট" : "এই ক্লাসের কনটেন্ট"}
          subtitle="নমুনা কনটেন্ট — আসল প্রশ্নভান্ডার ক্লাস অনুযায়ী তৈরি হচ্ছে।"
        />
        {filtered.length === 0 ? (
          <EmptyState
            title="এই ফিল্টারে কোনো কনটেন্ট নেই"
            body="এই বিষয় বা ধরনের কনটেন্ট এখনো তৈরি হয়নি। অন্য বিষয় বা ধরন বেছে দেখুন।"
            actionLabel="সব কনটেন্ট দেখুন"
            actionHref={`/class/${num}?medium=${medium}`}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article key={c.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950">
                <Thumbnail classNo={c.class} subject={c.subject} title={c.title} type={typeLabel[c.contentType] ?? c.contentType} />
                <div className="p-5">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">নমুনা</span>
                  <h3 className="mt-2 min-h-[3rem] text-base font-bold leading-snug text-slate-900 dark:text-white">{c.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {c.subject} · {c.questions ? `${toBn(c.questions)}টি প্রশ্ন · ` : ""}{c.minutes ? `${toBn(c.minutes)} মিনিট · ` : ""}{c.lessons ? `${toBn(c.lessons)}টি পাঠ · ` : ""}{c.board}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <PriceTag price={c.price ?? 0} oldPrice={c.oldPrice} />
                    <Link href="/mock-tests" className="inline-flex min-h-[40px] items-center rounded-full bg-brand-green px-5 text-sm font-bold text-white hover:bg-emerald-800">
                      শুরু করুন
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/#demo-test" className="inline-flex min-h-[48px] items-center rounded-full bg-brand-gold px-8 text-base font-bold text-[#042f2e]">ফ্রি টেস্ট দিন</Link>
        <Link href="/mock-tests" className="inline-flex min-h-[48px] items-center rounded-full border border-slate-300 px-8 text-base font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">সব মক টেস্ট দেখুন</Link>
      </div>
    </div>
  );
}
