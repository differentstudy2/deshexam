'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Eye, Download, Bookmark, Search, SlidersHorizontal,
  Filter, X, ChevronLeft, ChevronRight, Plus, Minus, BookOpen,
  Lightbulb, HelpCircle, ScrollText, Star, BookMarked, Grid3X3,
  List, LayoutGrid, BookOpenCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, getDocs, doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const TABS = [
  { id: 'all', label: 'All Documents', icon: BookOpen },
  { id: 'chapter_notes', label: 'Chapter Notes', icon: BookMarked },
  { id: 'suggestion', label: 'Suggestions', icon: Lightbulb },
  { id: 'question_bank', label: 'Question Bank', icon: HelpCircle },
  { id: 'model_paper', label: 'Model Papers', icon: ScrollText },
  { id: 'my_notes', label: 'My Notes', icon: Star },
];

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_DOCS = Array.from({ length: 18 }, (_, i) => ({
  id: `mock-${i}`,
  title: [
    'UPSC History - Medieval Period',
    'Maths Formulae Guide',
    'Science Model Paper 1',
    'Science Model Paper 2',
    'Science Model Paper 3',
    'Bangla Grammar Notes',
  ][i % 6],
  category: ['chapter_notes', 'suggestion', 'question_bank', 'model_paper'][i % 4],
  pages: Math.floor(Math.random() * 80) + 20,
  fileSize: `${(Math.random() * 20 + 2).toFixed(1)} MB`,
  downloads: `${(Math.random() * 3 + 0.5).toFixed(1)}k`,
  url: '',
  thumbnail: null,
}));

// ─── PDF Preview Modal ─────────────────────────────────────────────────────────
export function PDFPreviewModal({ doc: documentData, onClose }: { doc: any; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const totalPages = documentData.pages || 45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <h2 id="modal-title" className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[70%]">
            {documentData.title} (PDF Preview)
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium" aria-hidden="true">Close</span>
            <button
              onClick={onClose}
              aria-label="Close preview"
              className="w-7 h-7 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <nav className="flex items-center justify-center gap-3 px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0" aria-label="PDF Controls">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[80px] text-center" aria-live="polite">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            aria-label="Zoom out"
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="text-xs font-semibold text-slate-500 w-10 text-center" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.25))}
            aria-label="Zoom in"
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-800 flex items-start justify-center p-6">
          {documentData.url ? (
            <iframe
              src={`${documentData.url}#page=${page}`}
              className="rounded-lg shadow-xl"
              style={{ width: `${zoom * 100}%`, height: '70vh', border: 'none' }}
              title={`PDF viewer for ${documentData.title}`}
            />
          ) : (
            <div
              className="bg-white rounded-lg shadow-xl p-8 text-left"
              style={{ width: `${zoom * 560}px`, minHeight: '700px' }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-3">{documentData.title}</h2>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                This is a preview of the document content. The full document contains detailed
                educational material covering all the important topics related to {documentData.title}.
              </p>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Section {i + 1}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              ))}
              <p className="text-center text-xs text-slate-400 mt-8">— Page {page} of {totalPages} —</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Document Card ─────────────────────────────────────────────────────────────
export function DocCard({ doc: documentData, onPreview, isSaved, onToggleSave }: { doc: any; onPreview: (d: any) => void; isSaved: boolean; onToggleSave: () => void }) {
  const docHref = documentData.slug
    ? `/documents/${documentData.slug}`
    : documentData.id && !documentData.id.startsWith('mock-')
      ? `/documents/id/${documentData.id}`
      : null;

  return (
    <article className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 flex flex-col overflow-hidden group">
      <div className="relative bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 pt-5 pb-3 px-4 flex items-center justify-center">
        {docHref ? (
          <Link href={docHref} className="block" aria-label={`View ${documentData.title}`}>
            {documentData.thumbnail ? (
              <img src={documentData.thumbnail} alt={`Thumbnail for ${documentData.title}`} loading="lazy" className="w-14 h-16 object-cover rounded shadow hover:opacity-90 transition-opacity" />
            ) : (
              <div className="relative" aria-hidden="true">
                <div className="w-14 h-16 bg-red-500 rounded-lg flex flex-col overflow-hidden shadow-md hover:bg-red-600 transition-colors">
                  <div className="bg-red-700 px-1.5 py-0.5 text-[8px] font-black text-white tracking-wider">PDF</div>
                  <div className="flex-1 p-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-0.5 bg-white/40 rounded mb-0.5" style={{ width: `${60 + i * 8}%` }} />
                    ))}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-200 dark:bg-red-900 rounded-bl" />
              </div>
            )}
          </Link>
        ) : (
          documentData.thumbnail ? (
            <img src={documentData.thumbnail} alt={`Thumbnail for ${documentData.title}`} loading="lazy" className="w-14 h-16 object-cover rounded shadow" />
          ) : (
            <div className="relative" aria-hidden="true">
              <div className="w-14 h-16 bg-red-500 rounded-lg flex flex-col overflow-hidden shadow-md">
                <div className="bg-red-700 px-1.5 py-0.5 text-[8px] font-black text-white tracking-wider">PDF</div>
                <div className="flex-1 p-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-0.5 bg-white/40 rounded mb-0.5" style={{ width: `${60 + i * 8}%` }} />
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-200 dark:bg-red-900 rounded-bl" />
            </div>
          )
        )}

        <button
          onClick={onToggleSave}
          aria-label={isSaved ? "Remove bookmark" : "Bookmark document"}
          aria-pressed={isSaved}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 shadow-sm hover:bg-white transition-colors"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-500 text-blue-500' : 'text-slate-400'}`} aria-hidden="true" />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {docHref ? (
          <Link href={docHref}>
            <h2 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 leading-snug hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">
              {documentData.title}
            </h2>
          </Link>
        ) : (
          <h2 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 leading-snug">
            {documentData.title}
          </h2>
        )}

        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 mb-3" aria-label="Document metadata">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" aria-hidden="true" />
            <span>Pages: {documentData.pages || 45}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" aria-hidden="true" />
            <span>File Size: {documentData.fileSize || '12.3 MB'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" aria-hidden="true" />
            <span>Downloads: {documentData.downloads || '1.5k'}</span>
          </div>
        </div>

        <footer className="mt-auto flex items-center justify-around border-t border-slate-100 dark:border-slate-800 pt-2.5 gap-1">
          {docHref ? (
            <Link
              href={docHref}
              aria-label={`Read ${documentData.title}`}
              className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <BookOpenCheck className="w-4 h-4" aria-hidden="true" />
              Read
            </Link>
          ) : (
            <button
              onClick={() => onPreview(documentData)}
              aria-label={`Preview ${documentData.title}`}
              className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
              Preview
            </button>
          )}
          <button
            aria-label={`Download ${documentData.title}`}
            className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            onClick={() => documentData.url && window.open(documentData.url, '_blank')}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download
          </button>
        </footer>
      </div>
    </article>
  );
}

