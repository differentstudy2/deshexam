'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getGuideBoards, getGuideClassesByBoard, getGuideClasses, getGuideSubjectsByClass, getGuideTextbooksBySubject, getGuideChaptersByTextbook } from '@/lib/firebase/guide';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

export default function CreateTopicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
    getGuideBoards().then(setBoards);
  }, []);

  const [formData, setFormData] = useState({
    boardId: '',
    classId: '',
    subjectId: '',
    textbookId: '',
    chapterId: '',
    name: '',
    slug: '',
    thumbnail: '',
    status: 'draft',
    orderIndex: '1'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = async (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'boardId') {
      getGuideClassesByBoard(value).then(setClasses);
      setFormData(prev => ({ ...prev, classId: '', subjectId: '', textbookId: '', chapterId: '' }));
      setSubjects([]); setTextbooks([]); setChapters([]);
    }
    if (name === 'classId') {
      getGuideSubjectsByClass(value).then(setSubjects);
      setFormData(prev => ({ ...prev, subjectId: '', textbookId: '', chapterId: '' }));
      setTextbooks([]); setChapters([]);
    }
    if (name === 'subjectId') {
      getGuideTextbooksBySubject(value).then(setTextbooks);
      setFormData(prev => ({ ...prev, textbookId: '', chapterId: '' }));
      setChapters([]);
    }
    if (name === 'textbookId') {
      getGuideChaptersByTextbook(value).then(setChapters);
      setFormData(prev => ({ ...prev, chapterId: '' }));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.chapterId) {
      toast({
        title: "Missing Information",
        description: "Please fill out Topic Name and select a Chapter.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const newTopicId = formData.slug || 'topic-' + Date.now();
      
      // Save topic document
      await setDoc(doc(db, 'guide_topics', newTopicId), {
        title: formData.name,
        slug: formData.slug,
        chapterId: formData.chapterId,
        textbookId: formData.textbookId,
        subjectId: formData.subjectId,
        classId: formData.classId,
        boardId: formData.boardId,
        status: formData.status,
        orderIndex: Number(formData.orderIndex),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Auto-create default content sections
      const defaultSections = ['lesson', 'guide_content'];
      for (const sec of defaultSections) {
        await setDoc(doc(db, 'guide_topics', newTopicId, 'content_sections', sec), {
          topicId: newTopicId,
          sectionType: sec,
          content: '<p>Start typing here...</p>',
          updatedAt: serverTimestamp()
        });
      }
      
      toast({
        title: "Success",
        description: "Topic created successfully!"
      });
      router.push('/admin/guide-content/topic/' + newTopicId);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save topic",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const autoGenerateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/guide-content">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Topic</h1>
            <p className="text-sm text-slate-500">Define the hierarchy and metadata for a new curriculum topic.</p>
          </div>
        </div>
        <Button 
          className="bg-[#107c41] hover:bg-[#0b5c30]" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save & Continue to Editor</>}
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>Topic Details</CardTitle>
          <CardDescription>Select where this topic belongs in the curriculum tree.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Board</Label>
              <Select onValueChange={(val) => handleSelectChange('boardId', val)}>
                <SelectTrigger><SelectValue placeholder="Select Board" /></SelectTrigger>
                <SelectContent>
                  {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.title || b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select onValueChange={(val) => handleSelectChange('classId', val)} disabled={!formData.boardId}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.title || c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select onValueChange={(val) => handleSelectChange('subjectId', val)} disabled={!formData.classId}>
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.title || s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Textbook</Label>
              <Select onValueChange={(val) => handleSelectChange('textbookId', val)} disabled={!formData.subjectId}>
                <SelectTrigger><SelectValue placeholder="Select Textbook" /></SelectTrigger>
                <SelectContent>
                  {textbooks.map(t => <SelectItem key={t.id} value={t.id}>{t.title || t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select onValueChange={(val) => handleSelectChange('chapterId', val)} disabled={!formData.textbookId}>
                <SelectTrigger><SelectValue placeholder="Select Chapter" /></SelectTrigger>
                <SelectContent>
                  {chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.title || c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. ??? ???????" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>URL Slug</Label>
                <button type="button" onClick={autoGenerateSlug} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-generate
                </button>
              </div>
              <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. path-porichiti" />
              <p className="text-[11px] text-slate-500">This is how it appears in the student URL.</p>
            </div>
            <div className="space-y-2">
              <Label>Order / Sequence Number</Label>
              <Input name="orderIndex" type="number" value={formData.orderIndex} onChange={handleChange} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail Image URL (Optional)</Label>
              <Input name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <Label className="mb-3">Publishing Status</Label>
              <div className="flex items-center space-x-2">
                <Switch id="status" checked={formData.status === 'published'} onCheckedChange={(checked) => handleSelectChange('status', checked ? 'published' : 'draft')} />
                <Label htmlFor="status" className="font-normal text-slate-600">
                  {formData.status === 'published' ? 'Published (Visible to students)' : 'Draft (Hidden from students)'}
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
