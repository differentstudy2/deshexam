'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateMediaItemExtraData, getMediaItemById } from '@/lib/firebase/guide';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Youtube, Upload, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    language: 'english',
    provider: 'youtube',
    videoUrl: '',
    youtubeId: '',
    thumbnail: '',
    duration: '',
    videoType: 'lesson',
    instructorName: '',
    instructorAvatar: '',
    instructorBio: '',
    status: 'draft',
    views: 0,
    watchTime: 0,
    attachments: [] as any[]
  });

  useEffect(() => {
    if (params.id) {
      loadVideo();
    }
  }, [params.id]);

  const loadVideo = async () => {
    try {
      const data = await getMediaItemById('guide_videos', params.id);
      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          shortDescription: data.shortDescription || '',
          language: data.language || 'english',
          provider: data.provider || 'youtube',
          videoUrl: data.videoUrl || data.url || '',
          youtubeId: data.youtubeId || '',
          thumbnail: data.thumbnail || '',
          duration: data.duration || '',
          videoType: data.videoType || 'lesson',
          instructorName: data.instructorName || '',
          instructorAvatar: data.instructorAvatar || '',
          instructorBio: data.instructorBio || '',
          status: data.status || 'draft',
          views: data.views || 0,
          watchTime: data.watchTime || 0,
          attachments: data.attachments || []
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load video', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const fetchOembedData = async (url: string) => {
    try {
      if (formData.provider === 'youtube') {
        const res = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (!data.error) {
          setFormData(prev => ({
            ...prev,
            title: prev.title || data.title || '',
            slug: prev.title ? prev.slug : generateSlug(data.title || ''),
            description: prev.description || data.description || '', // Full description
            shortDescription: prev.shortDescription || (data.description ? data.description.substring(0, 150) + '...' : ''), // Snippet
            thumbnail: data.thumbnail_url || prev.thumbnail,
            duration: prev.duration || data.duration || '',
            instructorName: (prev.instructorName === 'DeshExam' || !prev.instructorName) ? (data.author_name || 'DeshExam') : prev.instructorName,
          }));
          toast({ title: "Metadata Extracted", description: "Automatically populated title, description, and thumbnail." });
        }
      } else {
        // Fallback for Vimeo or others using noembed
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (!data.error) {
          setFormData(prev => ({
            ...prev,
            title: prev.title || data.title || '',
            slug: prev.title ? prev.slug : generateSlug(data.title || ''),
            thumbnail: data.thumbnail_url || prev.thumbnail,
            instructorName: (prev.instructorName === 'DeshExam' || !prev.instructorName) ? (data.author_name || 'DeshExam') : prev.instructorName,
          }));
          toast({ title: "Metadata Extracted", description: "Automatically populated metadata." });
        }
      }
    } catch (e) {
      console.log('Metadata extraction error', e);
    }
  };

  const extractYoutubeInfo = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const id = match[2];
      setFormData(prev => ({
        ...prev,
        youtubeId: id,
        thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
      }));
    }
    fetchOembedData(url);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, videoUrl: url, url: url }));
    if (formData.provider === 'youtube') {
      extractYoutubeInfo(url);
    } else if (formData.provider === 'vimeo') {
      fetchOembedData(url);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' });
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        url: formData.videoUrl, // Keep legacy url field in sync just in case
        topicIds: formData.attachments.map((a: any) => a.topicId).filter(Boolean),
        updatedAt: new Date()
      };

      await updateMediaItemExtraData('guide_videos', params.id, payload);
      toast({ title: 'Success', description: 'Video updated successfully.' });
      router.push('/admin/video');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, { boardId: '', classId: '', subjectId: '', chapterId: '', topicId: '', sortOrder: 1 }]
    }));
  };

  const updateAttachment = (index: number, field: string, value: string | number) => {
    const newAttachments = [...formData.attachments];
    newAttachments[index] = { ...newAttachments[index], [field]: value };
    setFormData(prev => ({ ...prev, attachments: newAttachments }));
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData(prev => ({ ...prev, attachments: newAttachments }));
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/video">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Video</h1>
            <p className="text-slate-500 mt-1">Manage video details and curriculum attachments.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/admin/video')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-8">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="source">Video Source</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
          <TabsTrigger value="attachments" className="font-semibold text-blue-600">Attachments</TabsTrigger>
        </TabsList>

        {/* --- GENERAL CONTENT --- */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={handleTitleChange} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="h-20" />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="h-40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                    <option value="english">English</option>
                    <option value="bengali">Bengali</option>
                    <option value="hindi">Hindi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- SOURCE CONTENT --- */}
        <TabsContent value="source">
          <Card>
            <CardHeader>
              <CardTitle>Video Source Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer ${formData.provider === 'youtube' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'youtube'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800"><Youtube className={`w-6 h-6 ${formData.provider === 'youtube' ? 'text-red-500' : 'text-slate-400'}`} /> YouTube</div>
                </div>
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer ${formData.provider === 'vimeo' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'vimeo'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800"><LinkIcon className={`w-6 h-6 ${formData.provider === 'vimeo' ? 'text-blue-500' : 'text-slate-400'}`} /> Vimeo</div>
                </div>
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer ${formData.provider === 'upload' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'upload'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800"><Upload className={`w-6 h-6 ${formData.provider === 'upload' ? 'text-emerald-500' : 'text-slate-400'}`} /> Upload</div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input value={formData.videoUrl} onChange={handleUrlChange} />
                </div>
                {formData.provider === 'youtube' && (
                  <div className="space-y-2"><Label>YouTube ID</Label><Input value={formData.youtubeId} readOnly className="bg-slate-50" /></div>
                )}
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} />
                  {formData.thumbnail && <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 w-64 aspect-video bg-black flex items-center justify-center"><img src={formData.thumbnail} alt="preview" className="w-full h-full object-cover" /></div>}
                </div>
                <div className="space-y-2"><Label>Duration (Text format)</Label><Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- INSTRUCTOR CONTENT --- */}
        <TabsContent value="instructor">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Instructor Name</Label><Input value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Instructor Avatar URL</Label><Input value={formData.instructorAvatar} onChange={e => setFormData({...formData, instructorAvatar: e.target.value})} /></div>
              <div className="space-y-2"><Label>Instructor Bio</Label><Input value={formData.instructorBio} onChange={e => setFormData({...formData, instructorBio: e.target.value})} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CLASSIFICATION CONTENT --- */}
        <TabsContent value="classification">
          <Card>
            <CardHeader>
              <CardTitle>Categorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video Type</Label>
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.videoType} onChange={e => setFormData({...formData, videoType: e.target.value})}>
                  <option value="lesson">Lesson Video</option>
                  <option value="explanation">Explanation Video</option>
                  <option value="revision">Revision Video</option>
                  <option value="solution">Question Solution</option>
                  <option value="exam_prep">Exam Preparation</option>
                  <option value="motivational">Motivational</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ATTACHMENTS CONTENT --- */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Curriculum Attachments</CardTitle>
                <CardDescription>Attach this video to multiple topics or chapters.</CardDescription>
              </div>
              <Button onClick={addAttachment} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Attachment</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.attachments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50">
                  No attachments yet. Click the button above to link this video to a topic.
                </div>
              ) : (
                formData.attachments.map((att, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm relative group">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeAttachment(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <h4 className="font-semibold text-sm mb-4 text-slate-700">Attachment #{idx + 1}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1"><Label className="text-xs">Board ID</Label><Input bs-sm="true" value={att.boardId} onChange={e => updateAttachment(idx, 'boardId', e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Class ID</Label><Input bs-sm="true" value={att.classId} onChange={e => updateAttachment(idx, 'classId', e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Subject ID</Label><Input bs-sm="true" value={att.subjectId} onChange={e => updateAttachment(idx, 'subjectId', e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Chapter ID</Label><Input bs-sm="true" value={att.chapterId} onChange={e => updateAttachment(idx, 'chapterId', e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Topic ID</Label><Input bs-sm="true" value={att.topicId} onChange={e => updateAttachment(idx, 'topicId', e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Sort Order</Label><Input type="number" value={att.sortOrder} onChange={e => updateAttachment(idx, 'sortOrder', parseInt(e.target.value))} /></div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
