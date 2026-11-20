import Link from 'next/link';
import type { Metadata } from 'next';
import PricingClientPage from './pricing-client';
import { PLANS, toBn } from '@/lib/wb-board';

export const metadata: Metadata = {
  title: 'প্রাইসিং — Basic ₹৫০, Plus ₹১০০, Pro ₹২০০ /মাস | DeshExam',
  description: 'ক্লাস ৫–১২, WBBSE ও WBCHSE প্রস্তুতির প্ল্যান — Basic ₹৫০, Plus ₹১০০, Pro ₹২০০ প্রতি মাসে। UPI, কার্ড ও নেট ব্যাংকিংয়ে পেমেন্ট করা যায়।',
  keywords: ['deshexam pricing', 'wbbse mock test price', 'madhyamik plan', 'wbchse subscription', 'upi payment'],
  openGraph: {
    title: 'DeshExam প্রাইসিং — Basic ₹৫০, Plus ₹১০০, Pro ₹২০০ /মাস',
    description: 'আপনার জন্য সঠিক প্ল্যান বেছে নিন — UPI, কার্ড ও নেট ব্যাংকিংয়ে পেমেন্ট করা যায়।',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/pricing`,
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'DeshExam — ক্লাস ৫ থেকে ১২, পশ্চিমবঙ্গ বোর্ডের সম্পূর্ণ প্রস্তুতি',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeshExam প্রাইসিং — Basic ₹৫০, Plus ₹১০০, Pro ₹২০০ /মাস',
    description: 'আপনার জন্য সঠিক প্ল্যান বেছে নিন — UPI, কার্ড ও নেট ব্যাংকিংয়ে পেমেন্ট করা যায়।',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/og-image.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/pricing`,
  },
  robots: {
    index: true,
    follow: true,
  }
};

