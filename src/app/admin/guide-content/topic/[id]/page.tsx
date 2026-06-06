'use client';

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, BookOpen, FileText, Type, Target, Info, User, Lightbulb, PenTool, HelpCircle, Brain, CheckSquare, FileArchive, FileImage, Video } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTopicSections, saveTopicSections, updateTopicStatus } from '@/lib/firebase/guide';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from "@/hooks/use-toast";

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor').then(mod => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">Loading Editor...</div>
});

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
          } else if (!['word_meaning', 'mcq', 'pdf', 'video'].includes(s.id)) {
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Topic Editor</h1>
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
              {!['word_meaning', 'mcq', 'pdf', 'video'].includes(activeTab) ? (
                <div className="animate-in fade-in duration-300">
                  <TiptapEditor 
                    key={activeTab}
                    content={contentMap[activeTab] || ''} 
                    onChange={handleRichTextChange} 
                  />
                </div>
              ) : activeTab === 'pdf' ? (
                <div className="space-y-4 max-w-md animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label>Document Title</Label>
                    <Input placeholder="e.g. Chapter 1 Summary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload PDF File</Label>
                    <Input type="file" accept=".pdf" />
                    <p className="text-xs text-slate-500">Max size 20MB</p>
                  </div>
                </div>
              ) : activeTab === 'video' ? (
                <div className="space-y-4 max-w-md animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label>Video Title</Label>
                    <Input placeholder="e.g. Explanation of Poem" />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube Link</Label>
                    <Input placeholder="https://youtube.com/watch?v=..." />
                  </div>
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
