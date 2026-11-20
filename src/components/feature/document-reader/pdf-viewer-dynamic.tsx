'use client';

import dynamic from 'next/dynamic';

export const PdfViewerDynamic = dynamic(
  () => import('./pdf-viewer').then(mod => mod.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[80vh] min-h-[600px] bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-[#107c41] rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading PDF viewer...</p>
        </div>
      </div>
    ),
  }
);
