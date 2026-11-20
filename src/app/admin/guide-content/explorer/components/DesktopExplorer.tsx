'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  Search, AlignLeft, BarChart3, Bookmark, LayoutGrid, List, GripVertical, MoveRight
} from 'lucide-react';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  getTaxonomyNodesByTrack, getTaxonomyNodesByType, getTaxonomyNodesByParent,
  createTaxonomyNode, updateTaxonomyNode, deleteTaxonomyNode, getTaxonomyNodeById,
  updateTaxonomyNodeOrders, generateSlug, NodeType
} from '@/lib/firebase/taxonomy';
import { getTopicSections } from '@/lib/firebase/guide'; // Keeps old content fetching for topic internals

const getLevelConfig = (type: string) => {
  switch (type) {
    case 'board': return { color: 'text-emerald-700 dark:text-emerald-400', icon: FolderTree, bg: 'bg-gradient-to-r from-emerald-50/80 to-white dark:from-emerald-900/20 dark:to-slate-900', border: 'border border-emerald-100/80 dark:border-emerald-800/50 hover:border-emerald-300 hover:shadow-md' };
    case 'class': return { color: 'text-indigo-600 dark:text-indigo-400', icon: GraduationCap, bg: 'bg-gradient-to-r from-indigo-50/80 to-white dark:from-indigo-900/20 dark:to-slate-900', border: 'border border-indigo-100/80 dark:border-indigo-800/50 hover:border-indigo-300 hover:shadow-md' };
    case 'subject': return { color: 'text-amber-600 dark:text-amber-400', icon: Library, bg: 'bg-gradient-to-r from-amber-50/80 to-white dark:from-amber-900/20 dark:to-slate-900', border: 'border border-amber-100/80 dark:border-amber-800/50 hover:border-amber-300 hover:shadow-md' };
    case 'textbook': return { color: 'text-rose-600 dark:text-rose-400', icon: BookOpen, bg: 'bg-gradient-to-r from-rose-50/80 to-white dark:from-rose-900/20 dark:to-slate-900', border: 'border border-rose-100/80 dark:border-rose-800/50 hover:border-rose-300 hover:shadow-md' };
    case 'chapter': return { color: 'text-sky-600 dark:text-sky-400', icon: Layers, bg: 'bg-gradient-to-r from-sky-50/80 to-white dark:from-sky-900/20 dark:to-slate-900', border: 'border border-sky-100/80 dark:border-sky-800/50 hover:border-sky-300 hover:shadow-md' };
    case 'topic': return { color: 'text-purple-600 dark:text-purple-400', icon: FileText, bg: 'bg-gradient-to-r from-purple-50/80 to-white dark:from-purple-900/20 dark:to-slate-900', border: 'border border-purple-100/80 dark:border-purple-800/50 hover:border-purple-300 hover:shadow-md' };
    case 'section': return { color: 'text-slate-600 dark:text-slate-400', icon: Bookmark, bg: 'bg-slate-50 dark:bg-slate-800', border: 'border border-slate-200 dark:border-slate-700 hover:shadow-sm' };
    default: return { color: 'text-slate-600', icon: FolderTree, bg: 'bg-white', border: 'border-gray-100' };
  }
};

const generateAcronym = (text: string) => {
  if (!text) return '';
  if (text.length <= 5 && text === text.toUpperCase()) return text; // already an acronym like WBBSE
  const ignoreWords = ['of', 'and', 'for', 'the', 'in', 'on', 'at', '&', 'state', 'board', 'council'];
  const words = text.split(/[\s-]+/).filter(w => !ignoreWords.includes(w.toLowerCase()));
  if (words.length <= 1) return text;
  return words.map(w => w.charAt(0).toUpperCase()).join('');
};

type TreeNodeProps = {
  node: any;
  level?: number;
  onAddClick: (parentId: string, typeName: NodeType, onSuccess: () => void) => void;
  onBulkAddClick: (parentId: string, typeName: NodeType, onSuccess: () => void) => void;
  onEditClick: (nodeId: string, nodeName: string, nodeAuthor: string | undefined, onSuccess: () => void) => void;
  onDeleteClick: (nodeId: string, nodeName: string, onSuccess: () => void) => void;
  onSeoClick: (nodeId: string, nodeData: any, onSuccess: () => void) => void;
  onMoveClick: (node: any, onSuccess: () => void) => void;
  onBulkMigrateClick?: (nodeId: string, nodeType: NodeType, onSuccess: () => void) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  refreshParent?: () => void;
  dragListeners?: any;
  dragAttributes?: any;
  onExpand?: (isExpanding: boolean) => void;
};

