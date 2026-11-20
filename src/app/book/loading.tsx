// Loading skeleton for /book and /book/[id] (Phase 6 — instant feedback while the list loads).
export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mx-auto mt-3 h-5 w-96 max-w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="aspect-[3/4] rounded-t-xl bg-slate-200 dark:bg-slate-800" />
            <div className="p-5">
              <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
