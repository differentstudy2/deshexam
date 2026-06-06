'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [useGoogleDocs, setUseGoogleDocs] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [hasError, setHasError] = useState(false);

  const googleDocsUrl = `https://docs.google.com/gviewer?embedded=true&url=${encodeURIComponent(url)}`;
  const viewerSrc = useGoogleDocs ? googleDocsUrl : url;

  const handleReload = () => {
    setIframeKey(k => k + 1);
    setHasError(false);
  };

  const handleSwitchViewer = () => {
    setUseGoogleDocs(prev => !prev);
    setHasError(false);
    setIframeKey(k => k + 1);
  };

  return (
    <div className="flex flex-col bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {useGoogleDocs ? 'Google Docs Viewer' : 'Browser Viewer'}
          </span>
          <button
            onClick={handleSwitchViewer}
            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Switch to {useGoogleDocs ? 'Browser' : 'Google Docs'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-slate-600 dark:text-slate-400"
            onClick={handleReload}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </Button>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </Button>
          </a>
          <a href={url} download target="_blank" rel="noopener noreferrer">
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-1.5 text-xs bg-[#107c41] hover:bg-[#0d6535] text-white"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          </a>
        </div>
      </div>

      {/* PDF Frame */}
      <div className="relative h-[80vh] min-h-[600px] w-full">
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-white mb-1">Could not load PDF</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Your browser may be blocking the file. Try switching to the Google Docs viewer or download the file.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSwitchViewer} variant="outline" size="sm">
                Try Google Docs Viewer
              </Button>
              <a href={url} download target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-[#107c41] hover:bg-[#0d6535] text-white">
                  <Download className="w-4 h-4 mr-1.5" />
                  Download PDF
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={viewerSrc}
            className="w-full h-full border-0"
            title="PDF Document Viewer"
            allow="fullscreen"
            onError={() => setHasError(true)}
          />
        )}
      </div>
    </div>
  );
}
