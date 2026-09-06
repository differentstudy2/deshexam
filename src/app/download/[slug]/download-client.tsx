'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronRight, Bookmark, Share2, Download,
  FileText, Globe, Eye, Clock, CheckCircle2, Play, Headphones,
  BookOpen, HelpCircle, PenLine, Layers, ArrowLeft, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdUnit } from '@/components/ui/ad-unit';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DocItem {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string;
  fileUrl?: string;
  url?: string;
  fileType?: string;
  fileSize?: number;
  pages?: number;
  downloads?: number;
  views?: number;
  language?: string;
  category?: string;
  documentType?: string;
  topicId?: string;
  chapterId?: string;
  updatedAt?: number;
  createdAt?: number;
}

interface Props {
  document: DocItem;
  relatedDocs: DocItem[];
  settings?: {
    autoDownload: boolean;
    adsMode: string;
    adsensePublisherId?: string;
    leftAdSlot?: string;
    rightAdSlot?: string;
    sidebarAdSlot?: string;
    belowHeroAdSlot?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const fileTypeColor: Record<string, string> = {
  pdf: 'bg-red-500', docx: 'bg-blue-600', doc: 'bg-blue-600',
  pptx: 'bg-orange-500', ppt: 'bg-orange-500', xlsx: 'bg-green-600',
  zip: 'bg-yellow-500', rar: 'bg-yellow-500', mp3: 'bg-purple-500',
  mp4: 'bg-cyan-500',
};

function FileTypeBadge({ ext }: { ext: string }) {
  const bg = fileTypeColor[ext.toLowerCase()] || 'bg-slate-500';
  return (
    <span className={`${bg} text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wide`}>
      {ext}
    </span>
  );
}

// ─── Countdown / Download Core ────────────────────────────────────────────────
// NOTE: fileUrl is NEVER passed to this component — the proxy URL is used
// so the real storage URL is never exposed in the browser.
function CountdownCard({ slug, fileType, autoDownload }: { slug: string; fileType: string; autoDownload?: boolean }) {
  // Proxy endpoint — hides the real storage URL from the client
  const proxyUrl = `/api/documents/download/${slug}`;

  const TOTAL = 5;
  const [count, setCount] = useState(TOTAL);
  const [phase, setPhase] = useState<'counting' | 'manual' | 'success' | 'error'>(autoDownload === false ? 'manual' : 'counting');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerDownload = useCallback(() => {
    try {
      const link = window.document.createElement('a');
      link.href = proxyUrl;
      link.download = '';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      setPhase('success');
    } catch {
      setPhase('error');
    }
  }, [proxyUrl]);

  useEffect(() => {
    if (phase !== 'counting') return;
    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  useEffect(() => {
    if (count === 0 && phase === 'counting') {
      triggerDownload();
    }
  }, [count, phase, triggerDownload]);

  const progress = ((TOTAL - count) / TOTAL) * 100;
  const circleCircumference = 2 * Math.PI * 48;
  const circleDash = ((100 - progress) / 100) * circleCircumference;

  const extLabel = fileType.toUpperCase();
  const extBg = fileTypeColor[fileType.toLowerCase()] || 'bg-slate-500';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 sm:p-8 text-center relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-transparent dark:from-emerald-900/10 pointer-events-none" />

      {phase === 'counting' && (
        <>
          {/* File type animated icon */}
          <div className="flex justify-center mb-5">
            <div className={`relative w-16 h-16 animate-bounce`}>
              <div className={`w-full h-full ${extBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-white text-[11px] font-black tracking-wider">{extLabel}</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Preparing Your Download</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Please wait while we prepare your file.</p>

          {/* Circular countdown + step markers */}
          <div className="flex items-center justify-center gap-8">
            {/* SVG ring */}
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="48" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                <circle
                  cx="56" cy="56" r="48"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleDash}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">{count}</span>
                <span className="text-xs text-slate-400 mt-1">seconds</span>
              </div>
            </div>

            {/* Step markers */}
            <div className="flex flex-col gap-1.5">
              {[5, 4, 3, 2, 1].map(n => (
                <div key={n} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-all ${count <= n ? 'bg-emerald-500 scale-125' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <span className={`text-sm font-semibold transition-all ${count <= n ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">File will download automatically…</p>
        </>
      )}

      {phase === 'manual' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex justify-center mb-5">
            <div className={`relative w-16 h-16`}>
              <div className={`w-full h-full ${extBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-white text-[11px] font-black tracking-wider">{extLabel}</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your file is ready.</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Click the button below to start the download.</p>
          <a href={proxyUrl} download onClick={() => setTimeout(() => setPhase('success'), 1000)}>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 h-12 rounded-xl text-base shadow-lg shadow-emerald-500/20">
              <Download className="w-5 h-5" /> Download File Now
            </Button>
          </a>
        </div>
      )}

      {phase === 'success' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your file is ready.</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Download started successfully.</p>
          <div className="flex flex-col gap-3">
            {/* Download again — still uses proxy, not raw URL */}
            <a href={proxyUrl} download>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 h-12 rounded-xl text-base shadow-lg shadow-emerald-500/20">
                <Download className="w-5 h-5" /> Download Again
              </Button>
            </a>
            <Button variant="ghost" className="w-full gap-2 h-10 text-slate-500" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" /> Return to Chapter
            </Button>
          </div>
        </div>
      )}

      {phase === 'error' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Download className="w-7 h-7 text-amber-500" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Auto-download blocked</h2>
          <p className="text-sm text-slate-500 mb-4">Your browser blocked the auto-download. Please click below.</p>
          {/* Fallback button — proxy URL only */}
          <a href={proxyUrl} download>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 h-12 rounded-xl">
              <Download className="w-5 h-5" /> Download Now
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Continue Learning cards ────────────────────────────────────────────────
const CONTINUE_ITEMS = [
  { icon: Play, label: 'Video Lecture', sub: 'Watch chapter explanation', color: 'bg-red-500', href: '#' },
  { icon: BookOpen, label: 'Guide Content', sub: 'Read complete guide', color: 'bg-emerald-600', href: '#' },
  { icon: HelpCircle, label: 'MCQ Practice', sub: 'Test your knowledge', color: 'bg-blue-500', href: '#' },
  { icon: Headphones, label: 'Audio Lesson', sub: 'Listen while learning', color: 'bg-purple-500', href: '#' },
  { icon: PenLine, label: 'Creative Questions', sub: 'Exam preparation', color: 'bg-orange-500', href: '#' },
];

function ContinueLearningSection() {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Continue Learning While You Wait</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Explore related resources from this chapter.</p>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {CONTINUE_ITEMS.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className="flex-shrink-0 w-36 sm:w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight">{item.label}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">{item.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Related Study Materials ──────────────────────────────────────────────────
function RelatedMaterialCard({ doc }: { doc: DocItem }) {
  const ext = doc.fileType || 'pdf';
  const href = doc.slug ? `/download/${doc.slug}` : `/download/${doc.id}`;
  return (
    <Link href={href} className="group flex gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200">
      <div className={`w-12 h-14 ${fileTypeColor[ext] || 'bg-slate-400'} rounded-lg flex flex-col overflow-hidden shrink-0 relative shadow-sm`}>
        <div className="px-1 py-0.5 bg-black/20 text-[7px] font-black text-white tracking-wider uppercase">{ext}</div>
        <div className="flex-1 p-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-0.5 bg-white/30 rounded mb-0.5" style={{ width: `${50 + i * 15}%` }} />
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{doc.title}</p>
        {doc.pages && <p className="text-xs text-slate-400 mt-1">{doc.pages} Pages</p>}
      </div>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function DownloadSidebar({ relatedDocs, document: doc, settings, showAds }: { relatedDocs: DocItem[]; document: DocItem; settings: any; showAds: boolean }) {
  return (
    <aside className="hidden lg:flex flex-col gap-6 w-72 xl:w-80 shrink-0">
      {/* Related Study Materials */}
      {relatedDocs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-slate-800 dark:text-white mb-4">Related Study Materials</h4>
          <div className="space-y-3">
            {relatedDocs.slice(0, 4).map(d => (
              <RelatedMaterialCard key={d.id} doc={d} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Downloads */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <h4 className="font-bold text-slate-800 dark:text-white mb-4">Popular Downloads</h4>
        <div className="space-y-3">
          {['Important Questions PDF', 'Worksheet PDF', 'Revision Notes', 'Suggestion PDF'].map((name, i) => (
            <div key={name} className="flex items-center gap-3 group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors truncate">{name}</p>
                <p className="text-xs text-slate-400">{[14, 17, 23, 11][i]} Downloads</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Ad Slot */}
      {showAds && settings?.sidebarAdSlot && (
        <AdUnit publisherId={settings.adsensePublisherId} slotId={settings.sidebarAdSlot} className="w-full min-h-[250px] rounded-xl shadow-sm" />
      )}

      {/* Premium Promo Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white shadow-lg">
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
        <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200">Premium</span>
          </div>
          <h4 className="font-bold text-base mb-3 leading-tight">Unlock All Study Materials</h4>
          <ul className="space-y-1.5 mb-4">
            {['Unlimited Downloads', 'Premium Notes', 'Mock Tests', 'Exclusive Resources'].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Button size="sm" className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl">
            Upgrade Now
          </Button>
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <h4 className="font-bold text-slate-800 dark:text-white mb-4">Chapter Navigation</h4>
        <div className="space-y-2">
          {['Chapter Overview', 'Chapter Example', 'Chapter Bank'].map(n => (
            <Link key={n} href="#" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
              <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-emerald-600">{n}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Main Client Page ─────────────────────────────────────────────────────────
export function DownloadPageClient({ document: doc, relatedDocs, settings = { autoDownload: true, adsMode: 'guests_only' } }: Props) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  // fileUrl is intentionally NOT extracted here — it must never be sent to the browser.
  const ext = doc.fileType || 'pdf';
  const slug = doc.slug || doc.id;

  const showAds = settings.adsMode === 'everyone' || (settings.adsMode === 'guests_only' && !user);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: doc.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookmark = async () => {
    setBookmarked(b => !b);
    try {
      await fetch(`/api/documents/${doc.id}/bookmark`, { method: 'POST' });
    } catch {
      setBookmarked(b => !b); // revert on error
    }
  };

  const updatedDate = doc.updatedAt
    ? formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-16">
      {/* ── Minimal Header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-slate-900 dark:text-white text-sm hidden sm:block">DeshExam</span>
            </Link>
            <nav className="hidden md:flex items-center text-xs text-slate-400 gap-1 min-w-0">
              <Link href="/" className="hover:text-emerald-600 shrink-0">Home</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href="/documents" className="hover:text-emerald-600 shrink-0">Documents</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px] font-medium">{doc.title}</span>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${bookmarked ? 'border-emerald-300 text-emerald-600 bg-emerald-50' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-600'}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
              <span className="hidden sm:block">Bookmark</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Share</span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main Content ────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Hero Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 h-2" />
              <div className="p-5 sm:p-6 flex gap-4 sm:gap-6">
                {/* Thumbnail / file icon */}
                <div className="shrink-0">
                  {doc.thumbnail ? (
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md">
                      <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-20 h-24 sm:w-24 sm:h-28 ${fileTypeColor[ext] || 'bg-slate-400'} rounded-xl flex flex-col overflow-hidden shadow-md`}>
                      <div className="px-1 py-0.5 bg-black/20 text-[8px] font-black text-white tracking-wider uppercase">{ext}</div>
                      <div className="flex-1 p-2 flex flex-col gap-1">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-0.5 bg-white/30 rounded" />)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <FileTypeBadge ext={ext} />
                    {doc.category && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize">
                        {doc.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
                    {doc.title}
                  </h1>
                  {(doc.shortDescription || doc.description) && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                      {doc.shortDescription || doc.description}
                    </p>
                  )}

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {doc.pages && (
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{doc.pages} Pages</span>
                    )}
                    {doc.fileSize && (
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{formatFileSize(doc.fileSize)}</span>
                    )}
                    {doc.language && (
                      <span className="flex items-center gap-1 capitalize"><Globe className="w-3.5 h-3.5" />{doc.language}</span>
                    )}
                    {doc.views !== undefined && (
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{doc.views.toLocaleString()} Views</span>
                    )}
                    {doc.downloads !== undefined && (
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{doc.downloads.toLocaleString()} Downloads</span>
                    )}
                    {updatedDate && (
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Updated {updatedDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Below Hero Ad Slot */}
            {showAds && settings.belowHeroAdSlot && (
              <div className="mb-6">
                <AdUnit publisherId={settings.adsensePublisherId} slotId={settings.belowHeroAdSlot} className="w-full min-h-[90px] rounded-xl overflow-hidden shadow-sm" />
              </div>
            )}

            {/* Download Area with Side Ads */}
            <div className="mb-8 flex flex-col md:flex-row gap-6 items-start justify-center">
              {showAds && settings.leftAdSlot && (
                <div className="hidden md:block w-[160px] lg:w-[300px] shrink-0">
                  <AdUnit publisherId={settings.adsensePublisherId} slotId={settings.leftAdSlot} className="w-full h-[600px] rounded-xl shadow-sm" />
                </div>
              )}
              
              <div className="flex-1 w-full max-w-2xl">
                {/* Pass slug only — real fileUrl is never sent to the client */}
                <CountdownCard slug={slug} fileType={ext} autoDownload={settings.autoDownload} />
              </div>

              {showAds && settings.rightAdSlot && (
                <div className="hidden md:block w-[160px] lg:w-[300px] shrink-0">
                  <AdUnit publisherId={settings.adsensePublisherId} slotId={settings.rightAdSlot} className="w-full h-[600px] rounded-xl shadow-sm" />
                </div>
              )}
            </div>

            {/* Continue Learning */}
            <ContinueLearningSection />

            {/* Mobile: Related Docs */}
            {relatedDocs.length > 0 && (
              <div className="lg:hidden mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Related Study Materials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedDocs.map(d => <RelatedMaterialCard key={d.id} doc={d} />)}
                </div>
              </div>
            )}

            {/* Premium Banner (mobile) */}
            <div className="lg:hidden mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="flex items-start gap-4">
                <Crown className="w-8 h-8 text-yellow-300 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-200 mb-1">Premium</p>
                  <h4 className="font-bold text-base mb-2">Unlock All Study Materials</h4>
                  <Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl">
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <DownloadSidebar relatedDocs={relatedDocs} document={doc} settings={settings} showAds={showAds} />
        </div>
      </div>

      {/* Trigger Analytics (Client side tracking) */}
      <script dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined') {
             setTimeout(() => {
                fetch('/api/documents/${doc.id}/analytics', { method: 'POST' }).catch(console.error);
             }, 3000);
          }
        `
      }} />
    </div>
  );
}
