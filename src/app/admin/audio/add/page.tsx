'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setDoc, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AudioFormData, defaultAudioFormData } from '@/components/admin/audio/AudioFormTypes';
import { 
  BasicTab, MediaTab, CurriculumTab, InstructorTab, 
  TranscriptTab, ResourcesTab, SeoTab, SettingsTab, AnalyticsTab 
} from '@/components/admin/audio/AudioFormTabs';

export default function CreateAudioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AudioFormData>(defaultAudioFormData);

  const handleSave = async (isDraft = false) => {
    if (!formData.title) {
      toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const audioRef = doc(collection(db, 'guide_audios'));
      
      const payload = {
        id: audioRef.id,
        ...formData,
        status: isDraft ? 'draft' : formData.status,
        schemaType: formData.schemaEnabled ? 'AudioObject' : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Clean up UI-only state
      delete (payload as any).tagInput;

      await setDoc(audioRef, payload);
      toast({ title: 'Success', description: `Audio ${isDraft ? 'saved as draft' : 'published'} successfully.` });
      router.push('/admin/audio');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-slate-900">Add New Audio Track</h1>
              <p className="text-slate-500 mt-1">Configure audio media, transcripts, and curriculum mapping.</p>
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
          Publish Audio
        </Button>
      </div>
    </div>
  );
}
