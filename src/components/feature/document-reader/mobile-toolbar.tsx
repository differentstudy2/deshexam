'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, Bookmark, Share2, Search, Maximize } from 'lucide-react';

interface MobileToolbarProps {
  onFullscreen?: () => void;
  documentUrl?: string;
  documentTitle?: string;
  documentSlug?: string;
}

export function MobileToolbar({ onFullscreen, documentUrl, documentTitle, documentSlug }: MobileToolbarProps) {
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: documentTitle || 'DeshExam Document',
        url: window.location.href,
      }).catch(console.error);
    }
  };

  const downloadHref = documentSlug
    ? `/download/${documentSlug}`
    : documentUrl || '#';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 flex items-center justify-around z-50 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <Link href={downloadHref} className="flex-1">
        <Button variant="ghost" className="w-full flex flex-col gap-1 h-auto py-2 text-slate-600 dark:text-slate-400">
          <Download className="w-5 h-5" />
          <span className="text-[10px]">Download</span>
        </Button>
      </Link>
      <Button variant="ghost" className="flex-1 flex flex-col gap-1 h-auto py-2 text-slate-600 dark:text-slate-400">
        <Bookmark className="w-5 h-5" />
        <span className="text-[10px]">Save</span>
      </Button>
      <Button variant="ghost" className="flex-1 flex flex-col gap-1 h-auto py-2 text-slate-600 dark:text-slate-400">
        <Search className="w-5 h-5" />
        <span className="text-[10px]">Search</span>
      </Button>
      <Button variant="ghost" onClick={handleShare} className="flex-1 flex flex-col gap-1 h-auto py-2 text-slate-600 dark:text-slate-400">
        <Share2 className="w-5 h-5" />
        <span className="text-[10px]">Share</span>
      </Button>
      {onFullscreen && (
        <Button variant="ghost" onClick={onFullscreen} className="flex-1 flex flex-col gap-1 h-auto py-2 text-slate-600 dark:text-slate-400">
          <Maximize className="w-5 h-5" />
          <span className="text-[10px]">Expand</span>
        </Button>
      )}
    </div>
  );
}
