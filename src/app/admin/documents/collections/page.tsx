'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Layers, FolderPlus, FileText, Save, Loader2, Search } from 'lucide-react';

export default function CollectionsPage() {
  const { toast } = useToast();
  const [collections, setCollections] = useState<any[]>([]);
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [newCol, setNewCol] = useState({ title: '', description: '', docIds: [] as string[] });

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'document_collections')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
      getDocs(collection(db, 'guide_documents')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
    ]).then(([cols, docs]) => {
      setCollections(cols);
      setAllDocs(docs);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newCol.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const ref = doc(collection(db, 'document_collections'));
      const payload = { id: ref.id, ...newCol, createdAt: new Date(), updatedAt: new Date() };
      await setDoc(ref, payload);
      setCollections(prev => [payload, ...prev]);
      setNewCol({ title: '', description: '', docIds: [] });
      setCreating(false);
      toast({ title: 'Collection created' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const toggleDoc = (id: string) => {
    setNewCol(prev => ({
      ...prev,
      docIds: prev.docIds.includes(id) ? prev.docIds.filter(d => d !== id) : [...prev.docIds, id],
    }));
  };

  const filteredDocs = allDocs.filter(d => (d.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817]">
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/admin/documents">
            <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" /> Document Collections
            </h1>
            <p className="text-xs text-slate-500">Group documents into themed bundles for easy access</p>
          </div>
          <Button onClick={() => setCreating(true)} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
            <Plus className="w-4 h-4" /> New Collection
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Create form */}
        {creating && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-300 dark:border-amber-700 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">New Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Collection Title *</Label>
                <Input value={newCol.title} onChange={e => setNewCol(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Madhyamik 2026" className="dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newCol.description} onChange={e => setNewCol(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" className="dark:bg-slate-800" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Add Documents to Collection
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="pl-9 dark:bg-slate-800" />
              </div>
              <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.length === 0 ? (
                  <p className="p-4 text-sm text-slate-400 text-center">No documents found</p>
                ) : filteredDocs.map(d => (
                  <label key={d.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <input type="checkbox" checked={newCol.docIds.includes(d.id)} onChange={() => toggleDoc(d.id)} className="accent-amber-500 w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{d.title}</p>
                      <p className="text-xs text-slate-400 capitalize">{(d.category || '').replace(/_/g, ' ')}</p>
                    </div>
                    {newCol.docIds.includes(d.id) && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Selected</span>}
                  </label>
                ))}
              </div>
              {newCol.docIds.length > 0 && <p className="text-xs text-amber-600 font-medium">{newCol.docIds.length} documents selected</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreate} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Collection
              </Button>
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Collections list */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
        ) : collections.length === 0 ? (
          <div className="py-24 text-center">
            <Layers className="w-14 h-14 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-500">No collections yet</p>
            <p className="text-sm text-slate-400 mb-6">Create a collection to group related documents together.</p>
            <Button onClick={() => setCreating(true)} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
              <Plus className="w-4 h-4" /> Create First Collection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map(col => {
              const colDocs = allDocs.filter(d => (col.docIds || []).includes(d.id));
              return (
                <div key={col.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">{col.title}</h3>
                      {col.description && <p className="text-xs text-slate-500 mt-0.5">{col.description}</p>}
                    </div>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">{colDocs.length} docs</span>
                  </div>
                  <div className="space-y-1.5">
                    {colDocs.slice(0, 4).map(d => (
                      <div key={d.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{d.title}</span>
                      </div>
                    ))}
                    {colDocs.length > 4 && <p className="text-xs text-slate-400 pl-5">+{colDocs.length - 4} more...</p>}
                    {colDocs.length === 0 && <p className="text-xs text-slate-400 italic">No documents assigned</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
