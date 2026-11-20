import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  BookOpen,
  FileText,
  PlayCircle,
  ClipboardList,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Timer,
  FileQuestion,
  ArrowRight,
} from "lucide-react";
import { ClassPicker } from "@/components/wb/class-picker";
import { DemoTest } from "@/components/wb/demo-test";
import { EmptyState, PriceTag, SectionHeader, Thumbnail } from "@/components/wb/ui";
import {
  PLANS,
  SAMPLE_COURSES,
  SAMPLE_MOCK_TESTS,
  SAMPLE_NOTES,
  toBn,
} from "@/lib/wb-board";
import { getFAQSchema, getOrganizationSchema, getSearchActionSchema } from "@/lib/seo/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deshexam.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "DeshExam — ক্লাস ৫–১২, পশ্চিমবঙ্গ বোর্ড প্রস্তুতি | WBBSE ও WBCHSE",
  description:
    "ক্লাস ৫ থেকে ১২ — WBBSE (মাধ্যমিক) ও WBCHSE (উচ্চমাধ্যমিক) পরীক্ষার অধ্যায়ভিত্তিক MCQ, আগের বছরের প্রশ্নপত্র, সাজেশন ও মক টেস্ট। বাংলা ও English মাধ্যম।",
  keywords: [
    "DeshExam",
    "WBBSE",
    "WBCHSE",
    "Madhyamik suggestion",
    "WBCHSE Class 12 mock test",
    "ক্লাস ১০ মক টেস্ট",
    "পশ্চিমবঙ্গ বোর্ড",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "DeshExam — ক্লাস ৫–১২, পশ্চিমবঙ্গ বোর্ডের সম্পূর্ণ প্রস্তুতি",
    description:
      "অধ্যায়ভিত্তিক MCQ, আগের বছরের প্রশ্নপত্র, সাজেশন ও মক টেস্ট — বাংলা ও English মাধ্যমে, এক জায়গায়।",
    url: siteUrl,
    siteName: "DeshExam",
    locale: "bn_IN",
    type: "website",
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "DeshExam — ক্লাস ৫ থেকে ১২, পশ্চিমবঙ্গ বোর্ডের সম্পূর্ণ প্রস্তুতি" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeshExam — ক্লাস ৫–১২, পশ্চিমবঙ্গ বোর্ডের সম্পূর্ণ প্রস্তুতি",
    description:
      "অধ্যায়ভিত্তিক MCQ, আগের বছরের প্রশ্নপত্র, সাজেশন ও মক টেস্ট — বাংলা ও English মাধ্যমে।",
    images: [`${siteUrl}/og-image.png`],
  },
};

const FEATURES = [
  { icon: FileQuestion, title: "অধ্যায়ভিত্তিক MCQ অনুশীলন", benefit: "প্রতিটি অধ্যায় শেষে নিজেকে যাচাই করুন।", href: "/practice" },
  { icon: FileText, title: "আগের বছরের প্রশ্নপত্র", benefit: "মাধ্যমিক ও উচ্চমাধ্যমিকের আসল প্রশ্নপত্র।", href: "/previous-year-papers" },
  { icon: Lightbulb, title: "সাজেশন ও মডেল প্রশ্নপত্র", benefit: "পরীক্ষার আগে গুরুত্বপূর্ণ প্রশ্ন এক জায়গায়।", href: "/mock-tests" },
  { icon: ClipboardList, title: "ইউনিট, হাফ-ইয়ারলি ও অ্যানুয়াল মক টেস্ট", benefit: "পরীক্ষার মতো পরিবেশে সময় ধরে অনুশীলন।", href: "/mock-tests" },
  { icon: PlayCircle, title: "ভিডিও ক্লাস ও সন্দেহ সমাধান", benefit: "কঠিন বিষয় সহজ করে বোঝানো ভিডিও।", href: "/videos" },
  { icon: BarChart3, title: "ফলাফল বিশ্লেষণ", benefit: "কোন অধ্যায়ে দুর্বলতা, সেটা স্পষ্ট দেখুন।", href: "/learn" },
];

