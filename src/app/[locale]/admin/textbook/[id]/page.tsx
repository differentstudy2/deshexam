'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTaxonomyNodeById, getTaxonomyNodesByParent, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Layers, Target, FileText, Activity, Eye, ExternalLink, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface TopicData extends TaxonomyNode {
  contentsCount: number;
  questionCount: number;
  clientUrl: string;
}

interface ChapterData extends TaxonomyNode {
  topics: TopicData[];
  clientUrl: string;
}

export default function TextbookDetailsPage() {
  const params = useParams();
  const textbookId = params.id as string;

  const [textbook, setTextbook] = useState<TaxonomyNode | null>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientUrl, setClientUrl] = useState<string>('');

  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNodeData, setEditNodeData] = useState<{ id: string, title: string, type: 'chapter' | 'topic' } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteNodeData, setDeleteNodeData] = useState<{ id: string, title: string, type: 'chapter' | 'topic' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New States for Textbook Edit Form
  const [editTbData, setEditTbData] = useState<{
    title: string;
    slug: string;
    seoContent: string;
    tags: string;
    keywords: string;
    featureImage: string;
    faqs: { question: string; answer: string }[];
  } | null>(null);
  const [isSavingTb, setIsSavingTb] = useState(false);

  const loadData = async () => {
      if (!textbookId) return;

      try {
        // 1. Fetch the textbook
        const tbNode = await getTaxonomyNodeById(textbookId);
        setTextbook(tbNode);

        if (tbNode) {
          setEditTbData({
            title: tbNode.title || '',
            slug: tbNode.slug || '',
            seoContent: tbNode.seoContent || '',
            tags: (tbNode.tags || []).join(', '),
            keywords: (tbNode.keywords || []).join(', '),
            featureImage: tbNode.featureImage || '',
            faqs: tbNode.faqs || []
          });
          // 2. Fetch Client URL base path for textbook by walking up the taxonomy tree
          let baseTextbookSlugPath = tbNode.fullSlug || tbNode.id;
          try {
            let currentNode: TaxonomyNode | null = tbNode;
            const slugs: string[] = [];
            
            while (currentNode) {
              slugs.unshift(currentNode.slug || currentNode.id);
              if (!currentNode.parentId) break;
              currentNode = await getTaxonomyNodeById(currentNode.parentId);
            }
            baseTextbookSlugPath = slugs.join('/');
            setClientUrl(`/guide/${baseTextbookSlugPath}`);
          } catch (e) {
            console.error("Error building client url:", e);
            setClientUrl(`/guide/${baseTextbookSlugPath}`);
          }

          const sortNodes = (nodes: any[]) => {
            const extractNumber = (title: string): number => {
              const match = title.match(/[0-9০-৯]+/);
              if (!match) return 0;
              const bengaliToEnglish: Record<string, string> = {
                '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
                '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
              };
              const numStr = match[0].replace(/[০-৯]/g, (c) => bengaliToEnglish[c]);
              return parseInt(numStr, 10);
            };

            return nodes.sort((a, b) => {
              const numA = extractNumber(a.title);
              const numB = extractNumber(b.title);
              if (numA !== numB && (numA > 0 || numB > 0)) {
                return numA - numB;
              }
              if (typeof a.orderIndex === 'number' && typeof b.orderIndex === 'number' && a.orderIndex !== b.orderIndex) {
                return a.orderIndex - b.orderIndex;
              }
              return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
            });
          };

          // 2. Fetch all chapters for this textbook
          const chapterNodes = await getTaxonomyNodesByParent(textbookId);
          const sortedChapters = sortNodes(chapterNodes);
          
          // 3. For each chapter, fetch topics and their content counts
          const fullChapters: ChapterData[] = await Promise.all(
            sortedChapters.map(async (chap) => {
              const topicNodes = await getTaxonomyNodesByParent(chap.id);
              const sortedTopics = sortNodes(topicNodes);
              
              const fullTopics: TopicData[] = await Promise.all(
                sortedTopics.map(async (top) => {
                  // Fetch question count for this topic
                  const qQuery = query(collection(db, 'questions'), where('topicId', '==', top.id));
                  const qSnap = await getDocs(qQuery);
                  
                  // Fetch content (resources/videos/etc) count for this topic
                  const cQuery = query(collection(db, 'content'), where('topicId', '==', top.id));
                  const cSnap = await getDocs(cQuery);

                  return {
                    ...top,
                    questionCount: qSnap.size,
                    contentsCount: cSnap.size,
                    clientUrl: `/guide/${baseTextbookSlugPath}/${chap.slug || chap.id}/${top.slug || top.id}`
                  };
                })
              );

              return {
                ...chap,
                topics: fullTopics,
                clientUrl: `/guide/${baseTextbookSlugPath}/${chap.slug || chap.id}`
              };
            })
          );

          setChapters(fullChapters);
        }
      } catch (error) {
        console.error("Error fetching textbook details:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, [textbookId]);

  const handleAddChapter = async () => {
    if (!newItemTitle.trim() || !textbook) return;
    setIsAdding(true);
    try {
      const { createTaxonomyNode } = await import('@/lib/firebase/taxonomy');
      const titles = newItemTitle.split('\n').map(t => t.trim()).filter(Boolean);
      
      for (const title of titles) {
        await createTaxonomyNode({
          title: title,
          type: 'chapter',
          track: textbook.track,
          parentId: textbook.id,
          status: 'published'
        });
      }
      
      setIsAddChapterOpen(false);
      setNewItemTitle('');
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to add chapter');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddTopic = async () => {
    if (!newItemTitle.trim() || !textbook || !activeChapterId) return;
    setIsAdding(true);
    try {
      const { createTaxonomyNode } = await import('@/lib/firebase/taxonomy');
      const titles = newItemTitle.split('\n').map(t => t.trim()).filter(Boolean);
      
      for (const title of titles) {
        await createTaxonomyNode({
          title: title,
          type: 'topic',
          track: textbook.track,
          parentId: activeChapterId,
          status: 'published'
        });
      }
      
      setIsAddTopicOpen(false);
      setNewItemTitle('');
      setActiveChapterId(null);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to add topic');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editNodeData || !editNodeData.title.trim()) return;
    setIsEditing(true);
    try {
      const { updateTaxonomyNode } = await import('@/lib/firebase/taxonomy');
      await updateTaxonomyNode(editNodeData.id, { title: editNodeData.title.trim() });
      setIsEditModalOpen(false);
      setEditNodeData(null);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to update');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteNodeData) return;
    setIsDeleting(true);
    try {
      const { deleteTaxonomyNode } = await import('@/lib/firebase/taxonomy');
      await deleteTaxonomyNode(deleteNodeData.id);
      setIsDeleteDialogOpen(false);
      setDeleteNodeData(null);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveTextbook = async () => {
    if (!editTbData || !editTbData.title.trim()) return;
    setIsSavingTb(true);
    try {
      const { updateTaxonomyNode, generateSlug } = await import('@/lib/firebase/taxonomy');
      await updateTaxonomyNode(textbookId, { 
        title: editTbData.title.trim(),
        slug: editTbData.slug.trim() || generateSlug(editTbData.title.trim()),
        seoContent: editTbData.seoContent,
        tags: editTbData.tags.split(',').map(s => s.trim()).filter(Boolean),
        keywords: editTbData.keywords.split(',').map(s => s.trim()).filter(Boolean),
        featureImage: editTbData.featureImage.trim(),
        faqs: editTbData.faqs.filter(f => f.question.trim() && f.answer.trim())
      });
      await loadData();
      alert('Textbook info updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to update textbook info');
    } finally {
      setIsSavingTb(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 animate-pulse">Loading textbook data...</div>;
  }

  if (!textbook) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Textbook Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/textbook">Return to Textbooks</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-4">
          <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full shrink-0 mt-1 md:mt-0">
            <Link href="/admin/textbook">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-indigo-600 shrink-0" />
              <span className="truncate">{textbook.title}</span>
            </h1>
            <div className="text-gray-500 flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline">{textbook.track} Track</Badge>
              {textbook.status === 'active' || textbook.status === 'published' ? (
                 <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Published</Badge>
              ) : (
                 <Badge variant="secondary">Draft</Badge>
              )}
              <span className="text-sm border-l pl-2 border-gray-300 truncate max-w-[150px] sm:max-w-none">ID: {textbook.id}</span>
            </div>
          </div>
        </div>
        <div className="md:ml-auto flex items-center gap-2 w-full md:w-auto">
          <Button asChild variant="outline" className="gap-2 w-full md:w-auto">
            <Link href={clientUrl || `/guide/${textbook.boardSlug}/${textbook.classSlug}/${textbook.subjectSlug}/${textbook.slug || textbook.id}`} target="_blank">
              <Eye className="w-4 h-4" /> View Client Page
            </Link>
          </Button>
        </div>
      </div>

      {/* Edit Textbook Info Form */}
      {editTbData && (
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              Textbook Info & SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editTbData.title} onChange={(e) => setEditTbData({...editTbData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={editTbData.slug} onChange={(e) => setEditTbData({...editTbData, slug: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description / SEO Content (Markdown supported)</Label>
                <Textarea rows={6} value={editTbData.seoContent} onChange={(e) => setEditTbData({...editTbData, seoContent: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tags (Comma separated)</Label>
                  <Input value={editTbData.tags} onChange={(e) => setEditTbData({...editTbData, tags: e.target.value})} placeholder="e.g. math, science" />
                </div>
                <div className="space-y-2">
                  <Label>Keywords (Comma separated)</Label>
                  <Input value={editTbData.keywords} onChange={(e) => setEditTbData({...editTbData, keywords: e.target.value})} placeholder="e.g. class 10 math, board exam" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input value={editTbData.featureImage} onChange={(e) => setEditTbData({...editTbData, featureImage: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between mt-6 border-t pt-4">
                  <Label className="text-lg">FAQs</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditTbData({...editTbData, faqs: [...editTbData.faqs, {question: '', answer: ''}]})}>
                    <Plus className="w-4 h-4 mr-2" /> Add FAQ
                  </Button>
                </div>
                <div className="space-y-3 mt-2">
                  {editTbData.faqs.map((faq, idx) => (
                    <div key={idx} className="flex gap-2 items-start border p-3 rounded-md bg-slate-50">
                      <div className="flex-1 space-y-2">
                        <Input placeholder="Question" value={faq.question} onChange={(e) => {
                          const newFaqs = [...editTbData.faqs];
                          newFaqs[idx].question = e.target.value;
                          setEditTbData({...editTbData, faqs: newFaqs});
                        }} />
                        <Textarea placeholder="Answer" rows={2} value={faq.answer} onChange={(e) => {
                          const newFaqs = [...editTbData.faqs];
                          newFaqs[idx].answer = e.target.value;
                          setEditTbData({...editTbData, faqs: newFaqs});
                        }} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-100" onClick={() => {
                        const newFaqs = editTbData.faqs.filter((_, i) => i !== idx);
                        setEditTbData({...editTbData, faqs: newFaqs});
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {editTbData.faqs.length === 0 && <p className="text-sm text-gray-500 italic">No FAQs added yet.</p>}
                </div>
              </div>
              <div className="flex justify-end border-t pt-4">
                <Button onClick={handleSaveTextbook} disabled={!editTbData?.title.trim() || isSavingTb} className="bg-indigo-600 hover:bg-indigo-700">
                  {isSavingTb ? 'Saving...' : 'Save Textbook Info'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapters & Topics Accordion */}
      <Card>
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500 shrink-0" />
              <span className="leading-tight">Chapters & Topics Content Map</span>
            </CardTitle>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200 shrink-0">
                 <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} title="Grid View">
                    <LayoutGrid className="w-4 h-4" />
                 </button>
                 <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} title="List View">
                    <List className="w-4 h-4" />
                 </button>
              </div>
              <Button onClick={() => setIsAddChapterOpen(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Chapter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {chapters.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="text-gray-500 mb-4">No chapters have been added to this textbook yet.</p>
              <Button onClick={() => setIsAddChapterOpen(true)} variant="outline">
                Add First Chapter
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4" defaultValue={chapters.length > 0 ? [chapters[0].id] : []}>
              {chapters.map((chapter) => (
                <AccordionItem 
                  key={chapter.id} 
                  value={chapter.id} 
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm relative"
                >
                  <AccordionTrigger className="px-4 md:px-5 py-4 hover:bg-gray-50 hover:no-underline transition-colors data-[state=open]:bg-indigo-50/30 md:pr-[300px]">
                    <div className="flex items-center gap-3 w-full">
                      <div className="bg-indigo-100 p-2 rounded-md text-indigo-600 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-base md:text-lg text-gray-900 text-left line-clamp-2 pr-2">{chapter.title}</span>
                    </div>
                  </AccordionTrigger>
                  
                  {/* Action buttons extracted outside the button element to fix hydration error */}
                  <div className="relative md:absolute right-0 md:right-6 top-0 flex flex-wrap md:flex-nowrap items-center justify-end gap-2 md:gap-3 h-auto md:h-[60px] pointer-events-auto px-4 pb-3 md:px-0 md:pb-0 bg-white md:bg-transparent rounded-b-lg md:rounded-none z-10 border-b border-gray-100 md:border-none">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 z-10" onClick={(e) => e.stopPropagation()}>
                      <Link href={chapter.clientUrl} target="_blank">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-indigo-100 z-10" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/guide-content/topic/${chapter.id}`} target="_blank" title="Manage Content">
                        <FileText className="h-4 w-4 text-indigo-600" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 z-10" onClick={(e) => { e.stopPropagation(); setEditNodeData({ id: chapter.id, title: chapter.title, type: 'chapter' }); setIsEditModalOpen(true); }}>
                      <Edit2 className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 hover:text-red-600 z-10" onClick={(e) => { e.stopPropagation(); setDeleteNodeData({ id: chapter.id, title: chapter.title, type: 'chapter' }); setIsDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                    </Button>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 z-10">
                      {chapter.topics.length} Topics
                    </Badge>
                  </div>
                  
                  <AccordionContent className="pt-0 pb-0">
                    <div className="border-t border-gray-100">
                      {viewMode === 'grid' ? (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50">
                          {chapter.topics.map((topic) => (
                            <div key={topic.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-indigo-300 group flex flex-col justify-between h-full relative overflow-hidden">
                              <div className="flex items-start gap-3 mb-4">
                                <div className="mt-1 bg-indigo-50 p-1.5 rounded-lg text-indigo-500 shrink-0">
                                   <Target className="h-4 w-4" />
                                </div>
                                <span className="font-semibold text-gray-800 text-sm leading-snug">{topic.title}</span>
                              </div>
                              
                              {/* Contents Types & Counts */}
                              <div className="flex items-center gap-2 mt-auto pb-4 border-b border-gray-100">
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 font-normal text-[10.5px] px-2 py-0.5 ${topic.contentsCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                >
                                  <FileText className="h-3 w-3" />
                                  {topic.contentsCount} Res
                                </Badge>
                                
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 font-normal text-[10.5px] px-2 py-0.5 ${topic.questionCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                >
                                  <Activity className="h-3 w-3" />
                                  {topic.questionCount} Qs
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between pt-3">
                                 <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                                   <Link href={topic.clientUrl} target="_blank" title="View Client Page">
                                     <ExternalLink className="h-4 w-4" />
                                   </Link>
                                 </Button>
                                 <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                                   <Link href={`/admin/guide-content/topic/${topic.id}`} target="_blank" title="Manage Content">
                                     <FileText className="h-4 w-4" />
                                   </Link>
                                 </Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); setEditNodeData({ id: topic.id, title: topic.title, type: 'topic' }); setIsEditModalOpen(true); }} title="Edit Topic">
                                   <Edit2 className="h-4 w-4" />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setDeleteNodeData({ id: topic.id, title: topic.title, type: 'topic' }); setIsDeleteDialogOpen(true); }} title="Delete Topic">
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                            </div>
                          ))}
                          
                          <div 
                             onClick={() => { setActiveChapterId(chapter.id); setIsAddTopicOpen(true); }}
                             className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer min-h-[150px]"
                          >
                             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
                               <Plus className="w-5 h-5 text-gray-500" />
                             </div>
                             <span className="text-sm font-semibold text-gray-600">Add New Topic</span>
                          </div>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {chapter.topics.map((topic) => (
                            <li key={topic.id} className="p-4 pl-12 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <Target className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                <span className="font-medium text-gray-800">{topic.title}</span>
                                <Button asChild variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link href={topic.clientUrl} target="_blank">
                                    <ExternalLink className="h-3 w-3 text-indigo-600" />
                                  </Link>
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100">
                                  <Link href={`/admin/guide-content/topic/${topic.id}`} target="_blank" title="Manage Content">
                                    <FileText className="h-3 w-3 text-indigo-600" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setEditNodeData({ id: topic.id, title: topic.title, type: 'topic' }); setIsEditModalOpen(true); }}>
                                  <Edit2 className="h-3 w-3 text-gray-500 hover:text-indigo-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100" onClick={(e) => { e.stopPropagation(); setDeleteNodeData({ id: topic.id, title: topic.title, type: 'topic' }); setIsDeleteDialogOpen(true); }}>
                                  <Trash2 className="h-3 w-3 text-gray-500 hover:text-red-600" />
                                </Button>
                              </div>
                              
                              {/* Contents Types & Counts */}
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 font-normal ${topic.contentsCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                >
                                  <FileText className="h-3 w-3" />
                                  {topic.contentsCount} Resources
                                </Badge>
                                
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 font-normal ${topic.questionCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                >
                                  <Activity className="h-3 w-3" />
                                  {topic.questionCount} Questions
                                </Badge>
                              </div>
                            </li>
                          ))}
                          <li className="p-3 pl-12 bg-gray-50/50 flex items-center justify-center border-t border-gray-100">
                             <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2" onClick={() => { setActiveChapterId(chapter.id); setIsAddTopicOpen(true); }}>
                               <Plus className="w-4 h-4" /> Add Another Topic
                             </Button>
                          </li>
                        </ul>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Add Chapter Dialog */}
      <Dialog open={isAddChapterOpen} onOpenChange={(open) => { setIsAddChapterOpen(open); if (!open) setNewItemTitle(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Chapter Title(s)</Label>
              <Textarea 
                id="chapter-title" 
                placeholder="e.g. 1. Introduction to Physics&#10;2. Mechanics" 
                value={newItemTitle} 
                onChange={(e) => setNewItemTitle(e.target.value)}
                rows={5}
                autoFocus
              />
              <p className="text-xs text-gray-500">Enter one chapter title per line to add multiple chapters at once.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddChapterOpen(false)} disabled={isAdding}>Cancel</Button>
            <Button onClick={handleAddChapter} disabled={!newItemTitle.trim() || isAdding}>
              {isAdding ? 'Adding...' : 'Add Chapter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Topic Dialog */}
      <Dialog open={isAddTopicOpen} onOpenChange={(open) => { setIsAddTopicOpen(open); if (!open) { setNewItemTitle(''); setActiveChapterId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic-title">Topic Title(s)</Label>
              <Textarea 
                id="topic-title" 
                placeholder="e.g. Newton's First Law&#10;Newton's Second Law" 
                value={newItemTitle} 
                onChange={(e) => setNewItemTitle(e.target.value)}
                rows={5}
                autoFocus
              />
              <p className="text-xs text-gray-500">Enter one topic title per line to add multiple topics at once.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTopicOpen(false)} disabled={isAdding}>Cancel</Button>
            <Button onClick={handleAddTopic} disabled={!newItemTitle.trim() || isAdding}>
              {isAdding ? 'Adding...' : 'Add Topic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) setEditNodeData(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editNodeData?.type === 'chapter' ? 'Chapter' : 'Topic'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input 
                id="edit-title" 
                value={editNodeData?.title || ''} 
                onChange={(e) => setEditNodeData(prev => prev ? { ...prev, title: e.target.value } : null)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEditSubmit(); }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isEditing}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={!editNodeData?.title.trim() || isEditing}>
              {isEditing ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) setDeleteNodeData(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete {deleteNodeData?.type === 'chapter' ? 'Chapter' : 'Topic'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{deleteNodeData?.title}</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-md border border-red-100">
              Warning: This action cannot be undone. All contents and resources inside this {deleteNodeData?.type} will be permanently deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