// ─── Main Client Page ────────────────────────────────────────────────────────
export default function DocumentsClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedDocs, setSavedDocs] = useState<string[]>([]);

  // Fetch all documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const snap = await getDocs(collection(db, 'guide_documents'));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDocuments(data.length > 0 ? data : MOCK_DOCS);
      } catch {
        setDocuments(MOCK_DOCS);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Fetch saved document IDs for current user
  useEffect(() => {
    if (!user) {
      setSavedDocs([]);
      return;
    }
    const fetchSaved = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setSavedDocs(userDoc.data().savedDocuments || []);
        }
      } catch (error) {
        console.error("Failed to load saved docs", error);
      }
    };
    fetchSaved();
  }, [user]);

  const handleToggleSave = async (docId: string) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please sign in to save documents.", variant: "destructive" });
      return;
    }
    const isSaved = savedDocs.includes(docId);
    
    // Optimistic UI update
    setSavedDocs(prev => isSaved ? prev.filter(id => id !== docId) : [...prev, docId]);

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        savedDocuments: isSaved ? arrayRemove(docId) : arrayUnion(docId)
      }, { merge: true });
      
      if (!isSaved) {
        toast({ title: "Saved!", description: "Document added to your saved list." });
      }
    } catch (error) {
      // Revert UI on failure
      setSavedDocs(prev => isSaved ? [...prev, docId] : prev.filter(id => id !== docId));
      toast({ title: "Error", description: "Failed to update saved documents.", variant: "destructive" });
      console.error("Toggle save error", error);
    }
  };

  const filtered = documents.filter(d => {
    const matchSearch = (d.title || '').toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || d.category === activeTab || (activeTab === 'my_notes' && savedDocs.includes(d.id));
    return matchSearch && matchTab;
  });

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-[#020817]" aria-label="Documents Library">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span>Document Center</span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-700 dark:text-slate-200" aria-current="page">{viewMode === 'grid' ? 'Grid View' : 'List View'}</span>
          </nav>
          <div className="flex items-center gap-2" role="group" aria-label="View toggle">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <nav aria-label="Document Categories" className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-5 overflow-x-auto pb-px">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <search className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <label htmlFor="search-docs" className="sr-only">Search documents</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="search-docs"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes, topics, etc."
              className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 h-9 text-xs border-slate-200 dark:border-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              Sort
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-xs border-slate-200 dark:border-slate-700">
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
              Filter
            </Button>
          </div>
        </search>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" aria-busy="true" aria-label="Loading documents">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center" role="status" aria-live="polite">
            <FileText className="w-14 h-14 text-slate-200 dark:text-slate-700 mx-auto mb-4" aria-hidden="true" />
            <p className="text-lg font-semibold text-slate-500">No documents found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div 
            role="feed"
            aria-label="List of documents"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            {filtered.map(doc => (
              <DocCard 
                key={doc.id} 
                doc={doc} 
                onPreview={setPreviewDoc}
                isSaved={savedDocs.includes(doc.id)}
                onToggleSave={() => handleToggleSave(doc.id)}
              />
            ))}
          </div>
        )}
      </div>

      {previewDoc && (
        <PDFPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </section>
  );
}
