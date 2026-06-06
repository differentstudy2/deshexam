'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Youtube, Upload, Link as LinkIcon, Trash2, CheckCircle2, Search, Video, Save } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getTopicFullHierarchy } from '@/lib/firebase/guide';
import { useToast } from '@/hooks/use-toast';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import Link from 'next/link';

interface TopicVideoManagerProps {
  topicId: string;
}

export function TopicVideoManager({ topicId }: TopicVideoManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('attached');
  const [hierarchy, setHierarchy] = useState<any>(null);
  
  // State for Attached Videos
  const [attachedVideos, setAttachedVideos] = useState<any[]>([]);
  const [loadingAttached, setLoadingAttached] = useState(true);

  // State for Attach Existing
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAll, setLoadingAll] = useState(false);
  
  // State for Upload New (Create Video Form)
  const [loadingCreate, setLoadingCreate] = useState(false);
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
    status: 'published',
  });

  useEffect(() => {
    loadHierarchy();
    fetchAttachedVideos();
  }, [topicId]);

  const loadHierarchy = async () => {
    try {
      const h = await getTopicFullHierarchy(topicId);
      setHierarchy(h);
    } catch (e) {
      console.error('Failed to load hierarchy', e);
    }
  };

  const fetchAttachedVideos = async () => {
    setLoadingAttached(true);
    try {
      const q = query(collection(db, 'guide_videos'), where('topicIds', 'array-contains', topicId));
      const snap = await getDocs(q);
      const videos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttachedVideos(videos);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to fetch attached videos', variant: 'destructive' });
    } finally {
      setLoadingAttached(false);
    }
  };

  const fetchAllVideos = async () => {
    setLoadingAll(true);
    try {
      // In a real app, you might want to paginate or limit this, but for now we fetch all
      const snap = await getDocs(collection(db, 'guide_videos'));
      const videos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllVideos(videos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val === 'existing' && allVideos.length === 0) {
      fetchAllVideos();
    }
  };

  const attachVideo = async (video: any) => {
    try {
      const videoRef = doc(db, 'guide_videos', video.id);
      const updatedTopicIds = [...(video.topicIds || []), topicId];
      
      const newAttachment = {
        boardId: hierarchy?.board?.id || '',
        classId: hierarchy?.class?.id || '',
        subjectId: hierarchy?.subject?.id || '',
        chapterId: hierarchy?.chapter?.id || '',
        topicId: topicId,
        sortOrder: 1
      };
      
      const updatedAttachments = [...(video.attachments || []), newAttachment];
      
      await updateDoc(videoRef, {
        topicIds: updatedTopicIds,
        attachments: updatedAttachments,
        updatedAt: new Date()
      });
      
      toast({ title: 'Success', description: 'Video attached successfully' });
      fetchAttachedVideos();
      setActiveTab('attached');
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to attach video', variant: 'destructive' });
    }
  };

  const detachVideo = async (video: any) => {
    if (!confirm('Are you sure you want to detach this video from the topic?')) return;
    try {
      const videoRef = doc(db, 'guide_videos', video.id);
      const updatedTopicIds = (video.topicIds || []).filter((id: string) => id !== topicId);
      const updatedAttachments = (video.attachments || []).filter((a: any) => a.topicId !== topicId);
      
      await updateDoc(videoRef, {
        topicIds: updatedTopicIds,
        attachments: updatedAttachments,
        updatedAt: new Date()
      });
      
      toast({ title: 'Success', description: 'Video detached successfully' });
      fetchAttachedVideos();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to detach video', variant: 'destructive' });
    }
  };

  // --- Create Video Form Handlers ---
  const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, videoUrl: url }));
    
    if (formData.provider === 'youtube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        setFormData(prev => ({ ...prev, youtubeId: match[2], thumbnail: `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` }));
      }
      fetchOembedData(url);
    } else if (formData.provider === 'vimeo') {
      fetchOembedData(url);
    }
  };

  const handleCreateVideo = async () => {
    if (!formData.title) {
      toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' });
      return;
    }
    setLoadingCreate(true);
    try {
      const newVideoRef = doc(collection(db, 'guide_videos'));
      const videoId = newVideoRef.id;
      
      const newAttachment = {
        boardId: hierarchy?.board?.id || '',
        classId: hierarchy?.class?.id || '',
        subjectId: hierarchy?.subject?.id || '',
        chapterId: hierarchy?.chapter?.id || '',
        topicId: topicId,
        sortOrder: 1
      };

      const payload = {
        id: videoId,
        ...formData,
        url: formData.videoUrl, // legacy fallback
        topicIds: [topicId],
        attachments: [newAttachment],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(newVideoRef, payload);
      toast({ title: 'Success', description: 'Video created and attached successfully.' });
      
      // Reset form
      setFormData({
        title: '', slug: '', description: '', shortDescription: '', language: 'english',
        provider: 'youtube', videoUrl: '', youtubeId: '', thumbnail: '', duration: '',
        videoType: 'lesson', instructorName: 'DeshExam', instructorAvatar: '', instructorBio: '', status: 'published',
      });
      
      fetchAttachedVideos();
      setActiveTab('attached');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingCreate(false);
    }
  };

  const filteredExisting = allVideos.filter(v => 
    (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) && 
    !(v.topicIds || []).includes(topicId)
  );

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible mt-6">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Video className="w-5 h-5 text-blue-600" />
          Topic Video Library
        </CardTitle>
        <CardDescription>Manage videos attached to this topic.</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-0 bg-transparent h-auto p-0 gap-4">
              <TabsTrigger value="attached" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-blue-200 py-2">
                Attached ({attachedVideos.length})
              </TabsTrigger>
              <TabsTrigger value="existing" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-slate-200 py-2">
                Attach Existing
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-emerald-200 py-2">
                <Plus className="w-4 h-4 mr-2" /> Upload New
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            
            {/* TAB 1: ATTACHED VIDEOS */}
            <TabsContent value="attached" className="m-0 space-y-6">
              {loadingAttached ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : attachedVideos.length === 0 ? (
                <div className="text-center p-12 border border-dashed rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-900/50">
                  <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">No videos attached</h3>
                  <p className="text-slate-500 mb-6">Attach an existing video or upload a new one to show it in this topic.</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => handleTabChange('existing')}>Attach Existing</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleTabChange('new')}>Upload New</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {attachedVideos.map(video => (
                    <div key={video.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 flex flex-col shadow-sm">
                      <div className="aspect-video bg-slate-100 relative">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200"><Video className="w-8 h-8 text-slate-400" /></div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {video.duration || 'Video'}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-2">{video.title}</h4>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <Link href={`/admin/video/edit/${video.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="text-blue-600">Edit in Library</Button>
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => detachVideo(video)}>Detach</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: ATTACH EXISTING */}
            <TabsContent value="existing" className="m-0 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  placeholder="Search global video library..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {loadingAll ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : filteredExisting.length === 0 ? (
                <div className="text-center p-8 text-slate-500">No available videos found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto p-2">
                  {filteredExisting.map(video => (
                    <div key={video.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white flex flex-col shadow-sm group">
                      <div className="aspect-video bg-slate-100 relative">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200"><Video className="w-8 h-8 text-slate-400" /></div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => attachVideo(video)}>
                             <Plus className="w-4 h-4 mr-2" /> Attach to Topic
                           </Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">{video.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: UPLOAD NEW */}
            <TabsContent value="new" className="m-0">
              <div className="space-y-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                  <div className={`flex-1 p-3 border rounded-lg cursor-pointer text-center ${formData.provider === 'youtube' ? 'border-red-500 bg-red-50 text-red-700 font-semibold' : 'border-slate-200 bg-white hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'youtube'})}>
                    YouTube
                  </div>
                  <div className={`flex-1 p-3 border rounded-lg cursor-pointer text-center ${formData.provider === 'vimeo' ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 bg-white hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'vimeo'})}>
                    Vimeo
                  </div>
                  <div className={`flex-1 p-3 border rounded-lg cursor-pointer text-center ${formData.provider === 'upload' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-slate-200 bg-white hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'upload'})}>
                    Upload
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Video URL *</Label>
                      <Input value={formData.videoUrl} onChange={handleUrlChange} placeholder="Paste video link here..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Description</Label>
                      <Textarea value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} rows={3} />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Thumbnail URL</Label>
                      <Input value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} />
                      {formData.thumbnail && (
                        <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-slate-200 relative">
                          <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.videoType} onChange={e => setFormData({...formData, videoType: e.target.value})}>
                          <option value="lesson">Lesson Video</option>
                          <option value="explanation">Explanation Video</option>
                          <option value="revision">Revision Video</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 15:30" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <Button onClick={handleCreateVideo} disabled={loadingCreate} className="bg-emerald-600 hover:bg-emerald-700">
                    {loadingCreate ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Create & Attach Video
                  </Button>
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
