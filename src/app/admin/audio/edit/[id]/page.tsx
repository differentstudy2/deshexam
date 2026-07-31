'use client';

import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getMediaItemById } from '@/lib/firebase/guide';
import { AudioFormData, defaultAudioFormData } from '@/components/admin/audio/AudioFormTypes';
import { 
  BasicTab, MediaTab, CurriculumTab, InstructorTab, 
  TranscriptTab, ResourcesTab, SeoTab, SettingsTab, AnalyticsTab 
} from '@/components/admin/audio/AudioFormTabs';

export default function EditAudioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState<AudioFormData>(defaultAudioFormData);

  useEffect(() => {
    loadAudio();
  }, [id]);

  const loadAudio = async () => {
    try {
      const audio = await getMediaItemById('guide_audios', id);
      if (audio) {
        // Map database object to form data, keeping defaults for missing new enterprise fields
        setFormData({
          ...defaultAudioFormData,
          ...audio,
          // Ensure arrays are initialized if missing from old docs
          tags: audio.tags ? (typeof audio.tags === 'string' ? audio.tags.split(',') : audio.tags) : [],
          attachments: audio.attachments || [],
          resources: audio.resources || [],
          relatedAudioIds: audio.relatedAudioIds || [],
          tagInput: ''
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

  const handleSave = async (isDraft = false) => {
    if (!formData.title) {
      toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const audioRef = doc(db, 'guide_audios', id);
      
      const payload = {
        ...formData,
        status: isDraft ? 'draft' : formData.status,
        schemaType: formData.schemaEnabled ? 'AudioObject' : null,
        topicIds: formData.attachments.map(a => a.topicId).filter(Boolean),
        updatedAt: new Date()
      };

      // Clean up UI-only state
      delete (payload as any).tagInput;

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
    <div className="bg-slate-50 min-h-screen pb-32">
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/audio">
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-200">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Edit Audio Track</h1>
              <p className="text-slate-500 mt-1">Update configuration for this audio track.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-9 w-full mb-8 h-auto p-1 bg-white border shadow-sm rounded-xl">
            <TabsTrigger value="basic" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">Basic</TabsTrigger>
            <TabsTrigger value="media" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">Media</TabsTrigger>
            <TabsTrigger value="curriculum" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">Instructor</TabsTrigger>
            <TabsTrigger value="transcript" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">Transcript</TabsTrigger>
            <TabsTrigger value="resources" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">Resources</TabsTrigger>
            <TabsTrigger value="seo" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">SEO</TabsTrigger>
            <TabsTrigger value="analytics" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="py-2.5 rounded-lg data-[state=active]:bg-slate-100">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic"><BasicTab formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="media"><MediaTab formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="curriculum"><CurriculumTab formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="instructor"><InstructorTab formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="transcript"><TranscriptTab formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="resources"><ResourcesTab formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="seo"><SeoTab formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="settings"><SettingsTab formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab formData={formData} setFormData={setFormData} /></TabsContent>
        </Tabs>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 px-8 md:pl-72 flex justify-end gap-3 transition-all">
        <Button variant="outline" onClick={() => router.push('/admin/audio')} className="w-32 bg-white">Cancel</Button>
        <Button variant="secondary" onClick={() => handleSave(true)} disabled={loading} className="w-32">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Draft'}
        </Button>
        <Button onClick={() => handleSave(false)} disabled={loading} className="w-40 bg-indigo-600 hover:bg-indigo-700">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Update Audio
        </Button>
      </div>
    </div>
  );
}