// JSON-LD built only from the real PLANS data — no invented ratings, counts
// or prices. "X-এর সব সুবিধা" rows are expanded so each plan lists exactly
// what it includes.
const jsonLdProduct = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DeshExam — WBBSE ও WBCHSE প্রস্তুতি",
  "description": "ক্লাস ৫–১২, WBBSE (মাধ্যমিক) ও WBCHSE (উচ্চমাধ্যমিক) বোর্ডের প্রস্তুতি — অধ্যায়ভিত্তিক MCQ, আগের বছরের প্রশ্নপত্র, মক টেস্ট, নোট ও ভিডিও ক্লাস।",
  "brand": {
    "@type": "Brand",
    "name": "DeshExam"
  },
  "offers": PLANS.map((p) => ({
    "@type": "Offer",
    "name": p.name,
    "price": String(p.price),
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/pricing`
  }))
};

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "DeshExam-এর প্ল্যানগুলোর দাম কত?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Basic ₹৫০/মাস, Plus ₹১০০/মাস ও Pro ₹২০০/মাস। প্ল্যানের মেয়াদ কেনার সময় পেমেন্টের আগে দেখানো হয়।"
      }
    },
    {
      "@type": "Question",
      "name": "পেমেন্ট কীভাবে করব?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "UPI, কার্ড ও নেট ব্যাংকিংয়ে পেমেন্ট করা যায়। পেমেন্টের আগে প্ল্যান, দাম ও মেয়াদ দেখে নিশ্চিত হয়ে নিন।"
      }
    },
    {
      "@type": "Question",
      "name": "রিফান্ড কি পাওয়া যায়?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ডিজিটাল কনটেন্ট কেনার পর অ্যাক্সেস পেলে সাধারণত রিফান্ড হয় না। বিস্তারিত জানতে Refund Policy পাতাটি দেখুন।"
      }
    }
  ]
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}`
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Pricing",
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/pricing`
    }
  ]
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}`,
  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/logo.png`
};

// Expand "Basic-এর সব সুবিধা" / "Plus-এর সব সুবিধা" into the referenced
// plan's full feature list, so the table shows exactly what each plan has.
function resolveFeatures(planId: string, seen = new Set<string>()): string[] {
  if (seen.has(planId)) return [];
  seen.add(planId);
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return [];
  const out: string[] = [];
  for (const f of plan.features) {
    const m = f.match(/^(.+)-এর সব সুবিধা$/);
    if (m) {
      const ref = PLANS.find((p) => p.name === m[1]);
      if (ref) out.push(...resolveFeatures(ref.id, seen));
    } else {
      out.push(f);
    }
  }
  return out;
}

const PLAN_FEATURES = PLANS.map((p) => ({ ...p, allFeatures: resolveFeatures(p.id) }));
// Union of features, first-seen order (Basic first, then Plus-only, Pro-only).
const ALL_FEATURES: string[] = [];
for (const p of PLAN_FEATURES) {
  for (const f of p.allFeatures) {
    if (!ALL_FEATURES.includes(f)) ALL_FEATURES.push(f);
  }
}

function ComparisonTable() {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-12 text-white md:py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <div className="container relative mx-auto max-w-6xl px-4">
        <p className="text-center text-sm font-bold tracking-wide text-amber-300">প্ল্যান তুলনা করুন</p>
        <h2 className="mt-2 text-center text-2xl font-extrabold md:text-4xl">কোন প্ল্যানে কী কী পাবেন</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-base text-slate-300">
          তিনটি প্ল্যানের পাশাপাশি তুলনা — দাম ও সুবিধা দেখে আপনার জন্য সঠিক প্ল্যান বেছে নিন।
        </p>

        {/* Desktop table */}
        <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] md:block">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="min-w-[220px] p-4 text-base font-bold text-slate-200">সুবিধা</th>
                {PLAN_FEATURES.map((p) => (
                  <th key={p.id} className="p-4 text-center">
                    <span className="block text-lg font-extrabold text-white">{p.name}</span>
                    <span className="mt-1 block text-2xl font-extrabold text-amber-300">₹{toBn(p.price)}<span className="text-sm font-semibold text-slate-300">/মাস</span></span>
                    {'popular' in p && p.popular ? (
                      <span className="mt-2 inline-block rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-[#042f2e]">সবচেয়ে জনপ্রিয়</span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map((f) => (
                <tr key={f} className="border-b border-white/5 last:border-0">
                  <td className="p-4 text-base text-slate-200">{f}</td>
                  {PLAN_FEATURES.map((p) => (
                    <td key={p.id} className="p-4 text-center text-xl" aria-label={p.allFeatures.includes(f) ? 'আছে' : 'নেই'}>
                      {p.allFeatures.includes(f) ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:hidden">
          {PLAN_FEATURES.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 ${
                'popular' in p && p.popular
                  ? 'border-2 border-amber-400 bg-white/[0.06] shadow-lg'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            >
              {'popular' in p && p.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-[#042f2e]">
                  সবচেয়ে জনপ্রিয়
                </span>
              ) : null}
              <h3 className="text-xl font-extrabold text-white">{p.name}</h3>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-sm text-slate-400 line-through">₹{toBn(p.oldPrice)}</span>
                <span className="text-4xl font-extrabold text-white">₹{toBn(p.price)}</span>
                <span className="text-sm text-slate-400">/মাস</span>
              </p>
              <ul className="mt-5 space-y-2">
                {ALL_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-base text-slate-200">
                    {p.allFeatures.includes(f) ? (
                      <span className="font-bold text-emerald-400">✓</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                    <span className={p.allFeatures.includes(f) ? '' : 'text-slate-500 line-through'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className={`mt-6 flex min-h-[48px] items-center justify-center rounded-full text-base font-bold ${
                  'popular' in p && p.popular ? 'bg-amber-400 text-[#042f2e]' : 'bg-emerald-600 text-white'
                }`}
              >
                কিনুন
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm leading-relaxed text-slate-300">
          পেমেন্ট: UPI · কার্ড · নেট ব্যাংকিং। ডিজিটাল কনটেন্ট কেনার পর অ্যাক্সেস পেলে সাধারণত রিফান্ড হয় না — বিস্তারিত{' '}
          <Link href="/refund-policy" className="font-semibold text-amber-300 hover:underline">
            Refund Policy
          </Link>{' '}
          দেখুন।
        </p>
      </div>
    </section>
  );
}

export default function PricingPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
            <PricingClientPage />
            <ComparisonTable />
        </>
    );
}
