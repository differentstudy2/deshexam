'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, WifiOff, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  const isOffline = error.message?.toLowerCase().includes('offline') || typeof navigator !== 'undefined' && !navigator.onLine;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            {isOffline ? (
              <WifiOff className="w-10 h-10 text-red-500" />
            ) : (
              <AlertCircle className="w-10 h-10 text-red-500" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isOffline ? 'You are offline' : 'Something went wrong!'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isOffline 
              ? "It looks like you've lost your internet connection. Please check your network settings and try again."
              : "We apologize for the inconvenience. An unexpected error occurred while loading this page."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button 
            onClick={() => reset()} 
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>
        
        {!isOffline && (
          <div className="pt-4 text-xs text-slate-400 text-left border-t border-slate-100 dark:border-slate-800">
            <p className="font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded overflow-x-auto">
              {error.message || 'Unknown application error'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
