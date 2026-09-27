'use client';

import React, { useEffect, useState } from 'react';
import { getTaxonomyNodesByType, TaxonomyNode, NodeType } from '@/lib/firebase/taxonomy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Edit2, Trash2, Hash, FileText, CheckSquare, EyeOff, LayoutGrid, LayoutList,
  ChevronRight, Filter, Database, BookOpen, Layers, Target, Eye, ChevronLeft, Calendar, Activity, PlusCircle, Search, Tag,
  ArrowUpDown, Download, SortAsc, SortDesc, ImageIcon, Globe, RefreshCw, X as XIcon, MoreVertical, ShieldCheck, CheckCircle2, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { updateTaxonomyNode, generateSlug, deleteTaxonomyNode, getTaxonomyNodesByParent, getTaxonomyNodesByTrack } from '@/lib/firebase/taxonomy';
import { indianBoards } from '@/lib/data/indian-boards';

const INSTITUTION_TYPES = [
  'Public School', 'Private School', 'Government School', 'Govt. Aided School',
  'Primary School', 'Secondary School', 'Higher Secondary', 'Madrasah',
  'College', 'University', 'Deemed University', 'Engineering College',
  'Medical College', 'Law College', 'Arts College', 'Science College', 'Commerce College',
  'Polytechnic', 'ITI', 'Coaching Institute', 'Tuition Centre', 'Vocational Training',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

interface Props {
  type: NodeType;
  title: string;
}

export function TaxonomyDataTable({ type, title }: Props) {
  const [allNodes, setAllNodes] = useState<TaxonomyNode[]>([]);
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterBoardId, setFilterBoardId] = useState('all');
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterSubjectId, setFilterSubjectId] = useState('all');
  const [filterTextbookId, setFilterTextbookId] = useState('all');
  const [filterChapterId, setFilterChapterId] = useState('all');
  // New filters
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [groupByName, setGroupByName] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'context'>(
    ['class', 'subject', 'textbook', 'chapter', 'topic'].includes(type) ? 'context' : 'newest'
  );
  const [filterHasImage, setFilterHasImage] = useState<'all' | 'yes' | 'no'>('all');
  const [filterInstitutionType, setFilterInstitutionType] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [filterHasWebsite, setFilterHasWebsite] = useState<'all' | 'yes' | 'no'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllPages, setSelectAllPages] = useState(false);
  const [bulkBoardType, setBulkBoardType] = useState('');
  const [bulkState, setBulkState] = useState('');

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', titleBn: '', slug: '', subjectCode: '' });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<TaxonomyNode | null>(null);
  const [editForm, setEditForm] = useState({ title: '', titleBn: '', slug: '', subjectCode: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Merge Duplicates State
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<{title: string, parentId: string|null, nodes: TaxonomyNode[]}[]>([]);
  const [mergingGroupId, setMergingGroupId] = useState<string | null>(null);

  const getContextForMerge = (node: TaxonomyNode) => {
    let current = node;
    const path: string[] = [];
    while (current.parentId) {
      const parent = allNodes.find(n => n.id === current.parentId);
      if (!parent) break;
      path.unshift(parent.title);
      current = parent;
    }
    return path.join('>');
  };

  const findDuplicates = () => {
    const groups: Record<string, TaxonomyNode[]> = {};
    nodes.forEach(node => {
      const context = getContextForMerge(node) || 'root';
      const key = `${node.title.trim().toLowerCase()}_${context}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(node);
    });
    
    const duplicates = Object.values(groups).filter(group => group.length > 1).map(group => ({
      title: group[0].title,
      parentId: group[0].parentId,
      context: getContextForMerge(group[0]),
      nodes: group
    }));
    
    setDuplicateGroups(duplicates as any);
    setIsMergeModalOpen(true);
  };

  const handleMergeGroup = async (group: {title: string, parentId: string|null, nodes: TaxonomyNode[]}) => {
    const key = `${group.title}_${group.parentId}`;
    setMergingGroupId(key);
    try {
      const primaryNode = group.nodes[0];
      const duplicateNodes = group.nodes.slice(1);
      
      for (const dup of duplicateNodes) {
        const children = await getTaxonomyNodesByParent(dup.id);
        for (const child of children) {
          await updateTaxonomyNode(child.id, { parentId: primaryNode.id });
        }
        await deleteTaxonomyNode(dup.id);
      }
      
      setDuplicateGroups(prev => prev.filter(g => g !== group));
      fetchData();
      
    } catch(e) {
      console.error(e);
      alert("Failed to merge");
    } finally {
      setMergingGroupId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all to resolve parent hierarchies easily
      const data = await getTaxonomyNodesByTrack('academic');
      setAllNodes(data);
      setNodes(data.filter(n => n.type === type));
    } catch (error) {
      console.error(`Error fetching taxonomy nodes:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
    setSelectAllPages(false);
  }, [searchQuery, statusFilter, filterBoardId, filterClassId, filterSubjectId, filterTextbookId, filterChapterId, sortBy, filterHasImage, filterInstitutionType, filterState, filterDateRange, filterHasWebsite]);

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (node.slug && node.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          ((node as any).address && (node as any).address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
    const matchesHasImage = filterHasImage === 'all'
      ? true : filterHasImage === 'yes'
      ? !!(node as any).featureImage
      : !(node as any).featureImage;
    const matchesHasWebsite = filterHasWebsite === 'all'
      ? true : filterHasWebsite === 'yes'
      ? !!(node as any).websiteUrl
      : !(node as any).websiteUrl;
    const matchesInstType = filterInstitutionType === 'all' || (node as any).boardType === filterInstitutionType;
    const matchesState = filterState === 'all' || (node as any).stateRegion === filterState;
    // Date filter
    let matchesDate = true;
    if (filterDateRange !== 'all' && (node as any).createdAt) {
      const created = (node as any).createdAt?.toDate ? (node as any).createdAt.toDate() : new Date((node as any).createdAt);
      const now = new Date();
      if (filterDateRange === 'today') matchesDate = created.toDateString() === now.toDateString();
      else if (filterDateRange === 'week') matchesDate = (now.getTime() - created.getTime()) < 7 * 86400000;
      else if (filterDateRange === 'month') matchesDate = (now.getTime() - created.getTime()) < 30 * 86400000;
    }

    // Hierarchy matches
    let current = node;
    const pathIds: string[] = [node.id];
    while (current.parentId) {
      const parent = allNodes.find(n => n.id === current.parentId);
      if (!parent) break;
      pathIds.push(parent.id);
      current = parent;
    }
    const matchesBoard = filterBoardId === 'all' || pathIds.includes(filterBoardId);
    const matchesClass = filterClassId === 'all' || pathIds.includes(filterClassId);
    const matchesSubject = filterSubjectId === 'all' || pathIds.includes(filterSubjectId);
    const matchesTextbook = filterTextbookId === 'all' || pathIds.includes(filterTextbookId);
    const matchesChapter = filterChapterId === 'all' || pathIds.includes(filterChapterId);

    return matchesSearch && matchesStatus && matchesBoard && matchesClass && matchesSubject
      && matchesTextbook && matchesChapter && matchesHasImage && matchesHasWebsite
      && matchesInstType && matchesState && matchesDate;
  });

  // Sorting
  const sortedNodes = [...filteredNodes].sort((a, b) => {
    if (sortBy === 'context') {
      const ctxA = getParentContext(a) || '';
      const ctxB = getParentContext(b) || '';
      const cmp = ctxA.localeCompare(ctxB);
      if (cmp !== 0) return cmp;
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
    const aTime = (a as any).createdAt?.toDate ? (a as any).createdAt.toDate().getTime() : 0;
    const bTime = (b as any).createdAt?.toDate ? (b as any).createdAt.toDate().getTime() : 0;
    return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
  });

  // Dynamically calculate dropdown options based on selections
  const typeNodeAncestors = new Set<string>();
  if (allNodes.length > 0) {
    allNodes.filter(n => n.type === type).forEach(n => {
      let current = n;
      typeNodeAncestors.add(current.id);
      while (current.parentId) {
        const parent = allNodes.find(p => p.id === current.parentId);
        if (!parent) break;
        typeNodeAncestors.add(parent.id);
        current = parent;
      }
    });
  }

  const availableBoards = allNodes.filter(n => n.type === 'board' && typeNodeAncestors.has(n.id));
  const availableClasses = allNodes.filter(n => n.type === 'class' && (filterBoardId === 'all' || n.parentId === filterBoardId));
  const availableSubjects = allNodes.filter(n => n.type === 'subject' && (filterClassId === 'all' || n.parentId === filterClassId));
  const availableTextbooks = allNodes.filter(n => n.type === 'textbook' && (filterSubjectId === 'all' || n.parentId === filterSubjectId));
  const availableChapters = allNodes.filter(n => n.type === 'chapter' && (filterTextbookId === 'all' || n.parentId === filterTextbookId));

  const totalPages = Math.max(1, Math.ceil(sortedNodes.length / itemsPerPage));
  const paginatedNodes = sortedNodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const effectiveSelectedIds = selectAllPages ? sortedNodes.map(n => n.id) : selectedIds;

  // Active filter count
  const activeFilterCount = [statusFilter !== 'all', filterHasImage !== 'all', filterHasWebsite !== 'all',
    filterInstitutionType !== 'all', filterState !== 'all', filterDateRange !== 'all'].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearchQuery(''); setStatusFilter('all'); 
    setSortBy(['class', 'subject', 'textbook', 'chapter', 'topic'].includes(type) ? 'context' : 'newest');
    setFilterHasImage('all'); setFilterHasWebsite('all');
    setFilterInstitutionType('all'); setFilterState('all'); setFilterDateRange('all');
    setFilterBoardId('all'); setFilterClassId('all'); setFilterSubjectId('all');
    setFilterTextbookId('all'); setFilterChapterId('all');
  };

  const handleEditClick = (node: TaxonomyNode) => {
    setEditingNode(node);
    setEditForm({ 
      title: node.title, 
      titleBn: (node as any).titleBn || (node as any).title_bn || '',
      slug: node.slug || generateSlug(node.title),
      subjectCode: (node as any).subjectCode || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingNode) return;
    setIsSaving(true);
    try {
      await updateTaxonomyNode(editingNode.id, { 
        title: editForm.title, 
        ...(editForm.titleBn ? { titleBn: editForm.titleBn } : {}),
        slug: editForm.slug,
        ...(type === 'subject' && { subjectCode: editForm.subjectCode })
      });
      
      // If the slug or title has changed, rebuild the SEO fullSlugs for this node and its descendants
      if (editForm.title !== editingNode.title || editForm.slug !== editingNode.slug) {
        const { rebuildSubtreeSeo } = await import('@/lib/firebase/migration');
        await rebuildSubtreeSeo(editingNode.id);
      }

      setIsEditModalOpen(false);
      fetchData(); // Refresh
    } catch (error) {
      console.error("Failed to update node", error);
      alert("Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (node: TaxonomyNode) => {
    if (!window.confirm(`Are you sure you want to delete "${node.title}" AND all of its sub-items? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteTaxonomyNode(node.id);
      fetchData(); // Refresh list after deletion
    } catch (error: any) {
      console.error("Failed to delete node", error);
      alert(`Failed to delete item: ${error?.message || "Unknown error"}`);
    }
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectAllPages(false);
    if (checked) {
      setSelectedIds(paginatedNodes.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (effectiveSelectedIds.length === 0) return;
    setIsSaving(true);
    try {
      await Promise.all(effectiveSelectedIds.map(id => updateTaxonomyNode(id, { status: newStatus as any })));
      setSelectedIds([]); setSelectAllPages(false);
      fetchData();
    } catch (e) { console.error(e); alert('Failed to update items.'); }
    finally { setIsSaving(false); }
  };

  const handleBulkFieldUpdate = async (field: string, value: any) => {
    if (effectiveSelectedIds.length === 0 || !value) return;
    setIsSaving(true);
    try {
      await Promise.all(effectiveSelectedIds.map(id => updateTaxonomyNode(id, { [field]: value } as any)));
      setSelectedIds([]); setSelectAllPages(false);
      fetchData();
    } catch (e) { console.error(e); alert('Failed to update items.'); }
    finally { setIsSaving(false); }
  };

  const handleExportCSV = () => {
    const rows = effectiveSelectedIds.length > 0
      ? sortedNodes.filter(n => effectiveSelectedIds.includes(n.id))
      : sortedNodes;
    const headers = ['ID', 'Title', 'Slug', 'Status', 'Type', 'Board Type', 'State', 'Address', 'Website', 'Phone', 'Rating', 'Established Year', 'Order Index'];
    const csvRows = [
      headers.join(','),
      ...rows.map(n => [
        n.id, `"${n.title.replace(/"/g, '""')}"`, n.slug || '', n.status, n.type,
        (n as any).boardType || '', (n as any).stateRegion || '',
        `"${((n as any).address || '').replace(/"/g, '""')}"`,
        (n as any).websiteUrl || '', (n as any).phoneNumber || '',
        (n as any).rating || '', (n as any).establishedYear || '', n.orderIndex || 0
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${type}-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    if (effectiveSelectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${effectiveSelectedIds.length} items AND all their sub-items?`)) return;
    setIsSaving(true);
    try {
      await Promise.all(effectiveSelectedIds.map(id => deleteTaxonomyNode(id)));
      setSelectedIds([]); setSelectAllPages(false);
      fetchData();
    } catch (e) { console.error(e); alert('Failed to delete items.'); }
    finally { setIsSaving(false); }
  };

  const handleToggleStatus = async (node: TaxonomyNode) => {
    const newStatus = (node.status === 'active' || node.status === 'published') ? 'inactive' : 'active';
    try {
      await updateTaxonomyNode(node.id, { status: newStatus });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAdd = async () => {
    if (!addForm.title) return;
    setIsSaving(true);
    try {
      const { createTaxonomyNode } = await import('@/lib/firebase/taxonomy');
      let parentId = null;
      if (type === 'class') parentId = filterBoardId !== 'all' ? filterBoardId : null;
      if (type === 'subject') parentId = filterClassId !== 'all' ? filterClassId : null;
      if (type === 'textbook') parentId = filterSubjectId !== 'all' ? filterSubjectId : null;
      if (type === 'chapter') parentId = filterTextbookId !== 'all' ? filterTextbookId : null;
      if (type === 'topic') parentId = filterChapterId !== 'all' ? filterChapterId : null;
      
      if (type !== 'board' && type !== 'institution' && !parentId) {
         alert(`Please select a specific parent filter first before adding a new ${type}.`);
         setIsSaving(false);
         return;
      }

      await createTaxonomyNode({
        title: addForm.title,
        ...(addForm.titleBn ? { titleBn: addForm.titleBn } : {}),
        slug: addForm.slug || generateSlug(addForm.title),
        type: type,
        track: 'academic',
        parentId: parentId,
        status: 'draft',
        ...(type === 'subject' && { subjectCode: addForm.subjectCode })
      });
      setIsAddModalOpen(false);
      setAddForm({ title: '', titleBn: '', slug: '', subjectCode: '' });
      fetchData();
    } catch (error) {
      console.error("Failed to add node", error);
      alert("Failed to add new item");
    } finally {
      setIsSaving(false);
    }
  };

  function getParentContext(node: TaxonomyNode) {
    if (!node.parentId) return null;
    let current = node;
    const path: TaxonomyNode[] = [];
    while (current.parentId) {
      const parent = allNodes.find(n => n.id === current.parentId);
      if (!parent) break;
      path.unshift(parent);
      current = parent;
    }
    
    return path.map(p => p.type === 'board' && p.acronym ? p.acronym : p.title).join(' > ');
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              {title}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              View and manage all academic {title.toLowerCase()} in the database. Organize your educational structure efficiently.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => { setViewMode('list'); setGroupByName(false); }}
                className={`w-8 h-8 rounded-md transition-all ${viewMode === 'list' && !groupByName ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
              {['class', 'subject', 'textbook', 'chapter', 'topic'].includes(type) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => { setViewMode('list'); setGroupByName(true); }}
                  className={`w-8 h-8 rounded-md transition-all ${viewMode === 'list' && groupByName ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  title="Grouped View"
                >
                  <Layers className="w-4 h-4" />
                </Button>
              )}
            </div>
            {type === 'textbook' ? (
              <Button asChild size="icon" title="Add New" className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-sm shadow-indigo-500/20 transition-all rounded-lg shrink-0">
                <Link href="/admin/textbook/add">
                  <PlusCircle className="w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <Button onClick={() => setIsAddModalOpen(true)} size="icon" title="Add New"
                className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-sm shadow-indigo-500/20 transition-all rounded-lg shrink-0">
                <PlusCircle className="w-5 h-5" />
              </Button>
            )}
            <Button onClick={findDuplicates} size="icon" variant="outline" title="Merge Duplicates" className="h-10 w-10 border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-all rounded-lg shrink-0">
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-gray-200/60 dark:border-slate-700/60 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-xl">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col gap-3">
            {/* Row 1: Search + Sort + Status + Reset */}
            {/* Row 1: Search + Sort + Status + Reset */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2">
              <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
                <Input
                  placeholder="Search title, slug, address..."
                  className="pl-9 h-9 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-sm w-full text-slate-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-indigo-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Sort */}
                <div className="relative flex-1 sm:flex-none min-w-[110px]">
                  <select
                    className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="title-asc">A → Z</option>
                    <option value="title-desc">Z → A</option>
                    {type !== 'board' && <option value="context">Board & Class</option>}
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
                {/* Status */}
                <div className="relative flex-1 sm:flex-none min-w-[110px]">
                  <select
                    className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>

                {/* Dedicated Filters Section (Moved to same line) */}
                {['class', 'subject', 'textbook', 'chapter', 'topic'].includes(type) && (
                  <div className="relative flex-1 sm:flex-none min-w-[110px]">
                    <select 
                      className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition-all"
                      value={filterBoardId}
                      onChange={(e) => {
                        setFilterBoardId(e.target.value);
                        setFilterClassId('all'); setFilterSubjectId('all'); setFilterTextbookId('all'); setFilterChapterId('all');
                      }}
                    >
                      <option value="all">All Boards</option>
                      {availableBoards.map(b => {
                        const shortName = (b as any).acronym || indianBoards.find(ib => ib.slug === b.slug || ib.id === b.id)?.acronym || b.title;
                        return <option key={b.id} value={b.id}>{shortName}</option>;
                      })}
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>
                )}

                {['subject', 'textbook', 'chapter', 'topic'].includes(type) && (
                  <div className="relative flex-1 sm:flex-none min-w-[110px]">
                    <select 
                      className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                      value={filterClassId}
                      onChange={(e) => {
                        setFilterClassId(e.target.value);
                        setFilterSubjectId('all'); setFilterTextbookId('all'); setFilterChapterId('all');
                      }}
                      disabled={filterBoardId !== 'all' && availableClasses.length === 0}
                    >
                      <option value="all">All Classes</option>
                      {availableClasses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>
                )}

                {['textbook', 'chapter', 'topic'].includes(type) && (
                  <div className="relative flex-1 sm:flex-none min-w-[110px]">
                    <select 
                      className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                      value={filterSubjectId}
                      onChange={(e) => {
                        setFilterSubjectId(e.target.value);
                        setFilterTextbookId('all'); setFilterChapterId('all');
                      }}
                      disabled={filterClassId !== 'all' && availableSubjects.length === 0}
                    >
                      <option value="all">All Subjects</option>
                      {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>
                )}

                {['chapter', 'topic'].includes(type) && (
                  <div className="relative flex-1 sm:flex-none min-w-[110px]">
                    <select 
                      className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                      value={filterTextbookId}
                      onChange={(e) => {
                        setFilterTextbookId(e.target.value);
                        setFilterChapterId('all');
                      }}
                      disabled={filterSubjectId !== 'all' && availableTextbooks.length === 0}
                    >
                      <option value="all">All Textbooks</option>
                      {availableTextbooks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>
                )}

                {['topic'].includes(type) && (
                  <div className="relative flex-1 sm:flex-none min-w-[110px]">
                    <select 
                      className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                      value={filterChapterId}
                      onChange={(e) => setFilterChapterId(e.target.value)}
                      disabled={filterTextbookId !== 'all' && availableChapters.length === 0}
                    >
                      <option value="all">All Chapters</option>
                      {availableChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>
                )}
                
                {/* Reset Filters */}
                {activeFilterCount > 0 && (
                  <div className="shrink-0 flex-1 sm:flex-none min-w-[80px]">
                    <Button variant="ghost" size="sm" onClick={resetAllFilters}
                      className="w-full sm:w-auto h-9 px-3 text-xs text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 gap-1 transition-all justify-center">
                      <XIcon className="w-3.5 h-3.5" /> Reset
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Advanced filters — shown only for institution type */}
            {type === 'institution' && (
              <div className="flex flex-wrap gap-2">
                {/* Institution Type */}
                <div className="relative">
                  <select
                    className="h-8 pl-2.5 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer max-w-[160px]"
                    value={filterInstitutionType}
                    onChange={(e) => setFilterInstitutionType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
                {/* State */}
                <div className="relative">
                  <select
                    className="h-8 pl-2.5 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer max-w-[140px]"
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                  >
                    <option value="all">All States</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
                {/* Has Image */}
                <div className="relative">
                  <select
                    className="h-8 pl-2.5 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    value={filterHasImage}
                    onChange={(e) => setFilterHasImage(e.target.value as any)}
                  >
                    <option value="all">All Images</option>
                    <option value="yes">Has Image</option>
                    <option value="no">No Image</option>
                  </select>
                  <ImageIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
                {/* Has Website */}
                <div className="relative">
                  <select
                    className="h-8 pl-2.5 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    value={filterHasWebsite}
                    onChange={(e) => setFilterHasWebsite(e.target.value as any)}
                  >
                    <option value="all">Any Website</option>
                    <option value="yes">Has Website</option>
                    <option value="no">No Website</option>
                  </select>
                  <Globe className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
                {/* Date Range */}
                <div className="relative">
                  <select
                    className="h-8 pl-2.5 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value as any)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}
            {/* Removed Dedicated Filters Section as it's now inline */}
          </div>
        </CardHeader>

        {/* ── Bulk Actions Toolbar ── */}
        {effectiveSelectedIds.length > 0 && (
          <div className="border-b border-indigo-100 dark:border-indigo-800/50 bg-indigo-50/80 dark:bg-indigo-900/20">
            {/* Top: count + select all pages + deselect */}
            <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
                  {effectiveSelectedIds.length} selected
                </span>
                {!selectAllPages && selectedIds.length === paginatedNodes.length && sortedNodes.length > itemsPerPage && (
                  <button
                    className="text-xs text-indigo-600 dark:text-indigo-400 underline hover:no-underline"
                    onClick={() => setSelectAllPages(true)}
                  >
                    Select all {sortedNodes.length} records
                  </button>
                )}
                {selectAllPages && (
                  <button
                    className="text-xs text-indigo-600 dark:text-indigo-400 underline hover:no-underline"
                    onClick={() => { setSelectAllPages(false); setSelectedIds([]); }}
                  >
                    Clear selection
                  </button>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-500 dark:text-indigo-400"
                onClick={() => { setSelectedIds([]); setSelectAllPages(false); }}>
                <XIcon className="w-3 h-3 mr-1" /> Deselect
              </Button>
            </div>
            {/* Bottom: bulk action buttons */}
            <div className="px-4 pb-2.5 flex flex-wrap items-center gap-2">
              {/* Set Status */}
              <select
                className="h-8 pl-2.5 pr-7 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-md text-xs text-indigo-700 dark:text-indigo-300 outline-none appearance-none cursor-pointer"
                onChange={(e) => { if (e.target.value) handleBulkStatusUpdate(e.target.value); e.target.value = ''; }}
                defaultValue=""
              >
                <option value="" disabled>Set Status…</option>
                <option value="published">→ Published</option>
                <option value="active">→ Active</option>
                <option value="draft">→ Draft</option>
                <option value="inactive">→ Inactive</option>
              </select>

              {/* Institution-only: Set Type */}
              {type === 'institution' && (
                <>
                  <select
                    className="h-8 pl-2.5 pr-7 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-md text-xs text-indigo-700 dark:text-indigo-300 outline-none appearance-none cursor-pointer max-w-[160px]"
                    value={bulkBoardType}
                    onChange={(e) => setBulkBoardType(e.target.value)}
                  >
                    <option value="">Set Inst. Type…</option>
                    {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {bulkBoardType && (
                    <Button size="sm"
                      className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white"
                      onClick={() => { handleBulkFieldUpdate('boardType', bulkBoardType); setBulkBoardType(''); }}
                      disabled={isSaving}
                    >
                      Apply Type
                    </Button>
                  )}
                  <select
                    className="h-8 pl-2.5 pr-7 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-md text-xs text-indigo-700 dark:text-indigo-300 outline-none appearance-none cursor-pointer max-w-[140px]"
                    value={bulkState}
                    onChange={(e) => setBulkState(e.target.value)}
                  >
                    <option value="">Set State…</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {bulkState && (
                    <Button size="sm"
                      className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white"
                      onClick={() => { handleBulkFieldUpdate('stateRegion', bulkState); setBulkState(''); }}
                      disabled={isSaving}
                    >
                      Apply State
                    </Button>
                  )}
                </>
              )}

              {/* Export CSV */}
              <Button
                size="sm" variant="outline"
                className="h-8 text-xs border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 gap-1"
                onClick={handleExportCSV}
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>

              {/* Delete */}
              <Button variant="destructive" size="sm" className="h-8 text-xs gap-1 ml-auto" onClick={handleBulkDelete} disabled={isSaving}>
                <Trash2 className="w-3.5 h-3.5" /> Delete {effectiveSelectedIds.length}
              </Button>
            </div>
          </div>
        )}

        {/* Export All (no selection) */}
        {effectiveSelectedIds.length === 0 && type === 'institution' && (
          <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700/40 flex items-center justify-end gap-2">
            <Button
              size="sm" variant="ghost"
              className="h-7 text-xs text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 gap-1"
              onClick={handleExportCSV}
            >
              <Download className="w-3.5 h-3.5" /> Export all {sortedNodes.length} as CSV
            </Button>
          </div>
        )}

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400 animate-pulse">Loading data...</div>
          ) : paginatedNodes.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400">No records found.</div>
          ) : viewMode === 'grid' ? (
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-slate-50/30 dark:bg-slate-900/30">
              {paginatedNodes.map((node) => {
                const nodeAcronym = (node as any).acronym || indianBoards.find(ib => ib.slug === node.slug || ib.id === node.id)?.acronym;
                return (
                <div key={node.id} className={`group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 ${selectedIds.includes(node.id) ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-sm' : 'border-slate-200 dark:border-slate-700'}`}>
                  
                  {/* Card Header (Checkbox + Status) */}
                  <div className="flex items-start justify-between p-4 border-b border-slate-100 dark:border-slate-700/60">
                    <Checkbox
                      checked={selectedIds.includes(node.id)}
                      onCheckedChange={(checked) => handleToggleSelect(node.id, checked === true)}
                      className="mt-0.5 z-10"
                    />
                    <div className="flex items-center gap-1.5 z-10">
                      {(node as any).isHardcoded && (
                        <span className="flex items-center justify-center min-w-[22px] h-[22px] text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded border border-purple-200 dark:border-purple-500/30" title="Hardcoded">H</span>
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">#{node.orderIndex || 0}</span>
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border shadow-sm transition-colors
                          ${node.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : ''}
                          ${node.status === 'active' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                          ${node.status === 'draft' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : ''}
                          ${node.status === 'inactive' ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : ''}
                        `} title={node.status}>
                          {(node.status === 'published' || node.status === 'active') ? <CheckCircle2 className="w-3 h-3" /> : node.status === 'draft' ? <Edit2 className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col cursor-pointer overflow-hidden" onClick={() => handleToggleSelect(node.id, !selectedIds.includes(node.id))}>
                    <div className="flex flex-wrap items-start gap-x-2 gap-y-1 mb-1.5">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {(node as any).titleBn || (node as any).title_bn || node.title}
                      </h3>
                      {nodeAcronym && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-500/30 shrink-0">{nodeAcronym}</span>
                        </div>
                      )}
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded inline-block max-w-full" title={node.slug}>{node.slug}</p>
                    </div>
                    
                    {type !== 'board' && (
                      <div className="mt-auto pt-2">
                        <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Context</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {(() => {
                            if (!node.parentId) return <span className="text-sm text-slate-500">—</span>;
                            let current = node;
                            const path: TaxonomyNode[] = [];
                            while (current.parentId) {
                              const parent = allNodes.find(n => n.id === current.parentId);
                              if (!parent) break;
                              path.unshift(parent);
                              current = parent;
                            }
                            if (path.length === 0) return <span className="text-sm text-slate-500">—</span>;

                            return path.map((p, i) => {
                              const titleToShow = (p as any).titleBn || (p as any).title_bn || p.title;
                              const label = p.type === 'board' && p.acronym ? p.acronym : titleToShow;
                              return (
                                <React.Fragment key={i}>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                                    {label}
                                  </span>
                                  {i < path.length - 1 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                                </React.Fragment>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer (Actions) */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-2xl flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(node)} className="h-8 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                      {node.status === 'active' || node.status === 'published' ? <><EyeOff className="w-3.5 h-3.5 mr-1.5" /> Deactivate</> : <><CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Activate</>}
                    </Button>
                    <div className="flex items-center gap-1">
                      {type === 'textbook' && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30" title="View Details">
                          <Link href={`/admin/textbook/${node.id}`}><Eye className="w-4 h-4" /></Link>
                        </Button>
                      )}
                      {type === 'institution' && node.slug && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30" title="View Public Page">
                          <Link href={`/institutions/${node.slug}`} target="_blank"><Eye className="w-4 h-4" /></Link>
                        </Button>
                      )}
                      {!(node as any).isHardcoded && (
                        <>
                          {type === 'board' ? (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30" title="Edit">
                              <Link href={`/admin/board/${node.id}`}><Edit2 className="w-4 h-4" /></Link>
                            </Button>
                          ) : type === 'institution' ? (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30" title="Edit">
                              <Link href={`/admin/institution/${node.id}`}><Edit2 className="w-4 h-4" /></Link>
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(node)} className="h-8 w-8 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(node)} className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              )})}
            </div>
          ) : viewMode === 'list' && groupByName ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="w-8 sm:w-12 text-center hidden sm:table-cell"></TableHead>
                    <TableHead className="pl-3 sm:pl-4">TITLE</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">COUNT</TableHead>
                    <TableHead className="hidden md:table-cell">AVAILABLE IN (CONTEXTS)</TableHead>
                    <TableHead className="text-right pr-3 sm:pr-4">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(
                    filteredNodes.reduce((acc, node) => {
                      const title = ((node as any).titleBn || (node as any).title_bn || node.title).trim();
                      if (!acc[title]) acc[title] = { title, nodes: [] };
                      acc[title].nodes.push(node);
                      return acc;
                    }, {} as Record<string, { title: string, nodes: TaxonomyNode[] }>)
                  )
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((group, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700/50">
                      <TableCell className="text-center py-2 text-slate-400 text-xs hidden sm:table-cell">{idx + 1}</TableCell>
                      <TableCell className="py-3 pl-3 sm:pl-4 font-semibold text-gray-900 dark:text-slate-200">
                        {group.title}
                        {/* Mobile inline count */}
                        <span className="sm:hidden ml-2 text-xs font-normal text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                          {group.nodes.length} items
                        </span>
                        {/* Mobile inline contexts */}
                        <div className="md:hidden mt-1.5 flex flex-wrap gap-1">
                          {group.nodes.map(n => getParentContext(n)).filter(Boolean).slice(0, 3).map((ctx, i) => (
                            <span key={i} className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 truncate max-w-[120px] text-[10px] font-normal text-slate-500 dark:text-slate-400" title={ctx || ''}>{ctx}</span>
                          ))}
                          {group.nodes.length > 3 && <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-[10px] font-normal text-slate-500 dark:text-slate-400">+{group.nodes.length - 3}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center text-indigo-600 dark:text-indigo-400 font-bold hidden sm:table-cell">
                        {group.nodes.length}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-gray-500 dark:text-slate-400 max-w-[400px] hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {group.nodes.map(n => getParentContext(n)).filter(Boolean).slice(0, 5).map((ctx, i) => (
                            <span key={i} className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 truncate max-w-[150px]" title={ctx || ''}>{ctx}</span>
                          ))}
                          {group.nodes.length > 5 && <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">+{group.nodes.length - 5} more</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right pr-3 sm:pr-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 whitespace-nowrap"
                          onClick={() => {
                            setSearchQuery(group.title);
                            setGroupByName(false);
                          }}
                        >
                          View All
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="overflow-x-auto -mx-px">
                <Table>
                  <TableHeader className="bg-gray-50/50 dark:bg-slate-800/80">
                  <TableRow className="border-b border-gray-100 dark:border-slate-700">
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={paginatedNodes.length > 0 && selectedIds.length === paginatedNodes.length}
                        onCheckedChange={handleToggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide min-w-[160px]">Title</TableHead>
                    {type !== 'board' && (
                      <TableHead className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Context</TableHead>
                    )}
                    <TableHead className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Slug</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">#</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNodes.map((node) => {
                    const nodeAcronym = (node as any).acronym || indianBoards.find(ib => ib.slug === node.slug || ib.id === node.id)?.acronym;
                    return (
                    <TableRow key={node.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700/50">
                      <TableCell className="text-center py-2 pl-3 pr-1">
                        <Checkbox
                          checked={selectedIds.includes(node.id)}
                          onCheckedChange={(checked) => handleToggleSelect(node.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell className="py-2 pr-2">
                        <div className="font-medium text-sm text-gray-900 dark:text-slate-200 line-clamp-2 inline-flex items-center gap-2">
                          {(node as any).titleBn || (node as any).title_bn || node.title}
                          {(node as any).isHardcoded && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded border border-purple-200 dark:border-purple-500/30 whitespace-nowrap uppercase tracking-wider">Hardcoded</span>
                          )}
                          {nodeAcronym && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-500/30 whitespace-nowrap">{nodeAcronym}</span>
                          )}
                        </div>
                        {node.icon && <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded mt-0.5 inline-block">Icon: {node.icon}</span>}
                        {/* Mobile: show context & slug inline */}
                        {type !== 'board' && (
                          <div className="text-xs text-gray-400 dark:text-slate-500 sm:hidden mt-0.5 line-clamp-1">{getParentContext(node)}</div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-slate-500 md:hidden font-mono mt-0.5 line-clamp-1">{node.slug}</div>
                      </TableCell>
                      {type !== 'board' && (
                        <TableCell className="py-2 text-gray-500 dark:text-slate-400 text-xs hidden sm:table-cell max-w-[160px]">
                          <span className="line-clamp-2">{getParentContext(node)}</span>
                        </TableCell>
                      )}
                      <TableCell className="py-2 text-gray-500 dark:text-slate-400 font-mono text-xs hidden md:table-cell max-w-[140px]">
                        <span className="truncate block">{node.slug || '—'}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant={node.status === 'active' || node.status === 'published' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            node.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' :
                            node.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            node.status === 'draft' ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {node.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 hidden lg:table-cell">
                        <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">#{node.orderIndex || 0}</span>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {type === 'textbook' && (
                            <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30">
                              <Link href={`/admin/textbook/${node.id}`}><Eye className="w-3.5 h-3.5" /></Link>
                            </Button>
                          )}
                          {type === 'institution' && node.slug && (
                            <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30">
                              <Link href={`/institutions/${node.slug}`} target="_blank"><Eye className="w-3.5 h-3.5" /></Link>
                            </Button>
                          )}
                          {!(node as any).isHardcoded && (
                            <>
                              {type === 'board' ? (
                                <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30" title="Edit">
                                  <Link href={`/admin/board/${node.id}`}><Edit2 className="w-3.5 h-3.5" /></Link>
                                </Button>
                              ) : type === 'institution' ? (
                                <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30" title="Edit">
                                  <Link href={`/admin/institution/${node.id}`}><Edit2 className="w-3.5 h-3.5" /></Link>
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(node)} className="h-7 w-7 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(node)} className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
              </div>
              
              {/* Pagination Controls */}
              <div className="px-3 sm:px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/30 dark:bg-slate-800/30">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  <span className="font-medium text-gray-700 dark:text-slate-300">{filteredNodes.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredNodes.length)}</span>
                  {' '}of{' '}
                  <span className="font-medium text-gray-700 dark:text-slate-300">{filteredNodes.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-2.5 text-xs bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-400 min-w-[50px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2.5 text-xs bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Edit {title.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setEditForm(prev => ({
                    ...prev,
                    title: newTitle,
                    slug: editingNode?.slug ? prev.slug : generateSlug(newTitle)
                  }));
                }}
                placeholder="Title"
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Title (Bengali) - Optional</Label>
              <Input
                value={editForm.titleBn}
                onChange={(e) => setEditForm({ ...editForm, titleBn: e.target.value })}
                placeholder="Bengali Title"
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Slug</Label>
              <Input
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                placeholder="url-friendly-slug"
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400">Updating the slug might break existing links. Use carefully.</p>
            </div>
            {type === 'subject' && (
              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300">Subject Code</Label>
                <Input
                  value={editForm.subjectCode}
                  onChange={(e) => setEditForm({ ...editForm, subjectCode: e.target.value })}
                  placeholder="e.g. 101"
                  className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-gray-200 dark:border-slate-600 dark:text-slate-300">Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editForm.title || isSaving} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Add New {title.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Title</Label>
              <Input
                value={addForm.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setAddForm(prev => ({
                    ...prev,
                    title: newTitle,
                    slug: generateSlug(newTitle)
                  }));
                }}
                placeholder={`Enter ${type} title`}
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Title (Bengali) - Optional</Label>
              <Input
                value={addForm.titleBn}
                onChange={(e) => setAddForm({ ...addForm, titleBn: e.target.value })}
                placeholder="Bengali Title"
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Slug</Label>
              <Input
                value={addForm.slug}
                onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
                placeholder="url-friendly-slug"
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-mono text-sm"
              />
            </div>
            {type === 'subject' && (
              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300">Subject Code</Label>
                <Input
                  value={addForm.subjectCode}
                  onChange={(e) => setAddForm({ ...addForm, subjectCode: e.target.value })}
                  placeholder="e.g. 101"
                  className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-gray-200 dark:border-slate-600 dark:text-slate-300">Cancel</Button>
            <Button onClick={handleSaveAdd} disabled={!addForm.title || isSaving} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white">
              {isSaving ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Duplicates Modal */}
      <Dialog open={isMergeModalOpen} onOpenChange={setIsMergeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Merge Duplicates</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {duplicateGroups.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No duplicates found! All good.</div>
            ) : (
              duplicateGroups.map((group, index) => {
                const key = `${group.title}_${group.parentId}`;
                const isMerging = mergingGroupId === key;
                return (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center bg-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-800">{group.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Found {group.nodes.length} duplicates.</p>
                      {(group as any).context && (
                        <p className="text-xs text-indigo-600 mt-1">Context: {(group as any).context}</p>
                      )}
                    </div>
                    <Button onClick={() => handleMergeGroup(group)} disabled={isMerging} variant={isMerging ? "secondary" : "default"}>
                      {isMerging ? 'Merging...' : 'Merge Group'}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMergeModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple fallback icon for header
function DatabaseZap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
      <path d="M13 13.5 9 18l4-1.5z" />
    </svg>
  )
}
