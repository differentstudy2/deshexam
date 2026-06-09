'use client';

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, BookOpen, FileText, Type, Target, Info, User, Lightbulb, PenTool, HelpCircle, Brain, CheckSquare, FileArchive, FileImage, Video, Headphones, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTopicSections, saveTopicSections, updateTopicStatus } from '@/lib/firebase/guide';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from "@/hooks/use-toast";

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor').then(mod => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">Loading Editor...</div>
});

import { TopicVideoManager } from '@/components/admin/TopicVideoManager';
import { TopicDocumentManager } from '@/components/admin/TopicDocumentManager';
import { TopicQuestionManager } from '@/components/admin/TopicQuestionManager';

const sectionTypes = [
  { id: 'lesson', label: 'Read Lesson', icon: BookOpen },
  { id: 'guide_content', label: 'Guide Content', icon: FileText },
  { id: 'word_meaning', label: 'Word Meaning', icon: Type },
  { id: 'objective', label: 'Objective', icon: Target },
  { id: 'introduction', label: 'Introduction', icon: Info },
  { id: 'author', label: 'Author', icon: User },
  { id: 'explanation', label: 'Explanation', icon: Lightbulb },
  { id: 'exercise', label: 'Exercise', icon: PenTool },
  { id: 'mcq', label: 'MCQ', icon: HelpCircle },
  { id: 'creative_question', label: 'Creative Q', icon: Brain },
  { id: 'short_question', label: 'Short Q', icon: CheckSquare },
  { id: 'model_test', label: 'Model Test', icon: FileArchive },
  { id: 'pdf', label: 'PDF', icon: FileImage },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'audio', label: 'Audio', icon: Headphones },
];

