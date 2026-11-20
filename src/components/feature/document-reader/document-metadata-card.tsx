"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Download, Bookmark, Share2, Eye, FileText, Globe, Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSaveDocument } from '@/hooks/use-save-document';

interface DocumentMetadataProps {
  document: any; 
}

export function DocumentMetadataCard({ document }: DocumentMetadataProps) {
  const { isSaved, toggleSave } = useSaveDocument();

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  const handleScrollToReader = () => {
    const el = window.document.getElementById('pdf-viewer-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formattedDate = document.updatedAt || document.createdAt 
    ? formatDistanceToNow(new Date(document.updatedAt?.toMillis ? document.updatedAt.toMillis() : document.updatedAt || Date.now()), { addSuffix: true }) 
    : 'Unknown';

  const slug = document.slug || document.id;
  const saved = isSaved(document.id);

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Pages</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{document.pages || 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Globe className="w-4 h-4" /> Language</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{document.language || 'English / Bengali'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Eye className="w-4 h-4" /> Views</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{document.views || 0}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Download className="w-4 h-4" /> Downloads</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{document.downloads || 0}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Tag className="w-4 h-4" /> Type</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{document.documentType || document.type || 'Chapter Notes'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Updated</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formattedDate}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Size</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={handleScrollToReader} className="bg-[#107c41] hover:bg-[#0b5c30] text-white">
            <BookOpen className="w-4 h-4 mr-2" /> Read Online
          </Button>
          <Link href={`/download/${slug}`}>
            <Button variant="outline" className="border-[#107c41] text-[#107c41] hover:bg-green-50 dark:hover:bg-green-900/20">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </Link>
          <Button 
            variant={saved ? "default" : "ghost"} 
            className={saved ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-slate-600 dark:text-slate-400"}
            onClick={() => toggleSave(document.id)}
          >
            <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-white' : ''}`} /> 
            {saved ? 'Saved' : 'Bookmark'}
          </Button>
          <Button variant="ghost" onClick={handleShare} className="text-slate-600 dark:text-slate-400">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
