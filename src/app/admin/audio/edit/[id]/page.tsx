'use client';

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Upload, Link as LinkIcon, Music } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getMediaItemById } from '@/lib/firebase/guide';

export default function EditAudioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    language: 'english',
    provider: 'upload',
    audioUrl: '',
    thumbnail: '',
    duration: '',
    audioType: 'lesson',
    instructorName: 'DeshExam',
    instructorAvatar: '',
    instructorBio: '',
    status: 'draft',
    views: 0,
    listens: 0,
    attachments: [] as any[]
  });

  useEffect(() => {
    loadAudio();
  }, [id]);

  const loadAudio = async () => {
    try {
      const audio = await getMediaItemById('guide_audios', id);
      if (audio) {
        setFormData({
          title: audio.title || '',
          slug: audio.slug || '',
          description: audio.description || '',
          shortDescription: audio.shortDescription || '',
          language: audio.language || 'english',
          provider: audio.provider || 'upload',
          audioUrl: audio.audioUrl || audio.url || '',
          thumbnail: audio.thumbnail || '',
          duration: audio.duration || '',
          audioType: audio.audioType || audio.type || 'lesson',
          instructorName: audio.instructorName || 'DeshExam',
          instructorAvatar: audio.instructorAvatar || '',
          instructorBio: audio.instructorBio || '',
          status: audio.status || 'draft',
          views: audio.views || 0,
          listens: audio.listens || 0,
          attachments: audio.attachments || []
        });
      } else {
        toast({ title: 'Error', description: 'Audio track not found', variant: 'destructive' });
        router.push('/admin/audio');
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load audio details', variant: 'destructive' });
    } finally {
      setInitialLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title, slug: prev.slug ? prev.slug : generateSlug(title) }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, audioUrl: url }));
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const audioRef = doc(db, 'guide_audios', id);
      
      const payload = {
        ...formData,
        topicIds: formData.attachments.map(a => a.topicId).filter(Boolean),
        updatedAt: new Date()
      };

      await setDoc(audioRef, payload, { merge: true });
      toast({ title: 'Success', description: 'Audio updated successfully.' });
      router.push('/admin/audio');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/audio">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Audio</h1>
            <p className="text-slate-500 mt-1">Update configuration for this audio track.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/admin/audio')}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="source">Audio Source</TabsTrigger>
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
                <Input value={formData.title} onChange={handleTitleChange} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea 
                  value={formData.shortDescription} 
                  onChange={e => setFormData({...formData, shortDescription: e.target.value})} 
                  className="h-20"
                />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
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
              <CardTitle>Audio Source Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'upload' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'upload'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800">
                    <Upload className={`w-6 h-6 ${formData.provider === 'upload' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    Direct Audio Upload
                  </div>
                </div>
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'soundcloud' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'soundcloud'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800">
                    <Music className={`w-6 h-6 ${formData.provider === 'soundcloud' ? 'text-orange-500' : 'text-slate-400'}`} />
                    SoundCloud URL
                  </div>
                </div>
                <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'other' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'other'})}>
                  <div className="flex items-center gap-3 font-semibold text-slate-800">
                    <LinkIcon className={`w-6 h-6 ${formData.provider === 'other' ? 'text-blue-500' : 'text-slate-400'}`} />
                    External Link
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <Label>Audio URL (mp3 file link or stream link)</Label>
                  <Input value={formData.audioUrl} onChange={handleUrlChange} />
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail/Cover Art URL</Label>
                  <Input value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} />
                  {formData.thumbnail && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 w-32 h-32 bg-slate-100 flex items-center justify-center">
                      <img src={formData.thumbnail} alt="Cover preview" className="w-full h-full object-cover" />
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
              <CardTitle>Instructor / Speaker Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Speaker Name</Label>
                <Input value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Speaker Avatar URL</Label>
                <Input value={formData.instructorAvatar} onChange={e => setFormData({...formData, instructorAvatar: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Speaker Bio / Designation</Label>
                <Input value={formData.instructorBio} onChange={e => setFormData({...formData, instructorBio: e.target.value})} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification">
          <Card>
            <CardHeader>
              <CardTitle>Audio Categorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Audio Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  value={formData.audioType}
                  onChange={e => setFormData({...formData, audioType: e.target.value})}
                >
                  <option value="lesson">Lesson Audio</option>
                  <option value="podcast">Podcast Episode</option>
                  <option value="listening_test">Listening Test Track</option>
                  <option value="pronunciation">Pronunciation Guide</option>
                  <option value="music">Music / Ambience</option>
                  <option value="story">Story Narration</option>
                </select>
              </div>
              
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg mt-8">
                <h4 className="font-semibold text-indigo-900 mb-1">Curriculum Attachments (Coming Soon)</h4>
                <p className="text-sm text-indigo-700">
                  After creating this audio, you will be able to attach it to specific Boards, Classes, Subjects, Chapters, and Topics from the Audio Editor.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
