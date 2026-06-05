'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getReadingContent, saveGuideReadingContent } from '@/lib/firebase/guide';
import { ReadingContentData } from '@/app/guide/[id]/guide-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, AlignLeft, ListOrdered, Box, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

type BuilderSection = {
  id: string;
  type: 'article' | 'mcq' | 'subtopic';
  content: any;
};

export default function ContentManagerPage() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId') || '';
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [contentId, setContentId] = useState(topicId);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  
  const [sections, setSections] = useState<any[]>([]);

  // Load existing data if topicId is provided
  useEffect(() => {
    if (topicId) {
      setLoading(true);
      getReadingContent(topicId).then(data => {
        if (data) {
          setTitle(data.title);
          setSubtitle(data.subtitle || '');
          setTags(data.tags?.join(', ') || '');
          setAuthorName(data.author?.name || '');
          setAuthorAvatar(data.author?.avatarUrl || '');
          
          // Map backend ContentSection to our builder's internal format
          const mappedSections = (data.sections || []).map((sec: any, idx: number) => {
            if (sec.type === 'article') {
              return { id: `s-${idx}`, type: 'article', content: sec.body || '' };
            }
            if (sec.type === 'mcq') {
              return { id: `s-${idx}`, type: 'mcq', content: sec.questions || [] };
            }
            if (sec.type === 'subtopic') {
              // Our builder previously mapped this differently, let's keep it simple
              return { id: `s-${idx}`, type: 'subtopic', content: { title: sec.title || '', html: '' } };
            }
            return { id: `s-${idx}`, ...sec };
          });
          
          setSections(mappedSections);
        }
        setLoading(false);
      });
    }
  }, [topicId]);

  const handleSave = async () => {
    if (!contentId || !title) return alert('Content ID and Title are required');
    setSaving(true);
    
    // Map internal Builder sections back to ContentSection backend format
    const backendSections = sections.map(sec => {
      if (sec.type === 'article') {
        return { type: 'article', title: '', body: sec.content || '', author: { name: authorName, avatarUrl: authorAvatar } };
      }
      if (sec.type === 'mcq') {
        return { type: 'mcq', title: '', questions: typeof sec.content === 'string' ? JSON.parse(sec.content || '[]') : sec.content, author: { name: authorName, avatarUrl: authorAvatar } };
      }
      if (sec.type === 'subtopic') {
        return { type: 'subtopic', title: sec.content?.title || '', content: [{ text: sec.content?.html || '' }], author: { name: authorName, avatarUrl: authorAvatar } };
      }
      return sec;
    });

    const dataToSave: any = {
      title,
      subtitle,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      author: {
        name: authorName,
        avatarUrl: authorAvatar
      },
      sections: backendSections
    };

    try {
      await saveGuideReadingContent(contentId, dataToSave);
      alert('Content saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Error saving content');
    }
    setSaving(false);
  };

  const addSection = (type: 'article' | 'mcq' | 'subtopic') => {
    const newSection: any = {
      id: `s-${Date.now()}`,
      type
    };

    if (type === 'article') newSection.content = '';
    if (type === 'mcq') newSection.content = [];
    if (type === 'subtopic') newSection.content = { title: '', html: '' };

    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const updateSection = (index: number, updatedContent: any) => {
    const newSections = [...sections];
    newSections[index].content = updatedContent;
    setSections(newSections);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-emerald-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/guide">
            <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Content Builder</h1>
            <p className="text-slate-500 mt-1">Editing content for ID: <span className="font-mono text-emerald-600">{contentId || 'New Content'}</span></p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#107c41] hover:bg-[#0b5c30]">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Content
        </Button>
      </div>

      {/* Metadata Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>The core details for this reading content page.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content ID (Matches Topic ID)</label>
            <Input value={contentId} onChange={e => setContentId(e.target.value)} placeholder="e.g. otithir-sriti" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Main Title" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subtitle (Optional)</label>
            <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtitle or descriptive text" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (Comma separated)</label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="গল্প, শরৎচন্দ্র চট্টোপাধ্যায়" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Author Name (Optional)</label>
            <Input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Author Name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Author Avatar URL (Optional)</label>
            <Input value={authorAvatar} onChange={e => setAuthorAvatar(e.target.value)} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      {/* Sections Builder */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-2">Content Sections</h2>
        
        {sections.map((section, index) => (
          <Card key={section.id} className="border-slate-200 dark:border-slate-800 relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 uppercase tracking-wider">
                {section.type}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => removeSection(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <CardContent className="pt-6">
              
              {/* Article Section Editor */}
              {section.type === 'article' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><AlignLeft className="w-4 h-4"/> Markdown/HTML Content</label>
                  <Textarea 
                    className="min-h-[200px] font-mono text-sm" 
                    value={section.content as string} 
                    onChange={e => updateSection(index, e.target.value)}
                    placeholder="<p>Write your article content here...</p>"
                  />
                </div>
              )}

              {/* Subtopic Section Editor */}
              {section.type === 'subtopic' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Box className="w-4 h-4"/> Box Title</label>
                    <Input 
                      value={(section.content as any).title} 
                      onChange={e => updateSection(index, { ...(section.content as any), title: e.target.value })}
                      placeholder="e.g. লেখক পরিচিতি"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Box Content (HTML)</label>
                    <Textarea 
                      className="min-h-[150px] font-mono text-sm" 
                      value={(section.content as any).html} 
                      onChange={e => updateSection(index, { ...(section.content as any), html: e.target.value })}
                      placeholder="<p>Content inside the card...</p>"
                    />
                  </div>
                </div>
              )}

              {/* MCQ Section Editor */}
              {section.type === 'mcq' && (
                <div className="space-y-4">
                  <label className="text-sm font-medium flex items-center gap-2"><ListOrdered className="w-4 h-4"/> MCQ Questions (JSON Format for Admin)</label>
                  <Textarea 
                    className="min-h-[200px] font-mono text-sm" 
                    value={typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2)} 
                    onChange={e => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateSection(index, parsed);
                      } catch {
                        // If it's invalid JSON while typing, just store the string temporarily
                        updateSection(index, e.target.value);
                      }
                    }}
                    placeholder="[ { question: '...', options: ['A','B','C','D'], correctIndex: 0 } ]"
                  />
                  <p className="text-xs text-amber-600 dark:text-amber-400">Note: Must be valid JSON. A visual MCQ builder can be added in future updates.</p>
                </div>
              )}

            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
            No sections added yet. Build your content using the buttons below.
          </div>
        )}

        {/* Add Section Buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button variant="outline" className="border-dashed border-2 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300" onClick={() => addSection('article')}>
            <Plus className="w-4 h-4 mr-2 text-blue-500" /> Add Article Text
          </Button>
          <Button variant="outline" className="border-dashed border-2 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300" onClick={() => addSection('subtopic')}>
            <Plus className="w-4 h-4 mr-2 text-purple-500" /> Add Info Box (Subtopic)
          </Button>
          <Button variant="outline" className="border-dashed border-2 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300" onClick={() => addSection('mcq')}>
            <Plus className="w-4 h-4 mr-2 text-orange-500" /> Add MCQ Block
          </Button>
        </div>

      </div>
    </div>
  );
}
