'use client';

import React, { useState, useRef } from 'react';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Save, Loader2, Upload, FileText, X, FolderOpen, Image as ImageIcon,
  Tag, Globe, Lock, BookOpen, Users, FileArchive, FileSpreadsheet,
  Presentation, CheckCircle2
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface DocumentFormData {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  language: string;
  pages: string;
  version: string;
  author: string;
  tags: string;
  boardId: string;
  classId: string;
  subjectId: string;
  textbookId: string;
  chapterId: string;
  topicId: string;
  access: string;
  status: string;
  thumbnail: string;
}

export interface DocumentUploadFormProps {
  /** Pre-fill topicId (used when embedded inside topic editor) */
  topicId?: string;
  /** Called after document is saved. Returns the document ID. */
  onSaved?: (docId: string, data: any) => void;
  /** Compact mode — hides curriculum fields when they're already known */
  compact?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'study_notes', label: 'Study Notes' },
  { value: 'pdf_notes', label: 'PDF Notes' },
  { value: 'question_paper', label: 'Question Paper' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'worksheet', label: 'Worksheet' },
  { value: 'model_answer', label: 'Model Answer' },
  { value: 'answer_key', label: 'Answer Key' },
  { value: 'admission_form', label: 'Admission Form' },
  { value: 'notice', label: 'Notice' },
  { value: 'routine', label: 'Routine' },
  { value: 'book', label: 'Book' },
  { value: 'ebook', label: 'E-book' },
  { value: 'teacher_resource', label: 'Teacher Resource' },
];

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt';

const TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-500', docx: 'bg-blue-600', doc: 'bg-blue-600',
  pptx: 'bg-orange-500', ppt: 'bg-orange-500', xlsx: 'bg-green-600',
  xls: 'bg-green-600', zip: 'bg-yellow-500', rar: 'bg-yellow-500',
  txt: 'bg-slate-500',
};

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// ─── File Icon ────────────────────────────────────────────────────────────────
function FileTypeIcon({ ext, size = 'md' }: { ext: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = TYPE_COLORS[ext] || 'bg-slate-400';
  const dims = { sm: 'w-8 h-10', md: 'w-12 h-14', lg: 'w-16 h-20' }[size];
  const textSize = { sm: 'text-[7px]', md: 'text-[9px]', lg: 'text-[11px]' }[size];
  return (
    <div className={`${dims} ${colors} rounded-lg flex flex-col overflow-hidden shadow-md relative`}>
      <div className={`px-1 py-0.5 bg-black/20 ${textSize} font-black text-white tracking-wider uppercase`}>{ext}</div>
      <div className="flex-1 p-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-0.5 bg-white/30 rounded mb-0.5" style={{ width: `${50 + i * 12}%` }} />
        ))}
      </div>
      {/* Folded corner */}
      <div className="absolute top-0 right-0 w-3 h-3 bg-white/20" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function DocumentUploadForm({ topicId, onSaved, compact = false }: DocumentUploadFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');

  const [form, setForm] = useState<DocumentFormData>({
    title: '', slug: '', shortDescription: '', description: '',
    category: 'study_notes', language: 'bengali', pages: '',
    version: '', author: '', tags: '', boardId: '', classId: '',
    subjectId: '', textbookId: '', chapterId: '', topicId: topicId || '',
    access: 'free', status: 'published', thumbnail: '',
  });

  const update = (key: string, val: string) =>
    setForm(prev => ({ ...prev, [key]: val, ...(key === 'title' ? { slug: generateSlug(val) } : {}) }));

  const getExt = (f: File) => f.name.split('.').pop()?.toLowerCase() || '';

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setThumbFile(f); setThumbPreview(URL.createObjectURL(f)); }
  };

  const uploadFileToStorage = (f: File, path: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, f);
      task.on('state_changed',
        snap => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });

  const handleSave = async (statusOverride?: string) => {
    if (!form.title) {
      toast({ title: 'Title is required', variant: 'destructive' }); return;
    }
    setSaving(true);
    setUploadProgress(0);

    try {
      const newRef = doc(collection(db, 'documents'));
      const docId = newRef.id;

      let fileUrl = '';
      let fileType = '';
      let fileSize = 0;

      if (file) {
        setIsUploading(true);
        fileUrl = await uploadFileToStorage(file, `documents/${docId}/${file.name}`);
        fileType = getExt(file);
        fileSize = file.size;
        setIsUploading(false);
      }

      let thumbnailUrl = form.thumbnail;
      if (thumbFile) {
        thumbnailUrl = await uploadFileToStorage(thumbFile, `documents/${docId}/thumbnail`);
      }

      const effectiveTopicId = form.topicId || topicId || '';

      const payload = {
        id: docId,
        ...form,
        status: statusOverride || form.status,
        topicId: effectiveTopicId,
        topicIds: effectiveTopicId ? [effectiveTopicId] : [],
        fileUrl,
        fileType,
        fileSize,
        thumbnail: thumbnailUrl,
        pages: form.pages ? parseInt(form.pages) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        downloads: 0,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(newRef, payload);
      setSaved(true);
      toast({ title: '✅ Document uploaded!', description: 'It is now in the Document Library.' });
      onSaved?.(docId, payload);
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
      setIsUploading(false);
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Document Uploaded!</h3>
        <p className="text-slate-500 mb-6">It's now available in the Document Library and attached to this topic.</p>
        <Button onClick={() => { setSaved(false); setFile(null); setThumbFile(null); setThumbPreview(''); setForm(f => ({ ...f, title: '', slug: '', shortDescription: '', description: '', pages: '', tags: '' })); }}>
          Upload Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">Document File</Label>
        <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
        {!file ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none ${dragOver ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 scale-[1.01]' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/40 dark:hover:bg-amber-900/10'}`}
          >
            <div className="flex justify-center gap-3 mb-4 opacity-60">
              <FileTypeIcon ext="pdf" size="sm" />
              <FileTypeIcon ext="docx" size="sm" />
              <FileTypeIcon ext="pptx" size="sm" />
              <FileTypeIcon ext="xlsx" size="sm" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-base">Drag & Drop your file here</p>
            <p className="text-sm text-slate-500 mt-1 mb-4">PDF · DOCX · PPTX · XLSX · ZIP · TXT</p>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <Upload className="w-4 h-4 mr-2" /> Browse Files
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <FileTypeIcon ext={getExt(file)} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{file.name}</p>
              <p className="text-sm text-slate-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB · {getExt(file).toUpperCase()}</p>
              {isUploading && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-amber-600 mt-1">Uploading {Math.round(uploadProgress)}%...</p>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-red-400 hover:text-red-600 shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. The Wind Cap — Full Chapter Notes" className="dark:bg-slate-800" />
        </div>
        <div className="space-y-2">
          <Label>Short Description</Label>
          <Textarea value={form.shortDescription} onChange={e => update('shortDescription', e.target.value)} rows={2} placeholder="Brief description visible in listings..." className="dark:bg-slate-800 resize-none" />
        </div>
      </div>

      {/* Category chips */}
      <div className="space-y-3">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => update('category', c.value)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${form.category === c.value ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="space-y-3">
        <Label>Cover Thumbnail</Label>
        <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
        {thumbPreview ? (
          <div className="relative w-28 h-36 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group">
            <img src={thumbPreview} alt="Cover" className="w-full h-full object-cover" />
            <button onClick={() => { setThumbPreview(''); setThumbFile(null); }}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button onClick={() => thumbInputRef.current?.click()}
            className="w-28 h-36 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-amber-300 transition-colors text-slate-400 hover:text-amber-500">
            <ImageIcon className="w-6 h-6" />
            <span className="text-[10px] font-semibold text-center px-1">Upload Cover</span>
          </button>
        )}
      </div>

      {/* Curriculum (only shown when not compact or topicId not set) */}
      {!compact && (
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <Label className="text-sm font-bold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" /> Curriculum (optional)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'boardId', label: 'Board', placeholder: 'e.g. WBBSE' },
              { key: 'classId', label: 'Class', placeholder: 'e.g. Class 8' },
              { key: 'subjectId', label: 'Subject', placeholder: 'e.g. English' },
              { key: 'topicId', label: 'Topic ID', placeholder: 'Topic ID' },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs">{f.label}</Label>
                <Input value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} className="h-8 text-xs dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access + Metadata row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Pages</Label>
          <Input type="number" value={form.pages} onChange={e => update('pages', e.target.value)} placeholder="24" className="h-9 dark:bg-slate-800" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Language</Label>
          <select value={form.language} onChange={e => update('language', e.target.value)}
            className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs">
            <option value="bengali">Bengali</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="both">Bilingual</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Access</Label>
          <select value={form.access} onChange={e => update('access', e.target.value)}
            className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs">
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags (comma separated)</Label>
        <Input value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="notes, chapter-1, wbbse" className="dark:bg-slate-800" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={() => handleSave('published')}
          disabled={saving}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{isUploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Saving...'}</>
          ) : (
            <><Save className="w-4 h-4" /> Upload & Publish</>
          )}
        </Button>
        <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving} className="gap-2">
          Save Draft
        </Button>
      </div>
    </div>
  );
}
