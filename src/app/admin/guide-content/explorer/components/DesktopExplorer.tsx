'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  FolderTree, ChevronRight, ChevronDown, GraduationCap, Library, BookOpen, Layers, FileText,
  Plus, MoreVertical, Edit2, Loader2, Trash2, ArrowUp, ArrowDown, Settings, Eye, ArrowRightLeft, 
  Search, AlignLeft, BarChart3, Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { 
  getGuideBoards, getGuideClassesByBoard, getGuideClasses, getGuideSubjectsByClass, getGuideTextbooksBySubject, getGuideChaptersByTextbook, getGuideTopicsByChapter, getTopicSections, 
  createGuideBoard, createGuideClass, createGuideSubject, createGuideTextbook, createGuideChapter, createGuideTopic,
  deleteGuideBoard, deleteGuideClass, deleteGuideSubject, deleteGuideTextbook, deleteGuideChapter, deleteGuideTopic,
  updateGuideNodeTitle, migrateOldTextbooksToGuide, updateGuideNodeOrders, updateGuideNodeSEO, getGuideNodeById,
  moveGuideNode, getGuideAllChapters, getGuideTextbooks, getGuideStats
} from '@/lib/firebase/guide';
import { db } from '@/lib/firebase/client';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';

const getLevelConfig = (type: string) => {
  switch (type) {
    case 'board': return { color: 'text-emerald-600', icon: FolderTree, bg: 'bg-white', border: 'border border-gray-100 hover:border-emerald-200' };
    case 'class': return { color: 'text-indigo-600', icon: GraduationCap, bg: 'bg-indigo-50/50', border: 'border border-transparent border-l-4 border-l-indigo-400' };
    case 'subject': return { color: 'text-amber-600', icon: Library, bg: 'bg-amber-50/50', border: 'border border-transparent border-l-4 border-l-amber-400' };
    case 'textbook': return { color: 'text-rose-600', icon: BookOpen, bg: 'bg-rose-50/50', border: 'border border-transparent border-l-4 border-l-rose-400' };
    case 'chapter': return { color: 'text-sky-600', icon: Layers, bg: 'bg-sky-50/50', border: 'border border-transparent border-l-4 border-l-sky-400' };
    case 'topic': return { color: 'text-purple-600', icon: FileText, bg: 'bg-purple-50/50', border: 'border border-transparent border-l-4 border-l-purple-400' };
    case 'section': return { color: 'text-slate-600', icon: Bookmark, bg: 'bg-slate-50', border: 'border border-transparent border-l-2 border-l-slate-300' };
    default: return { color: 'text-slate-600', icon: FolderTree, bg: 'bg-white', border: 'border-gray-100' };
  }
};

