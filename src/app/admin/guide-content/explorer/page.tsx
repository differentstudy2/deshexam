'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  FolderTree, ChevronRight, ChevronDown, GraduationCap, Library, BookOpen, Layers, FileText,
  Plus, MoreVertical, Edit2, Loader2, Trash2, ArrowUp, ArrowDown, Settings, Eye
} from 'lucide-react';
import Link from 'next/link';
import { 
  getGuideBoards, getGuideClassesByBoard, getGuideClasses, getGuideSubjectsByClass, getGuideTextbooksBySubject, getGuideChaptersByTextbook, getGuideTopicsByChapter, getTopicSections, 
  createGuideBoard, createGuideClass, createGuideSubject, createGuideTextbook, createGuideChapter, createGuideTopic,
  deleteGuideBoard, deleteGuideClass, deleteGuideSubject, deleteGuideTextbook, deleteGuideChapter, deleteGuideTopic,
  updateGuideNodeTitle, migrateOldTextbooksToGuide, updateGuideNodeOrders, updateGuideNodeSEO, getGuideNodeById
} from '@/lib/firebase/guide';
import { db } from '@/lib/firebase/client';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';

const getIcon = (type: string) => {
  switch (type) {
    case 'board': return <FolderTree className="w-4 h-4 text-emerald-600" />;
    case 'class': return <GraduationCap className="w-4 h-4 text-blue-500" />;
    case 'subject': return <Library className="w-4 h-4 text-indigo-500" />;
    case 'textbook': return <BookOpen className="w-4 h-4 text-purple-500" />;
    case 'chapter': return <Layers className="w-4 h-4 text-amber-500" />;
    case 'topic': return <FileText className="w-4 h-4 text-emerald-500" />;
    case 'section': return <FileText className="w-4 h-4 text-slate-500" />;
    default: return <FolderTree className="w-4 h-4 text-slate-500" />;
  }
};

