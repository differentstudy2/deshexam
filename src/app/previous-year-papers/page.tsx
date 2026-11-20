import Link from 'next/link';
import { Metadata } from 'next';
import { getAssessments } from '@/lib/firebase/assessment';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { CLASSES, boardForClass, toBn } from '@/lib/wb-board';

export const metadata: Metadata = {
  title: 'আগের বছরের প্রশ্নপত্র — ক্লাস ৫–১২, WBBSE ও WBCHSE | DeshExam',
  description: 'মাধ্যমিক ও উচ্চমাধ্যমিকের আগের বছরের প্রশ্নপত্র — ক্লাস, বোর্ড ও বছর অনুযায়ী খুঁজুন।',
};

// --- URL-query filters (?board=&class=&year=) --------------------------------
// Years, boards and classes come ONLY from the papers that actually exist in
// the database — nothing is invented. A paper's year is taken from its
// `year` / `yearId` field, or from a 4-digit year in its title.
// Board ids in the taxonomy today: "board-wb" = WBBSE. Any other board id is
// matched by its own id and shown as-is.

function classOf(a: any): number | null {
  const m = String(a.classId || '').match(/class-(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function yearOf(a: any): string | null {
  if (a.year !== undefined && a.year !== null && a.year !== '') return String(a.year);
  if (a.yearId) {
    const m = String(a.yearId).match(/(19|20)\d{2}/);
    if (m) return m[0];
    return String(a.yearId);
  }
  const m = String(a.title || '').match(/(19|20)\d{2}/);
  return m ? m[0] : null;
}

function boardMatches(a: any, board: string): boolean {
  if (board === 'WBBSE') return a.boardId === 'board-wb';
  if (board === 'WBCHSE') return a.boardId === 'board-wbchse' || a.boardId === 'board-hs';
  return a.boardId === board;
}

function boardLabel(boardId: string): string {
  if (boardId === 'board-wb') return 'WBBSE';
  if (boardId === 'board-wbchse' || boardId === 'board-hs') return 'WBCHSE';
  return boardId;
}

export default async function PreviousYearPapersListingPage(props: {
  searchParams: Promise<{ board?: string; class?: string; year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const board = searchParams?.board || undefined;
  const classNum = searchParams?.class ? parseInt(searchParams.class, 10) : undefined;
  const year = searchParams?.year || undefined;

  const all = (await getAssessments('examPapers')) as any[];
  const papers = all.filter((a) => a.status === 'Published');

  // Filter options derived from the data that exists — never invented.
  const years = Array.from(new Set(papers.map(yearOf).filter((y): y is string => Boolean(y)))).sort((a, b) => b.localeCompare(a));
  const boardIds = Array.from(new Set(papers.map((a) => String(a.boardId || '')).filter(Boolean)));
  const boards = boardIds.map((id) => ({ id, label: boardLabel(id) }));
  const classNums = Array.from(
    new Set(papers.map(classOf).filter((n): n is number => n !== null))
  ).sort((a, b) => a - b);

  const filtered = papers.filter((a) => {
    if (board && !boardMatches(a, board)) return false;
    if (classNum && classOf(a) !== classNum) return false;
    if (year && yearOf(a) !== year) return false;
    return true;
  });

  const href = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const b = patch.board !== undefined ? patch.board : board;
    const c = patch.class !== undefined ? patch.class : (classNum ? String(classNum) : undefined);
    const y = patch.year !== undefined ? patch.year : year;
    if (b) params.set('board', b);
    if (c) params.set('class', c);
    if (y) params.set('year', y);
    const qs = params.toString();
    return qs ? `/previous-year-papers?${qs}` : '/previous-year-papers';
  };

  const chip = (active: boolean) =>
    `inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm font-bold transition-colors ${
      active
        ? 'border-amber-400 bg-amber-400 text-[#042f2e]'
        : 'border-white/15 bg-white/5 text-slate-200 hover:border-amber-400/60 hover:text-white'
    }`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold tracking-wide text-amber-300">WBBSE · WBCHSE · ক্লাস ৫–১২</p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">আগের বছরের প্রশ্নপত্র</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300">
            মাধ্যমিক ও উচ্চমাধ্যমিকের আগের বছরের প্রশ্নপত্র — ক্লাস, বোর্ড ও বছর অনুযায়ী খুঁজুন।
            বিস্তারিত সমাধানসহ অনলাইন পরীক্ষা হিসেবে দেওয়া যায়।
          </p>
        </div>

        {/* Filters — state lives in the URL query */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg md:p-5">
          <p className="mb-3 text-sm font-bold tracking-wide text-amber-300">ফিল্টার করুন</p>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-16 shrink-0 text-sm font-semibold text-slate-300">বোর্ড</span>
              <Link href={href({ board: '' })} className={chip(!board)}>সব বোর্ড</Link>
              {boards.map((b) => (
                <Link key={b.id} href={href({ board: b.label === b.id ? b.id : b.label })} className={chip(board === b.label || board === b.id)}>
                  {b.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-16 shrink-0 text-sm font-semibold text-slate-300">ক্লাস</span>
              <Link href={href({ class: '' })} className={chip(!classNum)}>সব ক্লাস</Link>
              {CLASSES.map((n) => (
                <Link key={n} href={href({ class: String(n) })} className={chip(classNum === n)}>
                  ক্লাস {toBn(n)}{n === 10 ? ' · মাধ্যমিক' : n === 12 ? ' · উচ্চমাধ্যমিক' : ''}
                </Link>
              ))}
              {classNums.filter((n) => !(CLASSES as readonly number[]).includes(n)).map((n) => (
                <Link key={n} href={href({ class: String(n) })} className={chip(classNum === n)}>
                  ক্লাস {toBn(n)}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-16 shrink-0 text-sm font-semibold text-slate-300">বছর</span>
              <Link href={href({ year: '' })} className={chip(!year)}>সব বছর</Link>
              {years.map((y) => (
                <Link key={y} href={href({ year: y })} className={chip(year === y)}>{toBn(y)}</Link>
              ))}
            </div>
          </div>
          {(board || classNum || year) && (
            <Link href="/previous-year-papers" className="mt-4 inline-flex min-h-[40px] items-center text-sm font-bold text-amber-300 hover:text-amber-200">
              ✕ সব ফিল্টার সরান
            </Link>
          )}
        </div>

        <p className="mb-6 text-base text-slate-300">
          {filtered.length === 0
            ? 'কোনো প্রশ্নপত্র পাওয়া যায়নি।'
            : `${toBn(filtered.length)}টি প্রশ্নপত্র পাওয়া গেছে${classNum ? ` — ${boardForClass(classNum) === 'WBBSE' ? 'WBBSE' : 'WBCHSE'}, ক্লাস ${toBn(classNum)}` : ''}${year ? `, ${toBn(year)}` : ''}।`}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-lg font-bold">এখনো কোনো প্রশ্নপত্র যোগ করা হয়নি</p>
            <p className="mx-auto mt-2 max-w-xl text-base text-slate-300">
              {papers.length === 0
                ? 'আগের বছরের প্রশ্নপত্র ক্লাস অনুযায়ী তৈরি হচ্ছে — শীঘ্রই এখানে আসবে।'
                : 'এই ফিল্টারে কোনো প্রশ্নপত্র নেই — অন্য ক্লাস, বোর্ড বা বছর বেছে দেখুন।'}
            </p>
            {(board || classNum || year) && (
              <Link href="/previous-year-papers" className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-full bg-amber-400 px-8 text-base font-bold text-[#042f2e]">
                সব প্রশ্নপত্র দেখুন
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((paper) => (
              <AssessmentCard
                key={paper.id}
                assessment={paper}
                type="Exam"
                href={`/previous-year-papers/${paper.slug || paper.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
