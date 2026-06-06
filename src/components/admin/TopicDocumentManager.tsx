'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DocumentUploadForm } from '@/components/admin/DocumentUploadForm';
import {
  FolderOpen, Search, Plus, Loader2, Trash2, ExternalLink,
  FileText, FileArchive, Download, Eye, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface TopicDocumentManagerProps {
  topicId: string;
}

const TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-500', docx: 'bg-blue-600', doc: 'bg-blue-600',
  pptx: 'bg-orange-500', xlsx: 'bg-green-600', zip: 'bg-yellow-500',
  rar: 'bg-yellow-500', txt: 'bg-slate-500',
};

function FileChip({ ext }: { ext: string }) {
  return (
    <span className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded uppercase ${TYPE_COLORS[ext] || 'bg-slate-400'}`}>
      {ext || 'file'}
    </span>
  );
}

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

  // Load attached
  const fetchAttached = async () => {
    setLoadingAttached(true);
    try {
      const q = query(collection(db, 'documents'), where('topicIds', 'array-contains', topicId));
      const snap = await getDocs(q);
      setAttached(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoadingAttached(false); }
  };

  // Load all (for Attach Existing)
  const fetchAll = async () => {
    setLoadingAll(true);
    try {
      const snap = await getDocs(collection(db, 'documents'));
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
      const updatedTopicIds = [...(document.topicIds || []), topicId];
      await updateDoc(doc(db, 'documents', document.id), {
        topicIds: updatedTopicIds,
        updatedAt: new Date(),
      });
      toast({ title: 'Attached', description: `"${document.title}" attached to this topic.` });
      fetchAttached();
      setTab('attached');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const detachDoc = async (document: any) => {
    if (!confirm(`Detach "${document.title}" from this topic?`)) return;
    try {
      const updatedTopicIds = (document.topicIds || []).filter((id: string) => id !== topicId);
      await updateDoc(doc(db, 'documents', document.id), {
        topicIds: updatedTopicIds,
        updatedAt: new Date(),
      });
      toast({ title: 'Detached' });
      setAttached(prev => prev.filter(d => d.id !== document.id));
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const unattachedDocs = allDocs.filter(d =>
    !(d.topicIds || []).includes(topicId) &&
    (d.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-2">
      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 mb-5">
        {[
          { id: 'attached', label: `Attached (${attached.length})` },
          { id: 'existing', label: 'Attach Existing' },
          { id: 'upload', label: '⬆ Upload New' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id as typeof tab)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Attached */}
      {tab === 'attached' && (
        <>
          {loadingAttached ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          ) : attached.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">No documents attached yet</p>
              <p className="text-sm text-slate-400 mb-5">Attach existing docs or upload a new one</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm" onClick={() => handleTabChange('existing')}>Attach Existing</Button>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => handleTabChange('upload')}>
                  <Plus className="w-4 h-4 mr-1" /> Upload New
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {attached.map(document => (
                <div key={document.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-amber-200 dark:hover:border-amber-800 transition-colors group">
                  {/* Icon */}
                  <div className={`w-10 h-12 rounded-lg flex flex-col overflow-hidden shadow ${TYPE_COLORS[document.fileType] || 'bg-slate-400'}`}>
                    <span className="text-[7px] font-black text-white px-1 pt-0.5 tracking-wider">{(document.fileType || '?').toUpperCase()}</span>
                    <div className="flex-1 p-1">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-white/30 rounded mb-0.5" />)}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{document.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FileChip ext={document.fileType} />
                      {document.pages && <span className="text-xs text-slate-400">{document.pages} pages</span>}
                      {document.fileSize && <span className="text-xs text-slate-400">{formatBytes(document.fileSize)}</span>}
                      <span className="text-xs text-slate-400 capitalize">{(document.category || '').replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {document.fileUrl && (
                      <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-blue-600"><Eye className="w-4 h-4" /></Button>
                      </a>
                    )}
                    <Link href={`/admin/documents/edit/${document.id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-amber-600">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-red-500" onClick={() => detachDoc(document)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: Attach Existing */}
      {tab === 'existing' && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search document library..." className="pl-9 dark:bg-slate-800" />
          </div>
          {loadingAll ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          ) : unattachedDocs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No documents available</p>
              <p className="text-sm mt-1">All documents are already attached, or upload a new one.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {unattachedDocs.map(document => (
                <div key={document.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-amber-200 dark:hover:border-amber-800 transition-colors group">
                  <div className={`w-8 h-10 rounded flex flex-col overflow-hidden shadow-sm shrink-0 ${TYPE_COLORS[document.fileType] || 'bg-slate-400'}`}>
                    <span className="text-[6px] font-black text-white px-0.5 tracking-wider">{(document.fileType || '?').toUpperCase()}</span>
                    <div className="flex-1 p-0.5">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-white/30 rounded mb-0.5" />)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{document.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {document.pages && <span className="text-xs text-slate-400">{document.pages}p</span>}
                      <span className="text-xs text-slate-400 capitalize">{(document.category || '').replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => attachDoc(document)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Attach
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 3: Upload New */}
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