type TreeNodeProps = {
  node: any;
  level?: number;
  onAddClick: (parentId: string, parentType: string, typeName: string, onSuccess: () => void) => void;
  onEditClick: (nodeId: string, nodeType: string, nodeName: string, nodeAuthor: string | undefined, onSuccess: () => void) => void;
  onDeleteClick: (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => void;
  onSeoClick: (nodeId: string, nodeType: string, nodeData: any, onSuccess: () => void) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  refreshParent?: () => void;
};

const TreeNode = ({ node, level = 0, onAddClick, onEditClick, onDeleteClick, onSeoClick, onMoveUp, onMoveDown, refreshParent }: TreeNodeProps) => {
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
        
        // Ensure sorted initially
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

    // Swap
    const temp = newChildren[index];
    newChildren[index] = newChildren[targetIndex];
    newChildren[targetIndex] = temp;

    // Update orderIndex
    newChildren.forEach((child, i) => {
      child.orderIndex = i;
    });

    setChildren(newChildren);

    try {
      await updateGuideNodeOrders(newChildren[0].type, newChildren.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
      // toast could be called here but since it's just visually updated it should be fine
    } catch (e) {
      console.error("Failed to reorder", e);
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    let typeName = '';
    if (node.type === 'board') typeName = 'Class';
    else if (node.type === 'class') typeName = 'Subject';
    else if (node.type === 'subject') typeName = 'Textbook';
    else if (node.type === 'textbook') typeName = 'Chapter';
    else if (node.type === 'chapter') typeName = 'Topic';
    else return;

    onAddClick(node.id, node.type, typeName, () => {
      // Force refresh of this node's children
      handleToggle(true);
    });
  };

  const handleDeleteChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(node.id, node.type, node.name, () => {
      // The parent will handle the refresh, or if root, the whole page refreshes
      if (refreshParent) refreshParent();
    });
  };

  const hasChildren = node.type !== 'section';

  return (
    <div className="space-y-1">
      <div className="select-none">
        <div 
          className={`flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer ${level === 0 ? 'bg-slate-50 dark:bg-slate-800/20 font-medium' : ''}`}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          <div className="flex items-center gap-2" onClick={() => hasChildren && handleToggle()}>
            <div className="w-5 flex justify-center text-slate-400">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : hasChildren ? (
                expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : <div className="w-4" />}
            </div>
            {getIcon(node.type)}
            <div className="flex flex-col">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {node.name}
              </span>
              {node.author && (
                <span className="text-xs text-slate-500 italic mt-0.5">Author: {node.author}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {node.type === 'topic' || node.type === 'chapter' ? (
              <Link href={`/admin/guide-content/topic/${node.id}`}>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 mr-1">
                  <Edit2 className="w-3 h-3 mr-1" /> Edit Content
                </Button>
              </Link>
            ) : null}
            {node.type !== 'section' && node.type !== 'topic' ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-slate-500"
                onClick={node.type === 'chapter' ? () => window.location.href = `/admin/guide-content/topic/create?chapterId=${node.id}` : handleAddChild}
              >
                <Plus className="w-3 h-3 mr-1" /> Add {
                  node.type === 'board' ? 'Class' :
                  node.type === 'class' ? 'Subject' : 
                  node.type === 'subject' ? 'Textbook' : 
                  node.type === 'textbook' ? 'Chapter' : 'Topic'
                }
              </Button>
            ) : null}
            {node.type !== 'section' && (
              <div className="flex items-center gap-1">
                {onMoveUp && node.type !== 'section' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                )}
                {onMoveDown && node.type !== 'section' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                )}
                <Link href={`/guide/${node.slug || node.id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                    title="View in Guide"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-amber-400 hover:text-amber-600 hover:bg-amber-50"
                  onClick={(e) => { e.stopPropagation(); onSeoClick(node.id, node.type, node, () => {
                    if (refreshParent) refreshParent();
                  }); }}
                  title="SEO Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                  onClick={(e) => { e.stopPropagation(); onEditClick(node.id, node.type, node.name, node.author, () => {
                    if (refreshParent) refreshParent();
                  }); }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={handleDeleteChild}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {expanded && children && (
          <div className="mt-1 relative before:absolute before:left-[18px] before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
            {children.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2" style={{ paddingLeft: `${(level + 1) * 24 + 8}px` }}>No items found.</div>
            ) : (
              children.map((child, index) => (
                <TreeNode 
                  key={child.id} 
                  node={child} 
                  level={level + 1} 
                  refreshParent={() => handleToggle(true)}
                  onAddClick={onAddClick} 
                  onMoveUp={index > 0 ? () => handleMoveChild(index, -1) : undefined}
                  onMoveDown={index < children.length - 1 ? () => handleMoveChild(index, 1) : undefined}
                  onSeoClick={onSeoClick}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ContentExplorer() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Dialog State
  const [dialogState, setDialogState] = useState({ isOpen: false, parentId: '', parentType: '', typeName: '', onSuccess: () => {} });
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit Dialog State
  const [editDialog, setEditDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', nodeName: '', authorName: '', onSuccess: () => {} });
  const [editTitleInput, setEditTitleInput] = useState('');
  const [editAuthorInput, setEditAuthorInput] = useState('');
  const [editing, setEditing] = useState(false);

  // SEO Dialog State
  const [seoDialog, setSeoDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', onSuccess: () => {} });
  const [seoInput, setSeoInput] = useState({ title: '', slug: '', seoTitle: '', description: '', featureImage: '', tags: '', keywords: '' });
  const [savingSeo, setSavingSeo] = useState(false);

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', nodeName: '', onSuccess: () => {} });
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  // Bulk Move Dialog State
  const [bulkMoveDialog, setBulkMoveDialog] = useState(false);
  const [allClassesForMove, setAllClassesForMove] = useState<any[]>([]);
  const [allBoardsForMove, setAllBoardsForMove] = useState<any[]>([]);
  const [selectedClassesForMove, setSelectedClassesForMove] = useState<string[]>([]);
  const [targetBoardForMove, setTargetBoardForMove] = useState<string>('');
  const [movingClasses, setMovingClasses] = useState(false);

  // Migration State
  const [migrationDialog, setMigrationDialog] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [oldTextbooksList, setOldTextbooksList] = useState<any[]>([]);
  const [selectedTextbookId, setSelectedTextbookId] = useState<string>('all');
  const [selectedFilterBoard, setSelectedFilterBoard] = useState<string>('all');
  const [selectedFilterClass, setSelectedFilterClass] = useState<string>('all');

  const uniqueOldBoards = Array.from(new Set(oldTextbooksList.map(t => t.board)));
  const uniqueOldClasses = Array.from(new Set(oldTextbooksList.filter(t => selectedFilterBoard === 'all' || t.board === selectedFilterBoard).map(t => t.class)));

  const handleOpenMigration = async () => {
    setMigrationDialog(true);
    if (oldTextbooksList.length === 0) {
      try {
        const snap = await getDocs(query(collection(db, 'textbooks')));
        setOldTextbooksList(snap.docs.map(d => ({ 
          id: d.id, 
          title: d.data().title || 'Untitled',
          board: d.data().board || 'Default Board',
          class: d.data().class || 'Default Class'
        })));
      } catch (e) {
        console.error("Failed to load old textbooks", e);
      }
    }
  };

  const startMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus('Starting migration...');
    const success = await migrateOldTextbooksToGuide((msg) => setMigrationStatus(msg), selectedFilterBoard, selectedFilterClass, selectedTextbookId);
    if (success) {
      toast({ title: "Migration Complete", description: "Successfully migrated textbooks!" });
      fetchRoot();
      setMigrationDialog(false);
    } else {
      toast({ title: "Migration Failed", description: "Check console for errors.", variant: "destructive" });
    }
    setIsMigrating(false);
  };

  const fetchRoot = async () => {
    setLoading(true);
    try {
      const cls = (await getGuideBoards()) as any[];
      setClasses(cls.map((c, i) => ({ id: c.id, name: c.title || c.name || c.id, type: 'board', status: c.status || 'published', author: c.author, orderIndex: c.orderIndex ?? i })));
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

    // Swap
    const temp = newClasses[index];
    newClasses[index] = newClasses[targetIndex];
    newClasses[targetIndex] = temp;

    // Update orderIndex
    newClasses.forEach((child, i) => {
      child.orderIndex = i;
    });

    setClasses(newClasses);

    try {
      await updateGuideNodeOrders('board', newClasses.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {
      console.error("Failed to reorder boards", e);
    }
  };

  const handleOpenDialog = (parentId: string, parentType: string, typeName: string, onSuccess: () => void) => {
    setTitleInput('');
    setAuthorInput('');
    setDialogState({ isOpen: true, parentId, parentType, typeName, onSuccess });
  };

  const handleSaveDialog = async () => {
    if (!titleInput.trim()) return;
    setSaving(true);
    try {
      const items = titleInput.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      if (dialogState.parentType === 'root') {
        for (const item of items) await createGuideBoard(item);
      } else if (dialogState.parentType === 'board') {
        for (const item of items) await createGuideClass(dialogState.parentId, item);
      } else if (dialogState.parentType === 'class') {
        for (const item of items) await createGuideSubject(dialogState.parentId, item);
      } else if (dialogState.parentType === 'subject') {
        for (const item of items) await createGuideTextbook(dialogState.parentId, item, authorInput);
      } else if (dialogState.parentType === 'textbook') {
        for (const item of items) await createGuideChapter(dialogState.parentId, item, authorInput);
      } else if (dialogState.parentType === 'chapter') {
        for (const item of items) await createGuideTopic(dialogState.parentId, item, authorInput);
      }

      dialogState.onSuccess();
      setDialogState(prev => ({ ...prev, isOpen: false }));
      toast({ title: "Success", description: "Created successfully!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSeo = async (nodeId: string, nodeType: string, nodeData: any, onSuccess: () => void) => {
    // We fetch fresh data from the db so the dialog doesn't show stale/empty data for previously updated children
    const freshNode = await getGuideNodeById(nodeId) || nodeData;

    setSeoInput({
      title: freshNode.title || '',
      slug: freshNode.slug || '',
      seoTitle: freshNode.seoTitle || '',
      description: freshNode.description || '',
      featureImage: freshNode.featureImage || '',
      tags: Array.isArray(freshNode.tags) ? freshNode.tags.join(', ') : (freshNode.tags || ''),
      keywords: Array.isArray(freshNode.keywords) ? freshNode.keywords.join(', ') : (freshNode.keywords || '')
    });
    setSeoDialog({ isOpen: true, nodeId, nodeType, onSuccess });
  };

  const handleSaveSeo = async () => {
    setSavingSeo(true);
    try {
      const parsedTags = seoInput.tags.split(',').map(t => t.trim()).filter(Boolean);
      const parsedKeywords = seoInput.keywords.split(',').map(k => k.trim()).filter(Boolean);
      
      const success = await updateGuideNodeSEO(seoDialog.nodeType, seoDialog.nodeId, {
        ...seoInput,
        tags: parsedTags,
        keywords: parsedKeywords
      });

      if (success) {
        toast({ title: "Success", description: "SEO metadata saved successfully." });
        setSeoDialog(prev => ({ ...prev, isOpen: false }));
        seoDialog.onSuccess();
      } else {
        toast({ title: "Error", description: "Failed to save SEO metadata.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "An error occurred while saving.", variant: "destructive" });
    } finally {
      setSavingSeo(false);
    }
  };

  const handleOpenEdit = (nodeId: string, nodeType: string, nodeName: string, nodeAuthor: string | undefined, onSuccess: () => void) => {
    setEditTitleInput(nodeName);
    setEditAuthorInput(nodeAuthor || '');
    setEditDialog({ isOpen: true, nodeId, nodeType, nodeName, authorName: nodeAuthor || '', onSuccess });
  };

  const handleSaveEdit = async () => {
    if (!editTitleInput.trim()) return;
    setEditing(true);
    try {
      await updateGuideNodeTitle(editDialog.nodeId, editDialog.nodeType, editTitleInput, editAuthorInput);
      if (editDialog.nodeType === 'class') fetchRoot();
      editDialog.onSuccess();
      setEditDialog(prev => ({ ...prev, isOpen: false }));
      toast({ title: "Success", description: "Changes saved successfully!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to edit item", variant: "destructive" });
    } finally {
      setEditing(false);
    }
  };

  const handleOpenDelete = (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => {
    setDeleteConfirmInput('');
    setDeleteDialog({ isOpen: true, nodeId, nodeType, nodeName, onSuccess });
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

      // If we deleted a root-level board, we need to refresh root
      if (nodeType === 'board') {
        fetchRoot();
      }

      deleteDialog.onSuccess();
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
      toast({ title: "Success", description: "Deleted successfully!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to delete item. It may have child items still associated.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleMigrateClasses = async () => {
    setLoading(true);
    try {
      const boardsSnap = await getDocs(query(collection(db, 'guide_boards')));
      let boardId = '';
      if (boardsSnap.empty) {
        boardId = await createGuideBoard('National Curriculum');
      } else {
        boardId = boardsSnap.docs[0].id;
      }

      const classesSnap = await getDocs(query(collection(db, 'guide_classes')));
      let migrated = 0;
      for (const cls of classesSnap.docs) {
        if (!cls.data().boardId) {
          await setDoc(doc(db, 'guide_classes', cls.id), { boardId }, { merge: true });
          migrated++;
        }
      }
      
      toast({ title: "Migration Complete", description: `Migrated ${migrated} classes to the board.` });
      fetchRoot();
    } catch (e) {
      console.error(e);
      toast({ title: "Migration Failed", description: "See console for details.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBulkMove = async () => {
    setBulkMoveDialog(true);
    try {
      const [boards, classes] = await Promise.all([getGuideBoards(), getGuideClasses()]);
      setAllBoardsForMove(boards);
      setAllClassesForMove(classes);
      setSelectedClassesForMove([]);
      setTargetBoardForMove('');
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load data for bulk move', variant: 'destructive' });
    }
  };

  const handleExecuteBulkMove = async () => {
    if (!targetBoardForMove || selectedClassesForMove.length === 0) return;
    setMovingClasses(true);
    try {
      for (const classId of selectedClassesForMove) {
        await setDoc(doc(db, 'guide_classes', classId), { boardId: targetBoardForMove }, { merge: true });
      }
      toast({ title: 'Success', description: `Moved ${selectedClassesForMove.length} classes to the new board.` });
      setBulkMoveDialog(false);
      fetchRoot();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to move classes.', variant: 'destructive' });
    } finally {
      setMovingClasses(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-[#107c41]" />
            Content Explorer
          </h1>
          <p className="text-sm text-slate-500 mt-1">Navigate and manage the entire curriculum tree.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleOpenMigration} className="border-indigo-500 text-indigo-600 hover:bg-indigo-50">
            Migrate Old Textbooks
          </Button>
          <Button variant="outline" onClick={handleOpenBulkMove} className="border-blue-500 text-blue-600 hover:bg-blue-50">
            Bulk Move Classes
          </Button>
          <Button variant="outline" onClick={handleMigrateClasses} className="border-orange-500 text-orange-600 hover:bg-orange-50 hidden">
            Migrate Old Classes
          </Button>
          <Button variant="outline" onClick={() => handleOpenDialog('root', 'root', 'Board', fetchRoot)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Board
          </Button>
          <Button className="bg-[#107c41] hover:bg-[#0b5c30]" onClick={fetchRoot}>
            Refresh Tree
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 min-h-[400px]">
        <CardContent className="p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No boards found. Add some to get started!</div>
            ) : (
              classes.map((c, index) => <TreeNode key={c.id} node={c} refreshParent={fetchRoot} onMoveUp={index > 0 ? () => handleMoveBoard(index, -1) : undefined} onMoveDown={index < classes.length - 1 ? () => handleMoveBoard(index, 1) : undefined} onAddClick={handleOpenDialog} onEditClick={handleOpenEdit} onDeleteClick={handleOpenDelete} onSeoClick={handleOpenSeo} />)
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEO Dialog */}
      <Dialog open={seoDialog.isOpen} onOpenChange={(open) => !open && setSeoDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>SEO Settings</DialogTitle>
            <DialogDescription>
              Manage SEO metadata for this {seoDialog.nodeType}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input 
                value={seoInput.slug}
                onChange={e => setSeoInput({...seoInput, slug: e.target.value})}
                placeholder="e.g., class-10-maths"
              />
              <p className="text-xs text-slate-500">Leave empty to auto-generate from title.</p>
            </div>
            <div className="space-y-2">
              <Label>SEO Title</Label>
              <Input 
                value={seoInput.seoTitle}
                onChange={e => setSeoInput({...seoInput, seoTitle: e.target.value})}
                placeholder="Meta title"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea 
                value={seoInput.description}
                onChange={e => setSeoInput({...seoInput, description: e.target.value})}
                placeholder="Brief description for search engines"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Feature Image URL</Label>
              <Input 
                value={seoInput.featureImage}
                onChange={e => setSeoInput({...seoInput, featureImage: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input 
                value={seoInput.tags}
                onChange={e => setSeoInput({...seoInput, tags: e.target.value})}
                placeholder="math, algebra, class 10"
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords (comma-separated)</Label>
              <Input 
                value={seoInput.keywords}
                onChange={e => setSeoInput({...seoInput, keywords: e.target.value})}
                placeholder="math textbook, cbse math"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeoDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button onClick={handleSaveSeo} disabled={savingSeo} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {savingSeo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save SEO Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Node Dialog */}
      <Dialog open={dialogState.isOpen} onOpenChange={(open) => !open && setDialogState(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New {dialogState.typeName}</DialogTitle>
            <DialogDescription>
              Enter the title for the new {dialogState.typeName.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea 
              value={titleInput}
              onChange={(e) => {
                setTitleInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder={`Enter ${dialogState.typeName.toLowerCase()} title(s)...\nSeparate multiple items by comma or new line.`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveDialog();
                }
              }}
              className="min-h-[60px] max-h-[300px] overflow-y-auto"
              autoFocus
            />
            {['Textbook', 'Chapter', 'Topic'].includes(dialogState.typeName) && (
              <Input
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                placeholder="Author (Optional)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveDialog();
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogState(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button className="bg-[#107c41] hover:bg-[#0b5c30]" onClick={handleSaveDialog} disabled={saving || !titleInput.trim()}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Node Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog.nodeType.charAt(0).toUpperCase() + deleteDialog.nodeType.slice(1)}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.nodeName}</strong>? This action cannot be undone. 
              {deleteDialog.nodeType !== 'topic' && ' ALL child items (and their content) will be permanently deleted.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <Label className="text-sm text-slate-600 dark:text-slate-400">
              Type <strong className="text-slate-900 dark:text-slate-100">{deleteDialog.nodeName}</strong> to confirm.
            </Label>
            <Input 
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="Type name here..."
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting || deleteConfirmInput !== deleteDialog.nodeName}>
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Title</DialogTitle>
            <DialogDescription>
              Rename this {editDialog.nodeType}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input 
              value={editTitleInput}
              onChange={(e) => setEditTitleInput(e.target.value)}
              placeholder={`Enter new title...`}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              autoFocus
            />
            {['textbook', 'chapter', 'topic'].includes(editDialog.nodeType) && (
              <Input
                value={editAuthorInput}
                onChange={(e) => setEditAuthorInput(e.target.value)}
                placeholder="Author (Optional)"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveEdit} disabled={editing || !editTitleInput.trim()}>
              {editing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Move Dialog */}
      <Dialog open={bulkMoveDialog} onOpenChange={(open) => !open && setBulkMoveDialog(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Move Classes</DialogTitle>
            <DialogDescription>
              Select multiple classes and move them to a different board.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-3">
              <Label>Target Board</Label>
              <Select value={targetBoardForMove} onValueChange={setTargetBoardForMove}>
                <SelectTrigger><SelectValue placeholder="Select destination board" /></SelectTrigger>
                <SelectContent>
                  {allBoardsForMove.map(b => <SelectItem key={b.id} value={b.id}>{b.title || b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label>Select Classes to Move</Label>
              <div className="max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-2">
                {allClassesForMove.map(cls => {
                  const currentBoard = allBoardsForMove.find(b => b.id === cls.boardId)?.title || 'Unknown Board';
                  return (
                    <div key={cls.id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md">
                      <Checkbox 
                        id={`cls-${cls.id}`} 
                        checked={selectedClassesForMove.includes(cls.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedClassesForMove(prev => [...prev, cls.id]);
                          else setSelectedClassesForMove(prev => prev.filter(id => id !== cls.id));
                        }}
                      />
                      <div className="flex flex-col cursor-pointer" onClick={() => {
                        const checked = !selectedClassesForMove.includes(cls.id);
                        if (checked) setSelectedClassesForMove(prev => [...prev, cls.id]);
                        else setSelectedClassesForMove(prev => prev.filter(id => id !== cls.id));
                      }}>
                        <label className="text-sm font-medium leading-none cursor-pointer">{cls.title || cls.name}</label>
                        <span className="text-xs text-slate-500 mt-1">Current Board: {currentBoard}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkMoveDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#107c41] hover:bg-[#0b5c30] text-white" 
              onClick={handleExecuteBulkMove} 
              disabled={movingClasses || !targetBoardForMove || selectedClassesForMove.length === 0}
            >
              {movingClasses ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Move {selectedClassesForMove.length} Classes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Migration Dialog */}
      <Dialog open={migrationDialog} onOpenChange={(open) => !isMigrating && setMigrationDialog(open)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Migrate Old Textbooks</DialogTitle>
            <DialogDescription>
              This will automatically fetch your old textbooks, chapters, and topics and import them into the new Guide Content tree. It will automatically match or create the required Boards, Classes, and Subjects based on the old data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {isMigrating ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-slate-700 animate-pulse text-center">
                  {migrationStatus}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Filter by Board</Label>
                  <Select value={selectedFilterBoard} onValueChange={setSelectedFilterBoard}>
                    <SelectTrigger><SelectValue placeholder="All Boards" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Boards</SelectItem>
                      {uniqueOldBoards.map(b => <SelectItem key={b as string} value={b as string}>{b as string}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filter by Class</Label>
                  <Select value={selectedFilterClass} onValueChange={setSelectedFilterClass}>
                    <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {uniqueOldClasses.map(c => <SelectItem key={c as string} value={c as string}>{c as string}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Textbook to Migrate</Label>
                  <Select value={selectedTextbookId} onValueChange={setSelectedTextbookId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Textbooks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Textbooks</SelectItem>
                      {oldTextbooksList
                        .filter(tb => (selectedFilterBoard === 'all' || tb.board === selectedFilterBoard) && (selectedFilterClass === 'all' || tb.class === selectedFilterClass))
                        .map(tb => (
                        <SelectItem key={tb.id} value={tb.id}>{tb.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm">
                  <strong>Note:</strong> Depending on the size of your textbook library, this process may take a minute or two. Do not close this window while the migration is in progress.
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMigrationDialog(false)} disabled={isMigrating}>
              Cancel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={startMigration} 
              disabled={isMigrating}
            >
              Start Migration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
