'use client';

import dynamic from 'next/dynamic';

export const DocumentMetadataCardDynamic = dynamic(
  () => import('./document-metadata-card').then(mod => mod.DocumentMetadataCard),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-lg animate-pulse">
        <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-4" />
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
      </div>
    ),
  }
);
