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
  Plus, MoreVertical, Edit2, Loader2, Trash2, ArrowUp, ArrowDown, Settings, Eye, ArrowRightLeft, MoreHorizontal, Search, Share2, BarChart2
} from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  getTaxonomyNodesByTrack, getTaxonomyNodesByType, getTaxonomyNodesByParent,
  createTaxonomyNode, updateTaxonomyNode, deleteTaxonomyNode, getTaxonomyNodeById,
  updateTaxonomyNodeOrders, generateSlug, NodeType
} from '@/lib/firebase/taxonomy';
import { 
  getTopicSections, migrateOldTextbooksToGuide, getGuideAllChapters, getGuideTextbooks
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSheetNode, setActiveSheetNode] = useState<any>(null);

  // Add Dialog State
  const [dialogState, setDialogState] = useState({ isOpen: false, parentId: '', parentType: '', typeName: '', onSuccess: () => {} });
  const [addMode, setAddMode] = useState<'select' | 'create'>('select');
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingOptions, setExistingOptions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

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
        const cls = await getTaxonomyNodesByType('academic', 'board');
        fetched = cls.map((c, i) => ({ id: c.id, name: c.title, type: 'board', status: c.status, author: c.author, orderIndex: c.orderIndex ?? i }));
      } else if (node.type === 'topic') {
        const res = (await getTopicSections(node.id)) as Record<string, any>;
        fetched = Object.keys(res).map((key, i) => ({ id: key, name: key, type: 'section', status: 'published', orderIndex: i }));
      } else {
        const res = await getTaxonomyNodesByParent(node.id);
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: r.type, status: r.status, author: r.author, orderIndex: r.orderIndex ?? i }));
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
      await updateTaxonomyNodeOrders(newNodes.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {
      console.error("Failed to reorder", e);
    }
  };


  const handleOpenDialog = async (parentId: string, parentType: string, typeName: string, onSuccess: () => void) => {
    setTitleInput('');
    setAuthorInput('');
    setDialogState({ isOpen: true, parentId, parentType, typeName, onSuccess });
    setLoadingOptions(true);
    setExistingOptions([]);
    setAddMode('select');

    let targetNodeType: NodeType = 'board';
    if (parentType === 'board') targetNodeType = 'class';
    else if (parentType === 'class') targetNodeType = 'subject';
    else if (parentType === 'subject') targetNodeType = 'textbook';
    else if (parentType === 'textbook') targetNodeType = 'chapter';
    else if (parentType === 'chapter') targetNodeType = 'topic';

    try {
      const allNodes = await getTaxonomyNodesByTrack('academic');
      const filtered = allNodes.filter((n: any) => n.type === targetNodeType);
      const uniqueTitles = Array.from(new Set(filtered.map((n: any) => n.title).filter(Boolean))) as string[];
      uniqueTitles.sort();
      setExistingOptions(uniqueTitles);
      if (uniqueTitles.length === 0) {
        setAddMode('create');
      } else {
        setAddMode('select');
      }
    } catch (e) {
      console.error("Failed to load options", e);
      setAddMode('create');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSaveDialog = async () => {
    if (!titleInput.trim()) return;
    setSaving(true);
    try {
      const items = titleInput.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      for (const item of items) {
        let nType: NodeType = 'board';
        if (dialogState.parentType === 'board') nType = 'class';
        else if (dialogState.parentType === 'class') nType = 'subject';
        else if (dialogState.parentType === 'subject') nType = 'textbook';
        else if (dialogState.parentType === 'textbook') nType = 'chapter';
        else if (dialogState.parentType === 'chapter') nType = 'topic';
        await createTaxonomyNode({
          title: item,
          type: nType,
          track: 'academic',
          parentId: dialogState.parentType === 'root' ? null : dialogState.parentId,
          status: 'published'
        });
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
    const freshNode = await getTaxonomyNodeById(nodeId) || nodeData;

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
      
      await updateTaxonomyNode(seoDialog.nodeId, {
        slug: seoInput.slug,
        featureImage: seoInput.featureImage,
        seo: {
          customTitle: seoInput.seoTitle,
          customDescription: seoInput.description,
          keywords: parsedKeywords
        },
        tags: parsedTags
      });

      toast({ title: "Success", description: "SEO metadata saved successfully." });
      setSeoDialog(prev => ({ ...prev, isOpen: false }));
      seoDialog.onSuccess();
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
      await updateTaxonomyNode(editDialog.nodeId, { title: editTitleInput, author: editAuthorInput });
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
        const nodeData: any = await getTaxonomyNodeById(nodeId);
        textbookId = nodeData?.parentId;
      } else if (nodeType === 'topic') {
        const nodeData: any = await getTaxonomyNodeById(nodeId);
        const chapterId = nodeData?.parentId;
        if (chapterId) {
          const chapData: any = await getTaxonomyNodeById(chapterId);
          textbookId = chapData?.parentId;
        }
      }

      if (textbookId) {
        filteredTextbooks = textbooks.filter((t: any) => t.id === textbookId);
        filteredChapters = chapters.filter((c: any) => c.parentId === textbookId);
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

      await updateTaxonomyNode(moveNodeDialog.nodeId, { parentId: dest.id });
      
      toast({ title: "Success", description: "Moved successfully." });
      moveNodeDialog.onSuccess();
      fetchRoot(); // Refresh root to reflect structural changes
      setMoveNodeDialog({ ...moveNodeDialog, isOpen: false });
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
      await deleteTaxonomyNode(nodeId);

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
        boardId = await createTaxonomyNode({
          title: 'National Curriculum',
          type: 'board',
          track: 'academic',
          parentId: null,
          status: 'published'
        });
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
      const [boards, classes] = await Promise.all([getTaxonomyNodesByType('academic', 'board'), getTaxonomyNodesByType('academic', 'class')]);
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

  // Filtered nodes based on search
  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col relative h-full bg-[#f6faf8] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden ${className || ''}`}>
      {/* Mobile App Header (Green Theme) */}
      <div className="flex items-center justify-between p-4 bg-[#3b8c4c] text-white shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          {navigationStack.length > 1 ? (
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-white hover:bg-white/20" onClick={handlePop}>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Button>
          ) : (
             <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-white hover:bg-white/20" onClick={() => {}}>
                <MoreHorizontal className="w-5 h-5" />
             </Button>
          )}
          <h1 className="text-xl font-bold truncate flex items-center gap-2">
            {activeLevel.type === 'root' ? 'DeshExam Explorer' : 
             activeLevel.type === 'board' ? `${activeLevel.name}${activeLevel.acronym ? ` (${activeLevel.acronym})` : ''} - Subjects` :
             activeLevel.type === 'class' ? `${activeLevel.name}${activeLevel.acronym ? ` (${activeLevel.acronym})` : ''} - Chapters` :
             `${activeLevel.name}${activeLevel.acronym ? ` (${activeLevel.acronym})` : ''}`}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={fetchRoot}>
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {navigationStack.length === 1 && (
            <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center border border-white/30">
               <span className="text-xs font-bold">U</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 px-4 pt-4 pb-2 shrink-0 z-0 shadow-sm">
        {/* Breadcrumb Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 mb-4 border border-slate-200 dark:border-slate-700">
            <span className="shrink-0">Home</span>
            {navigationStack.slice(1).map((nav, idx) => (
              <React.Fragment key={nav.id}>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="shrink-0 max-w-[80px] truncate">{nav.name}</span>
              </React.Fragment>
            ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeLevel.type === 'root' ? 'boards' : activeLevel.type === 'board' ? 'subjects' : 'chapters'}...`}
            className="pl-9 bg-slate-100/80 dark:bg-slate-900 border-none rounded-full h-11 text-sm focus-visible:ring-1 focus-visible:ring-[#3b8c4c] dark:focus-visible:ring-[#3b8c4c]"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2 bg-[#f6faf8] dark:bg-slate-950">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#3b8c4c]" /></div>
        ) : filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <FolderTree className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">It's empty here</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">{searchQuery ? "No results match your search." : `No items found in this ${activeLevel.type}.`}</p>
          </div>
        ) : (
          <div className={cn(
            "pb-32", 
            activeLevel.type === 'root' ? "grid grid-cols-2 gap-3" : "space-y-2"
          )}>
            {filteredNodes.map((node, index) => {
              const hasChildren = node.type !== 'section';
              const isBoardLevel = activeLevel.type === 'root';
              const isChapterLevel = activeLevel.type === 'class';
              
              if (isBoardLevel) {
                 // Grid View for Boards
                 return (
                    <div 
                      key={node.id} 
                      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden active:scale-[0.98] transition-transform flex flex-col items-center justify-center p-3 min-h-[120px]"
                      onClick={() => hasChildren ? handlePush(node) : null}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                         {getIcon(node.type)}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white text-center mb-1 line-clamp-2">{node.title || node.name}{node.acronym ? ` (${node.acronym})` : ''}</h3>
                      <p className="text-[11px] font-medium text-[#3b8c4c] dark:text-[#4ade80]">Explore Classes</p>
                    </div>
                 );
              }

              return (
                <div key={node.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="flex flex-col min-h-[64px]">
                    <div className="flex items-center gap-2 px-3 py-2 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors flex-1" onClick={() => hasChildren ? handlePush(node) : null}>
                      <div className={cn("shrink-0 p-2 rounded-lg", isChapterLevel ? "bg-green-50 dark:bg-green-900/20" : "bg-orange-50 dark:bg-orange-900/20")}>
                        {getIcon(node.type)}
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight mb-0.5">{node.title || node.name}{node.acronym ? ` (${node.acronym})` : ''}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                           {isChapterLevel ? `${Math.floor(Math.random() * 5) + 1} Chapters` : `Chapters: ${Math.floor(Math.random() * 60) + 1}`}
                        </p>
                      </div>
                      
                      {/* Action Menu Trigger */}
                      <div className="shrink-0 pl-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveSheetNode({ ...node, index }); }}>
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar for Chapters */}
                    {isChapterLevel && (
                        <div className="px-4 pb-3 pt-1 w-full">
                           <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-semibold text-slate-500">Topic: {Math.floor(Math.random() * 200)}</span>
                              <span className="text-[10px] font-semibold text-slate-400">Progress</span>
                           </div>
                           <Progress value={Math.floor(Math.random() * 100)} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-[#3b8c4c]" />
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {activeLevel.type !== 'section' && activeLevel.type !== 'topic' && (
        <div className="absolute bottom-6 right-6 z-20">
            <Button 
               size="icon" 
               className="h-14 w-14 rounded-2xl bg-[#3b8c4c] hover:bg-[#2e703c] text-white shadow-lg shadow-green-900/20 active:scale-95 transition-all"
               onClick={() => {
                  let typeName = '';
                  if (activeLevel.type === 'root') typeName = 'Board';
                  else if (activeLevel.type === 'board') typeName = 'Class';
                  else if (activeLevel.type === 'class') typeName = 'Subject';
                  else if (activeLevel.type === 'subject') typeName = 'Textbook';
                  else if (activeLevel.type === 'textbook') typeName = 'Chapter';
                  else if (activeLevel.type === 'chapter') typeName = 'Topic';
                  handleOpenDialog(activeLevel.id, activeLevel.type, typeName, fetchRoot);
               }}
            >
               <Plus className="w-6 h-6" />
            </Button>
        </div>
      )}

      {/* Bottom Sheet for Actions */}
      <Sheet open={!!activeSheetNode} onOpenChange={(open) => !open && setActiveSheetNode(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-8 px-2 pt-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
           <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
           <SheetHeader className="sr-only">
              <SheetTitle>Node Actions</SheetTitle>
           </SheetHeader>
           {activeSheetNode && (
             <div className="flex flex-col gap-1 px-4">
                {(activeSheetNode.type === 'chapter' || activeSheetNode.type === 'topic') && (
                   <Button variant="ghost" className="justify-start h-12 text-base font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-emerald-600 hover:text-emerald-700" asChild onClick={() => setActiveSheetNode(null)}>
                      <Link href={`/admin/guide-content/topic/${activeSheetNode.id}`}>
                        <BookOpen className="w-5 h-5 mr-4" /> Manage Content (Notes/MCQ)
                      </Link>
                   </Button>
                )}
                <Button variant="ghost" className="justify-start h-12 text-base font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => { handleOpenEdit(activeSheetNode.id, activeSheetNode.type, activeSheetNode.name, activeSheetNode.author, fetchRoot); setActiveSheetNode(null); }}>
                   <Edit2 className="w-5 h-5 mr-4 text-slate-700 dark:text-slate-300" /> Rename Title
                </Button>
                {(activeSheetNode.type === 'chapter' || activeSheetNode.type === 'topic') && (
                   <Button variant="ghost" className="justify-start h-12 text-base font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => { handleMoveNodeClick(activeSheetNode.id, activeSheetNode.type, activeSheetNode.name, fetchRoot); setActiveSheetNode(null); }}>
                      <ArrowRightLeft className="w-5 h-5 mr-4 text-slate-700 dark:text-slate-300" /> Move {activeSheetNode.type.charAt(0).toUpperCase() + activeSheetNode.type.slice(1)}
                   </Button>
                )}
                <Button variant="ghost" className="justify-start h-12 text-base font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-red-600 hover:text-red-700" onClick={() => { handleDeleteClick(activeSheetNode.id, activeSheetNode.type, activeSheetNode.name, fetchRoot); setActiveSheetNode(null); }}>
                   <Trash2 className="w-5 h-5 mr-4" /> Delete
                </Button>
                <Button variant="ghost" className="justify-start h-12 text-base font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => { handleOpenSeo(activeSheetNode.id, activeSheetNode.type, activeSheetNode, fetchRoot); setActiveSheetNode(null); }}>
                   <BarChart2 className="w-5 h-5 mr-4 text-slate-700 dark:text-slate-300" /> View Analytics / SEO
                </Button>
                <Button variant="ghost" className="justify-start h-12 text-base font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900" asChild onClick={() => setActiveSheetNode(null)}>
                   <Link href={`/guide/${activeSheetNode.fullSlug || activeSheetNode.id}`} target="_blank">
                     <Eye className="w-5 h-5 mr-4 text-emerald-500" /> View in Guide
                   </Link>
                </Button>
             </div>
           )}
        </SheetContent>
      </Sheet>

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
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#107c41]" />
              Add {dialogState.typeName ? dialogState.typeName.charAt(0).toUpperCase() + dialogState.typeName.slice(1) : 'Item'}
            </DialogTitle>
            <DialogDescription>
              Choose from existing predefined {dialogState.typeName.toLowerCase()}s or enter a new one.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher */}
          <div className="flex border rounded-lg p-1 bg-slate-50 gap-1 mt-1">
            <button
              type="button"
              onClick={() => setAddMode('select')}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                addMode === 'select'
                  ? 'bg-white text-[#107c41] shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Option A: Select ({existingOptions.length})
            </button>
            <button
              type="button"
              onClick={() => setAddMode('create')}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                addMode === 'create'
                  ? 'bg-white text-[#107c41] shadow-sm border border-slate-200'
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
                    <Loader2 className="w-4 h-4 animate-spin text-[#107c41]" />
                    Loading available {dialogState.typeName}s...
                  </div>
                ) : existingOptions.length === 0 ? (
                  <div className="p-4 text-center rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    No existing {dialogState.typeName}s found. Please switch to <strong>Option B</strong>.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select value={titleInput} onValueChange={(val) => setTitleInput(val)}>
                      <SelectTrigger className="w-full h-10 bg-white">
                        <SelectValue placeholder={`-- Select an existing ${dialogState.typeName} --`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[240px]">
                        {existingOptions.map((opt, i) => (
                          <SelectItem key={i} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="mt-2">
                      <Label className="text-[11px] text-slate-400">Quick list:</Label>
                      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto mt-1 p-1 bg-slate-50 rounded-lg border border-slate-100">
                        {existingOptions.map((opt, i) => (
                          <span
                            key={i}
                            onClick={() => setTitleInput(opt)}
                            className={`text-xs px-2.5 py-1 rounded-md cursor-pointer border transition-all ${
                              titleInput === opt
                                ? 'bg-[#107c41] text-white border-[#107c41] font-medium'
                                : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200'
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
                  className="min-h-[60px] max-h-[200px] overflow-y-auto"
                  autoFocus
                />
              </div>
            )}

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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogState(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button className="bg-[#107c41] hover:bg-[#0b5c30] text-white" onClick={handleSaveDialog} disabled={saving || !titleInput.trim()}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {addMode === 'select' ? `Attach ${dialogState.typeName || 'Item'}` : `Create & Attach`}
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
