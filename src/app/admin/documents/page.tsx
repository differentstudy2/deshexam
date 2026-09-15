'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  FolderOpen, Plus, Loader2, Search, Eye, Edit3, Trash2, Download,
  FileText, FileArchive, FileSpreadsheet, Presentation, BookOpen,
  Filter, BarChart2, Layers, RefreshCw, ExternalLink, Settings
} from 'lucide-react';

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5 text-red-500" />,
  docx: <FileText className="w-5 h-5 text-blue-500" />,
  doc: <FileText className="w-5 h-5 text-blue-500" />,
  pptx: <Presentation className="w-5 h-5 text-orange-500" />,
  xlsx: <FileSpreadsheet className="w-5 h-5 text-green-500" />,
  zip: <FileArchive className="w-5 h-5 text-yellow-500" />,
  rar: <FileArchive className="w-5 h-5 text-yellow-500" />,
  txt: <FileText className="w-5 h-5 text-slate-500" />,
};

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

function formatBytes(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDocumentsPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'guide_documents'));
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'guide_documents', id));
      toast({ title: 'Deleted', description: `"${title}" was deleted.` });
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const filtered = documents.filter(d => {
    const matchSearch = (d.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: 'Total', value: documents.length, color: 'text-blue-600' },
    { label: 'Published', value: documents.filter(d => d.status === 'published').length, color: 'text-emerald-600' },
    { label: 'Draft', value: documents.filter(d => d.status === 'draft').length, color: 'text-yellow-600' },
    { label: 'Total Downloads', value: documents.reduce((a, d) => a + (d.downloads || 0), 0), color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817]">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <FolderOpen className="w-6 h-6 text-amber-500" />
              Document Library
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage all educational documents and files</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadDocuments} disabled={loading} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/admin/documents/collections">
              <Button variant="outline" size="sm" className="gap-2">
                <Layers className="w-4 h-4" />
                Collections
              </Button>
            </Link>
            <Link href="/admin/documents/analytics">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart2 className="w-4 h-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/admin/documents/create">
              <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="w-4 h-4" />
                Upload Document
              </Button>
            </Link>
            <Link href="/admin/documents/settings">
              <Button variant="outline" size="icon" className="w-9 h-9 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600" title="Settings">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="pl-9 h-9 bg-white dark:bg-slate-900" />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'published', 'draft', 'archived'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <FolderOpen className="w-14 h-14 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-500">No documents found</p>
              <p className="text-sm text-slate-400 mb-6">Upload your first document to get started.</p>
              <Link href="/admin/documents/create">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                  <Plus className="w-4 h-4" /> Upload Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class / Subject</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Downloads</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {FILE_TYPE_ICONS[doc.fileType] || <FileText className="w-5 h-5 text-slate-400" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-1 max-w-[200px]">{doc.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{doc.fileType?.toUpperCase()} {doc.pages ? `· ${doc.pages} pages` : ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{(doc.category || '—').replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400">{doc.classId || '—'}</div>
                        <div className="text-xs text-slate-400">{doc.subjectId || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatBytes(doc.fileSize)}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{(doc.downloads || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[doc.status] || STATUS_STYLES.draft}`}>
                          {doc.status || 'draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {doc.fileUrl && (
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-blue-600">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                          <Link href={`/admin/documents/edit/${doc.id}`}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-amber-600">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </Link>
                          {doc.fileUrl && (
                            <a href={doc.fileUrl} download>
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-emerald-600">
                                <Download className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(doc.id, doc.title)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