const FAQS = [
  { q: "কোন ক্লাস ও বোর্ডের জন্য DeshExam?", a: "ক্লাস ৫ থেকে ১২ পর্যন্ত। ক্লাস ৫–১০ WBBSE (মাধ্যমিক) এবং ক্লাস ১১–১২ WBCHSE (উচ্চমাধ্যমিক) বোর্ডের জন্য।" },
  { q: "বাংলা মাধ্যম নাকি English মাধ্যম?", a: "দুটোই। ক্লাস বেছে নেওয়ার সময় বাংলা মাধ্যম বা English Medium বেছে নিতে পারবেন — আপনার পছন্দ মনে রাখা হয়।" },
  { q: "ফ্রি টেস্ট কীভাবে দেব?", a: "এই পাতার ‘ফ্রি টেস্ট দিন’ অংশে ৫টি নমুনা প্রশ্নের টেস্ট আছে — লগইন ছাড়াই দেওয়া যায়, সঙ্গে সঙ্গে ফলাফল পাবেন।" },
  { q: "পেমেন্ট কীভাবে করব?", a: "UPI, কার্ড ও নেট ব্যাংকিংয়ে পেমেন্ট করা যায়। পেমেন্টের আগে প্ল্যান, দাম ও মেয়াদ দেখে নিশ্চিত হয়ে নিন।" },
  { q: "রিফান্ড কি পাওয়া যায়?", a: "ডিজিটাল কনটেন্ট কেনার পর অ্যাক্সেস পেলে সাধারণত রিফান্ড হয় না। বিস্তারিত জানতে Refund Policy পাতাটি দেখুন।" },
  { q: "প্ল্যানের মেয়াদ কতদিন?", a: "প্রতিটি প্ল্যান ১ মাসের জন্য — প্রতি মাসে নবায়ন হয়। মেয়াদ শেষ হলে আবার কিনতে পারবেন।" },
  { q: "কোন ডিভাইসে চলবে?", a: "মোবাইল, ট্যাবলেট ও কম্পিউটার — যেকোনো আধুনিক ব্রাউজারে চলে। কম দামের অ্যান্ড্রয়েড ফোনের কথা মাথায় রেখে পাতাগুলো হালকা রাখা হয়েছে।" },
  { q: "অফলাইনে কি পড়া যায়?", a: "এখনো অফলাইন সুবিধা নেই — পড়তে ইন্টারনেট লাগবে। অফলাইন সুবিধা ভবিষ্যতে আসতে পারে।" },
  { q: "সাহায্য দরকার হলে কোথায় যোগাযোগ করব?", a: "ইমেইল করুন support@deshexam.com-এ অথবা +91 62940 06590 নম্বরে যোগাযোগ করুন। Contact পাতায় বিস্তারিত আছে।" },
];