type TreeNodeProps = {
  node: any;
  level?: number;
  onAddClick: (parentId: string, parentType: string, typeName: string, onSuccess: () => void) => void;
  onBulkAddClick: (parentId: string, parentType: string, typeName: string, onSuccess: () => void) => void;
  onEditClick: (nodeId: string, nodeType: string, nodeName: string, nodeAuthor: string | undefined, onSuccess: () => void) => void;
  onDeleteClick: (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => void;
  onSeoClick: (nodeId: string, nodeType: string, nodeData: any, onSuccess: () => void) => void;
  onMoveClick: (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  refreshParent?: () => void;
};

const TreeNode = ({ node, level = 0, onAddClick, onBulkAddClick, onEditClick, onDeleteClick, onSeoClick, onMoveClick, onMoveUp, onMoveDown, refreshParent }: TreeNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (forceReload = false) => {
    const isExpanding = forceReload ? true : !expanded;
    setExpanded(isExpanding);

    if (isExpanding && (children === null || forceReload) && node.type !== 'section') {
      setLoading(true);
      try {
        let fetchedChildren: any[] = [];
        if (node.type === 'board') {
          const res = (await getGuideClassesByBoard(node.id)) as any[];
          fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'class', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
        } else if (node.type === 'class') {
          const res = (await getGuideSubjectsByClass(node.id)) as any[];
          fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'subject', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
        } else if (node.type === 'subject') {
          const res = (await getGuideTextbooksBySubject(node.id)) as any[];
          fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'textbook', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
        } else if (node.type === 'textbook') {
          const res = (await getGuideChaptersByTextbook(node.id)) as any[];
          fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'chapter', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
        } else if (node.type === 'chapter') {
          const res = (await getGuideTopicsByChapter(node.id)) as any[];
          fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'topic', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
        } else if (node.type === 'topic') {
          const res = (await getTopicSections(node.id)) as Record<string, any>;
          fetchedChildren = Object.keys(res).map((key, i) => ({ id: key, name: key, type: 'section', status: 'published', orderIndex: i }));
        }
        
        fetchedChildren.sort((a, b) => a.orderIndex - b.orderIndex);
        setChildren(fetchedChildren);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMoveChild = async (index: number, direction: number) => {
    if (!children) return;
    const newChildren = [...children];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newChildren.length) return;

    const temp = newChildren[index];
    newChildren[index] = newChildren[targetIndex];
    newChildren[targetIndex] = temp;

    newChildren.forEach((child, i) => { child.orderIndex = i; });
    setChildren(newChildren);

    try {
      await updateGuideNodeOrders(newChildren[0].type, newChildren.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {
      console.error("Failed to reorder", e);
    }
  };

  const getChildTypeName = () => {
    if (node.type === 'board') return 'Class';
    if (node.type === 'class') return 'Subject';
    if (node.type === 'subject') return 'Textbook';
    if (node.type === 'textbook') return 'Chapter';
    if (node.type === 'chapter') return 'Topic';
    return '';
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const typeName = getChildTypeName();
    if (!typeName) return;
    onAddClick(node.id, node.type, typeName, () => handleToggle(true));
  };

  const handleBulkAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const typeName = getChildTypeName();
    if (!typeName) return;
    onBulkAddClick(node.id, node.type, typeName, () => handleToggle(true));
  };

  const hasChildren = node.type !== 'section';
  const conf = getLevelConfig(node.type);
  const Icon = conf.icon;

  return (
    <div className={`mt-2 ${level > 0 ? "ml-8" : ""}`}>
      <div className={`group flex items-center justify-between p-3 rounded-lg shadow-sm transition-all ${conf.bg} ${conf.border}`}>
        
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => hasChildren && handleToggle()}>
          <div className={`w-5 flex justify-center ${conf.color}`}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : hasChildren ? (
              expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
            ) : <div className="w-4" />}
          </div>
          <Icon className={`w-5 h-5 ${conf.color}`} />
          <div className="flex flex-col">
            <span className={`font-semibold text-gray-800 ${level === 0 ? 'text-lg' : ''}`}>
              {node.name}
            </span>
            {node.author && (
              <span className="text-xs text-slate-500 italic mt-0.5">Author: {node.author}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          
          {/* Section Edit Link */}
          {node.type === 'topic' || node.type === 'chapter' ? (
            <Link href={`/admin/guide-content/topic/${node.id}`}>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                <Edit2 className="w-3 h-3 mr-1" /> Content
              </Button>
            </Link>
          ) : null}

          {/* Core Actions */}
          {node.type !== 'section' && (
            <>
              {node.type !== 'topic' && (
                <>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-emerald-600 hover:bg-emerald-50" onClick={node.type === 'chapter' ? () => window.location.href = `/admin/guide-content/topic/create?chapterId=${node.id}` : handleAddChild}>
                    <Plus className="w-4 h-4 mr-1" /> {getChildTypeName()}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={handleBulkAddChild} title={`Bulk Add ${getChildTypeName()}s`}>
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); onEditClick(node.id, node.type, node.name, node.author, () => { if (refreshParent) refreshParent(); }); }} title="Rename">
                <Edit2 className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onDeleteClick(node.id, node.type, node.name, () => { if (refreshParent) refreshParent(); }); }} title="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>

              {/* Advanced Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                  {onMoveUp && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveUp(); }}><ArrowUp className="w-4 h-4 mr-2 text-slate-500" /> Move Up</DropdownMenuItem>}
                  {onMoveDown && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveDown(); }}><ArrowDown className="w-4 h-4 mr-2 text-slate-500" /> Move Down</DropdownMenuItem>}
                  <DropdownMenuItem asChild>
                    <Link href={`/guide/${node.slug || node.id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                      <Eye className="w-4 h-4 mr-2 text-emerald-500" /> View in Guide
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSeoClick(node.id, node.type, node, () => { if (refreshParent) refreshParent(); }); }}>
                    <Settings className="w-4 h-4 mr-2 text-amber-500" /> SEO Settings
                  </DropdownMenuItem>
                  {(node.type === 'chapter' || node.type === 'topic') && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveClick(node.id, node.type, node.name, () => { if (refreshParent) refreshParent(); }); }}>
                      <ArrowRightLeft className="w-4 h-4 mr-2 text-indigo-500" /> Move / Convert
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {expanded && children && (
        <div className="relative">
          {children.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-3 ml-8">No items found.</div>
          ) : (
            children.map((child, index) => (
              <TreeNode 
                key={child.id} 
                node={child} 
                level={level + 1} 
                refreshParent={() => handleToggle(true)}
                onAddClick={onAddClick} 
                onBulkAddClick={onBulkAddClick}
                onMoveUp={index > 0 ? () => handleMoveChild(index, -1) : undefined}
                onMoveDown={index < children.length - 1 ? () => handleMoveChild(index, 1) : undefined}
                onSeoClick={onSeoClick}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onMoveClick={onMoveClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export function DesktopExplorer({ className }: { className?: string }) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ boards: 0, classes: 0, subjects: 0, textbooks: 0, chapters: 0, topics: 0 });

  // Dialog States
  const [dialogState, setDialogState] = useState({ isOpen: false, parentId: '', parentType: '', typeName: '', onSuccess: () => {} });
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [saving, setSaving] = useState(false);

  const [bulkAddDialog, setBulkAddDialog] = useState({ isOpen: false, parentId: '', parentType: '', typeName: '', onSuccess: () => {} });
  const [bulkTextInput, setBulkTextInput] = useState('');

  const [editDialog, setEditDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', nodeName: '', authorName: '', onSuccess: () => {} });
  const [editTitleInput, setEditTitleInput] = useState('');
  const [editAuthorInput, setEditAuthorInput] = useState('');
  const [editing, setEditing] = useState(false);

  const [seoDialog, setSeoDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', onSuccess: () => {} });
  const [seoInput, setSeoInput] = useState({ title: '', slug: '', seoTitle: '', description: '', featureImage: '', tags: '', keywords: '' });
  const [savingSeo, setSavingSeo] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', nodeName: '', onSuccess: () => {} });
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const [moveNodeDialog, setMoveNodeDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', nodeName: '', onSuccess: () => {} });
  const [movingNode, setMovingNode] = useState(false);
  const [moveDestinations, setMoveDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  const [migrationDialog, setMigrationDialog] = useState(false);

  const fetchRoot = async () => {
    setLoading(true);
    try {
      const cls = (await getGuideBoards()) as any[];
      setClasses(cls.map((c, i) => ({ id: c.id, name: c.title || c.name || c.id, type: 'board', status: c.status || 'published', author: c.author, orderIndex: c.orderIndex ?? i })));
      getGuideStats().then(setStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoot();
  }, []);

  const handleMoveBoard = async (index: number, direction: number) => {
    const newClasses = [...classes];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newClasses.length) return;
    const temp = newClasses[index];
    newClasses[index] = newClasses[targetIndex];
    newClasses[targetIndex] = temp;
    newClasses.forEach((child, i) => { child.orderIndex = i; });
    setClasses(newClasses);
    try { await updateGuideNodeOrders('board', newClasses.map(c => ({ id: c.id, orderIndex: c.orderIndex }))); } catch (e) { console.error(e); }
  };

  const handleOpenDialog = (parentId: string, parentType: string, typeName: string, onSuccess: () => void) => {
    setTitleInput(''); setAuthorInput(''); setDialogState({ isOpen: true, parentId, parentType, typeName, onSuccess });
  };

  const handleOpenBulkAdd = (parentId: string, parentType: string, typeName: string, onSuccess: () => void) => {
    setBulkTextInput(''); setBulkAddDialog({ isOpen: true, parentId, parentType, typeName, onSuccess });
  };

  const executeAdd = async (items: string[], parentType: string, parentId: string, author?: string) => {
    if (parentType === 'root') for (const item of items) await createGuideBoard(item);
    else if (parentType === 'board') for (const item of items) await createGuideClass(parentId, item);
    else if (parentType === 'class') for (const item of items) await createGuideSubject(parentId, item);
    else if (parentType === 'subject') for (const item of items) await createGuideTextbook(parentId, item, author);
    else if (parentType === 'textbook') for (const item of items) await createGuideChapter(parentId, item, author);
    else if (parentType === 'chapter') for (const item of items) await createGuideTopic(parentId, item, author);
  };

  const handleSaveDialog = async () => {
    if (!titleInput.trim()) return;
    setSaving(true);
    try {
      const items = [titleInput.trim()]; // Single add
      await executeAdd(items, dialogState.parentType, dialogState.parentId, authorInput);
      dialogState.onSuccess();
      setDialogState(prev => ({ ...prev, isOpen: false }));
      toast({ title: "Success", description: "Created successfully!" });
      getGuideStats().then(setStats);
    } catch (e) { toast({ title: "Error", description: "Failed to save", variant: "destructive" }); } finally { setSaving(false); }
  };

  const handleBulkAddSave = async () => {
    if (!bulkTextInput.trim()) return;
    setSaving(true);
    try {
      const items = bulkTextInput.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      await executeAdd(items, bulkAddDialog.parentType, bulkAddDialog.parentId);
      bulkAddDialog.onSuccess();
      setBulkAddDialog(prev => ({ ...prev, isOpen: false }));
      toast({ title: "Success", description: `Created ${items.length} items successfully!` });
      getGuideStats().then(setStats);
    } catch (e) { toast({ title: "Error", description: "Failed to save", variant: "destructive" }); } finally { setSaving(false); }
  };

  const handleOpenSeo = async (nodeId: string, nodeType: string, nodeData: any, onSuccess: () => void) => {
    const freshNode = await getGuideNodeById(nodeId) || nodeData;
    setSeoInput({
      title: freshNode.title || '', slug: freshNode.slug || '', seoTitle: freshNode.seoTitle || '', description: freshNode.description || '',
      featureImage: freshNode.featureImage || '', tags: Array.isArray(freshNode.tags) ? freshNode.tags.join(', ') : (freshNode.tags || ''),
      keywords: Array.isArray(freshNode.keywords) ? freshNode.keywords.join(', ') : (freshNode.keywords || '')
    });
    setSeoDialog({ isOpen: true, nodeId, nodeType, onSuccess });
  };

  const handleSaveSeo = async () => {
    setSavingSeo(true);
    try {
      const success = await updateGuideNodeSEO(seoDialog.nodeType, seoDialog.nodeId, {
        ...seoInput, tags: seoInput.tags.split(',').map(t => t.trim()).filter(Boolean), keywords: seoInput.keywords.split(',').map(k => k.trim()).filter(Boolean)
      });
      if (success) { toast({ title: "Success", description: "SEO metadata saved." }); setSeoDialog(prev => ({ ...prev, isOpen: false })); seoDialog.onSuccess(); }
    } catch (e) { toast({ title: "Error", description: "An error occurred.", variant: "destructive" }); } finally { setSavingSeo(false); }
  };

  const handleOpenEdit = (nodeId: string, nodeType: string, nodeName: string, nodeAuthor: string | undefined, onSuccess: () => void) => {
    setEditTitleInput(nodeName); setEditAuthorInput(nodeAuthor || '');
    setEditDialog({ isOpen: true, nodeId, nodeType, nodeName, authorName: nodeAuthor || '', onSuccess });
  };

  const handleSaveEdit = async () => {
    if (!editTitleInput.trim()) return;
    setEditing(true);
    try {
      await updateGuideNodeTitle(editDialog.nodeId, editDialog.nodeType, editTitleInput, editAuthorInput);
      if (editDialog.nodeType === 'board') fetchRoot();
      editDialog.onSuccess(); setEditDialog(prev => ({ ...prev, isOpen: false })); toast({ title: "Success", description: "Changes saved!" });
    } catch (e) { toast({ title: "Error", description: "Failed to edit item", variant: "destructive" }); } finally { setEditing(false); }
  };

  const handleDeleteClick = (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => {
    setDeleteDialog({ isOpen: true, nodeId, nodeType, nodeName, onSuccess }); setDeleteConfirmInput('');
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const { nodeId, nodeType } = deleteDialog;
      if (nodeType === 'board') await deleteGuideBoard(nodeId);
      else if (nodeType === 'class') await deleteGuideClass(nodeId);
      else if (nodeType === 'subject') await deleteGuideSubject(nodeId);
      else if (nodeType === 'textbook') await deleteGuideTextbook(nodeId);
      else if (nodeType === 'chapter') await deleteGuideChapter(nodeId);
      else if (nodeType === 'topic') await deleteGuideTopic(nodeId);

      if (nodeType === 'board') fetchRoot();
      deleteDialog.onSuccess(); setDeleteDialog(prev => ({ ...prev, isOpen: false })); toast({ title: "Success", description: "Deleted!" });
      getGuideStats().then(setStats);
    } catch (e) { toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" }); } finally { setDeleting(false); }
  };

  const handleMoveNodeClick = async (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => {
    setMoveNodeDialog({ isOpen: true, nodeId, nodeType, nodeName, onSuccess }); setSelectedDestination('');
    try {
      const textbooks = await getGuideTextbooks(); const chapters = await getGuideAllChapters();
      setMoveDestinations([
        ...textbooks.map((t: any) => ({ id: t.id, name: t.title, type: 'textbook', label: `Textbook: ${t.title}` })),
        ...chapters.map((c: any) => ({ id: c.id, name: c.title, type: 'chapter', label: `Chapter: ${c.title}` }))
      ].filter(d => d.id !== nodeId));
    } catch (e) { toast({ title: "Error", description: "Failed to load destinations", variant: "destructive" }); }
  };

  const handleMoveNodeSubmit = async () => {
    if (!selectedDestination) return;
    setMovingNode(true);
    try {
      const dest = moveDestinations.find(d => d.id === selectedDestination);
      const res = await moveGuideNode(moveNodeDialog.nodeId, moveNodeDialog.nodeType as any, dest.id, dest.type as any);
      if (res.success) { toast({ title: "Success", description: res.message }); moveNodeDialog.onSuccess(); fetchRoot(); setMoveNodeDialog({ ...moveNodeDialog, isOpen: false }); }
      else { toast({ title: "Move failed", description: res.message, variant: "destructive" }); }
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); } finally { setMovingNode(false); }
  };

  const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`space-y-6 max-w-7xl mx-auto p-4 md:p-6 ${className || ''}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-[#107c41]" />
            Guide Content Explorer
          </h1>
          <p className="text-sm text-slate-500 mt-1">Navigate and manage the entire 7-level curriculum tree.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-gray-200" onClick={() => handleOpenDialog('root', 'root', 'Board', fetchRoot)}>
            <Plus className="w-4 h-4 mr-2" /> Add Board
          </Button>
          <Button variant="outline" className="border-gray-200" onClick={() => handleOpenBulkAdd('root', 'root', 'Board', fetchRoot)}>
            <AlignLeft className="w-4 h-4 mr-2" /> Bulk Add Boards
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Tree Section */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Search Boards..." 
              className="pl-10 h-12 bg-white border-gray-200 rounded-xl shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="p-8 text-center text-gray-500 animate-pulse">Loading Tree...</div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-white rounded-lg border border-dashed border-gray-300">No boards found. Add some to get started!</div>
            ) : (
              filteredClasses.map((c, index) => (
                <TreeNode 
                  key={c.id} 
                  node={c} 
                  refreshParent={fetchRoot} 
                  onMoveUp={index > 0 ? () => handleMoveBoard(index, -1) : undefined} 
                  onMoveDown={index < filteredClasses.length - 1 ? () => handleMoveBoard(index, 1) : undefined} 
                  onAddClick={handleOpenDialog} 
                  onBulkAddClick={handleOpenBulkAdd}
                  onEditClick={handleOpenEdit} 
                  onDeleteClick={handleDeleteClick} 
                  onSeoClick={handleOpenSeo} 
                  onMoveClick={handleMoveNodeClick} 
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar Section */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm sticky top-6">
            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                7-Level Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="text-xs text-slate-600 space-y-3 font-medium">
                <li className="flex flex-col gap-1 border-l-2 border-emerald-400 pl-3">
                  <span className="flex items-center gap-2 text-emerald-700"><FolderTree className="w-3 h-3" /> Board</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. CBSE, ICSE, WBBSE</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-indigo-400 pl-3 ml-2">
                  <span className="flex items-center gap-2 text-indigo-700"><GraduationCap className="w-3 h-3" /> Class</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. Class 10, Class 12</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-amber-400 pl-3 ml-4">
                  <span className="flex items-center gap-2 text-amber-700"><Library className="w-3 h-3" /> Subject</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. Mathematics, Science</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-rose-400 pl-3 ml-6">
                  <span className="flex items-center gap-2 text-rose-700"><BookOpen className="w-3 h-3" /> Textbook</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. NCERT Math Vol 1</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-sky-400 pl-3 ml-8">
                  <span className="flex items-center gap-2 text-sky-700"><Layers className="w-3 h-3" /> Chapter</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. Algebra, Trigonometry</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-purple-400 pl-3 ml-10">
                  <span className="flex items-center gap-2 text-purple-700"><FileText className="w-3 h-3" /> Topic</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. Quadratic Equations</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-slate-300 pl-3 ml-12">
                  <span className="flex items-center gap-2 text-slate-700"><Bookmark className="w-3 h-3" /> Content Section</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. MCQ, Video, PDF Notes</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Database Counts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><FolderTree className="w-3 h-3 text-emerald-500" /> Boards</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{stats.boards}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><GraduationCap className="w-3 h-3 text-indigo-500" /> Classes</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{stats.classes}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><Library className="w-3 h-3 text-amber-500" /> Subjects</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{stats.subjects}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><BookOpen className="w-3 h-3 text-rose-500" /> Textbooks</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{stats.textbooks}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><Layers className="w-3 h-3 text-sky-500" /> Chapters</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{stats.chapters}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><FileText className="w-3 h-3 text-purple-500" /> Topics</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{stats.topics}</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogState.isOpen} onOpenChange={(open) => !open && setDialogState(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Add New {dialogState.typeName}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder={`Enter ${dialogState.typeName} title`} autoFocus />
            {['Textbook', 'Chapter', 'Topic'].includes(dialogState.typeName) && <Input value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} placeholder="Author (Optional)" />}
          </div>
          <DialogFooter><Button onClick={handleSaveDialog} disabled={saving || !titleInput.trim()}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={bulkAddDialog.isOpen} onOpenChange={(open) => !open && setBulkAddDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Add {bulkAddDialog.typeName}s</DialogTitle>
            <DialogDescription>Paste multiple names separated by commas or new lines.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea value={bulkTextInput} onChange={(e) => setBulkTextInput(e.target.value)} placeholder="Maths\nScience\nEnglish" className="min-h-[150px]" autoFocus />
          </div>
          <DialogFooter><Button onClick={handleBulkAddSave} disabled={saving || !bulkTextInput.trim()}>Bulk Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Rename</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Input value={editTitleInput} onChange={(e) => setEditTitleInput(e.target.value)} placeholder="New title" autoFocus />
            {['textbook', 'chapter', 'topic'].includes(editDialog.nodeType) && <Input value={editAuthorInput} onChange={(e) => setEditAuthorInput(e.target.value)} placeholder="Author" />}
          </div>
          <DialogFooter><Button onClick={handleSaveEdit} disabled={editing || !editTitleInput.trim()}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Delete {deleteDialog.nodeName}</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
            <Label className="text-sm">Type <strong className="text-red-500">{deleteDialog.nodeName}</strong> to confirm.</Label>
            <Input value={deleteConfirmInput} onChange={(e) => setDeleteConfirmInput(e.target.value)} />
          </div>
          <DialogFooter><Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting || deleteConfirmInput !== deleteDialog.nodeName}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SEO Dialog */}
      <Dialog open={seoDialog.isOpen} onOpenChange={(open) => !open && setSeoDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>SEO Settings</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2"><Label>Slug</Label><Input value={seoInput.slug} onChange={e => setSeoInput({...seoInput, slug: e.target.value})} /></div>
            <div className="space-y-2"><Label>SEO Title</Label><Input value={seoInput.seoTitle} onChange={e => setSeoInput({...seoInput, seoTitle: e.target.value})} /></div>
            <div className="space-y-2"><Label>Meta Description</Label><Textarea value={seoInput.description} onChange={e => setSeoInput({...seoInput, description: e.target.value})} /></div>
            <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={seoInput.tags} onChange={e => setSeoInput({...seoInput, tags: e.target.value})} /></div>
            <div className="space-y-2"><Label>Keywords (comma-separated)</Label><Input value={seoInput.keywords} onChange={e => setSeoInput({...seoInput, keywords: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveSeo} disabled={savingSeo}>Save SEO Data</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Node Dialog */}
      <Dialog open={moveNodeDialog.isOpen} onOpenChange={(open) => !open && setMoveNodeDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Move / Convert Item</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Select value={selectedDestination} onValueChange={setSelectedDestination}>
              <SelectTrigger><SelectValue placeholder="Search or select new destination..." /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {moveDestinations.map(d => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter><Button onClick={handleMoveNodeSubmit} disabled={movingNode || !selectedDestination}>Confirm Move</Button></DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
