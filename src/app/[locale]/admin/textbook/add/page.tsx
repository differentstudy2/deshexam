'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTaxonomyNodesByTrack, createTaxonomyNode, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AddTextbookPage() {
  const router = useRouter();
  const [allNodes, setAllNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [boardId, setBoardId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [featureImage, setFeatureImage] = useState('');
  const [seoContent, setSeoContent] = useState('');
  const [tags, setTags] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTaxonomyNodesByTrack('academic');
        setAllNodes(data);
      } catch (error) {
        console.error('Failed to load taxonomy nodes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableBoards = allNodes.filter(n => n.type === 'board');
  const availableClasses = boardId && boardId !== 'none' ? allNodes.filter(n => n.type === 'class' && n.parentId === boardId) : allNodes.filter(n => n.type === 'class');
  const availableSubjects = allNodes.filter(n => n.type === 'subject' && n.parentId === classId);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !subjectId) return;

    setIsSaving(true);
    try {
      const newTextbookId = await createTaxonomyNode({
        title: title.trim(),
        slug: slug.trim(),
        type: 'textbook',
        track: 'academic',
        parentId: subjectId,
        status: 'draft',
        featureImage: featureImage.trim(),
        seoContent: seoContent.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        faqs: []
      });
      router.push(`/admin/textbook/${newTextbookId}`);
    } catch (error) {
      console.error('Failed to create textbook:', error);
      alert('Error creating textbook. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 -m-4 sm:-m-6 md:-m-8 pb-12 relative overflow-hidden">
      {/* Premium Background Blurs */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute top-40 left-0 -ml-20 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

      {/* WordPress-like Top Bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800/80 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Link href="/admin/textbook">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <BookPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-lg">Add New Textbook</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" asChild className="h-9 text-xs sm:text-sm">
            <Link href="/admin/textbook">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !subjectId || isSaving} className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs sm:text-sm">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Main Content (Left Column) */}
          <div className="w-full lg:w-[70%] space-y-6">
            
            {/* Title & Permalink */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-all focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-300 dark:focus-within:border-indigo-700">
              <div className="p-5 sm:p-8">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  className="w-full text-2xl sm:text-4xl font-extrabold bg-transparent border-0 border-b border-transparent outline-none focus:ring-0 px-0 py-2 placeholder:text-gray-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white transition-colors"
                />
                
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                  <span className="font-medium text-gray-700 dark:text-slate-300">Permalink:</span> 
                  {slug ? (
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{slug}</span>
                  ) : (
                    <span className="italic text-gray-400">auto-generated-from-title</span>
                  )}
                  <Button type="button" variant="ghost" className="h-6 px-2 py-0 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:text-indigo-400" onClick={() => {
                    const customSlug = prompt("Enter custom slug (letters, numbers, hyphens):", slug);
                    if (customSlug !== null) setSlug(customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                  }}>Edit</Button>
                </div>
              </div>
            </div>

            {/* Main Editor Block (Description) */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col">
              <div className="border-b border-gray-100 dark:border-slate-800 px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between">
                 <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Description / Content</h2>
              </div>
              <div className="p-0 flex-1">
                <Textarea 
                  rows={16} 
                  value={seoContent} 
                  onChange={(e) => setSeoContent(e.target.value)} 
                  placeholder="Start writing or type / to choose a block..." 
                  className="w-full min-h-[300px] border-0 focus-visible:ring-0 resize-y p-5 sm:p-8 text-base leading-relaxed bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-gray-300 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* SEO & Meta Settings */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-slate-800 px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">SEO & Meta Tags</CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Tags</Label>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. math, science (comma separated)" className="h-10 bg-slate-50 dark:bg-slate-900/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Focus Keywords</Label>
                  <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g. class 10 math (comma separated)" className="h-10 bg-slate-50 dark:bg-slate-900/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="w-full lg:w-[30%] space-y-6">
            
            {/* Status & Publish */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-slate-800 px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Publish</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Status:</span>
                  <span className="font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-800/50">Draft</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Visibility:</span>
                  <span className="font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/50">Public</span>
                </div>
              </CardContent>
              <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <Button onClick={handleSubmit} disabled={!title.trim() || !subjectId || isSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSaving ? 'Publishing...' : 'Publish Textbook'}
                </Button>
              </div>
            </Card>

            {/* Hierarchy Selection */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-slate-800 px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Taxonomy Mapping</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Board (Optional)</Label>
                  <Select value={boardId} onValueChange={(val) => { setBoardId(val); setClassId(''); setSubjectId(''); }}>
                    <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50">
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="italic text-gray-500">None / All Classes</SelectItem>
                      {availableBoards.map(b => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.acronym ? b.acronym : b.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Class <span className="text-red-500">*</span></Label>
                  <Select value={classId} onValueChange={(val) => { setClassId(val); setSubjectId(''); }}>
                    <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Subject <span className="text-red-500">*</span></Label>
                  <Select disabled={!classId} value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Feature Image */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-slate-800 px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Feature Image</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-center">
                {featureImage ? (
                  <div className="relative rounded-md overflow-hidden border border-gray-200 dark:border-slate-700 bg-slate-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featureImage} alt="Cover preview" className="w-full h-auto object-cover" />
                    <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2 h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setFeatureImage('')}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="py-10 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-md">
                    <p className="text-xs text-gray-500 dark:text-slate-400">No image selected</p>
                  </div>
                )}
                <div className="space-y-1.5 text-left pt-2 border-t border-gray-100 dark:border-slate-800">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Image URL</Label>
                  <Input value={featureImage} onChange={(e) => setFeatureImage(e.target.value)} placeholder="https://..." className="h-9 text-xs" />
                </div>
              </CardContent>
            </Card>

          </div>
        </form>
      </div>
    </div>
  );
}