export default function Home() {
  const schemas = [
    getSearchActionSchema(),
    getOrganizationSchema(),
    getFAQSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
  ];

  return (
    <div className="flex flex-col overflow-x-hidden bg-[#040a16] font-body text-base text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      {/* 4.2 Hero */}
      <section className="section-dark-hero text-white">
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 md:items-center md:py-14">
          <div>
            <p className="mb-3 inline-block rounded-full border border-amber-300/40 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-amber-200">
              WBBSE · WBCHSE · ক্লাস ৫–১২
            </p>
            <h1 className="text-3xl font-extrabold leading-snug tracking-tight md:text-5xl md:leading-tight">
              ক্লাস ৫ থেকে ১২ — পশ্চিমবঙ্গ বোর্ডের সম্পূর্ণ প্রস্তুতি, এক জায়গায়
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-teal-100 md:text-lg">
              অধ্যায়ভিত্তিক MCQ, আগের বছরের প্রশ্নপত্র, সাজেশন ও মক টেস্ট — বাংলা ও English মাধ্যমে, এক জায়গায়।
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#demo-test"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-gold px-8 text-base font-bold text-[#042f2e] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                ফ্রি টেস্ট দিন
              </Link>
              <Link
                href="#class-picker"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-amber-300/50 bg-white/5 px-8 text-base font-bold text-amber-100 backdrop-blur transition-all hover:bg-white/10"
              >
                ক্লাস বেছে নিন
              </Link>
            </div>
            <p className="mt-4 text-sm text-teal-200/80">লগইন ছাড়াই ফ্রি টেস্ট দেওয়া যায়।</p>
          </div>
          {/* Phone-frame mockup of the exam interface — original CSS mockup, no photo */}
          <div className="mx-auto w-full max-w-xs" aria-hidden="true">
            <div className="rounded-[2rem] border-4 border-slate-700 bg-slate-900 p-3 shadow-2xl">
              <div className="rounded-[1.5rem] bg-white p-4 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">ক্লাস ১০ · জীবনবিজ্ঞান</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">⏱ ০৪:৩২</span>
                </div>
                <p className="mt-3 text-sm font-bold leading-relaxed text-slate-900 dark:text-white">
                  সালোকসংশ্লেষ প্রক্রিয়ায় উদ্ভিদ কোন গ্যাস গ্রহণ করে?
                </p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">ক) অক্সিজেন</div>
                  <div className="rounded-xl border-2 border-emerald-600 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">খ) কার্বন ডাই-অক্সাইড ✓</div>
                  <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">গ) নাইট্রোজেন</div>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-900">
                  <p className="text-xs font-semibold text-slate-500">ফলাফল</p>
                  <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">৪ / ৫ সঠিক</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.3 Class picker */}
      <section id="class-picker" className="section-dark scroll-mt-20 py-12 md:py-16">
        <div className="dark container mx-auto max-w-6xl px-4">
        <SectionHeader tone="dark"
          eyebrow="ক্লাস বেছে নিন"
          title="আপনার ক্লাস কোনটি?"
          subtitle="ক্লাস বেছে নিলে সেই ক্লাসের বিষয়, মক টেস্ট, নোট ও আগের বছরের প্রশ্নপত্র দেখতে পাবেন।"
        />
        <Suspense fallback={<div className="rounded-2xl border border-white/10 bg-white/[0.05] p-8 text-center text-slate-400">ক্লাস লোড হচ্ছে…</div>}>
          <ClassPicker />
        </Suspense>
        </div>
      </section>

      {/* 4.4 Features — only the 6 that exist */}
      <section className="section-dark-teal py-12 md:py-16">
        <div className="dark container mx-auto max-w-6xl px-4">
          <SectionHeader tone="dark" eyebrow="সুবিধা" title="যা যা পাবেন" subtitle="শুধু সেগুলোই, যা আজই কাজ করে।" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-gold hover:shadow-md"
              >
                <span className="inline-flex rounded-xl bg-brand-green/10 p-3 text-brand-green dark:text-emerald-400">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-1 text-base text-slate-300">{f.benefit}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-400">
                  দেখুন <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5 Free demo test */}
      <section id="demo-test" className="section-dark-blue scroll-mt-20 py-12 md:py-16">
        <div className="dark container mx-auto max-w-6xl px-4">
        <SectionHeader tone="dark"
          eyebrow="ফ্রি ডেমো টেস্ট"
          title="আগে চেষ্টা করে দেখুন, তারপর সিদ্ধান্ত নিন"
          subtitle="৫টি নমুনা প্রশ্ন — কোনো লগইন লাগবে না, ফলাফল সঙ্গে সঙ্গে।"
        />
        <DemoTest tone="dark" />
        </div>
      </section>

      {/* 4.6 Mock tests preview */}
      <section className="section-dark-blue py-12 md:py-16">
        <div className="dark container mx-auto max-w-6xl px-4">
          <SectionHeader tone="dark"
            eyebrow="মক টেস্ট"
            title="মক টেস্ট ও কুইজ"
            subtitle="নমুনা টেস্ট — আসল প্রশ্নভান্ডার ক্লাস অনুযায়ী তৈরি হচ্ছে।"
            href="/mock-tests"
            linkLabel="সব টেস্ট দেখুন"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_MOCK_TESTS.slice(0, 4).map((t) => (
              <article key={t.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <Thumbnail classNo={t.class} subject={t.subject} title={t.title} type="মক টেস্ট" />
                <div className="p-5">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">নমুনা</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-300">{t.difficulty}</span>
                  </div>
                  <h3 className="min-h-[3rem] text-base font-bold leading-snug text-white">{t.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                    <FileQuestion className="h-4 w-4" /> {toBn(t.questions ?? 0)}টি প্রশ্ন
                    <Timer className="ml-2 h-4 w-4" /> {toBn(t.minutes ?? 0)} মিনিট
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <PriceTag tone="dark" price={t.price ?? 0} />
                    <Link
                      href={`/mock-tests?class=${t.class}`}
                      className="inline-flex min-h-[40px] items-center rounded-full bg-brand-green px-5 text-sm font-bold text-white hover:bg-emerald-800"
                    >
                      শুরু করুন
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4.7 Exam notices — honest empty state, no hardcoded dates */}
      <section className="section-dark-teal px-4 py-12 md:py-16">
        <div className="dark container mx-auto max-w-6xl px-4">
        <SectionHeader tone="dark" eyebrow="পরীক্ষার নোটিশ" title="মাধ্যমিক ও উচ্চমাধ্যমিক নোটিশ" subtitle="রুটিন ও ফলাফলের খবর — অফিসিয়াল সূত্রসহ।" />
        <EmptyState tone="dark"
          title="এখনো কোনো নোটিশ যোগ করা হয়নি"
          body="পরীক্ষার রুটিন ও ফলাফলের নোটিশ এখানে আসবে। পরীক্ষার তারিখ অফিসিয়াল বোর্ডের ঘোষণা যাচাই করে তবেই যোগ করা হবে।"
        />
        <p className="mt-4 text-center text-sm text-slate-400">
          অফিসিয়াল তথ্যের জন্য:{" "}
          <a href="https://wbbse.wb.gov.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-400 hover:underline">WBBSE</a>
          {" "}ও{" "}
          <a href="https://wbchse.wb.gov.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-400 hover:underline">WBCHSE</a>
          -এর ওয়েবসাইট দেখুন।
        </p>
        </div>
      </section>

      {/* 4.8 Courses + Notes/Books preview */}
      <section className="section-dark py-12 md:py-16">
        <div className="dark container mx-auto max-w-6xl px-4">
          <SectionHeader tone="dark" eyebrow="কোর্স ও নোট" title="কোর্স ও অধ্যায়ভিত্তিক নোট" subtitle="নমুনা কনটেন্ট — আসল কোর্স ও নোট ক্লাস অনুযায়ী তৈরি হচ্ছে।" />
          <h3 className="mb-4 text-xl font-bold text-white">কোর্স</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_COURSES.map((c) => (
              <article key={c.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <Thumbnail classNo={c.class} subject={c.subject} title={c.title} type="কোর্স" />
                <div className="p-5">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">নমুনা</span>
                  <h3 className="mt-2 min-h-[3rem] text-base font-bold leading-snug text-white">{c.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">শিক্ষক: DeshExam Faculty · {toBn(c.lessons ?? 0)}টি পাঠ</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <PriceTag tone="dark" price={c.price ?? 0} />
                    <Link href="/course" className="inline-flex min-h-[40px] items-center rounded-full border border-emerald-500/60 px-5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/10">
                      বিস্তারিত
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <h3 className="mb-4 mt-10 text-xl font-bold text-white">নোট ও বই</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_NOTES.map((n) => (
              <article key={n.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <Thumbnail classNo={n.class} subject={n.subject} title={n.title} type="নোট" />
                <div className="p-5">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">নমুনা</span>
                  <h3 className="mt-2 min-h-[3rem] text-base font-bold leading-snug text-white">{n.title}</h3>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <PriceTag tone="dark" price={n.price ?? 0} />
                    <Link href="/book" className="inline-flex min-h-[40px] items-center rounded-full border border-emerald-500/60 px-5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/10">
                      বিস্তারিত
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4.9 Pricing — no yearly toggle: no yearly pricing exists in the repo */}
      <section className="section-dark-blue px-4 py-12 md:py-16">
        <div className="dark container mx-auto max-w-6xl px-4">
        <SectionHeader tone="dark"
          eyebrow="প্রাইসিং"
          title="আপনার জন্য সঠিক প্ল্যান বেছে নিন"
          subtitle="মাসিক প্ল্যান — UPI, কার্ড ও নেট ব্যাংকিংয়ে পেমেন্ট করা যায়।"
          href="/pricing"
          linkLabel="প্ল্যান তুলনা করুন"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 shadow-sm ${
                "popular" in p && p.popular
                  ? "border-2 border-brand-gold bg-white/[0.06] shadow-lg md:-translate-y-2"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              {"popular" in p && p.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-gold px-3 py-1 text-xs font-bold text-[#042f2e]">
                  সবচেয়ে জনপ্রিয়
                </span>
              ) : null}
              <h3 className="text-xl font-extrabold text-white">{p.name}</h3>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="text-sm text-slate-400 line-through">
                  <span className="sr-only">আগের দাম </span>₹{p.oldPrice}
                </span>
                <span className="text-4xl font-extrabold text-white">₹{p.price}</span>
                <span className="text-sm text-slate-400">/মাস</span>
              </p>
              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-base text-slate-300">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className={`mt-6 flex min-h-[48px] items-center justify-center rounded-full text-base font-bold ${
                  "popular" in p && p.popular
                    ? "bg-brand-gold text-[#042f2e] hover:bg-amber-400"
                    : "bg-brand-green text-white hover:bg-emerald-800"
                }`}
              >
                কিনুন
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          পেমেন্ট: UPI · কার্ড · নেট ব্যাংকিং। ডিজিটাল কনটেন্ট কেনার পর অ্যাক্সেস পেলে সাধারণত রিফান্ড হয় না — বিস্তারিত{" "}
          <Link href="/refund-policy" className="font-semibold text-emerald-400 hover:underline">
            Refund Policy
          </Link>{" "}
          দেখুন।
        </p>
        </div>
      </section>

      {/* 4.10 Social proof — hidden: no real testimonials exist yet. */}

      {/* 4.11 FAQ */}
      <section className="section-dark-teal py-12 md:py-16">
        <div className="dark container mx-auto max-w-3xl px-4">
          <SectionHeader tone="dark" eyebrow="জিজ্ঞাসা" title="সচরাচর জিজ্ঞাসা" />
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 open:bg-white/[0.07]">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 text-base font-bold text-white">
                  {f.q}
                  <span className="shrink-0 text-xl text-amber-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-base leading-relaxed text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 4.12 Final CTA */}
      <section className="section-dark-hero py-12 text-white md:py-16">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-extrabold md:text-4xl">আজই ফ্রি টেস্ট দিয়ে শুরু করুন</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-teal-100">
            লগইন ছাড়াই ৫টি নমুনা প্রশ্নের উত্তর দিন — তারপর আপনার ক্লাসের প্রস্তুতি শুরু করুন।
          </p>
          <Link
            href="#demo-test"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-gold px-8 text-base font-bold text-[#042f2e] shadow-lg hover:bg-amber-400"
          >
            ফ্রি টেস্ট দিন
          </Link>
        </div>
      </section>
    </div>
  );
}
