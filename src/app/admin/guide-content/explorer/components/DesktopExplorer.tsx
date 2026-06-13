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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  FolderTree, ChevronRight, ChevronDown, GraduationCap, Library, BookOpen, Layers, FileText,
  Plus, MoreVertical, Edit2, Loader2, Trash2, ArrowUp, ArrowDown, Settings, Eye, ArrowRightLeft, 
  Search, AlignLeft, BarChart3, Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { 
  getTaxonomyNodesByTrack, getTaxonomyNodesByType, getTaxonomyNodesByParent,
  createTaxonomyNode, updateTaxonomyNode, deleteTaxonomyNode, getTaxonomyNodeById,
  updateTaxonomyNodeOrders, generateSlug, NodeType
} from '@/lib/firebase/taxonomy';
import { getTopicSections } from '@/lib/firebase/guide'; // Keeps old content fetching for topic internals

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
  onAddClick: (parentId: string, typeName: NodeType, onSuccess: () => void) => void;
  onBulkAddClick: (parentId: string, typeName: NodeType, onSuccess: () => void) => void;
  onEditClick: (nodeId: string, nodeName: string, nodeAuthor: string | undefined, onSuccess: () => void) => void;
  onDeleteClick: (nodeId: string, nodeName: string, onSuccess: () => void) => void;
  onSeoClick: (nodeId: string, nodeData: any, onSuccess: () => void) => void;
  onMoveClick: (nodeId: string, nodeName: string, onSuccess: () => void) => void;
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
        if (node.type === 'topic') {
          // Sections are stored inside topics, keep using old method
          const res = (await getTopicSections(node.id)) as Record<string, any>;
          fetchedChildren = Object.keys(res).map((key, i) => ({ id: key, title: key, type: 'section', status: 'published', orderIndex: i }));
        } else {
          // Fetch children dynamically using universal taxonomy parentId mapping
          fetchedChildren = await getTaxonomyNodesByParent(node.id);
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
      await updateTaxonomyNodeOrders(newChildren.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {
      console.error("Failed to reorder", e);
    }
  };

  const getChildTypeName = (): NodeType | '' => {
    if (node.type === 'board') return 'class';
    if (node.type === 'class') return 'subject';
    if (node.type === 'subject') return 'textbook';
    if (node.type === 'textbook') return 'chapter';
    if (node.type === 'chapter') return 'topic';
    return '';
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const typeName = getChildTypeName();
    if (!typeName) return;
    onAddClick(node.id, typeName, () => handleToggle(true));
  };

  const handleBulkAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const typeName = getChildTypeName();
    if (!typeName) return;
    onBulkAddClick(node.id, typeName, () => handleToggle(true));
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
              {node.title || node.name}
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
              
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); onEditClick(node.id, node.title || node.name, node.author, () => { if (refreshParent) refreshParent(); }); }} title="Rename">
                <Edit2 className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onDeleteClick(node.id, node.title || node.name, () => { if (refreshParent) refreshParent(); }); }} title="Delete">
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
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSeoClick(node.id, node, () => { if (refreshParent) refreshParent(); }); }}>
                    <Settings className="w-4 h-4 mr-2 text-amber-500" /> SEO Settings
                  </DropdownMenuItem>
                  {(node.type === 'chapter' || node.type === 'topic') && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveClick(node.id, node.title || node.name, () => { if (refreshParent) refreshParent(); }); }}>
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
  const [dialogState, setDialogState] = useState({ isOpen: false, parentId: '', typeName: '' as NodeType, onSuccess: () => {} });
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [saving, setSaving] = useState(false);

  const [bulkAddDialog, setBulkAddDialog] = useState({ isOpen: false, parentId: '', typeName: '' as NodeType, onSuccess: () => {} });
  const [bulkTextInput, setBulkTextInput] = useState('');

  const [editDialog, setEditDialog] = useState({ isOpen: false, nodeId: '', nodeName: '', authorName: '', onSuccess: () => {} });
  const [editTitleInput, setEditTitleInput] = useState('');
  const [editAuthorInput, setEditAuthorInput] = useState('');
  const [editing, setEditing] = useState(false);

  const [seoDialog, setSeoDialog] = useState({ isOpen: false, nodeId: '', onSuccess: () => {} });
  const [seoInput, setSeoInput] = useState({ title: '', slug: '', seoTitle: '', description: '', featureImage: '', tags: '', keywords: '' });
  const [savingSeo, setSavingSeo] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, nodeId: '', nodeName: '', onSuccess: () => {} });
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const [moveNodeDialog, setMoveNodeDialog] = useState({ isOpen: false, nodeId: '', nodeName: '', onSuccess: () => {} });
  const [movingNode, setMovingNode] = useState(false);
  const [moveDestinations, setMoveDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  const fetchRootAndStats = async () => {
    setLoading(true);
    try {
      const allNodes = await getTaxonomyNodesByTrack('academic');
      
      const boards = allNodes.filter(n => n.type === 'board');
      setClasses(boards);

      setStats({
        boards: boards.length,
        classes: allNodes.filter(n => n.type === 'class').length,
        subjects: allNodes.filter(n => n.type === 'subject').length,
        textbooks: allNodes.filter(n => n.type === 'textbook').length,
        chapters: allNodes.filter(n => n.type === 'chapter').length,
        topics: allNodes.filter(n => n.type === 'topic').length,
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRootAndStats();
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
    try { await updateTaxonomyNodeOrders(newClasses.map(c => ({ id: c.id, orderIndex: c.orderIndex }))); } catch (e) { console.error(e); }
  };

  const handleOpenDialog = (parentId: string, typeName: NodeType, onSuccess: () => void) => {
    setTitleInput(''); setAuthorInput(''); setDialogState({ isOpen: true, parentId, typeName, onSuccess });
  };

  const handleOpenBulkAdd = (parentId: string, typeName: NodeType, onSuccess: () => void) => {
    setBulkTextInput(''); setBulkAddDialog({ isOpen: true, parentId, typeName, onSuccess });
  };

  const handleSaveDialog = async () => {
    if (!titleInput.trim()) return;
    setSaving(true);
    try {
      await createTaxonomyNode({
        title: titleInput.trim(),
        slug: generateSlug(titleInput.trim()),
        type: dialogState.typeName,
        track: 'academic',
        parentId: dialogState.parentId || null,
        author: authorInput,
        status: 'published'
      });
      dialogState.onSuccess();
      setDialogState(prev => ({ ...prev, isOpen: false }));
      toast({ title: "Success", description: "Created successfully!" });
      fetchRootAndStats();
    } catch (e) { toast({ title: "Error", description: "Failed to save", variant: "destructive" }); } finally { setSaving(false); }
  };

  const handleBulkAddSave = async () => {
    if (!bulkTextInput.trim()) return;
    setSaving(true);
    try {
      const items = bulkTextInput.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      for (const item of items) {
        await createTaxonomyNode({
          title: item,
          slug: generateSlug(item),
          type: bulkAddDialog.typeName,
          track: 'academic',
          parentId: bulkAddDialog.parentId || null,
          status: 'published'
        });
      }
      bulkAddDialog.onSuccess();
      setBulkAddDialog(prev => ({ ...prev, isOpen: false }));
      toast({ title: "Success", description: `Created ${items.length} items successfully!` });
      fetchRootAndStats();
    } catch (e) { toast({ title: "Error", description: "Failed to save", variant: "destructive" }); } finally { setSaving(false); }
  };

  const handleOpenSeo = async (nodeId: string, nodeData: any, onSuccess: () => void) => {
    const freshNode = await getTaxonomyNodeById(nodeId) || nodeData;
    setSeoInput({
      title: freshNode.title || '', slug: freshNode.slug || '', seoTitle: freshNode.seoTitle || '', description: freshNode.description || '',
      featureImage: freshNode.featureImage || '', tags: Array.isArray(freshNode.tags) ? freshNode.tags.join(', ') : (freshNode.tags || ''),
      keywords: Array.isArray(freshNode.keywords) ? freshNode.keywords.join(', ') : (freshNode.keywords || '')
    });
    setSeoDialog({ isOpen: true, nodeId, onSuccess });
  };

  const handleSaveSeo = async () => {
    setSavingSeo(true);
    try {
      await updateTaxonomyNode(seoDialog.nodeId, {
        ...seoInput, tags: seoInput.tags.split(',').map(t => t.trim()).filter(Boolean), keywords: seoInput.keywords.split(',').map(k => k.trim()).filter(Boolean)
      });
      toast({ title: "Success", description: "SEO metadata saved." }); setSeoDialog(prev => ({ ...prev, isOpen: false })); seoDialog.onSuccess(); 
    } catch (e) { toast({ title: "Error", description: "An error occurred.", variant: "destructive" }); } finally { setSavingSeo(false); }
  };

  const handleOpenEdit = (nodeId: string, nodeName: string, nodeAuthor: string | undefined, onSuccess: () => void) => {
    setEditTitleInput(nodeName); setEditAuthorInput(nodeAuthor || '');
    setEditDialog({ isOpen: true, nodeId, nodeName, authorName: nodeAuthor || '', onSuccess });
  };

  const handleSaveEdit = async () => {
    if (!editTitleInput.trim()) return;
    setEditing(true);
    try {
      await updateTaxonomyNode(editDialog.nodeId, {
        title: editTitleInput,
        author: editAuthorInput
      });
      editDialog.onSuccess(); setEditDialog(prev => ({ ...prev, isOpen: false })); toast({ title: "Success", description: "Changes saved!" });
    } catch (e) { toast({ title: "Error", description: "Failed to edit item", variant: "destructive" }); } finally { setEditing(false); }
  };

  const handleDeleteClick = (nodeId: string, nodeName: string, onSuccess: () => void) => {
    setDeleteDialog({ isOpen: true, nodeId, nodeName, onSuccess }); setDeleteConfirmInput('');
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTaxonomyNode(deleteDialog.nodeId);
      deleteDialog.onSuccess(); setDeleteDialog(prev => ({ ...prev, isOpen: false })); toast({ title: "Success", description: "Deleted!" });
      fetchRootAndStats();
    } catch (e) { toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" }); } finally { setDeleting(false); }
  };

  const handleMoveNodeClick = async (nodeId: string, nodeName: string, onSuccess: () => void) => {
    setMoveNodeDialog({ isOpen: true, nodeId, nodeName, onSuccess }); setSelectedDestination('');
    try {
      const textbooks = await getTaxonomyNodesByType('academic', 'textbook'); 
      const chapters = await getTaxonomyNodesByType('academic', 'chapter');
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
      await updateTaxonomyNode(moveNodeDialog.nodeId, { parentId: selectedDestination });
      toast({ title: "Success", description: "Successfully moved!" }); 
      moveNodeDialog.onSuccess(); fetchRootAndStats(); setMoveNodeDialog(prev => ({ ...prev, isOpen: false })); 
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); } finally { setMovingNode(false); }
  };

  const filteredClasses = classes.filter(c => (c.title || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`space-y-6 max-w-7xl mx-auto p-4 md:p-6 ${className || ''}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-[#107c41]" />
            Guide Content (Universal API)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Navigate and manage the entire 7-level academic tree.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-gray-200" onClick={() => handleOpenDialog('', 'board', fetchRootAndStats)}>
            <Plus className="w-4 h-4 mr-2" /> Add Board
          </Button>
          <Button variant="outline" className="border-gray-200" onClick={() => handleOpenBulkAdd('', 'board', fetchRootAndStats)}>
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
                  refreshParent={fetchRootAndStats} 
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
            {['textbook', 'chapter', 'topic'].includes(dialogState.typeName) && <Input value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} placeholder="Author (Optional)" />}
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
            <Input value={editAuthorInput} onChange={(e) => setEditAuthorInput(e.target.value)} placeholder="Author" />
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
