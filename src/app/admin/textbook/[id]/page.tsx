'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTaxonomyNodeById, getTaxonomyNodesByParent, getTaxonomyNodesByTrack, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { getAssessmentsByNode } from '@/lib/firebase/assessment';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Layers, Target, FileText, Activity, Eye, ExternalLink, LayoutGrid, List, UploadCloud, Loader2, User, Languages, Type, Tag, Search, HelpCircle, Save } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface TopicData extends TaxonomyNode {
  contentsCount: number;
  questionCount: number;
  practiceSetCount: number;
  quizCount: number;
  mockTestCount: number;
  clientUrl: string;
}

interface ChapterData extends TaxonomyNode {
  topics: TopicData[];
  contentsCount: number;
  questionCount: number;
  practiceSetCount: number;
  quizCount: number;
  mockTestCount: number;
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
    status: 'active' | 'inactive' | 'published' | 'draft';
    author: string;
    description: string;
    mediumOfInstruction: string;
  } | null>(null);
  const [isSavingTb, setIsSavingTb] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalContents: 0,
    practiceSets: 0,
    quizzes: 0,
    mockTests: 0,
  });

  // Taxonomy Mapping State
  const [allNodes, setAllNodes] = useState<TaxonomyNode[]>([]);
  const [boardId, setBoardId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const loadData = async () => {
      if (!textbookId) return;

      try {
        // 1. Fetch the textbook
        const tbNode = await getTaxonomyNodeById(textbookId);
        setTextbook(tbNode);

        if (tbNode) {
          const nodes = await getTaxonomyNodesByTrack('academic');
          setAllNodes(nodes);
          
          let bId = '';
          let cId = '';
          let sId = '';
          if (tbNode.ancestors) {
            const b = tbNode.ancestors.find((a: any) => a.type === 'board');
            const c = tbNode.ancestors.find((a: any) => a.type === 'class');
            const s = tbNode.ancestors.find((a: any) => a.type === 'subject');
            if (b) bId = b.id;
            if (c) cId = c.id;
            if (s) sId = s.id;
          } else {
            sId = tbNode.parentId || '';
          }
          setBoardId(bId);
          setClassId(cId);
          setSubjectId(sId);
          setEditTbData({
            title: tbNode.title || '',
            slug: tbNode.slug || '',
            seoContent: tbNode.seoContent || '',
            tags: (tbNode.tags || []).join(', '),
            keywords: (tbNode.keywords || []).join(', '),
            featureImage: tbNode.featureImage || '',
            faqs: tbNode.faqs || [],
            status: tbNode.status || 'draft',
            author: tbNode.author || '',
            description: tbNode.description || '',
            mediumOfInstruction: (tbNode.mediumOfInstruction || []).join(', '),
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

          // Fetch ALL assessments, questions, and contents for the textbook to avoid n+1 query problems
          const tbqQuery = query(collection(db, 'question_bank'), where('textbookId', '==', textbookId));
          const tbqSnap = await getDocs(tbqQuery);
          const tbqDocs = tbqSnap.docs.map(d => d.data());

          const tbcQuery = query(collection(db, 'content'), where('textbookId', '==', textbookId));
          const tbcSnap = await getDocs(tbcQuery);
          const tbcDocs = tbcSnap.docs.map(d => d.data());

          const pSets = await getAssessmentsByNode('practiceSets', 'textbook', textbookId) as any[];
          const qSets = await getAssessmentsByNode('quizzes', 'textbook', textbookId) as any[];
          const mTests = await getAssessmentsByNode('mockTests', 'textbook', textbookId) as any[];

          // 2. Fetch all chapters for this textbook
          const chapterNodes = await getTaxonomyNodesByParent(textbookId);
          const sortedChapters = sortNodes(chapterNodes);
          
          // 3. For each chapter, fetch topics and calculate counts in memory
          const fullChapters: ChapterData[] = await Promise.all(
            sortedChapters.map(async (chap) => {
              const topicNodes = await getTaxonomyNodesByParent(chap.id);
              const sortedTopics = sortNodes(topicNodes);
              
              const fullTopics: TopicData[] = sortedTopics.map(top => {
                return {
                  ...top,
                  questionCount: tbqDocs.filter(q => q.topicId === top.id).length,
                  contentsCount: tbcDocs.filter(c => c.topicId === top.id).length,
                  practiceSetCount: pSets.filter(p => p.topicId === top.id).length,
                  quizCount: qSets.filter(q => q.topicId === top.id).length,
                  mockTestCount: mTests.filter(m => m.topicId === top.id).length,
                  clientUrl: `/guide/${baseTextbookSlugPath}/${chap.slug || chap.id}/${top.slug || top.id}`
                };
              });

              return {
                ...chap,
                topics: fullTopics,
                questionCount: tbqDocs.filter(q => q.chapterId === chap.id).length,
                contentsCount: tbcDocs.filter(c => c.chapterId === chap.id).length,
                practiceSetCount: pSets.filter(p => p.chapterId === chap.id).length,
                quizCount: qSets.filter(q => q.chapterId === chap.id).length,
                mockTestCount: mTests.filter(m => m.chapterId === chap.id).length,
                clientUrl: `/guide/${baseTextbookSlugPath}/${chap.slug || chap.id}`
              };
            })
          );

          setChapters(fullChapters);

          setStats({
            totalQuestions: tbqDocs.length,
            totalContents: tbcDocs.length,
            practiceSets: pSets.length,
            quizzes: qSets.length,
            mockTests: mTests.length,
          });
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
      
      const getValidId = (id: string) => id && id !== 'none' ? id : null;
      const finalParentId = getValidId(subjectId) || getValidId(classId) || getValidId(boardId) || null;

      await updateTaxonomyNode(textbookId, { 
        title: editTbData.title.trim(),
        slug: editTbData.slug.trim() || generateSlug(editTbData.title.trim()),
        seoContent: editTbData.seoContent,
        tags: editTbData.tags.split(',').map(s => s.trim()).filter(Boolean),
        keywords: editTbData.keywords.split(',').map(s => s.trim()).filter(Boolean),
        featureImage: editTbData.featureImage.trim(),
        faqs: editTbData.faqs.filter(f => f.question.trim() && f.answer.trim()),
        status: editTbData.status,
        author: editTbData.author.trim(),
        description: editTbData.description.trim(),
        mediumOfInstruction: editTbData.mediumOfInstruction.split(',').map(s => s.trim()).filter(Boolean),
        parentId: finalParentId,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editTbData) return;
    setIsUploadingImage(true);
    try {
      const fileRef = storageRef(storage, `textbook_covers/${textbookId}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setEditTbData({ ...editTbData, featureImage: url });
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setIsUploadingImage(false);
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
    <div className="flex gap-6 pb-12 items-start">

      {/* Left Sidebar - Chapters & Topics Navigator */}
      {chapters.length > 0 && (
        <div className="hidden xl:flex flex-col w-[260px] shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Chapters & Topics</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 truncate">{textbook.title}</p>
          </div>
          <div className="flex flex-col py-2">
            {chapters.map((chapter, idx) => (
              <div key={chapter.id}>
                {/* Chapter row */}
                <button
                  onClick={() => {
                    const el = document.getElementById(`chapter-${chapter.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"
                >
                  <span className="shrink-0 text-slate-400 dark:text-slate-500 text-[11px] font-bold">{idx + 1}.</span>
                  <span className="truncate">{chapter.title}</span>
                </button>
                {/* Topics */}
                {chapter.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      const el = document.getElementById(`topic-${topic.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="w-full text-left px-4 pl-8 py-1.5 text-[12px] text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-b border-slate-100 dark:border-slate-800 truncate"
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
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
              <Eye className="w-4 h-4" /> <span className="hidden md:inline">View Client Page</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-slate-800 border-indigo-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Total Questions</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalQuestions}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-teal-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Contents</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalContents}</h3>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-500/20 rounded-xl text-teal-600 dark:text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md cursor-pointer" onClick={() => window.location.href = `/admin/assessment-center/mock-tests?textbook=${textbookId}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Mock Tests</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.mockTests}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md cursor-pointer" onClick={() => window.location.href = `/admin/assessment-center/practice-sets?textbook=${textbookId}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Practice Sets</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.practiceSets}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 border-amber-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md cursor-pointer" onClick={() => window.location.href = `/admin/assessment-center/quizzes?textbook=${textbookId}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Quizzes</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.quizzes}</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Textbook Info Form */}
      {editTbData && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-900">

          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Textbook Info & SEO</h2>
                <p className="text-indigo-200 text-xs">Manage metadata, SEO content, and cover image</p>
              </div>
            </div>
            <span className={`hidden sm:flex px-3 py-1.5 rounded-full text-xs font-bold border items-center gap-1.5 ${
              editTbData.status === 'published' || editTbData.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                : 'bg-amber-500/20 text-amber-200 border-amber-400/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${editTbData.status === 'published' || editTbData.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {editTbData.status.charAt(0).toUpperCase() + editTbData.status.slice(1)}
            </span>
          </div>

          {/* Two-column body */}
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">

            {/* ── Left Sidebar ── */}
            <div className="lg:w-[240px] xl:w-[260px] shrink-0 p-5 space-y-5 bg-slate-50/60 dark:bg-slate-800/30">

              {/* Cover Image */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5">Cover Image</p>
                {editTbData.featureImage ? (
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editTbData.featureImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-4 gap-2">
                      <label className="cursor-pointer bg-white/95 text-slate-800 text-[11px] font-bold px-4 py-2 rounded-full hover:bg-white transition-colors flex items-center gap-1.5 shadow-lg">
                        <UploadCloud className="w-3 h-3" /> Change
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                      </label>
                      <button onClick={() => setEditTbData({...editTbData, featureImage: ''})} className="bg-red-500 text-white text-[11px] font-bold px-4 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center gap-1.5 shadow-lg">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full aspect-[3/4] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-400 group">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageUpload} disabled={isUploadingImage} />
                    {isUploadingImage ? (
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-600 flex items-center justify-center mb-3 shadow-sm transition-colors">
                        <UploadCloud className="w-5 h-5 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    )}
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{isUploadingImage ? 'Uploading...' : 'Upload Cover'}</p>
                    <p className="text-[10px] text-slate-400 mt-1 text-center px-3 leading-relaxed">Click or drag & drop<br/>Recommended: 3:4 ratio</p>
                  </div>
                )}
                <Input className="mt-2.5 text-xs h-8 bg-white dark:bg-slate-900 placeholder:text-slate-400" value={editTbData.featureImage} onChange={(e) => setEditTbData({...editTbData, featureImage: e.target.value})} placeholder="Or paste image URL..." />
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-700" />

              {/* Publish Status */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Publish Status</p>
                <Select value={editTbData.status} onValueChange={(val) => setEditTbData({...editTbData, status: val as any})}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 h-9 text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />Published</span>
                    </SelectItem>
                    <SelectItem value="draft">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />Draft</span>
                    </SelectItem>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />Active</span>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />Inactive</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3" /> Author / Publisher
                </label>
                <Input className="bg-white dark:bg-slate-900 h-9 text-sm" value={editTbData.author} onChange={(e) => setEditTbData({...editTbData, author: e.target.value})} placeholder="e.g. NCTB, Dr. Jafar" />
              </div>

              {/* Medium */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Languages className="w-3 h-3" /> Language / Medium
                </label>
                <Input className="bg-white dark:bg-slate-900 h-9 text-sm" value={editTbData.mediumOfInstruction} onChange={(e) => setEditTbData({...editTbData, mediumOfInstruction: e.target.value})} placeholder="e.g. Bangla, English" />
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-700" />

              {/* Taxonomy Mapping */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Taxonomy Mapping</p>
                <div className="space-y-2">
                  <Select value={boardId} onValueChange={(val) => { setBoardId(val); setClassId(''); setSubjectId(''); }}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 h-9 text-xs">
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="italic text-slate-500 text-xs">None / All Boards</SelectItem>
                      {allNodes.filter(n => n.type === 'board').map(b => (
                        <SelectItem key={b.id} value={b.id} className="text-xs">{b.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Select value={classId} onValueChange={(val) => { setClassId(val); setSubjectId(''); }}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 h-9 text-xs">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="italic text-slate-500 text-xs">None / Independent</SelectItem>
                      {(boardId && boardId !== 'none' ? allNodes.filter(n => n.type === 'class' && n.parentId === boardId) : allNodes.filter(n => n.type === 'class')).map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Select disabled={!classId} value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 h-9 text-xs">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="italic text-slate-500 text-xs">None / Independent</SelectItem>
                      {allNodes.filter(n => n.type === 'subject' && n.parentId === classId).map(s => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ── Right Main Panel ── */}
            <div className="flex-1 p-6 space-y-8 min-w-0">

              {/* Section: Core Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
                    <Type className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Core Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Title <span className="text-red-500">*</span></Label>
                    <Input value={editTbData.title} onChange={(e) => setEditTbData({...editTbData, title: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">URL Slug</Label>
                    <Input value={editTbData.slug} onChange={(e) => setEditTbData({...editTbData, slug: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors font-mono text-sm h-10" placeholder="auto-generated-from-title" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Short Description / Excerpt</Label>
                  <Textarea rows={2} value={editTbData.description} onChange={(e) => setEditTbData({...editTbData, description: e.target.value})} placeholder="Brief 1-2 sentence summary shown in search results and cards..." className="bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors resize-none text-sm" />
                </div>
              </div>

              {/* Section: Content & SEO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm shadow-violet-200">
                    <FileText className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Content & SEO</h3>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Detailed Content <span className="font-normal text-slate-400">(Markdown supported)</span></Label>
                  <Textarea rows={6} value={editTbData.seoContent} onChange={(e) => setEditTbData({...editTbData, seoContent: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors font-mono text-sm resize-y" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-slate-400" /> Tags <span className="font-normal text-slate-400">(comma separated)</span>
                    </Label>
                    <Input value={editTbData.tags} onChange={(e) => setEditTbData({...editTbData, tags: e.target.value})} placeholder="math, science, class 10" className="bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-slate-400" /> Keywords <span className="font-normal text-slate-400">(comma separated)</span>
                    </Label>
                    <Input value={editTbData.keywords} onChange={(e) => setEditTbData({...editTbData, keywords: e.target.value})} placeholder="class 10 math, board exam" className="bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors h-10" />
                  </div>
                </div>
              </div>

              {/* Section: FAQs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm shadow-amber-200">
                      <HelpCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">FAQs</h3>
                    {editTbData.faqs.length > 0 && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-700">
                        {editTbData.faqs.length}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditTbData({...editTbData, faqs: [...editTbData.faqs, {question: '', answer: ''}]})}
                    className="h-7 text-xs gap-1.5 border-dashed hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Plus className="w-3 h-3" /> Add FAQ
                  </Button>
                </div>
                <div className="space-y-3">
                  {editTbData.faqs.map((faq, idx) => (
                    <div key={idx} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => {
                          const newFaqs = editTbData.faqs.filter((_, i) => i !== idx);
                          setEditTbData({...editTbData, faqs: newFaqs});
                        }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-2 pr-8">
                        <Input
                          placeholder={`Q${idx + 1}. Enter question...`}
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...editTbData.faqs];
                            newFaqs[idx].question = e.target.value;
                            setEditTbData({...editTbData, faqs: newFaqs});
                          }}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 font-medium text-sm"
                        />
                        <Textarea
                          placeholder="Answer..."
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...editTbData.faqs];
                            newFaqs[idx].answer = e.target.value;
                            setEditTbData({...editTbData, faqs: newFaqs});
                          }}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-sm resize-none"
                        />
                      </div>
                    </div>
                  ))}
                  {editTbData.faqs.length === 0 && (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-colors group" onClick={() => setEditTbData({...editTbData, faqs: [{question: '', answer: ''}]})}>
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30 group-hover:opacity-60 group-hover:text-amber-400 transition-all" />
                      <p className="text-sm font-medium text-slate-500">No FAQs added yet</p>
                      <p className="text-xs text-slate-400 mt-1">Click to add your first FAQ</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">All changes are saved to Firestore database</p>
                <Button
                  onClick={handleSaveTextbook}
                  disabled={!editTbData?.title.trim() || isSavingTb}
                  className="ml-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 px-6 h-10 rounded-xl font-semibold transition-all active:scale-95 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingTb ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapters & Topics Accordion */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-violet-50 via-purple-50/50 to-white border-b border-violet-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet-500 to-purple-600"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-3 text-violet-950">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-violet-50 shrink-0">
                <Layers className="h-5 w-5 text-violet-600" />
              </div>
              <span className="leading-tight font-semibold bg-clip-text text-transparent bg-gradient-to-r from-violet-900 to-slate-800">Chapters & Topics Content Map</span>
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
                <Plus className="w-4 h-4" /> <span className="hidden md:inline">Add Chapter</span>
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
                  id={`chapter-${chapter.id}`}
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
                    <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 z-10 shrink-0">
                        {chapter.topics.length} Topics
                      </Badge>
                      {chapter.contentsCount > 0 && (
                        <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200 z-10 shrink-0">
                          {chapter.contentsCount} Res
                        </Badge>
                      )}
                      {chapter.questionCount > 0 && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 z-10 shrink-0">
                          {chapter.questionCount} Qs
                        </Badge>
                      )}
                      {chapter.mockTestCount > 0 && (
                        <Badge variant="secondary" className="bg-sky-50 text-sky-700 border-sky-200 z-10 shrink-0">
                          {chapter.mockTestCount} Mocks
                        </Badge>
                      )}
                      {chapter.practiceSetCount > 0 && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 z-10 shrink-0">
                          {chapter.practiceSetCount} Prac
                        </Badge>
                      )}
                      {chapter.quizCount > 0 && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 z-10 shrink-0">
                          {chapter.quizCount} Quiz
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <AccordionContent className="pt-0 pb-0">
                    <div className="border-t border-gray-100">
                      {viewMode === 'grid' ? (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50">
                          {chapter.topics.map((topic) => (
                            <div key={topic.id} id={`topic-${topic.id}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-indigo-300 group flex flex-col justify-between h-full relative overflow-hidden">
                              <div className="flex items-start gap-3 mb-4">
                                <div className="mt-1 bg-indigo-50 p-1.5 rounded-lg text-indigo-500 shrink-0">
                                   <Target className="h-4 w-4" />
                                </div>
                                <span className="font-semibold text-gray-800 text-sm leading-snug">{topic.title}</span>
                              </div>
                              
                              {/* Contents Types & Counts */}
                              <div className="flex flex-wrap items-center gap-2 mt-auto pb-4 border-b border-gray-100">
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
                                
                                {topic.mockTestCount > 0 && (
                                  <Badge variant="outline" className="flex items-center gap-1 font-normal text-[10.5px] px-2 py-0.5 bg-sky-50 text-sky-700 border-sky-200">
                                    {topic.mockTestCount} Mocks
                                  </Badge>
                                )}
                                {topic.practiceSetCount > 0 && (
                                  <Badge variant="outline" className="flex items-center gap-1 font-normal text-[10.5px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {topic.practiceSetCount} Prac
                                  </Badge>
                                )}
                                {topic.quizCount > 0 && (
                                  <Badge variant="outline" className="flex items-center gap-1 font-normal text-[10.5px] px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                                    {topic.quizCount} Quiz
                                  </Badge>
                                )}
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
                            <li key={topic.id} id={`topic-${topic.id}`} className="p-4 pl-12 hover:bg-gray-50 transition-colors flex items-center justify-between group">
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
                              <div className="flex items-center flex-wrap gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 font-normal ${topic.contentsCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                >
                                  <FileText className="h-3 w-3" />
                                  {topic.contentsCount} Res
                                </Badge>
                                
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 font-normal ${topic.questionCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                >
                                  <Activity className="h-3 w-3" />
                                  {topic.questionCount} Qs
                                </Badge>

                                {topic.mockTestCount > 0 && (
                                  <Badge variant="outline" className="flex items-center gap-1 font-normal bg-sky-50 text-sky-700 border-sky-200">
                                    {topic.mockTestCount} Mocks
                                  </Badge>
                                )}
                                {topic.practiceSetCount > 0 && (
                                  <Badge variant="outline" className="flex items-center gap-1 font-normal bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {topic.practiceSetCount} Prac
                                  </Badge>
                                )}
                                {topic.quizCount > 0 && (
                                  <Badge variant="outline" className="flex items-center gap-1 font-normal bg-purple-50 text-purple-700 border-purple-200">
                                    {topic.quizCount} Quiz
                                  </Badge>
                                )}
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
    </div>
  );
}
