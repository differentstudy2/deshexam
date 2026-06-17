'use client';

import React, { useEffect, useState } from 'react';
import { getTaxonomyNodesByType, TaxonomyNode, NodeType } from '@/lib/firebase/taxonomy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Layers, Calendar, Hash, Tag, Activity, Edit2, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { updateTaxonomyNode, generateSlug, deleteTaxonomyNode } from '@/lib/firebase/taxonomy';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
  }, [searchQuery, statusFilter, filterBoardId, filterClassId, filterSubjectId, filterTextbookId, filterChapterId]);

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (node.slug && node.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || node.status === statusFilter;

    // Check hierarchy matches
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

    return matchesSearch && matchesStatus && matchesBoard && matchesClass && matchesSubject && matchesTextbook && matchesChapter;
  });

  // Dynamically calculate dropdown options based on selections
  const availableBoards = allNodes.filter(n => n.type === 'board');
  const availableClasses = allNodes.filter(n => n.type === 'class' && (filterBoardId === 'all' || n.parentId === filterBoardId));
  const availableSubjects = allNodes.filter(n => n.type === 'subject' && (filterClassId === 'all' || n.parentId === filterClassId));
  const availableTextbooks = allNodes.filter(n => n.type === 'textbook' && (filterSubjectId === 'all' || n.parentId === filterSubjectId));
  const availableChapters = allNodes.filter(n => n.type === 'chapter' && (filterTextbookId === 'all' || n.parentId === filterTextbookId));

  const totalPages = Math.max(1, Math.ceil(filteredNodes.length / itemsPerPage));
  const paginatedNodes = filteredNodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all academic {title.toLowerCase()} in the database.</p>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-50 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2 shrink-0">
              <DatabaseZap className="w-5 h-5 text-emerald-500" />
              Data Table
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600 font-mono">{filteredNodes.length} items</Badge>
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search by title or slug..." 
                  className="pl-9 h-9 bg-white border-gray-200 text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <select 
                  className="h-9 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Dedicated Filters Section */}
        {['class', 'subject', 'textbook', 'chapter', 'topic'].includes(type) && (
          <div className="p-4 border-b border-gray-100 bg-gray-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

            {['class', 'subject', 'textbook', 'chapter', 'topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Board</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
                    value={filterBoardId}
                    onChange={(e) => {
                      setFilterBoardId(e.target.value);
                      setFilterClassId('all'); setFilterSubjectId('all'); setFilterTextbookId('all'); setFilterChapterId('all');
                    }}
                  >
                    <option value="all">All Boards</option>
                    {availableBoards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {['subject', 'textbook', 'chapter', 'topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Class</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
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
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {['textbook', 'chapter', 'topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Subject</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
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
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {['chapter', 'topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Textbook</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
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
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {['topic'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Chapter</Label>
                <div className="relative">
                  <select 
                    className="h-9 w-full px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
                    value={filterChapterId}
                    onChange={(e) => setFilterChapterId(e.target.value)}
                    disabled={filterTextbookId !== 'all' && availableChapters.length === 0}
                  >
                    <option value="all">All Chapters</option>
                    {availableChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">Loading data...</div>
          ) : paginatedNodes.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No records found.</div>
          ) : (
            <div className="flex flex-col">
              <div className="overflow-x-auto min-h-[400px]">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="w-[250px]">Title</TableHead>
                    {type !== 'board' && (
                      <TableHead>Hierarchy Context</TableHead>
                    )}
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNodes.map((node) => (
                    <TableRow key={node.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">
                        {node.title}
                        {node.icon && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Icon: {node.icon}</span>}
                      </TableCell>
                      {type !== 'board' && (
                        <TableCell className="text-gray-500 text-xs">
                          {getParentContext(node)}
                        </TableCell>
                      )}
                      <TableCell className="text-gray-500 font-mono text-xs">{node.slug || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={node.status === 'active' || node.status === 'published' ? 'default' : 'secondary'} 
                               className={node.status === 'active' || node.status === 'published' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : ''}>
                          {node.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Hash className="w-3 h-3" />
                          {node.orderIndex || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(node)} className="h-8 px-2 text-indigo-600 hover:bg-indigo-50">
                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(node)} className="h-8 px-2 text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              
              {/* Pagination Controls */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 rounded-b-xl">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{filteredNodes.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredNodes.length)}</span> of <span className="font-medium text-gray-900">{filteredNodes.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 text-xs bg-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center justify-center min-w-[30px] text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 text-xs bg-white"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
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
              />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input 
                value={editForm.slug} 
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} 
                placeholder="url-friendly-slug" 
              />
              <p className="text-xs text-gray-500">Updating the slug might break existing links. Use carefully.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editForm.title || isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSaving ? 'Saving...' : 'Save Changes'}
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
