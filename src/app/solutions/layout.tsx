import SolutionsSidebar from '@/components/feature/solutions-sidebar';

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto flex items-start gap-3 px-3 sm:px-4 py-5">
        <main className="flex-1 min-w-0">
          {children}
        </main>
        <SolutionsSidebar />
      </div>
    </div>
  );
}
