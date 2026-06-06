'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download,
  Maximize, Minimize, RotateCw, Loader2, AlertCircle,
  ExternalLink, FileText, Minus, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PDFJS_VERSION = '4.4.168';
const PDFJS_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`;
const WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
const CMAP_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/cmaps/`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.3);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pageInput, setPageInput] = useState('1');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pageRenderRef = useRef<boolean>(false);

  // ── Load pdfjs from CDN (webpackIgnore bypasses webpack bundling entirely) ──
  const loadPdfJs = useCallback(async () => {
    // @ts-ignore — dynamic CDN import, not a local module
    const lib = await import(/* webpackIgnore: true */ PDFJS_URL);
    lib.GlobalWorkerOptions.workerSrc = WORKER_URL;
    return lib;
  }, []);

  // ── Load the PDF document ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setPdfDoc(null);
    setNumPages(0);
    setPageNumber(1);
    setPageInput('1');

    const load = async () => {
      try {
        const pdfjsLib = await loadPdfJs();
        if (cancelled) return;

        // Proxy external URLs to avoid CORS errors with Firebase Storage
        const fetchUrl = url.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(url)}` : url;

        const loadingTask = pdfjsLib.getDocument({
          url: fetchUrl,
          cMapUrl: CMAP_URL,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load PDF. The file may be unavailable or protected.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [url, loadPdfJs]);

  // ── Render page onto canvas ────────────────────────────────────────────────
  const renderPage = useCallback(async (pdf: any, pageNum: number, currentScale: number, rot: number) => {
    if (!canvasRef.current || !pdf || pageRenderRef.current) return;

    // Cancel any previous render task
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (_) {}
    }

    pageRenderRef.current = true;
    setIsPageLoading(true);

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentScale, rotation: rot });

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Retina / HiDPI support
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);

      const renderContext = { canvasContext: ctx, viewport };
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') {
        console.error('[PdfViewer] render error:', e);
      }
    } finally {
      pageRenderRef.current = false;
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pdfDoc) renderPage(pdfDoc, pageNumber, scale, rotation);
  }, [pdfDoc, pageNumber, scale, rotation, renderPage]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setPageNumber(p => Math.min(p + 1, numPages));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setPageNumber(p => Math.max(p - 1, 1));
      } else if (e.key === '+' || e.key === '=') {
        setScale(s => Math.min(s + 0.2, 4));
      } else if (e.key === '-') {
        setScale(s => Math.max(s - 0.2, 0.4));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [numPages]);

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const zoomIn  = () => setScale(s => Math.min(+(s + 0.2).toFixed(1), 4.0));
  const zoomOut = () => setScale(s => Math.max(+(s - 0.2).toFixed(1), 0.4));
  const rotate  = () => setRotation(r => (r + 90) % 360);
  const prev    = () => { setPageNumber(p => Math.max(p - 1, 1));    setPageInput(String(Math.max(pageNumber - 1, 1))); };
  const next    = () => { setPageNumber(p => Math.min(p + 1, numPages)); setPageInput(String(Math.min(pageNumber + 1, numPages))); };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const n = parseInt(pageInput);
      if (!isNaN(n) && n >= 1 && n <= numPages) setPageNumber(n);
      else setPageInput(String(pageNumber));
    }
  };

  const scalePercent = Math.round(scale * 100);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0f172a] shadow-sm',
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none border-0' : 'h-[85vh] min-h-[600px]'
      )}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-2 flex-wrap">

        {/* Left: Page nav */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev} disabled={pageNumber <= 1 || isLoading}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="text"
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={handlePageInput}
              onBlur={() => setPageInput(String(pageNumber))}
              className="w-10 text-center text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-1 outline-none focus:ring-1 focus:ring-[#107c41]"
              disabled={isLoading}
            />
            <span className="text-slate-400 text-xs">/ {numPages || '—'}</span>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next} disabled={pageNumber >= numPages || isLoading}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Center: Zoom */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={scale <= 0.4 || isLoading}>
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-12 text-center tabular-nums">
            {scalePercent}%
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={scale >= 4.0 || isLoading}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={rotate} disabled={isLoading} title="Rotate 90°">
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Open in new tab">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
          <a href={url} download target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs px-3 bg-[#107c41] hover:bg-[#0d6535] text-white"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </a>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* ── Canvas Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6 bg-slate-200 dark:bg-slate-950/60">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-500">
            <div className="relative">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              <Loader2 className="w-8 h-8 text-[#107c41] absolute -bottom-1 -right-1 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Loading PDF…</p>
              <p className="text-xs text-slate-400 mt-1">Fetching document from server</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white mb-1">Could not load PDF</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
            </div>
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Button className="gap-2 bg-[#107c41] hover:bg-[#0d6535] text-white">
                <Download className="w-4 h-4" />
                Download PDF instead
              </Button>
            </a>
          </div>
        )}

        {/* Canvas */}
        {!isLoading && !error && (
          <div className="relative">
            {/* Page loading overlay */}
            {isPageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10 rounded">
                <Loader2 className="w-6 h-6 text-[#107c41] animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="rounded shadow-xl block max-w-full bg-white"
            />
          </div>
        )}
      </div>

      {/* ── Footer status bar ────────────────────────────────────────────── */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <span className="text-[10px] text-slate-400 font-mono">
            Page {pageNumber} of {numPages} · {scalePercent}% · {rotation > 0 ? `${rotation}° rotated ·` : ''} Use ← → keys to navigate
          </span>
          <span className="text-[10px] text-slate-400">
            Rendered with PDF.js {PDFJS_VERSION}
          </span>
        </div>
      )}
    </div>
  );
}
