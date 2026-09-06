'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Search, Video, Save, Trash2, ExternalLink, Youtube, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getTopicFullHierarchy } from '@/lib/firebase/guide';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TopicVideoManagerProps { topicId: string; }

export function TopicVideoManager({ topicId }: TopicVideoManagerProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<'attached' | 'existing' | 'new'>('attached');
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [attachedVideos, setAttachedVideos] = useState<any[]>([]);
  const [loadingAttached, setLoadingAttached] = useState(true);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', shortDescription: '', language: 'english',
    provider: 'youtube', videoUrl: '', youtubeId: '', thumbnail: '', duration: '',
    videoType: 'lesson', instructorName: 'DeshExam', instructorAvatar: '', instructorBio: '', status: 'published',
  });

  useEffect(() => {
    getTopicFullHierarchy(topicId).then(h => setHierarchy(h)).catch(console.error);
    fetchAttachedVideos();
  }, [topicId]);

  const fetchAttachedVideos = async () => {
    setLoadingAttached(true);
    try {
      const q = query(collection(db, 'guide_videos'), where('topicIds', 'array-contains', topicId));
      const snap = await getDocs(q);
      setAttachedVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { toast({ title: 'Error loading videos', variant: 'destructive' }); }
    finally { setLoadingAttached(false); }
  };

  const fetchAllVideos = async () => {
    setLoadingAll(true);
    try {
      const snap = await getDocs(collection(db, 'guide_videos'));
      setAllVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoadingAll(false); }
  };

  const handleTabChange = (t: typeof tab) => {
    setTab(t);
    if (t === 'existing' && allVideos.length === 0) fetchAllVideos();
  };

  const attachVideo = async (video: any) => {
    try {
      await updateDoc(doc(db, 'guide_videos', video.id), {
        topicIds: [...(video.topicIds || []), topicId],
        attachments: [...(video.attachments || []), { boardId: hierarchy?.board?.id || '', classId: hierarchy?.class?.id || '', subjectId: hierarchy?.subject?.id || '', chapterId: hierarchy?.chapter?.id || '', topicId, sortOrder: 1 }],
        updatedAt: new Date()
      });
      toast({ title: 'Video attached!' });
      fetchAttachedVideos();
      setTab('attached');
    } catch (e) { toast({ title: 'Failed to attach', variant: 'destructive' }); }
  };

  const detachVideo = async (video: any) => {
    if (!confirm('Detach this video?')) return;
    try {
      await updateDoc(doc(db, 'guide_videos', video.id), {
        topicIds: (video.topicIds || []).filter((id: string) => id !== topicId),
        attachments: (video.attachments || []).filter((a: any) => a.topicId !== topicId),
        updatedAt: new Date()
      });
      toast({ title: 'Detached' });
      fetchAttachedVideos();
    } catch (e) { toast({ title: 'Failed to detach', variant: 'destructive' }); }
  };

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(p => ({ ...p, videoUrl: url }));
    const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    if (match && match[2].length === 11) {
      setFormData(p => ({ ...p, youtubeId: match[2], thumbnail: `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` }));
    }
  };

  const handleCreateVideo = async () => {
    if (!formData.title) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    setLoadingCreate(true);
    try {
      const newRef = doc(collection(db, 'guide_videos'));
      await setDoc(newRef, { id: newRef.id, ...formData, url: formData.videoUrl, topicIds: [topicId], attachments: [{ boardId: hierarchy?.board?.id || '', classId: hierarchy?.class?.id || '', subjectId: hierarchy?.subject?.id || '', chapterId: hierarchy?.chapter?.id || '', topicId, sortOrder: 1 }], createdAt: new Date(), updatedAt: new Date() });
      toast({ title: 'Video created!' });
      setFormData({ title: '', slug: '', description: '', shortDescription: '', language: 'english', provider: 'youtube', videoUrl: '', youtubeId: '', thumbnail: '', duration: '', videoType: 'lesson', instructorName: 'DeshExam', instructorAvatar: '', instructorBio: '', status: 'published' });
      fetchAttachedVideos();
      setTab('attached');
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setLoadingCreate(false); }
  };

  const filteredExisting = allVideos.filter(v => (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) && !(v.topicIds || []).includes(topicId));

  const TABS = [
    { id: 'attached', label: `Attached (${attachedVideos.length})` },
    { id: 'existing', label: 'Find Existing' },
    { id: 'new', label: '+ Add New' },
  ] as const;

  return (
    <div>
      {/* Tab pills — wrapping on desktop */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)}
            className={cn("px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border", tab === t.id ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500")}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Attached ── */}
      {tab === 'attached' && (
        loadingAttached ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
        ) : attachedVideos.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <Video className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No videos attached</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Find an existing one or add a new video</p>
            <div className="flex gap-2">
              <button onClick={() => handleTabChange('existing')} className="px-4 py-2 text-xs font-semibold rounded-full border border-slate-300 text-slate-600">Find Existing</button>
              <button onClick={() => handleTabChange('new')} className="px-4 py-2 text-xs font-semibold rounded-full bg-blue-600 text-white">Add New</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {attachedVideos.map(v => (
              <div key={v.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-sm">
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                  {v.thumbnail ? <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Video className="w-5 h-5 text-slate-400" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{v.title}</p>
                  {v.duration && <p className="text-[10px] text-slate-400 mt-0.5">{v.duration}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/admin/video/edit/${v.id}`} target="_blank">
                    <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><ExternalLink className="w-3.5 h-3.5 text-blue-500" /></button>
                  </Link>
                  <button onClick={() => detachVideo(v)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
            <Input className="h-9 pl-8 text-sm rounded-xl" placeholder="Search video library..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          {loadingAll ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
          ) : filteredExisting.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">No available videos found.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {filteredExisting.map(v => (
                <div key={v.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
                  <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    {v.thumbnail ? <img src={v.thumbnail} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><Video className="w-4 h-4 text-slate-400" /></div>}
                  </div>
                  <p className="flex-1 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{v.title}</p>
                  <button onClick={() => attachVideo(v)} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-600 text-white shrink-0">Attach</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add New ── */}
      {tab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3">
          {/* Provider pills — full width */}
          <div className="lg:col-span-2 flex gap-2">
            {['youtube', 'vimeo', 'upload'].map(p => (
              <button key={p} onClick={() => setFormData(fd => ({ ...fd, provider: p }))}
                className={cn("flex-1 py-2 text-xs font-bold rounded-xl border capitalize transition-all", formData.provider === p ? (p === 'youtube' ? 'bg-red-500 border-red-500 text-white' : p === 'vimeo' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-emerald-600 border-emerald-600 text-white') : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900')}
              >{p}</button>
            ))}
          </div>

          {/* Video URL — full width */}
          <div className="lg:col-span-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Video URL *</label>
            <Input className="h-9 text-sm mt-1" placeholder="Paste video link here..." value={formData.videoUrl} onChange={handleUrlChange} />
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Title *</label>
            <Input className="h-9 text-sm mt-1" value={formData.title} onChange={e => setFormData(fd => ({ ...fd, title: e.target.value, slug: generateSlug(e.target.value) }))} placeholder="Video title..." />
          </div>

          {/* Duration */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Duration</label>
            <Input className="h-9 text-sm mt-1" placeholder="e.g. 15:30" value={formData.duration} onChange={e => setFormData(fd => ({ ...fd, duration: e.target.value }))} />
          </div>

          {/* Thumbnail preview — full width */}
          {formData.thumbnail && (
            <div className="lg:col-span-2 aspect-video rounded-xl overflow-hidden border border-slate-200">
              <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Video Type */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Type</label>
            <select className="mt-1 w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-sm" value={formData.videoType} onChange={e => setFormData(fd => ({ ...fd, videoType: e.target.value }))}>
              <option value="lesson">Lesson</option>
              <option value="explanation">Explanation</option>
              <option value="revision">Revision</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</label>
            <select className="mt-1 w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-sm" value={formData.status} onChange={e => setFormData(fd => ({ ...fd, status: e.target.value }))}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Short Description — full width */}
          <div className="lg:col-span-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Short Description</label>
            <Textarea className="mt-1 text-sm resize-none rounded-xl" rows={2} value={formData.shortDescription} onChange={e => setFormData(fd => ({ ...fd, shortDescription: e.target.value }))} />
          </div>

          {/* Submit — full width */}
          <button onClick={handleCreateVideo} disabled={loadingCreate}
            className="lg:col-span-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {loadingCreate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create & Attach Video
          </button>
        </div>
      )}
    </div>
  );
}
