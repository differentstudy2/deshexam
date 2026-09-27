'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setDoc, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Youtube, Upload, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function CreateVideoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    instructorName: 'DeshExam',
    instructorAvatar: '',
    instructorBio: '',
    status: 'draft',
    views: 0,
    watchTime: 0,
    attachments: [] as any[]
  });

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
    setFormData(prev => ({ ...prev, videoUrl: url }));
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
    
    setLoading(true);
    try {
      const newVideoRef = doc(collection(db, 'guide_videos'));
      const videoId = newVideoRef.id;
      
      const payload = {
        id: videoId,
        ...formData,
        topicIds: formData.attachments.map(a => a.topicId).filter(Boolean),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(newVideoRef, payload);
      toast({ title: 'Success', description: 'Video created successfully in the library.' });
      router.push('/admin/video');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-slate-900">Add New Video</h1>
            <p className="text-slate-500 mt-1">Upload and configure a new video for the library.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/admin/video')}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save to Library
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="source">Video Source</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={handleTitleChange} placeholder="e.g. The Wind Cap Full Explanation" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="the-wind-cap-full-explanation" />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea 
                  value={formData.shortDescription} 
                  onChange={e => setFormData({...formData, shortDescription: e.target.value})} 
                  placeholder="A brief 1-2 sentence summary..." 
                  className="h-20"
                />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Detailed explanation, chapters, and topics covered..." 
                  className="h-40"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.language}
                    onChange={e => setFormData({...formData, language: e.target.value})}
                  >
                    <option value="english">English</option>
                    <option value="bengali">Bengali</option>
                    <option value="hindi">Hindi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source">
          <Card>
            <CardHeader>
              <CardTitle>Video Source Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'youtube' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'youtube'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800">
                    <Youtube className={`w-6 h-6 ${formData.provider === 'youtube' ? 'text-red-500' : 'text-slate-400'}`} />
                    YouTube Embed
                  </div>
                </div>
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'vimeo' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'vimeo'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800">
                    <LinkIcon className={`w-6 h-6 ${formData.provider === 'vimeo' ? 'text-blue-500' : 'text-slate-400'}`} />
                    Vimeo
                  </div>
                </div>
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'upload' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'upload'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800">
                    <Upload className={`w-6 h-6 ${formData.provider === 'upload' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    Direct Upload
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input value={formData.videoUrl} onChange={handleUrlChange} placeholder="https://www.youtube.com/watch?v=..." />
                  {formData.provider === 'youtube' && <p className="text-xs text-slate-500">Paste YouTube link to auto-extract ID and thumbnail.</p>}
                </div>

                {formData.provider === 'youtube' && (
                  <div className="space-y-2">
                    <Label>YouTube ID (Auto-extracted)</Label>
                    <Input value={formData.youtubeId} readOnly className="bg-slate-50" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="https://..." />
                  {formData.thumbnail && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 w-64 aspect-video bg-black flex items-center justify-center">
                      <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Duration (Text format)</Label>
                  <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 18:24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructor">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Instructor Name</Label>
                <Input value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Instructor Avatar URL</Label>
                <Input value={formData.instructorAvatar} onChange={e => setFormData({...formData, instructorAvatar: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Instructor Bio / Designation</Label>
                <Input value={formData.instructorBio} onChange={e => setFormData({...formData, instructorBio: e.target.value})} placeholder="e.g. Expert Educator at DeshExam" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification">
          <Card>
            <CardHeader>
              <CardTitle>Video Categorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  value={formData.videoType}
                  onChange={e => setFormData({...formData, videoType: e.target.value})}
                >
                  <option value="lesson">Lesson Video</option>
                  <option value="explanation">Explanation Video</option>
                  <option value="revision">Revision Video</option>
                  <option value="solution">Question Solution</option>
                  <option value="exam_prep">Exam Preparation</option>
                  <option value="motivational">Motivational</option>
                </select>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mt-8">
                <h4 className="font-semibold text-blue-900 mb-1">Curriculum Attachments (Coming Soon)</h4>
                <p className="text-sm text-blue-700">
                  After creating this video, you will be able to attach it to specific Boards, Classes, Subjects, Chapters, and Topics from the Video Editor.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
