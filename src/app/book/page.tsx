'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/firebase/product';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CLASSES, MEDIUMS, toBn } from '@/lib/wb-board';

const PAGE_SIZE = 12;

/** classCategory is free text like "Class 10" or "5 - 10 Class" — match a class number in it. */
function matchesClass(classCategory: string, n: number): boolean {
  const cat = classCategory || '';
  const range = cat.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) {
    const lo = Number(range[1]);
    const hi = Number(range[2]);
    if (!Number.isNaN(lo) && !Number.isNaN(hi) && n >= lo && n <= hi) return true;
  }
  return new RegExp(`\\b${n}\\b`).test(cat);
}

/** Derive WB medium from a product's language field — no invented data. */
function mediumOf(language: string): 'bn' | 'en' | undefined {
  const lang = (language || '').toLowerCase();
  if (lang.includes('বাংলা') || lang.includes('bengali') || lang.includes('bangla')) return 'bn';
  if (lang.includes('english')) return 'en';
  return undefined;
}

function BookStoreInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') ?? '';
  const classParam = searchParams.get('class');
  const classNum = classParam ? Number(classParam) : undefined;
  const validClass =
    classNum !== undefined && (CLASSES as readonly number[]).includes(classNum)
      ? classNum
      : undefined;
  const medium =
    searchParams.get('medium') === 'bn' || searchParams.get('medium') === 'en'
      ? (searchParams.get('medium') as 'bn' | 'en')
      : undefined;
  const subjectParam = searchParams.get('subject') ?? undefined;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({}, 50);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const subjectOptions = useMemo(
    () => [...new Set(products.map((p) => p.subject).filter(Boolean))].sort(),
    [products],
  );
  const subject =
    subjectParam && subjectOptions.includes(subjectParam) ? subjectParam : undefined;

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '' || v === 'all') next.delete(k);
      else next.set(k, v);
    }
    if (!('page' in patch)) next.delete('page');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const hay = `${p.title} ${p.authorName}`.toLowerCase();
        if (q && !hay.includes(q.toLowerCase())) return false;
        if (validClass !== undefined && !matchesClass(p.classCategory, validClass)) return false;
        if (subject !== undefined && p.subject !== subject) return false;
        if (medium !== undefined && mediumOf(p.language) !== medium) return false;
        return true;
      }),
    [products, q, validClass, subject, medium],
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number(searchParams.get('page')) || 1));
  const pageItems = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filtersActive =
    validClass !== undefined || medium !== undefined || subject !== undefined || q !== '';

  const pill = (active: boolean) =>
    `inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold ${
      active
        ? 'bg-amber-400 text-[#042f2e]'
        : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen bg-[#040d1a] pb-20 text-slate-100">
      {/* Hero Section — premium dark, blue glow + gold accent */}
      <div className="relative overflow-hidden bg-[radial-gradient(700px_320px_at_15%_0%,rgba(37,99,235,0.35),transparent),linear-gradient(180deg,#04122b,#040d1a)] px-4 py-16 text-white">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center text-center">
          <BookOpen className="mb-6 h-16 w-16 text-amber-300" />
          <h1 className="font-headline text-4xl font-bold tracking-tight md:text-6xl">
            DeshExam Store
          </h1>
          <p className="mb-8 mt-4 max-w-2xl text-lg text-slate-300 md:text-xl">
            ক্লাস ও বিষয় অনুযায়ী বই, গাইড ও প্র্যাকটিস সেট বেছে নিন — বাংলা ও English মাধ্যমে।
          </p>

          <div className="relative w-full max-w-md text-slate-900">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="বই বা লেখকের নাম লিখুন..."
              className="w-full rounded-full border border-white/15 bg-white py-6 pl-10 text-lg shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400"
              value={q}
              onChange={(e) => updateParams({ q: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Filters — class / subject / medium + page, synced to URL */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.05] p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold text-amber-200">ক্লাস:</span>
            <button type="button" onClick={() => updateParams({ class: undefined, subject: undefined })} className={pill(validClass === undefined)}>সব ক্লাস</button>
            {CLASSES.map((n) => (
              <button key={n} type="button" onClick={() => updateParams({ class: String(n), subject: undefined })} className={pill(validClass === n)}>
                {toBn(n)}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold text-amber-200">মাধ্যম:</span>
            <button type="button" onClick={() => updateParams({ medium: undefined })} className={pill(medium === undefined)}>সব মাধ্যম</button>
            {MEDIUMS.map((m) => (
              <button key={m.id} type="button" onClick={() => updateParams({ medium: m.id })} className={pill(medium === m.id)}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold text-amber-200">বিষয়:</span>
            <button type="button" onClick={() => updateParams({ subject: undefined })} className={pill(subject === undefined)}>সব বিষয়</button>
            {subjectOptions.map((s) => (
              <button key={s} type="button" onClick={() => updateParams({ subject: s })} className={pill(subject === s)}>
                {s}
              </button>
            ))}
          </div>
          {filtersActive && (
            <button
              type="button"
              onClick={() => router.replace(pathname, { scroll: false })}
              className="mt-4 inline-flex min-h-[40px] items-center rounded-full border border-amber-300/50 px-4 text-sm font-bold text-amber-200 hover:bg-white/10"
            >
              ✕ ফিল্টার মুছুন
            </button>
          )}
        </div>

        <p className="mb-6 text-sm text-slate-400">
          {toBn(filteredProducts.length)}টি বই পাওয়া গেছে
          {validClass !== undefined ? ` · ক্লাস ${toBn(validClass)}` : ''}
          {subject ? ` · ${subject}` : ''}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl bg-white/[0.05] shadow-sm" />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center">
            <h2 className="text-2xl font-semibold text-white">
              {q ? `No products found matching "${q}"` : 'কোনো বই পাওয়া যায়নি'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">ফিল্টার বদলে আবার দেখুন।</p>
            <Button
              variant="outline"
              className="mt-4 min-h-[44px] border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => router.replace(pathname, { scroll: false })}
            >
              ফিল্টার মুছুন
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {pageItems.map((product) => (
                <Link
                  href={`/book/${product.id}`}
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-xl"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
                    <img
                      src={product.coverImage || '/placeholder.png'}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.discount > 0 && (
                      <div className="absolute right-3 top-3 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                        {product.discount}% OFF
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex gap-2">
                      <Badge variant="secondary" className="border-0 bg-white/90 text-slate-800 shadow-sm backdrop-blur-sm hover:bg-white">
                        {product.bookType}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-grow flex-col p-5">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-300">{product.subject}</div>
                    <h3 className="mb-1 line-clamp-2 text-lg font-bold text-white transition-colors group-hover:text-amber-300">
                      {product.title}
                    </h3>
                    <p className="mb-4 line-clamp-1 text-sm text-slate-400">
                      By {product.authorName}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                      <div>
                        <span className="text-xl font-bold text-white">₹{product.price}</span>
                        {product.discount > 0 && (
                          <span className="ml-2 text-sm text-slate-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <Button size="icon" className="rounded-full bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-[#042f2e]">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="পৃষ্ঠা">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← আগের
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateParams({ page: String(n) })}
                    aria-current={n === page ? 'page' : undefined}
                    className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-4 text-sm font-bold ${
                      n === page
                        ? 'bg-amber-400 text-[#042f2e]'
                        : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {toBn(n)}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  পরের →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BookStorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#040d1a] text-slate-300">
          লোড হচ্ছে…
        </div>
      }
    >
      <BookStoreInner />
    </Suspense>
  );
}
