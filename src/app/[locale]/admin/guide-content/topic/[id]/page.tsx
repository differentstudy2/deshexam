'use client';

import { fetchWithAuth } from '@/lib/fetch-with-auth';
import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Save, BookOpen, FileText, Type, Target, Info, User,
  Lightbulb, PenTool, HelpCircle, Brain, CheckSquare, FileArchive,
  FileImage, Video, Headphones, Plus, Trash2, ClipboardList, StickyNote,
  Key, Timer, Award, Bookmark, ChevronRight, LayoutDashboard, Globe, Sparkles, Loader2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getTopicSections, saveTopicSections, updateTopicStatus } from '@/lib/firebase/guide';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db, storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor').then(mod => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[200px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-400">Loading Editor...</div>,
});

import { TopicVideoManager } from '@/components/admin/TopicVideoManager';
import { TopicDocumentManager } from '@/components/admin/TopicDocumentManager';
import { TopicQuestionManager } from '@/components/admin/TopicQuestionManager';
import { TopicAssessmentManager } from '@/components/admin/TopicAssessmentManager';

const sectionCategories = [
  {
    title: 'Learning',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    dot: 'bg-emerald-500',
    items: [
      { id: 'lesson',      label: 'Lesson',      icon: BookOpen },
      { id: 'author',      label: 'Author',      icon: User },
      { id: 'word_meaning',label: 'Word Meaning',icon: Type },
      { id: 'explanation', label: 'Explanation', icon: Lightbulb },
      { id: 'exercise',    label: 'Exercise',    icon: PenTool },
    ]
  },
  {
    title: 'Resources',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    dot: 'bg-blue-500',
    items: [
      { id: 'notes',     label: 'Notes',     icon: StickyNote },
      { id: 'pdf',       label: 'Documents', icon: FileImage },
      { id: 'solutions', label: 'Solutions', icon: Key },
      { id: 'video',     label: 'Videos',    icon: Video },
      { id: 'audio',     label: 'Audio',     icon: Headphones },
    ]
  },
  {
    title: 'Practice',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    dot: 'bg-violet-500',
    items: [
      { id: 'questions',    label: 'Questions',   icon: HelpCircle },
      { id: 'practice_sets',label: 'Practice Sets',icon: ClipboardList },
      { id: 'quizzes',      label: 'Quizzes',     icon: HelpCircle },
      { id: 'model_test',   label: 'Model Test',  icon: FileArchive },
      { id: 'mock_tests',   label: 'Mock Tests',  icon: Timer },
      { id: 'exams_papers', label: 'Exam Papers', icon: Award },
    ]
  }
];

const sectionTypes = sectionCategories.flatMap(c => c.items);

