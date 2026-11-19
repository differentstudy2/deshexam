import { toBn } from "@/lib/wb-board";

// Branded thumbnail — SVG/CSS only, no stock photos (Phase 3).
// Colour is derived from the subject via a small fixed palette.
const SUBJECT_HUES: Record<string, string> = {
  "গণিত": "#0b3b39",
  "পদার্থবিদ্যা": "#134e4a",
  "ভৌতবিজ্ঞান": "#134e4a",
  "রসায়ন": "#155e75",
  "জীবনবিজ্ঞান": "#15803d",
  "জীববিদ্যা": "#15803d",
  "বাংলা": "#7c5e10",
  "English": "#1d4ed8",
  "ইতিহাস": "#92400e",
  "ভূগোল": "#0f766e",
  "বিজ্ঞান": "#15803d",
  "হিসাবশাস্ত্র": "#713f12",
  "রাষ্ট্রবিজ্ঞান": "#6d28d9",
  "শিক্ষাবিজ্ঞান": "#9d174d",
  "কম্পিউটার বিজ্ঞান": "#1e293b",
};

function hueFor(subject: string): string {
  if (SUBJECT_HUES[subject]) return SUBJECT_HUES[subject];
  let h = 0;
  for (const ch of subject) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 45% 28%)`;
}

export function Thumbnail({
  classNo,
  subject,
  title,
  type,
}: {
  classNo: number;
  subject: string;
  title: string;
  type: string;
}) {
  const bg = hueFor(subject);
  return (
    <div
      className="relative flex h-40 w-full flex-col justify-between overflow-hidden p-4 text-white"
      style={{ background: `linear-gradient(135deg, ${bg} 0%, #042f2e 100%)` }}
      role="img"
      aria-label={`${title} — ${subject}, ক্লাস ${toBn(classNo)}`}
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full border-[10px] border-[#d4af37]/30"
      />
      <div className="relative flex items-center gap-2">
        <span className="rounded-full bg-[#d4af37] px-2.5 py-1 text-xs font-bold text-[#042f2e]">
          ক্লাস {toBn(classNo)}
        </span>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          {type}
        </span>
      </div>
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/90">{subject}</p>
        <p className="mt-1 line-clamp-2 text-base font-bold leading-snug">{title}</p>
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 text-center md:mb-10">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-golddark dark:text-amber-400">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
        {title}
      </h2>
      <span aria-hidden className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-gold" />
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-400">{subtitle}</p>
      ) : null}
      {href && linkLabel ? (
        <a href={href} className="mt-3 inline-block text-sm font-semibold text-brand-green hover:underline dark:text-emerald-400">
          {linkLabel} →
        </a>
      ) : null}
    </div>
  );
}

export function PriceTag({ price, oldPrice }: { price: number; oldPrice?: number }) {
  if (price === 0) {
    return <span className="text-lg font-extrabold text-brand-green dark:text-emerald-400">ফ্রি</span>;
  }
  return (
    <span className="flex items-baseline gap-2">
      {oldPrice ? (
        <span className="text-sm text-slate-500 line-through dark:text-slate-400">
          <span className="sr-only">আগের দাম </span>₹{oldPrice}
        </span>
      ) : null}
      <span className="text-lg font-extrabold text-slate-900 dark:text-white">₹{price}</span>
    </span>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="text-lg font-bold text-slate-900 dark:text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-base text-slate-600 dark:text-slate-400">{body}</p>
      {actionLabel && actionHref ? (
        <a
          href={actionHref}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-brand-green px-6 text-sm font-bold text-white hover:bg-emerald-800"
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
