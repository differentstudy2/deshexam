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
import { ArrowLeft, BookPlus, Loader2, UploadCloud, Type, FileText, Tag, Image as ImageIcon, BookOpen, User, Languages, Settings2, Save } from 'lucide-react';
import Link from 'next/link';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { motion, Variants } from 'framer-motion';
import { TiptapEditor } from '@/components/admin/TiptapEditor';

const FADE_UP_ANIMATION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function AddTextbookPage() {
  const router = useRouter();
  const [allNodes, setAllNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `textbook_covers/${file.name}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFeatureImage(url);
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const availableBoards = allNodes.filter(n => n.type === 'board');
  const availableClasses = boardId && boardId !== 'none' ? allNodes.filter(n => n.type === 'class' && n.parentId === boardId) : allNodes.filter(n => n.type === 'class');
  const availableSubjects = allNodes.filter(n => n.type === 'subject' && n.parentId === classId);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const getValidId = (id: string) => id && id !== 'none' ? id : null;
    const finalParentId = getValidId(subjectId) || getValidId(classId) || getValidId(boardId) || null;

    setIsSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        slug: slug.trim(),
        type: 'textbook',
        track: 'academic',
        parentId: finalParentId,
        status: 'draft',
        featureImage: featureImage.trim(),
        seoContent: seoContent.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        author: author.trim(),
        description: description.trim(),
        faqs: []
      };
      
      if (language) {
        payload.mediumOfInstruction = language.split(',').map((l: string) => l.trim()).filter(Boolean);
      }

      const newTextbookId = await createTaxonomyNode(payload);
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 -m-4 sm:-m-6 md:-m-8 pb-20 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-[100px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 blur-[100px] rounded-full pointer-events-none transform -translate-x-1/2 opacity-60"></div>

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Link href="/admin/textbook">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-white tracking-tight">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm">
              <BookPlus className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg">Create Textbook</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" asChild className="h-9 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <Link href="/admin/textbook">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isSaving} className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 text-sm font-medium rounded-lg px-6 transition-all active:scale-95">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? 'Saving...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Main Content (Left Column) */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="w-full lg:w-[68%] space-y-6"
          >
            
            {/* Title & Permalink */}
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 dark:focus-within:border-indigo-600 group">
              <div className="p-6 sm:p-8">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter textbook title here..."
                  className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent border-0 outline-none focus:ring-0 px-0 py-2 placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white transition-colors tracking-tight"
                />
                
                <div className="flex flex-wrap items-center gap-2 mt-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-4">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Type className="w-4 h-4 text-indigo-500" />
                    Permalink:
                  </div>
                  {slug ? (
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md font-mono text-xs">{slug}</span>
                  ) : (
                    <span className="italic text-slate-400 font-mono text-xs">auto-generated-from-title</span>
                  )}
                  <Button type="button" variant="ghost" size="sm" className="h-6 px-2.5 py-0 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:text-indigo-400 rounded-md" onClick={() => {
                    const customSlug = prompt("Enter custom slug (letters, numbers, hyphens):", slug);
                    if (customSlug !== null) setSlug(customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                  }}>Edit URL</Button>
                </div>
              </div>
            </motion.div>

            {/* Short Excerpt */}
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-6 sm:p-8 transition-shadow hover:shadow-md">
              <Label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                <FileText className="w-4 h-4 text-indigo-500" />
                Short Description / Excerpt
              </Label>
              <Textarea 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Write a brief 1-2 sentence summary of the textbook. This appears in search results and cards..." 
                className="w-full bg-slate-50 dark:bg-slate-950 resize-y border-slate-200 dark:border-slate-800 focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-indigo-400/20 text-base"
              />
            </motion.div>

            {/* Main Editor Block */}
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex flex-col">
              <Label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 px-1">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Detailed Content & Overview
              </Label>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
                <TiptapEditor 
                  content={seoContent} 
                  onChange={(html) => setSeoContent(html)} 
                  maxHeight="500px"
                />
              </div>
            </motion.div>

            {/* SEO & Meta Settings */}
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                  <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-indigo-500" />
                    SEO & Meta Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <Tag className="w-3.5 h-3.5" /> Tags
                    </Label>
                    <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. math, science (comma separated)" className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <Search className="w-3.5 h-3.5" /> Focus Keywords
                    </Label>
                    <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g. class 10 math, board exam (comma separated)" className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Sidebar (Right Column) */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
            }}
            className="w-full lg:w-[32%] space-y-6 lg:sticky lg:top-24"
          >
            
            {/* Publish Status Card */}
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                  <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Save className="w-4 h-4 text-indigo-500" />
                    Publish
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
                    <span className="font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-md border border-amber-100 dark:border-amber-800/50">Draft</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Visibility:</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50">Public</span>
                  </div>
                </CardContent>
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button onClick={handleSubmit} disabled={!title.trim() || isSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium h-10 rounded-lg">
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSaving ? 'Publishing...' : 'Publish Textbook'}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Feature Image */}
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                  <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    Cover Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-center">
                  {featureImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featureImage} alt="Cover preview" className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="sm" className="h-8 px-4 rounded-full font-medium" onClick={() => setFeatureImage('')}>
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[3/4] bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-700/70 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group flex flex-col items-center justify-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-6 h-6 text-indigo-500" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {isUploading ? 'Uploading...' : 'Upload Cover Image'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-[150px]">
                        Drag & drop or click to browse. Recommended size: 600x800px.
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5 text-left pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Or Paste Image URL</Label>
                    <Input value={featureImage} onChange={(e) => setFeatureImage(e.target.value)} placeholder="https://..." className="h-10 text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Book Details */}
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                  <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Book Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <User className="w-3.5 h-3.5" /> Author / Publisher
                    </Label>
                    <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Dr. Jafar Iqbal, NCTB" className="h-11 text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <Languages className="w-3.5 h-3.5" /> Language / Medium
                    </Label>
                    <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. Bangla, English" className="h-11 text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hierarchy Selection */}
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                  <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <BookPlus className="w-4 h-4 text-indigo-500" />
                    Taxonomy Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Board / Curriculum</Label>
                    <Select value={boardId} onValueChange={(val) => { setBoardId(val); setClassId(''); setSubjectId(''); }}>
                      <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select Board (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="italic text-slate-500">None / All Boards</SelectItem>
                        {availableBoards.map(b => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.acronym ? b.acronym : b.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Class / Level</Label>
                    <Select value={classId} onValueChange={(val) => { setClassId(val); setSubjectId(''); }}>
                      <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select Class (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="italic text-slate-500">None / Independent</SelectItem>
                        {availableClasses.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subject</Label>
                    <Select disabled={!classId} value={subjectId} onValueChange={setSubjectId}>
                      <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select Subject (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="italic text-slate-500">None / Independent</SelectItem>
                        {availableSubjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </motion.div>
        </form>
      </div>
    </div>
  );
}

// Ensure Search icon is imported
import { Search } from 'lucide-react';
