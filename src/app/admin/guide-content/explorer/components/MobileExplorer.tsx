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
  Plus, MoreVertical, Edit2, Loader2, Trash2, ArrowUp, ArrowDown, Settings, Eye, ArrowRightLeft, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { 
  getGuideBoards, getGuideClassesByBoard, getGuideClasses, getGuideSubjectsByClass, getGuideTextbooksBySubject, getGuideChaptersByTextbook, getGuideTopicsByChapter, getTopicSections, 
  createGuideBoard, createGuideClass, createGuideSubject, createGuideTextbook, createGuideChapter, createGuideTopic,
  deleteGuideBoard, deleteGuideClass, deleteGuideSubject, deleteGuideTextbook, deleteGuideChapter, deleteGuideTopic,
  updateGuideNodeTitle, migrateOldTextbooksToGuide, updateGuideNodeOrders, updateGuideNodeSEO, getGuideNodeById,
  moveGuideNode, getGuideAllChapters, getGuideTextbooks
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

export function MobileExplorer({ className }: { className?: string }) {
  
  const { toast } = useToast();
  const [navigationStack, setNavigationStack] = useState<any[]>([{ id: 'root', name: 'Boards', type: 'root' }]);
  const [nodes, setNodes] = useState<any[]>([]);
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

  // Move Node Dialog State
  const [moveNodeDialog, setMoveNodeDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', nodeName: '', onSuccess: () => {} });
  const [movingNode, setMovingNode] = useState(false);
  const [moveDestinations, setMoveDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('');

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
    const success = await migrateOldTextbooksToGuide((msg: string) => setMigrationStatus(msg), selectedFilterBoard, selectedFilterClass, selectedTextbookId);
    if (success) {
      toast({ title: "Migration Complete", description: "Successfully migrated textbooks!" });
      fetchRoot();
      setMigrationDialog(false);
    } else {
      toast({ title: "Migration Failed", description: "Check console for errors.", variant: "destructive" });
    }
    setIsMigrating(false);
  };

  const activeLevel = navigationStack[navigationStack.length - 1];

  const fetchRoot = async () => {
    setLoading(true);
    try {
      let fetched: any[] = [];
      const node = navigationStack[navigationStack.length - 1];
      if (node.type === 'root') {
        const cls = (await getGuideBoards()) as any[];
        fetched = cls.map((c, i) => ({ id: c.id, name: c.title || c.name || c.id, type: 'board', status: c.status || 'published', author: c.author, orderIndex: c.orderIndex ?? i }));
      } else if (node.type === 'board') {
        const res = (await getGuideClassesByBoard(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'class', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'class') {
        const res = (await getGuideSubjectsByClass(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'subject', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'subject') {
        const res = (await getGuideTextbooksBySubject(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'textbook', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'textbook') {
        const res = (await getGuideChaptersByTextbook(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'chapter', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'chapter') {
        const res = (await getGuideTopicsByChapter(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'topic', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'topic') {
        const res = (await getTopicSections(node.id)) as Record<string, any>;
        fetched = Object.keys(res).map((key, i) => ({ id: key, name: key, type: 'section', status: 'published', orderIndex: i }));
      }
      fetched.sort((a, b) => a.orderIndex - b.orderIndex);
      setNodes(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoot();
  }, [navigationStack]);

  const handlePush = (node: any) => {
    if (node.type === 'section') return;
    setNavigationStack(prev => [...prev, node]);
  };

  const handlePop = () => {
    setNavigationStack(prev => prev.slice(0, Math.max(1, prev.length - 1)));
  };


  const handleMoveNodeOrder = async (index: number, direction: number) => {
    const newNodes = [...nodes];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newNodes.length) return;

    const temp = newNodes[index];
    newNodes[index] = newNodes[targetIndex];
    newNodes[targetIndex] = temp;

    newNodes.forEach((child, i) => { child.orderIndex = i; });
    setNodes(newNodes);

    try {
      await updateGuideNodeOrders(newNodes[0].type, newNodes.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {
      console.error("Failed to reorder", e);
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

  const handleDeleteClick = (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => {
    setDeleteDialog({ isOpen: true, nodeId, nodeType, nodeName, onSuccess });
    setDeleteConfirmInput('');
  };

  const handleMoveNodeClick = async (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => {
    setMoveNodeDialog({ isOpen: true, nodeId, nodeType, nodeName, onSuccess });
    setSelectedDestination('');
    
    try {
      const textbooks = await getGuideTextbooks();
      const chapters = await getGuideAllChapters();

      let filteredTextbooks = textbooks;
      let filteredChapters = chapters;

      let textbookId = null;
      if (nodeType === 'chapter') {
        const nodeData: any = await getGuideNodeById(nodeId);
        textbookId = nodeData?.textbookId;
      } else if (nodeType === 'topic') {
        const nodeData: any = await getGuideNodeById(nodeId);
        const chapterId = nodeData?.chapterId;
        if (chapterId) {
          const chapData: any = await getGuideNodeById(chapterId);
          textbookId = chapData?.textbookId;
        }
      }

      if (textbookId) {
        filteredTextbooks = textbooks.filter((t: any) => t.id === textbookId);
        filteredChapters = chapters.filter((c: any) => c.textbookId === textbookId);
      }
      
      const dests = [
        ...filteredTextbooks.map((t: any) => ({ id: t.id, name: t.title, type: 'textbook', label: `Textbook: ${t.title}` })),
        ...filteredChapters.map((c: any) => ({ id: c.id, name: c.title, type: 'chapter', label: `Chapter: ${c.title}` }))
      ];
      setMoveDestinations(dests.filter(d => d.id !== nodeId));
    } catch (e) {
      toast({ title: "Error", description: "Failed to load destinations", variant: "destructive" });
    }
  };

  const handleMoveNodeSubmit = async () => {
    if (!selectedDestination) return;
    setMovingNode(true);
    try {
      const dest = moveDestinations.find(d => d.id === selectedDestination);
      if (!dest) throw new Error("Invalid destination");

      const res = await moveGuideNode(moveNodeDialog.nodeId, moveNodeDialog.nodeType as any, dest.id, dest.type as any);
      
      if (res.success) {
        toast({ title: "Success", description: res.message });
        moveNodeDialog.onSuccess();
        fetchRoot(); // Refresh root to reflect structural changes
        setMoveNodeDialog({ ...moveNodeDialog, isOpen: false });
      } else {
        toast({ title: "Move failed", description: res.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to move node", variant: "destructive" });
    } finally {
      setMovingNode(false);
    }
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
    <div className={`flex flex-col h-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden ${className || ''}`}>
      {/* Mobile App Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {navigationStack.length > 1 && (
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-indigo-600 bg-indigo-50 hover:bg-indigo-100" onClick={handlePop}>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
            {activeLevel.type === 'root' ? <FolderTree className="w-5 h-5 text-[#107c41]" /> : getIcon(activeLevel.type)}
            {activeLevel.name}
          </h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={fetchRoot}>
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {activeLevel.type !== 'section' && activeLevel.type !== 'topic' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#107c41] bg-emerald-50 hover:bg-emerald-100" onClick={() => {
              let typeName = '';
              if (activeLevel.type === 'root') typeName = 'Board';
              else if (activeLevel.type === 'board') typeName = 'Class';
              else if (activeLevel.type === 'class') typeName = 'Subject';
              else if (activeLevel.type === 'subject') typeName = 'Textbook';
              else if (activeLevel.type === 'textbook') typeName = 'Chapter';
              else if (activeLevel.type === 'chapter') typeName = 'Topic';
              handleOpenDialog(activeLevel.id, activeLevel.type, typeName, fetchRoot);
            }}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb Summary */}
      {navigationStack.length > 1 && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-500 flex items-center gap-1 overflow-x-auto whitespace-nowrap hide-scrollbar shrink-0 border-b border-slate-200 dark:border-slate-800">
          {navigationStack.map((nav, idx) => (
            <React.Fragment key={nav.id}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
              <span className={`shrink-0 ${idx === navigationStack.length - 1 ? 'font-medium text-slate-700 dark:text-slate-300' : ''}`}>
                {nav.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <FolderTree className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">It's empty here</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">No items found in this {activeLevel.type}. Tap the + button above to add one.</p>
          </div>
        ) : (
          <div className="space-y-2 pb-16">
            {nodes.map((node, index) => {
              const hasChildren = node.type !== 'section';
              return (
                <div key={node.id} className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden active:scale-[0.99] transition-transform">
                  <div className="flex items-stretch min-h-[64px]">
                    {/* Main Tappable Area for Drill-down */}
                    <div 
                      className="flex-1 flex items-center gap-3 px-4 py-3"
                      onClick={() => hasChildren ? handlePush(node) : null}
                    >
                      <div className="shrink-0 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        {getIcon(node.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{node.name}</p>
                        {node.author && <p className="text-xs text-slate-500 truncate mt-0.5">By {node.author}</p>}
                      </div>
                    </div>
                    
                    {/* Actions Area */}
                    <div className="flex items-center pr-2 shrink-0 border-l border-slate-100 dark:border-slate-800">
                      {node.type === 'topic' || node.type === 'chapter' ? (
                        <Link href={`/admin/guide-content/topic/${node.id}`} className="p-2 h-full flex items-center justify-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                      ) : null}
                      {node.type !== 'section' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            {index > 0 && (
                              <DropdownMenuItem onClick={() => handleMoveNodeOrder(index, -1)}>
                                <ArrowUp className="w-4 h-4 mr-2 text-slate-500" /> Move Up
                              </DropdownMenuItem>
                            )}
                            {index < nodes.length - 1 && (
                              <DropdownMenuItem onClick={() => handleMoveNodeOrder(index, 1)}>
                                <ArrowDown className="w-4 h-4 mr-2 text-slate-500" /> Move Down
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link href={`/guide/${node.slug || node.id}`} target="_blank">
                                <Eye className="w-4 h-4 mr-2 text-emerald-500" /> View in Guide
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenSeo(node.id, node.type, node, fetchRoot)}>
                              <Settings className="w-4 h-4 mr-2 text-amber-500" /> SEO Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(node.id, node.type, node.name, node.author, fetchRoot)}>
                              <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> Rename
                            </DropdownMenuItem>
                            {(node.type === 'chapter' || node.type === 'topic') && (
                              <DropdownMenuItem onClick={() => handleMoveNodeClick(node.id, node.type, node.name, fetchRoot)}>
                                <ArrowRightLeft className="w-4 h-4 mr-2 text-indigo-500" /> Move / Convert
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => handleDeleteClick(node.id, node.type, node.name, fetchRoot)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Move Node Dialog */}
      <Dialog open={moveNodeDialog.isOpen} onOpenChange={(open) => !open && setMoveNodeDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move / Convert Item</DialogTitle>
            <DialogDescription>
              Select a new destination for this item.
              <br/><br/>
              <strong>Note:</strong> Moving under a Textbook makes it a Chapter. Moving under a Chapter makes it a Topic.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Moving: {moveNodeDialog.nodeName}</Label>
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Search or select new destination..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {moveDestinations.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500">Loading destinations...</div>
                  ) : (
                    moveDestinations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveNodeDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleMoveNodeSubmit} disabled={movingNode || !selectedDestination}>
              {movingNode ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Move
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