const SortableTreeNode = (props: TreeNodeProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.node.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}>
      <TreeNode {...props} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
};

const TreeNode = ({ node, level = 0, onAddClick, onBulkAddClick, onEditClick, onDeleteClick, onSeoClick, onMoveClick, onBulkMigrateClick, onMoveUp, onMoveDown, refreshParent, dragListeners, dragAttributes, onExpand }: TreeNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  useEffect(() => {
    if (children && activeChildId && !children.find(c => c.id === activeChildId)) {
      setActiveChildId(null);
    }
  }, [children, activeChildId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && children) {
      const oldIndex = children.findIndex((c) => c.id === active.id);
      const newIndex = children.findIndex((c) => c.id === over?.id);
      
      const newChildren = arrayMove(children, oldIndex, newIndex);
      newChildren.forEach((child, i) => { child.orderIndex = i; });
      setChildren(newChildren);
      try {
        await updateTaxonomyNodeOrders(newChildren.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
      } catch (e) {
        console.error("Failed to reorder", e);
      }
    }
  };

  const handleToggle = async (forceReload = false) => {
    const isExpanding = forceReload ? true : !expanded;
    setExpanded(isExpanding);
    if (onExpand && !forceReload) {
      onExpand(isExpanding);
    }
    if (!isExpanding) {
      setActiveChildId(null);
    }

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

  const displayName = node.title || node.name || '';
  const isAcronymLike = displayName.length <= 6 && displayName === displayName.toUpperCase();
  const displayAcronym = node.acronym || (level === 0 && !isAcronymLike ? generateAcronym(displayName) : '');
  const finalMainName = (level === 0 && displayAcronym) ? displayAcronym : displayName;
  const finalSubName = (level === 0 && displayAcronym && displayAcronym !== displayName) ? displayName : '';

  return (
    <div className={`mt-2`}>
      <div className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${conf.bg} ${conf.border} ${level === 0 ? 'shadow-sm mb-4 border-slate-200 dark:border-slate-700 hover:scale-[1.01]' : 'mb-2 hover:scale-[1.01]'}`}>
        
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => hasChildren && handleToggle()}>
          
          {dragListeners && (
            <div {...dragListeners} {...dragAttributes} className="cursor-grab p-1.5 -ml-2 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors" onClick={(e) => e.stopPropagation()}>
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          
          <div className={`w-7 flex justify-center items-center ${conf.color} bg-white dark:bg-slate-800 rounded-full h-7 shadow-sm border border-slate-100 dark:border-slate-700 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : hasChildren ? (
              <ChevronRight className="w-4 h-4" />
            ) : <div className="w-3.5" />}
          </div>
          <div className={`p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm backdrop-blur-sm`}>
            <Icon className={`w-4 h-4 ${conf.color}`} />
          </div>
          
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-slate-800 dark:text-slate-100 ${level === 0 ? 'text-lg tracking-tight' : 'text-sm'}`}>
                {finalMainName}
              </span>
              {finalSubName && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 truncate max-w-[200px] md:max-w-[400px]" title={finalSubName}>
                  {finalSubName}
                </span>
              )}
              {level > 0 && node.acronym && !finalSubName && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {node.acronym}
                </span>
              )}
            </div>
            {node.author && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Author: {node.author}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {getChildTypeName() && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={handleAddChild} title={`Add ${getChildTypeName()}`}>
              <Plus className="w-4 h-4" />
            </Button>
          )}

          {(node.type === 'chapter' || node.type === 'topic') && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:bg-purple-50" title="Manage Content">
              <Link href={`/admin/guide-content/topic/${node.id}`} onClick={(e) => e.stopPropagation()}>
                <FileText className="w-4 h-4" />
              </Link>
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); onEditClick(node.id, node.title || node.name, node.author, () => { if (refreshParent) refreshParent(); }); }} title="Rename">
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
            <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
              {onMoveUp && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveUp(); }}><ArrowUp className="w-4 h-4 mr-2 text-slate-500" /> Move Up</DropdownMenuItem>}
              {onMoveDown && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveDown(); }}><ArrowDown className="w-4 h-4 mr-2 text-slate-500" /> Move Down</DropdownMenuItem>}
              <DropdownMenuItem asChild>
                <Link href={`/guide/${node.fullSlug || node.id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                  <Eye className="w-4 h-4 mr-2 text-emerald-500" /> View in Guide
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSeoClick(node.id, node, () => { if (refreshParent) refreshParent(); }); }}>
                <Settings className="w-4 h-4 mr-2 text-amber-500" /> SEO Settings
              </DropdownMenuItem>
              {(node.type === 'chapter' || node.type === 'topic') && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveClick(node, () => { if (refreshParent) refreshParent(); }); }}>
                  <ArrowRightLeft className="w-4 h-4 mr-2 text-indigo-500" /> Move / Convert Node
                </DropdownMenuItem>
              )}
              {(node.type === 'textbook' || node.type === 'chapter') && onBulkMigrateClick && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onBulkMigrateClick(node.id, node.type as NodeType, () => { if (refreshParent) refreshParent(); }); }}>
                  <MoveRight className="w-4 h-4 mr-2 text-purple-500" /> Bulk Move Items
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded && children && (
        <div className="relative mt-2 mb-4">
          {/* Tree Guide Line */}
          <div className="absolute left-6 top-0 bottom-4 w-[2px] bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700" />
          
          <div className="pl-12">
            {children.length === 0 ? (
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500 italic py-4">No items found.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={children.filter(c => activeChildId ? c.id === activeChildId : true).map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {children
                    .filter(c => activeChildId ? c.id === activeChildId : true)
                    .map((child, index) => {
                      const isSortable = child.type === 'chapter' || child.type === 'topic';
                    const NodeComponent = isSortable ? SortableTreeNode : TreeNode;
                    
                    return (
                      <NodeComponent 
                        key={child.id} 
                        node={child} 
                        level={level + 1} 
                        refreshParent={() => handleToggle(true)}
                        onAddClick={onAddClick} 
                        onBulkAddClick={onBulkAddClick}
                        onMoveUp={!isSortable && index > 0 ? () => handleMoveChild(index, -1) : undefined}
                        onMoveDown={!isSortable && index < children.length - 1 ? () => handleMoveChild(index, 1) : undefined}
                        onSeoClick={onSeoClick}
                        onEditClick={onEditClick}
                        onDeleteClick={onDeleteClick}
                        onMoveClick={onMoveClick}
                        onBulkMigrateClick={onBulkMigrateClick}
                        onExpand={(isExpanding) => setActiveChildId(isExpanding ? child.id : null)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            )}
          </div>
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [stats, setStats] = useState({ boards: 0, classes: 0, subjects: 0, textbooks: 0, chapters: 0, topics: 0 });
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Dialog States
  const [dialogState, setDialogState] = useState({ isOpen: false, parentId: '', typeName: '' as NodeType, onSuccess: () => {} });
  const [addMode, setAddMode] = useState<'select' | 'create'>('select');
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingOptions, setExistingOptions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

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

  // Bulk Migrate Dialog State
  const [bulkMigrateDialog, setBulkMigrateDialog] = useState({ isOpen: false, parentId: '', parentType: '' as NodeType, onSuccess: () => {} });
  const [bulkMigrateItems, setBulkMigrateItems] = useState<any[]>([]);
  const [selectedBulkItems, setSelectedBulkItems] = useState<string[]>([]);
  const [bulkMigrateDestinations, setBulkMigrateDestinations] = useState<any[]>([]);
  const [selectedBulkDestination, setSelectedBulkDestination] = useState<string>('');
  const [migratingBulkItems, setMigratingBulkItems] = useState(false);

  useEffect(() => {
    if (classes.length > 0 && activeBoardId && !classes.find(c => c.id === activeBoardId)) {
      setActiveBoardId(null);
    }
  }, [classes, activeBoardId]);

  const [activeParentIds, setActiveParentIds] = useState<Set<string>>(new Set());

  const fetchRootAndStats = async () => {
    setLoading(true);
    try {
      const allNodes = await getTaxonomyNodesByTrack('academic');
      
      const boards = allNodes.filter(n => n.type === 'board');
      setClasses(boards);
      
      const parents = new Set(allNodes.map(n => n.parentId).filter(Boolean) as string[]);
      setActiveParentIds(parents);

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

  const handleOpenDialog = async (parentId: string, typeName: NodeType, onSuccess: () => void) => {
    setTitleInput(''); setAuthorInput(''); setDialogState({ isOpen: true, parentId, typeName, onSuccess });
    setLoadingOptions(true);
    setExistingOptions([]);
    setAddMode('select');
    try {
      // Fetching by track and filtering locally avoids potential missing composite index errors in Firestore
      const allNodes = await getTaxonomyNodesByTrack('academic');
      const filtered = allNodes.filter((n: any) => n.type === typeName);
      const uniqueTitles = Array.from(new Set(filtered.map((n: any) => n.title).filter(Boolean))) as string[];
      uniqueTitles.sort();
      setExistingOptions(uniqueTitles);
      if (uniqueTitles.length === 0) {
        setAddMode('create');
      } else {
        setAddMode('select');
      }
    } catch(e) {
      console.error("Failed to load options");
      setAddMode('create');
    } finally {
      setLoadingOptions(false);
    }
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

  const handleMoveNodeClick = async (node: any, onSuccess: () => void) => {
    setMoveNodeDialog({ isOpen: true, nodeId: node.id, nodeName: node.title || node.name, onSuccess }); 
    setSelectedDestination('');
    try {
      let dests: any[] = [];
      if (node.type === 'chapter') {
        if (node.parentId) {
           const siblings = await getTaxonomyNodesByParent(node.parentId);
           dests = siblings.map(c => ({ id: c.id, name: c.title, type: 'chapter', label: `Chapter: ${c.title}` }));
        }
      } else if (node.type === 'topic') {
        if (node.parentId) {
           const parentChapter = await getTaxonomyNodeById(node.parentId);
           if (parentChapter?.parentId) {
              const textbookId = parentChapter.parentId;
              const textbook = await getTaxonomyNodeById(textbookId);
              const chapters = await getTaxonomyNodesByParent(textbookId);
              
              if (textbook) {
                 dests.push({ id: textbook.id, name: textbook.title, type: 'textbook', label: `Textbook: ${textbook.title} (Convert to Chapter)` });
              }
              dests.push(...chapters.map(c => ({ id: c.id, name: c.title, type: 'chapter', label: `Chapter: ${c.title}` })));
           }
        }
      }
      setMoveDestinations(dests.filter(d => d.id !== node.id));
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

  const handleBulkMigrateClick = async (nodeId: string, nodeType: NodeType, onSuccess: () => void) => {
    setLoading(true);
    try {
      const items = await getTaxonomyNodesByParent(nodeId);
      setBulkMigrateItems(items.sort((a, b) => a.orderIndex - b.orderIndex));
      setSelectedBulkItems([]);
      setSelectedBulkDestination('');

      const nodeInfo = await getTaxonomyNodeById(nodeId);
      let dests: any[] = [];
      
      if (nodeType === 'textbook') {
         // moving chapters -> destinations are other textbooks
         dests = await getTaxonomyNodesByType('academic', 'textbook');
      } else if (nodeType === 'chapter') {
         // moving topics -> destinations are other chapters in the SAME textbook
         if (nodeInfo?.parentId) {
           dests = await getTaxonomyNodesByParent(nodeInfo.parentId); 
         }
      }

      setBulkMigrateDestinations(dests.map(d => ({ id: d.id, label: d.title || d.name })));
      setBulkMigrateDialog({ isOpen: true, parentId: nodeId, parentType: nodeType, onSuccess });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error loading data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBulkMigrate = async () => {
    if (!selectedBulkDestination || selectedBulkItems.length === 0) return;
    setMigratingBulkItems(true);
    try {
      const promises = selectedBulkItems.map(itemId => 
        updateTaxonomyNode(itemId, { parentId: selectedBulkDestination })
      );
      await Promise.all(promises);
      toast({ title: 'Success', description: `Successfully migrated ${selectedBulkItems.length} items.` });
      setBulkMigrateDialog(prev => ({ ...prev, isOpen: false }));
      bulkMigrateDialog.onSuccess();
      fetchRootAndStats();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error migrating', description: e.message, variant: 'destructive' });
    } finally {
      setMigratingBulkItems(false);
    }
  };

  const [hideEmpty, setHideEmpty] = useState(false);

  const filteredClasses = classes.filter(c => {
    const matchesSearch = (c.title || c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isNotEmpty = activeParentIds.has(c.id);
    if (hideEmpty && !isNotEmpty) return false;
    return matchesSearch;
  });

  return (
    <div className={`space-y-6 max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 ${className || ''}`}>
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#107c41] via-emerald-600 to-teal-700 p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-500/30 mb-8">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner border border-white/10">
                <FolderTree className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              Universal Taxonomy Explorer
            </h1>
            <p className="text-emerald-100/90 mt-2 text-[14px] md:text-[15px] font-medium max-w-2xl leading-relaxed">
              Navigate and manage the entire 7-level academic tree architecture (Boards, Classes, Subjects, Textbooks, Chapters, Topics, Sections).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-sm rounded-xl h-11 px-5 transition-transform active:scale-95" onClick={() => handleOpenDialog('', 'board', fetchRootAndStats)}>
              <Plus className="w-4 h-4 mr-2" /> Add Board
            </Button>
            <Button variant="outline" className="text-white border-white/30 bg-black/10 hover:bg-black/20 hover:text-white font-bold backdrop-blur-sm rounded-xl h-11 px-5 transition-transform active:scale-95" onClick={() => handleOpenBulkAdd('', 'board', fetchRootAndStats)}>
              <AlignLeft className="w-4 h-4 mr-2" /> Bulk Add
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Tree Section */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col gap-4 mt-6 pb-20">
            <div className="flex flex-col lg:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                <Input 
                  placeholder="Search Boards or Nodes..." 
                  className="pl-12 h-12 bg-white dark:bg-slate-900 border-0 rounded-xl shadow-sm text-[15px] font-medium w-full focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-4 h-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setHideEmpty(!hideEmpty)}>
                  <Checkbox checked={hideEmpty} onCheckedChange={(c) => setHideEmpty(!!c)} className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                  <Label className="text-[14px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Hide Empty</Label>
                </div>
                <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1.5 h-12 items-center gap-1">
                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('grid')}
                    className={`h-9 w-9 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('list')}
                    className={`h-9 w-9 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className={viewMode === 'grid' ? `grid grid-cols-1 ${activeBoardId ? '' : 'md:grid-cols-2'} gap-4 items-start` : "space-y-2"}>
              {loading ? (
                <div className="p-8 text-center text-gray-500 animate-pulse col-span-full">Loading Tree...</div>
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-white rounded-lg border border-dashed border-gray-300 col-span-full">No boards found. Add some to get started!</div>
              ) : (
                filteredClasses
                  .filter(c => activeBoardId ? c.id === activeBoardId : true)
                  .map((c, index) => (
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
                    onExpand={(isExpanding) => setActiveBoardId(isExpanding ? c.id : null)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Section */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-md rounded-2xl overflow-hidden bg-white dark:bg-slate-900 sticky top-6">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-5">
              <CardTitle className="text-[15px] font-bold flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <FolderTree className="w-4 h-4" />
                </div>
                7-Level Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <ul className="text-[13px] text-slate-600 dark:text-slate-300 space-y-4 font-semibold">
                <li className="flex flex-col gap-1 border-l-2 border-emerald-400 pl-4">
                  <span className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400"><FolderTree className="w-3.5 h-3.5" /> Board</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">e.g. CBSE, ICSE, WBBSE</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-indigo-400 pl-4 ml-3">
                  <span className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400"><GraduationCap className="w-3.5 h-3.5" /> Class</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">e.g. Class 10, Class 12</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-amber-400 pl-4 ml-6">
                  <span className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400"><Library className="w-3.5 h-3.5" /> Subject</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">e.g. Mathematics, Science</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-rose-400 pl-4 ml-9">
                  <span className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400"><BookOpen className="w-3.5 h-3.5" /> Textbook</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">e.g. NCERT Math Vol 1</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-sky-400 pl-4 ml-12">
                  <span className="flex items-center gap-2.5 text-sky-700 dark:text-sky-400"><Layers className="w-3.5 h-3.5" /> Chapter</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">e.g. Algebra, Trigonometry</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-purple-400 pl-4 ml-14">
                  <span className="flex items-center gap-2.5 text-purple-700 dark:text-purple-400"><FileText className="w-3.5 h-3.5" /> Topic</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">e.g. Quadratic Equations</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-slate-300 dark:border-slate-600 pl-4 ml-16">
                  <span className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300"><Bookmark className="w-3.5 h-3.5" /> Content Section</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">e.g. MCQ, Video, PDF Notes</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-md rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-5">
              <CardTitle className="text-[15px] font-bold flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </div>
                Database Counts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <ul className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 space-y-3">
                <li className="flex items-center justify-between"><div className="flex items-center gap-2.5"><FolderTree className="w-4 h-4 text-emerald-500" /> Boards</div> <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{stats.boards}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2.5"><GraduationCap className="w-4 h-4 text-indigo-500" /> Classes</div> <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{stats.classes}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Library className="w-4 h-4 text-amber-500" /> Subjects</div> <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{stats.subjects}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2.5"><BookOpen className="w-4 h-4 text-rose-500" /> Textbooks</div> <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{stats.textbooks}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Layers className="w-4 h-4 text-sky-500" /> Chapters</div> <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{stats.chapters}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2.5"><FileText className="w-4 h-4 text-purple-500" /> Topics</div> <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{stats.topics}</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogState.isOpen} onOpenChange={(open) => !open && setDialogState(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Add {dialogState.typeName ? dialogState.typeName.charAt(0).toUpperCase() + dialogState.typeName.slice(1) : 'Item'}
            </DialogTitle>
            <DialogDescription>
              Choose from existing predefined {dialogState.typeName}s or create a custom new one.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher: Option A vs Option B */}
          <div className="flex border rounded-lg p-1 bg-slate-50 gap-1 mt-1">
            <button
              type="button"
              onClick={() => setAddMode('select')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                addMode === 'select'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Option A: Select Existing ({existingOptions.length})
            </button>
            <button
              type="button"
              onClick={() => setAddMode('create')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                addMode === 'create'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Option B: Create New
            </button>
          </div>

          <div className="py-3 space-y-4">
            {addMode === 'select' ? (
              <div className="space-y-3">
                <Label className="text-xs font-medium text-slate-700">Select Existing {dialogState.typeName}</Label>
                {loadingOptions ? (
                  <div className="p-4 text-xs text-center text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    Loading available {dialogState.typeName}s...
                  </div>
                ) : existingOptions.length === 0 ? (
                  <div className="p-4 text-center rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    No existing {dialogState.typeName}s found. Please switch to <strong>Option B</strong> to create a new one.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select value={titleInput} onValueChange={(val) => setTitleInput(val)}>
                      <SelectTrigger className="w-full h-10 bg-white">
                        <SelectValue placeholder={`-- Choose an existing ${dialogState.typeName} --`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[260px]">
                        {existingOptions.map((opt, i) => (
                          <SelectItem key={i} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="mt-2">
                      <Label className="text-[11px] text-slate-400">Quick suggestions / tags:</Label>
                      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto mt-1 p-1 bg-slate-50 rounded-lg border border-slate-100">
                        {existingOptions.map((opt, i) => (
                          <span
                            key={i}
                            onClick={() => setTitleInput(opt)}
                            className={`text-xs px-2.5 py-1 rounded-md cursor-pointer border transition-all ${
                              titleInput === opt
                                ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                                : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200'
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-slate-700">New {dialogState.typeName} Title</Label>
                  <Input
                    className="mt-1"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder={`Enter new custom ${dialogState.typeName} title`}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {['textbook', 'chapter', 'topic'].includes(dialogState.typeName) && (
              <div>
                <Label className="text-xs font-medium text-slate-700">Author (Optional)</Label>
                <Input
                  className="mt-1"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  placeholder="Author name"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogState(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSaveDialog}
              disabled={saving || !titleInput.trim()}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {addMode === 'select' ? `Attach ${dialogState.typeName || 'Item'}` : `Create & Attach`}
            </Button>
          </DialogFooter>
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

      {/* Bulk Migrate Dialog */}
      <Dialog open={bulkMigrateDialog.isOpen} onOpenChange={(open) => !open && setBulkMigrateDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Move Items</DialogTitle>
            <DialogDescription>
              Select items to move, and pick a new destination within this tree.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-3">
              <Label>Target Destination</Label>
              <Select value={selectedBulkDestination} onValueChange={setSelectedBulkDestination}>
                <SelectTrigger><SelectValue placeholder="Select destination..." /></SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {bulkMigrateDestinations.map(b => <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label>Select Items to Move</Label>
              <div className="max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-2">
                {bulkMigrateItems.map(item => {
                  return (
                    <div key={item.id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md">
                      <Checkbox 
                        id={`blk-${item.id}`} 
                        checked={selectedBulkItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedBulkItems(prev => [...prev, item.id]);
                          else setSelectedBulkItems(prev => prev.filter(id => id !== item.id));
                        }}
                      />
                      <label htmlFor={`blk-${item.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                        {item.title || item.name}
                      </label>
                    </div>
                  );
                })}
                {bulkMigrateItems.length === 0 && (
                  <div className="text-sm text-slate-500 text-center py-4">No items available to move.</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkMigrateDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button 
              className="bg-[#107c41] hover:bg-[#0b5c30] text-white" 
              onClick={handleExecuteBulkMigrate} 
              disabled={migratingBulkItems || !selectedBulkDestination || selectedBulkItems.length === 0}
            >
              {migratingBulkItems ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Move {selectedBulkItems.length} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
