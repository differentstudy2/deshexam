'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Guide Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Something went wrong!</h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        We encountered an error while trying to fetch this curriculum data from the backend. 
        It might be because the database hasn't been seeded yet.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default" className="bg-[#107c41] hover:bg-[#0b5c30]">
          Try again
        </Button>
      </div>
    </div>
  );
}
