'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FolderTree, ChevronRight, ChevronDown, GraduationCap, Library, BookOpen, Layers, FileText,
  Plus, MoreVertical, Edit2, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { getGuideClasses, getGuideSubjectsByClass, getGuideTextbooksBySubject, getGuideChaptersByTextbook, getGuideTopicsByChapter, getTopicSections, createGuideClass, createGuideSubject, createGuideTextbook, createGuideChapter } from '@/lib/firebase/guide';

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

const TreeNode = ({ node, level = 0 }: { node: any; level?: number }) => {
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

  const handleAddChild = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let typeName = '';
    if (node.type === 'class') typeName = 'Subject';
    else if (node.type === 'subject') typeName = 'Textbook';
    else if (node.type === 'textbook') typeName = 'Chapter';
    else return; // Topic creation is done via its own page

    const title = window.prompt(`Enter title for the new ${typeName}:`);
    if (!title || title.trim() === '') return;

    try {
      if (node.type === 'class') await createGuideSubject(node.id, title);
      else if (node.type === 'subject') await createGuideTextbook(node.id, title);
      else if (node.type === 'textbook') await createGuideChapter(node.id, title);
      
      // Force refresh by collapsing and expanding
      setExpanded(false);
      setChildren(null);
      setTimeout(() => handleToggle(), 100);
    } catch (e) {
      console.error(e);
      alert('Failed to create node');
    }
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

          <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: level === 0 ? 1 : undefined }}>
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
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {expanded && children && (
          <div className="mt-1 relative before:absolute before:left-[18px] before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
            {children.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2" style={{ paddingLeft: `${(level + 1) * 24 + 8}px` }}>No items found.</div>
            ) : (
              children.map(child => <TreeNode key={child.id} node={child} level={level + 1} />)
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

      const handleAddClass = async () => {
    const title = window.prompt("Enter title for the new Class:");
    if (!title || title.trim() === '') return;
    try {
      await createGuideClass(title);
      fetchRoot();
    } catch (e) {
      console.error(e);
      alert('Failed to create Class');
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
          <Button variant="outline" onClick={handleAddClass}>
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
              classes.map(c => <TreeNode key={c.id} node={c} />)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
