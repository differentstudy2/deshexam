'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DocumentUploadForm } from '@/components/admin/DocumentUploadForm';
import { FolderOpen, Search, Plus, Loader2, Trash2, ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TopicDocumentManagerProps { topicId: string; }

const TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-500', docx: 'bg-blue-600', doc: 'bg-blue-600',
  pptx: 'bg-orange-500', xlsx: 'bg-green-600', zip: 'bg-yellow-500',
  rar: 'bg-yellow-500', txt: 'bg-slate-500',
};

function formatBytes(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TopicDocumentManager({ topicId }: TopicDocumentManagerProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<'attached' | 'existing' | 'upload'>('attached');
  const [attached, setAttached] = useState<any[]>([]);
  const [loadingAttached, setLoadingAttached] = useState(true);
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAttached = async () => {
    setLoadingAttached(true);
    try {
      const q = query(collection(db, 'guide_documents'), where('topicIds', 'array-contains', topicId));
      const snap = await getDocs(q);
      setAttached(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoadingAttached(false); }
  };

  const fetchAll = async () => {
    setLoadingAll(true);
    try {
      const snap = await getDocs(collection(db, 'guide_documents'));
      setAllDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoadingAll(false); }
  };

  useEffect(() => { fetchAttached(); }, [topicId]);

  const handleTabChange = (t: typeof tab) => {
    setTab(t);
    if (t === 'existing' && allDocs.length === 0) fetchAll();
  };

  const attachDoc = async (document: any) => {
    try {
      await updateDoc(doc(db, 'guide_documents', document.id), { topicIds: [...(document.topicIds || []), topicId], updatedAt: new Date() });
      toast({ title: `"${document.title}" attached!` });
      fetchAttached(); setTab('attached');
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const detachDoc = async (document: any) => {
    if (!confirm(`Detach "${document.title}"?`)) return;
    try {
      await updateDoc(doc(db, 'guide_documents', document.id), { topicIds: (document.topicIds || []).filter((id: string) => id !== topicId), updatedAt: new Date() });
      toast({ title: 'Detached' });
      setAttached(prev => prev.filter(d => d.id !== document.id));
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const unattachedDocs = allDocs.filter(d => !(d.topicIds || []).includes(topicId) && (d.title || '').toLowerCase().includes(search.toLowerCase()));

  const TABS = [
    { id: 'attached', label: `Attached (${attached.length})` },
    { id: 'existing', label: 'Find Existing' },
    { id: 'upload', label: '+ Upload' },
  ] as const;

  return (
    <div>
      {/* Tab pills */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)}
            className={cn("px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border", tab === t.id ? "bg-amber-500 text-white border-amber-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500")}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Attached ── */}
      {tab === 'attached' && (
        loadingAttached ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-amber-500" /></div>
        ) : attached.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <FolderOpen className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No documents attached</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Find an existing doc or upload a new one</p>
            <div className="flex gap-2">
              <button onClick={() => handleTabChange('existing')} className="px-4 py-2 text-xs font-semibold rounded-full border border-slate-300 text-slate-600">Find Existing</button>
              <button onClick={() => handleTabChange('upload')} className="px-4 py-2 text-xs font-semibold rounded-full bg-amber-500 text-white">Upload New</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {attached.map(d => (
              <div key={d.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-sm">
                {/* File type badge */}
                <div className={cn("w-9 h-11 rounded-lg flex flex-col overflow-hidden shrink-0 shadow-sm", TYPE_COLORS[d.fileType] || 'bg-slate-400')}>
                  <span className="text-[6px] font-black text-white px-1 tracking-wider pt-0.5">{(d.fileType || '?').toUpperCase()}</span>
                  <div className="flex-1 p-1">{[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-white/30 rounded mb-0.5" />)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">{d.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {d.pages && <span className="text-[10px] text-slate-400">{d.pages}p</span>}
                    {d.fileSize && <span className="text-[10px] text-slate-400">{formatBytes(d.fileSize)}</span>}
                    {d.category && <span className="text-[10px] text-slate-400 capitalize">{d.category.replace(/_/g, ' ')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"><button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="w-3.5 h-3.5 text-blue-500" /></button></a>}
                  <Link href={`/admin/documents/edit/${d.id}`} target="_blank"><button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><ExternalLink className="w-3.5 h-3.5 text-slate-400" /></button></Link>
                  <button onClick={() => detachDoc(d)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Find Existing ── */}
      {tab === 'existing' && (
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input className="h-9 pl-8 text-sm rounded-xl" placeholder="Search document library..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {loadingAll ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-amber-500" /></div>
          ) : unattachedDocs.length === 0 ? (
            <div className="py-10 text-center">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-200 dark:text-slate-700" />
              <p className="text-sm text-slate-400">No documents available</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto lg:max-h-none lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {unattachedDocs.map(d => (
                <div key={d.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
                  <div className={cn("w-7 h-9 rounded shrink-0 flex flex-col overflow-hidden", TYPE_COLORS[d.fileType] || 'bg-slate-400')}>
                    <span className="text-[5px] font-black text-white px-0.5 tracking-wider">{(d.fileType || '?').toUpperCase()}</span>
                    <div className="flex-1 p-0.5">{[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-white/30 rounded mb-0.5" />)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{d.title}</p>
                    {d.pages && <p className="text-[10px] text-slate-400 mt-0.5">{d.pages} pages</p>}
                  </div>
                  <button onClick={() => attachDoc(d)} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-500 text-white shrink-0">
                    <Plus className="w-3.5 h-3.5 inline mr-0.5" /> Attach
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Upload New ── */}
      {tab === 'upload' && (
        <DocumentUploadForm
          topicId={topicId}
          compact
          onSaved={(docId, data) => {
            setAttached(prev => [{ id: docId, ...data }, ...prev]);
            setTimeout(() => setTab('attached'), 1500);
          }}
        />
      )}
    </div>
  );
}