export default function TopicEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const topicId = resolvedParams.id;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('lesson');
  const [contentMap, setContentMap] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize empty content and load from Firebase
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        // Fetch topic status
        const topicDoc = await getDoc(doc(db, 'guide_topics', topicId));
        if (topicDoc.exists() && topicDoc.data().status) {
          setStatus(topicDoc.data().status);
        }

        // Fetch sections
        const sections = await getTopicSections(topicId);
        
        const initial: Record<string, any> = {};
        sectionTypes.forEach(s => {
          if (sections[s.id]) {
            let loadedContent = sections[s.id].content || '';
            // Clean up any accidentally saved hardcoded placeholders from previous versions
            if (loadedContent === '<p>Start typing here...</p>') {
              loadedContent = '';
            }
            initial[s.id] = loadedContent;
          } else if (!['word_meaning', 'mcq', 'pdf', 'video', 'audio'].includes(s.id)) {
            initial[s.id] = '';
          }
        });
        setContentMap(initial);
      } catch (e) {
        console.error("Failed to load sections", e);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [topicId]);

  const handleRichTextChange = (html: string) => {
    setContentMap(prev => ({ ...prev, [activeTab]: html }));
  };

  const getMediaData = (type: string): any[] => {
    const val = contentMap[type];
    if (typeof val === 'string') {
      if (val.startsWith('[')) {
        try { return JSON.parse(val); } catch(e) { return []; }
      } else if (val.startsWith('{')) {
        try { 
          const parsed = JSON.parse(val); 
          if (parsed.url || parsed.title) {
            return [{ ...parsed, id: Date.now().toString() }]; 
          }
          return [];
        } catch(e) { return []; }
      }
    }
    return [];
  };

  const updateMediaItem = (type: string, index: number, field: string, value: string) => {
    const data = getMediaData(type);
    if (data[index]) {
      data[index][field] = value;
      setContentMap(prev => ({ ...prev, [type]: JSON.stringify(data) }));
    }
  };

  const removeMediaItem = (type: string, index: number) => {
    const data = getMediaData(type);
    data.splice(index, 1);
    setContentMap(prev => ({ ...prev, [type]: JSON.stringify(data) }));
  };

  const addMediaItem = (type: string) => {
    const data = getMediaData(type);
    data.push({ id: Date.now().toString() + Math.random().toString(), title: '', url: '', description: '', tags: '' });
    setContentMap(prev => ({ ...prev, [type]: JSON.stringify(data) }));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const folder = type === 'audio' ? 'audio' : 'pdfs';
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      updateMediaItem(type, index, 'url', url);
      toast({ title: 'Success', description: `${type.toUpperCase()} uploaded successfully` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: `Failed to upload ${type}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedSections: Record<string, any> = {};
      Object.entries(contentMap).forEach(([key, value]) => {
        formattedSections[key] = { content: value };
      });
      
      await saveTopicSections(topicId, formattedSections);
      await updateTopicStatus(topicId, status);
      
      toast({
        title: "Success",
        description: "Content saved successfully!",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/guide-content/explorer">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              Topic Editor
              <Link href={`/guide/${topicId}`} target="_blank">
                <Button variant="outline" size="sm" className="h-7 text-xs flex gap-1.5 px-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  View Chapter
                </Button>
              </Link>
            </h1>
            <p className="text-sm text-slate-500">ID: {topicId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={(val: any) => setStatus(val)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="bg-[#107c41] hover:bg-[#0b5c30]" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save All Sections</>}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <CardContent className="p-3">
              <div className="space-y-1">
                {sectionTypes.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === section.id 
                        ? 'bg-[#107c41]/10 text-[#107c41]' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <section.icon className={`w-4 h-4 ${activeTab === section.id ? 'text-[#107c41]' : 'text-slate-400'}`} />
                    {section.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 min-w-0">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full min-h-[600px]">
            <CardContent className="p-6">
              
              <div className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                {React.createElement(sectionTypes.find(s => s.id === activeTab)?.icon || FileText, { className: "w-6 h-6 text-[#107c41]" })}
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {sectionTypes.find(s => s.id === activeTab)?.label}
                </h2>
              </div>

              {/* Dynamic Content Renderer based on type */}
              {activeTab === 'video' ? (
                <div className="animate-in fade-in duration-300">
                  <TopicVideoManager topicId={topicId} />
                </div>
              ) : activeTab === 'pdf' ? (
                <div className="animate-in fade-in duration-300">
                  <TopicDocumentManager topicId={topicId} />
                </div>
              ) : !['word_meaning', 'mcq', 'audio'].includes(activeTab) ? (
                <div className="animate-in fade-in duration-300">
                  <TiptapEditor 
                    key={activeTab}
                    content={contentMap[activeTab] || ''} 
                    onChange={handleRichTextChange} 
                  />
                </div>
              ) : ['pdf', 'audio'].includes(activeTab) ? (
                <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                  {getMediaData(activeTab).map((item: any, index: number) => (
                    <Card key={item.id} className="border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -right-3 -top-3 w-8 h-8 rounded-full shadow-md z-10"
                        onClick={() => removeMediaItem(activeTab, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <CardContent className="p-5 space-y-4">
                        <div className="space-y-2">
                          <Label>{activeTab.toUpperCase()} Title</Label>
                          <Input 
                            placeholder={`e.g. ${activeTab === 'video' ? 'Explanation of Poem' : 'Chapter 1 Summary'}`} 
                            value={item.title || ''}
                            onChange={(e) => updateMediaItem(activeTab, index, 'title', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea 
                            placeholder="Brief description of this media..." 
                            value={item.description || ''}
                            onChange={(e) => updateMediaItem(activeTab, index, 'description', e.target.value)}
                            className="resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tags (comma-separated)</Label>
                          <Input 
                            placeholder="e.g. physics, chapter 1, revision" 
                            value={item.tags || ''}
                            onChange={(e) => updateMediaItem(activeTab, index, 'tags', e.target.value)}
                          />
                        </div>
                        
                        {activeTab === 'video' ? (
                          <div className="space-y-2">
                            <Label>YouTube Link</Label>
                            <Input 
                              placeholder="https://youtube.com/watch?v=..." 
                              value={item.url}
                              onChange={(e) => updateMediaItem(activeTab, index, 'url', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Upload {activeTab.toUpperCase()} File</Label>
                            <Input 
                              type="file" 
                              accept={activeTab === 'pdf' ? '.pdf' : 'audio/*'} 
                              onChange={(e) => handleMediaUpload(e, activeTab, index)} 
                            />
                            {item.url && (
                              <div className="mt-2 text-sm text-emerald-600 font-medium">
                                {activeTab === 'pdf' ? (
                                  <a href={item.url} target="_blank" rel="noopener noreferrer">View current PDF</a>
                                ) : (
                                  <audio controls src={item.url} className="mt-2 w-full"></audio>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <Button 
                    variant="outline" 
                    className="w-full border-dashed border-2 py-8 text-slate-500 hover:text-[#107c41] hover:border-[#107c41] transition-colors"
                    onClick={() => addMediaItem(activeTab)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another {activeTab.toUpperCase()}
                  </Button>
                </div>
              ) : ['mcq', 'creative_question', 'short_question', 'model_test'].includes(activeTab) ? (
                <div className="animate-in fade-in duration-300">
                  <TopicQuestionManager topicId={topicId} tabType={activeTab} />
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg animate-in fade-in duration-300">
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {sectionTypes.find(s => s.id === activeTab)?.label} Editor
                  </h3>
                  <p>Specialized sub-editor component will be injected here.</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
