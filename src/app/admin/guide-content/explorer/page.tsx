'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  FolderTree, ChevronRight, ChevronDown, GraduationCap, Library, BookOpen, Layers, FileText,
  Plus, MoreVertical, Edit2, Loader2, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { 
  getGuideClasses, getGuideSubjectsByClass, getGuideTextbooksBySubject, getGuideChaptersByTextbook, getGuideTopicsByChapter, getTopicSections, 
  createGuideClass, createGuideSubject, createGuideTextbook, createGuideChapter,
  deleteGuideClass, deleteGuideSubject, deleteGuideTextbook, deleteGuideChapter, deleteGuideTopic
} from '@/lib/firebase/guide';

const getIcon = (type: string) => {
  switch (type) {
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
  onDeleteClick: (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => void;
};

const TreeNode = ({ node, level = 0, onAddClick, onDeleteClick }: TreeNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const isExpanding = !expanded;
    setExpanded(isExpanding);

    if (isExpanding && children === null && node.type !== 'section') {
      setLoading(true);
      try {
        let fetchedChildren: any[] = [];
        if (node.type === 'class') {
          const res = (await getGuideSubjectsByClass(node.id)) as any[];
          fetchedChildren = res.map(r => ({ id: r.id, name: r.title, type: 'subject', status: r.status || 'published' }));
        } else if (node.type === 'subject') {
          const res = (await getGuideTextbooksBySubject(node.id)) as any[];
          fetchedChildren = res.map(r => ({ id: r.id, name: r.title, type: 'textbook', status: r.status || 'published' }));
        } else if (node.type === 'textbook') {
          const res = (await getGuideChaptersByTextbook(node.id)) as any[];
          fetchedChildren = res.map(r => ({ id: r.id, name: r.title, type: 'chapter', status: r.status || 'published' }));
        } else if (node.type === 'chapter') {
          const res = (await getGuideTopicsByChapter(node.id)) as any[];
          fetchedChildren = res.map(r => ({ id: r.id, name: r.title, type: 'topic', status: r.status || 'published' }));
        } else if (node.type === 'topic') {
          const res = (await getTopicSections(node.id)) as Record<string, any>;
          fetchedChildren = Object.keys(res).map(key => ({ id: key, name: key, type: 'section', status: 'published' }));
        }
        setChildren(fetchedChildren);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    let typeName = '';
    if (node.type === 'class') typeName = 'Subject';
    else if (node.type === 'subject') typeName = 'Textbook';
    else if (node.type === 'textbook') typeName = 'Chapter';
    else return;

    onAddClick(node.id, node.type, typeName, () => {
      // Force refresh of this node
      setExpanded(false);
      setChildren(null);
      setTimeout(() => handleToggle(), 100);
    });
  };

  const handleDeleteChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(node.id, node.type, node.name, () => {
      // The parent will handle the refresh, or if root, the whole page refreshes
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
            <span className="text-slate-700 dark:text-slate-200 text-sm">
              {node.name}
            </span>
            {node.status === 'draft' && (
              <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-sm ml-2">Draft</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {node.type === 'topic' ? (
              <Link href={`/admin/guide-content/topic/${node.id}`}>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                  <Edit2 className="w-3 h-3 mr-1" /> Edit Content
                </Button>
              </Link>
            ) : node.type !== 'section' ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-slate-500"
                onClick={node.type === 'chapter' ? () => window.location.href = `/admin/guide-content/topic/create?chapterId=${node.id}` : handleAddChild}
              >
                <Plus className="w-3 h-3 mr-1" /> Add {
                  node.type === 'class' ? 'Subject' : 
                  node.type === 'subject' ? 'Textbook' : 
                  node.type === 'textbook' ? 'Chapter' : 'Topic'
                }
              </Button>
            ) : null}
            {node.type !== 'section' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={handleDeleteChild}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {expanded && children && (
          <div className="mt-1 relative before:absolute before:left-[18px] before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
            {children.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2" style={{ paddingLeft: `${(level + 1) * 24 + 8}px` }}>No items found.</div>
            ) : (
              children.map(child => (
                <TreeNode 
                  key={child.id} 
                  node={child} 
                  level={level + 1} 
                  onAddClick={onAddClick} 
                  onDeleteClick={(id, type, name, successCb) => {
                    // Pass up but intercept the success callback to refresh THIS node's children
                    onDeleteClick(id, type, name, () => {
                      setExpanded(false);
                      setChildren(null);
                      setTimeout(() => handleToggle(), 100);
                      successCb();
                    });
                  }} 
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
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Dialog State
  const [dialogState, setDialogState] = useState({ isOpen: false, parentId: '', parentType: '', typeName: '', onSuccess: () => {} });
  const [titleInput, setTitleInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, nodeId: '', nodeType: '', nodeName: '', onSuccess: () => {} });
  const [deleting, setDeleting] = useState(false);

  const fetchRoot = async () => {
    setLoading(true);
    try {
      const cls = (await getGuideClasses()) as any[];
      setClasses(cls.map(c => ({ id: c.id, name: c.title || c.name || c.id, type: 'class', status: c.status || 'published' })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoot();
  }, []);

  const handleOpenDialog = (parentId: string, parentType: string, typeName: string, onSuccess: () => void) => {
    setTitleInput('');
    setDialogState({ isOpen: true, parentId, parentType, typeName, onSuccess });
  };

  const handleSaveDialog = async () => {
    if (!titleInput.trim()) return;
    setSaving(true);
    try {
      if (dialogState.parentType === 'root') await createGuideClass(titleInput);
      else if (dialogState.parentType === 'class') await createGuideSubject(dialogState.parentId, titleInput);
      else if (dialogState.parentType === 'subject') await createGuideTextbook(dialogState.parentId, titleInput);
      else if (dialogState.parentType === 'textbook') await createGuideChapter(dialogState.parentId, titleInput);

      dialogState.onSuccess();
      setDialogState(prev => ({ ...prev, isOpen: false }));
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (nodeId: string, nodeType: string, nodeName: string, onSuccess: () => void) => {
    setDeleteDialog({ isOpen: true, nodeId, nodeType, nodeName, onSuccess });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const { nodeId, nodeType } = deleteDialog;
      if (nodeType === 'class') await deleteGuideClass(nodeId);
      else if (nodeType === 'subject') await deleteGuideSubject(nodeId);
      else if (nodeType === 'textbook') await deleteGuideTextbook(nodeId);
      else if (nodeType === 'chapter') await deleteGuideChapter(nodeId);
      else if (nodeType === 'topic') await deleteGuideTopic(nodeId);

      // If we deleted a class, we need to refresh root
      if (nodeType === 'class') {
        fetchRoot();
      }

      deleteDialog.onSuccess();
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
    } catch (e) {
      console.error(e);
      alert('Failed to delete item. It may have child items still associated.');
    } finally {
      setDeleting(false);
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
          <p className="text-sm text-slate-500 mt-1">Navigate and manage the entire 6-level curriculum tree.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleOpenDialog('root', 'root', 'Class', fetchRoot)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
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
              <div className="text-center py-8 text-slate-500">No classes found. Add some to get started!</div>
            ) : (
              classes.map(c => <TreeNode key={c.id} node={c} onAddClick={handleOpenDialog} onDeleteClick={handleOpenDelete} />)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Node Dialog */}
      <Dialog open={dialogState.isOpen} onOpenChange={(open) => !open && setDialogState(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New {dialogState.typeName}</DialogTitle>
            <DialogDescription>
              Enter the title for the new {dialogState.typeName.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder={`Enter ${dialogState.typeName.toLowerCase()} title...`}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveDialog()}
              autoFocus
            />
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
              {deleteDialog.nodeType !== 'topic' && ' Any child items may become orphaned.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