export default function TopicEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const topicId = resolvedParams.id;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('lesson');
  const [contentMap, setContentMap] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [flatCurriculum, setFlatCurriculum] = useState<any[]>([]);
  const [nodeTitle, setNodeTitle] = useState<string>('');
  const router = useRouter();
  const [nodeLevel, setNodeLevel] = useState<'chapter' | 'topic'>('topic');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [nodeSlug, setNodeSlug] = useState('');
  const [nodeDbId, setNodeDbId] = useState<string>('');
  const [contentLang, setContentLang] = useState<'bn' | 'en'>('bn');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const { findGuideNodeAnyLevel, getCurriculumBySubject } = await import('@/lib/firebase/guide');
        const nodeInfo = await findGuideNodeAnyLevel(topicId);
        
        if (nodeInfo?.node) {
          if (nodeInfo.node.status) setStatus(nodeInfo.node.status);
          setNodeTitle(nodeInfo.node.title || nodeInfo.node.name || '');
          setNodeSlug(nodeInfo.node.fullSlug || nodeInfo.node.id);
          setNodeDbId(nodeInfo.node.id);

          if (nodeInfo.level === 'chapter' || nodeInfo.level === 'topic') {
            setNodeLevel(nodeInfo.level);
          }

          const subject = nodeInfo.node.ancestors?.find((a: any) => a.type === 'subject');
          if (subject) {
            const curriculum = await getCurriculumBySubject(subject.id);
            const flat: any[] = [];
            curriculum.forEach((ch: any) => {
              flat.push({ id: ch.dbId || ch.id, title: ch.title });
              (ch.topics || []).forEach((t: any) => {
                flat.push({ id: t.dbId || t.id, title: t.title });
                (t.subtopics || []).forEach((st: any) => {
                  flat.push({ id: st.dbId || st.id, title: st.title });
                });
              });
            });
            setFlatCurriculum(flat);
          }
        }
        
        const sections = await getTopicSections(topicId);
        const initial: Record<string, any> = {};
        sectionTypes.forEach(s => {
          if (sections[s.id]) {
            let content = sections[s.id].content || '';
            let content_en = sections[s.id].content_en || '';
            if (content === '<p>Start typing here...</p>') content = '';
            initial[s.id] = content;
            initial[`${s.id}_en`] = content_en;
          } else if (!['word_meaning', 'mcq', 'pdf', 'video', 'audio'].includes(s.id)) {
            initial[s.id] = '';
            initial[`${s.id}_en`] = '';
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
    const key = contentLang === 'en' ? `${activeTab}_en` : activeTab;
    setContentMap(prev => ({ ...prev, [key]: html }));
  };

  const getMediaData = (type: string): any[] => {
    const val = contentMap[type];
    if (typeof val === 'string') {
      if (val.startsWith('[')) { try { return JSON.parse(val); } catch { return []; } }
      if (val.startsWith('{')) {
        try {
          const parsed = JSON.parse(val);
          if (parsed.url || parsed.title) return [{ ...parsed, id: Date.now().toString() }];
          return [];
        } catch { return []; }
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
    const item = data[index];
    if (item?.url?.includes('firebasestorage.googleapis.com')) {
      deleteObject(ref(storage, item.url)).catch(console.error);
    }
    data.splice(index, 1);
    setContentMap(prev => ({ ...prev, [type]: JSON.stringify(data) }));
  };

  const addMediaItem = (type: string) => {
    const data = getMediaData(type);
    data.push({ id: Date.now().toString() + Math.random(), title: '', url: '', description: '', tags: '' });
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
      toast({ title: 'Uploaded!' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formatted: Record<string, any> = {};
      sectionTypes.forEach(s => {
        if (contentMap[s.id] !== undefined || contentMap[`${s.id}_en`] !== undefined) {
          formatted[s.id] = { 
            content: contentMap[s.id] || '',
            ...(contentMap[`${s.id}_en`] !== undefined ? { content_en: contentMap[`${s.id}_en`] } : {})
          };
        }
      });
      await saveTopicSections(topicId, formatted);
      await updateTopicStatus(topicId, status);
      toast({ title: "Saved!", description: "Content saved successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const navigateTo = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false); // close mobile drawer when navigating
  };

  const activeSection = sectionTypes.find(s => s.id === activeTab);

  const currentIndex = flatCurriculum.findIndex(item => item.id === topicId);
  const prevNode = currentIndex > 0 ? flatCurriculum[currentIndex - 1] : undefined;
  const nextNode = currentIndex !== -1 && currentIndex < flatCurriculum.length - 1 ? flatCurriculum[currentIndex + 1] : undefined;

  const handleAITranslate = async () => {
    const sourceContent = contentMap[activeTab];
    if (!sourceContent) {
      toast({ title: 'No content', description: 'Please add some content in Bengali first.', variant: 'destructive' });
      return;
    }
    
    setIsTranslating(true);
    try {
      const res = await fetchWithAuth('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceContent, targetLanguage: 'English' })
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      
      setContentMap(prev => ({ ...prev, [`${activeTab}_en`]: data.result }));
      setContentLang('en');
      toast({ title: 'Translated successfully', description: 'Switched to English view.' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Translation failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!nodeTitle) {
      toast({ title: 'No Topic Title', description: 'Please ensure the topic has a title.', variant: 'destructive' });
      return;
    }
    
    setIsGenerating(true);
    try {
      const { generateLearnContent } = await import('@/ai/flows/ai-learn-content-generator');
      const topicToGenerate = `${nodeTitle} - ${activeSection?.label || activeTab}`;
      const res = await generateLearnContent({ topic: topicToGenerate });
      
      if (res && res.body) {
        let cleanBody = res.body.trim();
        if (cleanBody.startsWith('```')) {
          cleanBody = cleanBody.replace(/^```(markdown|html)?\n/i, '').replace(/\n```$/i, '');
        }
        
        const { marked } = await import('marked');
        const html = await marked.parse(cleanBody);

        const key = contentLang === 'en' ? `${activeTab}_en` : activeTab;
        setContentMap(prev => ({ ...prev, [key]: html }));
        toast({ title: 'Generated Successfully', description: 'AI content has been populated.' });
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Sidebar nav content (shared between desktop sidebar + mobile drawer) ──
  const sidebarNavContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand / ID */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Topic ID</p>
          <div className="flex items-center gap-1">
            <button 
              disabled={!prevNode} 
              onClick={() => router.push(`/admin/guide-content/topic/${prevNode?.id}`)} 
              title={prevNode ? `Previous: ${prevNode.title}` : undefined}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button 
              disabled={!nextNode} 
              onClick={() => router.push(`/admin/guide-content/topic/${nextNode?.id}`)}
              title={nextNode ? `Next: ${nextNode.title}` : undefined}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate" title={topicId}>{topicId.slice(0, 16)}…</p>
        {flatCurriculum.length > 0 ? (
          <select 
            value={topicId}
            onChange={(e) => {
              const val = e.target.value;
              if (val !== topicId) {
                router.push(`/admin/guide-content/topic/${val}`);
              }
            }}
            className="w-full mt-1.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-md py-1.5 px-2 text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            {flatCurriculum.map(item => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        ) : (
          nodeTitle && <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1 truncate" title={nodeTitle}>{nodeTitle}</p>
        )}
      </div>

      {/* Status + Save */}
      <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <Select value={status} onValueChange={(val: any) => setStatus(val)}>
          <SelectTrigger className="h-8 text-xs flex-1 rounded-lg border-slate-200 dark:border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-8 text-xs px-3 rounded-lg bg-[#107c41] hover:bg-[#0b5c30] shrink-0 gap-1" onClick={handleSave} disabled={saving || loading}>
          {saving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving</> : <><Save className="w-3 h-3" /> Save</>}
        </Button>
      </div>

      {/* Preview link */}
      <div className="px-3 pt-2 pb-1">
        <Link href={`/guide/${topicId}`} target="_blank">
          <button className="w-full flex items-center justify-between text-xs text-[#107c41] font-semibold py-1.5 px-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
            <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Preview Page</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* Nav sections */}
      <div className="flex-1 px-3 pt-1 pb-4 space-y-4">
        {sectionCategories.map(cat => (
          <div key={cat.title}>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", cat.dot)} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", cat.color)}>{cat.title}</span>
            </div>
            <div className="space-y-0.5">
              {cat.items.map(section => {
                const isActive = activeTab === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => navigateTo(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-left",
                      isActive
                        ? "bg-[#107c41] text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <section.icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Content panel ──
  const mainContentPanel = (
    <div className="animate-in fade-in duration-200">
      {activeTab === 'video' ? (
        <TopicVideoManager topicId={topicId} />
      ) : activeTab === 'pdf' ? (
        <TopicDocumentManager topicId={topicId} />
      ) : ['lesson','guide_content','objective','introduction','author','explanation','exercise','notes','solutions','bookmark','word_meaning'].includes(activeTab) ? (
        <div className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative flex flex-col h-full">
          <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
             <span className="text-sm font-semibold flex items-center gap-2">
               {activeSection && React.createElement(activeSection.icon, { className: "w-4 h-4 text-[#107c41]" })}
               {activeSection?.label} Editor
             </span>
             <Button type="button" variant="outline" size="sm" onClick={handleAIGenerate} disabled={isGenerating}>
               {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-amber-500" />} Generate with AI
             </Button>
          </div>
          {contentLang === 'en' && (
            <div className="absolute top-14 right-0 m-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded z-10 flex items-center gap-1 shadow-sm">
              <Globe className="w-3 h-3" /> English Variant
            </div>
          )}
          <div className="flex-1 overflow-auto p-2">
            <TiptapEditor key={`${activeTab}_${contentLang}`} content={contentMap[contentLang === 'en' ? `${activeTab}_en` : activeTab] || ''} onChange={handleRichTextChange} />
          </div>
        </div>
      ) : activeTab === 'audio' ? (
        <div className="space-y-3">
          {getMediaData(activeTab).map((item: any, index: number) => (
            <div key={item.id} className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-200 dark:border-slate-800 p-3 relative shadow-sm">
              <button className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30 text-red-500" onClick={() => removeMediaItem(activeTab, index)}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="space-y-3 pr-8">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Title</label>
                  <Input className="h-8 text-sm mt-1" placeholder="Audio title..." value={item.title || ''} onChange={e => updateMediaItem(activeTab, index, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Upload Audio</label>
                  <Input type="file" accept="audio/*" className="h-8 text-xs mt-1" onChange={e => handleMediaUpload(e, activeTab, index)} />
                  {item.url && <audio controls src={item.url} className="mt-2 w-full h-8" />}
                </div>
              </div>
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-500 hover:border-[#107c41] hover:text-[#107c41] transition-colors" onClick={() => addMediaItem(activeTab)}>
            <Plus className="w-4 h-4" /> Add Audio
          </button>
        </div>
      ) : ['questions','mcq','creative_question','descriptive'].includes(activeTab) ? (
        <TopicQuestionManager topicId={nodeDbId || topicId} tabType={activeTab} nodeLevel={nodeLevel} />
      ) : ['model_test','practice_sets','quizzes','mock_tests','exams_papers'].includes(activeTab) ? (
        <TopicAssessmentManager topicId={nodeDbId || topicId} tabType={activeTab} nodeLevel={nodeLevel} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
          <FileText className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">{activeSection?.label} Editor</p>
          <p className="text-xs mt-1 opacity-60">Sub-editor coming soon.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6f9] dark:bg-[#0f1117]">

      {/* ═══════════════════════════════════════════════════
          STICKY TOP HEADER (shared for all breakpoints)
      ═══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1a1d27] border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between px-3 lg:px-6 py-2.5 gap-3">
          {/* Left: back + title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/admin/guide-content/explorer">
              <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </Link>
            {/* Section icon + label (desktop only header breadcrumb) */}
            <div className="hidden lg:flex items-center gap-2 min-w-0">
              {activeSection && React.createElement(activeSection.icon, { className: "w-4 h-4 text-[#107c41] shrink-0" })}
              <div>
                <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Topic Editor</h1>
                <p className="text-[10px] text-slate-400 leading-tight">{activeSection?.label}</p>
              </div>
            </div>
            {/* Mobile title */}
            <div className="lg:hidden min-w-0">
              <h1 className="text-sm font-bold text-slate-800 dark:text-white truncate leading-tight">Topic Editor</h1>
              <p className="text-[10px] text-slate-400 truncate leading-tight">{activeSection?.label}</p>
            </div>
          </div>

          {/* Right: status + save */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Select value={contentLang} onValueChange={(val: any) => setContentLang(val)}>
              <SelectTrigger className="h-7 text-xs px-2 w-[110px] rounded-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bn">Bengali (bn)</SelectItem>
                <SelectItem value="en">English (en)</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <Select value={status} onValueChange={(val: any) => setStatus(val)}>
              <SelectTrigger className="h-7 text-xs px-2 w-[92px] rounded-full border-slate-300 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-7 text-xs px-3 rounded-full bg-[#107c41] hover:bg-[#0b5c30] gap-1" onClick={handleSave} disabled={saving || loading}>
              {saving ? (
                <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving</>
              ) : (
                <><Save className="w-3 h-3" /> Save</>
              )}
            </Button>
          </div>
        </div>

        {/* ── Mobile-only: scrollable pill nav ── */}
        <div className="lg:hidden overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-1 px-3 py-2 w-max">
            {sectionCategories.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {catIdx > 0 && <div className="w-px bg-slate-200 dark:bg-slate-700 self-stretch mx-0.5" />}
                {cat.items.map(section => {
                  const isActive = activeTab === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => navigateTo(section.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0",
                        isActive
                          ? "bg-[#107c41] text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <section.icon className="w-3 h-3" />
                      {section.label}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          BODY: mobile = single col, desktop = sidebar + content
      ═══════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 bg-white dark:bg-[#1a1d27] border-r border-slate-200 dark:border-slate-800 sticky top-[73px] h-[calc(100vh-73px)] overflow-hidden">
          {sidebarNavContent}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">
          {/* Mobile: px-3 / desktop: wider padding + max-width */}
          <div className="px-3 pt-3 pb-24 lg:px-8 lg:pt-6 lg:pb-10 lg:max-w-4xl xl:max-w-5xl lg:mx-auto">

            {/* Desktop section header strip */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {activeSection && React.createElement(activeSection.icon, { className: "w-5 h-5 text-[#107c41]" })}
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{activeSection?.label}</h2>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-1">
                  {sectionCategories.find(c => c.items.some(i => i.id === activeTab))?.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {['lesson','guide_content','objective','introduction','author','explanation','exercise','notes','solutions','bookmark','word_meaning'].includes(activeTab) && contentLang === 'bn' && (
                  <Button size="sm" variant="outline" className="h-8 gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30" onClick={handleAITranslate} disabled={isTranslating}>
                    {isTranslating ? <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> : <Brain className="w-4 h-4" />}
                    Translate to EN
                  </Button>
                )}
                <Link href={`/guide/${nodeSlug || topicId}`} target="_blank">
                  <button className="flex items-center gap-1.5 text-sm text-[#107c41] font-semibold hover:underline">
                    <BookOpen className="w-4 h-4" /> Preview <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile section mini-header */}
            <div className="flex items-center gap-2 mb-3 lg:hidden">
              {activeSection && React.createElement(activeSection.icon, { className: "w-4 h-4 text-[#107c41] shrink-0" })}
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{activeSection?.label}</span>
              <Link href={`/guide/${nodeSlug || topicId}`} target="_blank" className="ml-auto">
                <button className="flex items-center gap-1 text-[10px] text-[#107c41] font-medium">
                  <BookOpen className="w-3 h-3" /> Preview <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>

            {mainContentPanel}
          </div>
        </main>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
