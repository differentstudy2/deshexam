// Loading skeleton for /questions (Phase 6 — instant feedback while the list loads).
export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="h-8 w-72 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="h-5 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 flex gap-2">
              <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
