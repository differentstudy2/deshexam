'use client';

import React, { useEffect, useState } from 'react';
import { getTaxonomyNodesByType, TaxonomyNode, NodeType } from '@/lib/firebase/taxonomy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Edit2, Trash2, Hash, FileText, CheckSquare, EyeOff, LayoutGrid, 
  ChevronRight, Filter, Database, BookOpen, Layers, Target, Eye, ChevronLeft, Calendar, Activity, PlusCircle, Search, Tag,
  ArrowUpDown, Download, SortAsc, SortDesc, ImageIcon, Globe, RefreshCw, X as XIcon
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { updateTaxonomyNode, generateSlug, deleteTaxonomyNode } from '@/lib/firebase/taxonomy';

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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title-asc' | 'title-desc'>('newest');
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
  const [addForm, setAddForm] = useState({ title: '', slug: '' });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<TaxonomyNode | null>(null);
  const [editForm, setEditForm] = useState({ title: '', slug: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all to resolve parent hierarchies easily
      const { getTaxonomyNodesByTrack } = await import('@/lib/firebase/taxonomy');
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
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
    const aTime = (a as any).createdAt?.toDate ? (a as any).createdAt.toDate().getTime() : 0;
    const bTime = (b as any).createdAt?.toDate ? (b as any).createdAt.toDate().getTime() : 0;
    return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
  });

  // Dynamically calculate dropdown options based on selections
  const availableBoards = allNodes.filter(n => n.type === 'board');
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
    setSearchQuery(''); setStatusFilter('all'); setSortBy('newest');
    setFilterHasImage('all'); setFilterHasWebsite('all');
    setFilterInstitutionType('all'); setFilterState('all'); setFilterDateRange('all');
    setFilterBoardId('all'); setFilterClassId('all'); setFilterSubjectId('all');
    setFilterTextbookId('all'); setFilterChapterId('all');
  };

  const handleEditClick = (node: TaxonomyNode) => {
    setEditingNode(node);
    setEditForm({ 
      title: node.title, 
      slug: node.slug || generateSlug(node.title) 
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingNode) return;
    setIsSaving(true);
    try {
      await updateTaxonomyNode(editingNode.id, { 
        title: editForm.title, 
        slug: editForm.slug 
      });
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
        slug: addForm.slug || generateSlug(addForm.title),
        type: type,
        track: 'academic',
        parentId: parentId,
        status: 'draft'
      });
      setIsAddModalOpen(false);
      setAddForm({ title: '', slug: '' });
      fetchData();
    } catch (error) {
      console.error("Failed to add node", error);
      alert("Failed to add new item");
    } finally {
      setIsSaving(false);
    }
  };

  const getParentContext = (node: TaxonomyNode) => {
    if (!node.parentId) return null;
    let current = node;
    const path: TaxonomyNode[] = [];
    while (current.parentId) {
      const parent = allNodes.find(n => n.id === current.parentId);
      if (!parent) break;
      path.unshift(parent);
      current = parent;
    }
    
    return path.map(p => p.title).join(' > ');
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">View and manage all academic {title.toLowerCase()} in the database.</p>
        </div>
      </div>

      <Card className="border-gray-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/50">
          <div className="flex flex-col gap-3">
            {/* Row 1: Title + count + Add + Reset */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <DatabaseZap className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-slate-200">
                  Data Table
                </CardTitle>
                <Badge variant="secondary" className="ml-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-mono text-xs">
                  {sortedNodes.length}
                </Badge>
                {activeFilterCount > 0 && (
                  <Badge className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs border-0">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetAllFilters}
                    className="h-8 text-xs text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 gap-1">
                    <XIcon className="w-3 h-3" /> Reset
                  </Button>
                )}
                <Button onClick={() => setIsAddModalOpen(true)}
                  className="h-9 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm">
                  <PlusCircle className="w-4 h-4 mr-1.5" /> Add New
                </Button>
              </div>
            </div>

            {/* Row 2: Search + Sort + Status */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
                <Input
                  placeholder="Search title, slug, address..."
                  className="pl-9 h-9 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-sm w-full text-slate-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Sort */}
              <div className="relative shrink-0">
                <select
                  className="h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title-asc">A → Z</option>
                  <option value="title-desc">Z → A</option>
                </select>
                <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
              </div>
              {/* Status */}
              <div className="relative shrink-0">
                <select
                  className="h-9 pl-3 pr-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-xs text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
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

        {/* Dedicated Filters Section */}
        {['class', 'subject', 'textbook', 'chapter', 'topic'].includes(type) && (
          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/30 dark:bg-slate-800/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">

            {['class', 'subject', 'textbook', 'chapter', 'topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Filter by Board</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
                    value={filterBoardId}
                    onChange={(e) => {
                      setFilterBoardId(e.target.value);
                      setFilterClassId('all'); setFilterSubjectId('all'); setFilterTextbookId('all'); setFilterChapterId('all');
                    }}
                  >
                    <option value="all">All Boards</option>
                    {availableBoards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}

            {['subject', 'textbook', 'chapter', 'topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Filter by Class</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
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
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}

            {['textbook', 'chapter', 'topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Filter by Subject</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
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
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}

            {['chapter', 'topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Filter by Textbook</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
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
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}

            {['topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Filter by Chapter</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
                    value={filterChapterId}
                    onChange={(e) => setFilterChapterId(e.target.value)}
                    disabled={filterTextbookId !== 'all' && availableChapters.length === 0}
                  >
                    <option value="all">All Chapters</option>
                    {availableChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400 animate-pulse">Loading data...</div>
          ) : paginatedNodes.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400">No records found.</div>
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
                  {paginatedNodes.map((node) => (
                    <TableRow key={node.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700/50">
                      <TableCell className="text-center py-2 pl-3 pr-1">
                        <Checkbox
                          checked={selectedIds.includes(node.id)}
                          onCheckedChange={(checked) => handleToggleSelect(node.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell className="py-2 pr-2">
                        <div className="font-medium text-sm text-gray-900 dark:text-slate-200 line-clamp-2">{node.title}</div>
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
                      <TableCell className="py-2 text-right pr-3">
                        <div className="flex justify-end items-center gap-0.5">
                          {type === 'textbook' && (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="View Details">
                              <Link href={`/admin/textbook/${node.id}`}><Eye className="w-4 h-4" /></Link>
                            </Button>
                          )}
                          {type === 'institution' && node.slug && (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="View Public Page">
                              <Link href={`/institutions/${node.slug}`} target="_blank"><Eye className="w-4 h-4" /></Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(node)} className="h-8 w-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Toggle Status">
                            {node.status === 'active' || node.status === 'published' ? <CheckSquare className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          {type === 'board' ? (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="Edit">
                              <Link href={`/admin/board/${node.id}`}><Edit2 className="w-4 h-4" /></Link>
                            </Button>
                          ) : type === 'institution' ? (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="Edit">
                              <Link href={`/admin/institution/${node.id}`}><Edit2 className="w-4 h-4" /></Link>
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(node)} className="h-8 w-8 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(node)} className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              <Label className="text-slate-700 dark:text-slate-300">Slug</Label>
              <Input
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                placeholder="url-friendly-slug"
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400">Updating the slug might break existing links. Use carefully.</p>
            </div>
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
              <Label className="text-slate-700 dark:text-slate-300">Slug</Label>
              <Input
                value={addForm.slug}
                onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
                placeholder="url-friendly-slug"
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-gray-200 dark:border-slate-600 dark:text-slate-300">Cancel</Button>
            <Button onClick={handleSaveAdd} disabled={!addForm.title || isSaving} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white">
              {isSaving ? 'Adding...' : 'Add Item'}
            </Button>
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
