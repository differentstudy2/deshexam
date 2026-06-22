'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTaxonomyNodes, createTaxonomyNode, updateTaxonomyNode, deleteTaxonomyNode, TaxonomyType, TAXONOMY_COLLECTIONS } from '@/lib/firebase/question-bank';
import { TaxonomyNode } from '@/lib/question-bank-types';
import { PlusCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

const taxonomyTabs: { id: TaxonomyType; label: string }[] = [
  { id: 'board', label: 'Boards' },
  { id: 'class', label: 'Classes' },
  { id: 'subject', label: 'Subjects' },
  { id: 'textbook', label: 'Textbooks' },
  { id: 'chapter', label: 'Chapters' },
  { id: 'topic', label: 'Topics' },
  { id: 'exam', label: 'Exams' },
  { id: 'year', label: 'Years' },
  { id: 'tag', label: 'Tags' },
];

export default function QuestionBankCategoriesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TaxonomyType>('board');
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TaxonomyNode>>({});

  const fetchData = async (type: TaxonomyType) => {
    setLoading(true);
    try {
      const questionData = await getTaxonomyNodes(type) as TaxonomyNode[];
      
      let guideData: any[] = [];
      if (['board', 'class', 'subject', 'textbook', 'chapter', 'topic'].includes(type)) {
          const guideColRef = collection(db, `guide_${type}s`);
          const guideSnap = await getDocs(guideColRef);
          guideData = guideSnap.docs.map(d => {
              const data = d.data();
              return { 
                  id: d.id, 
                  name: data.title || data.name || d.id, 
                  slug: data.slug || d.id,
                  isGuide: true,
                  ...data 
              } as unknown as TaxonomyNode;
          });
      }

      const combined = [...guideData, ...questionData];
      const uniqueMap = new Map();
      combined.forEach(item => {
          // questionData items will overwrite guideData items with the same id
          uniqueMap.set(item.id, item); 
      });
      
      setNodes(Array.from(uniqueMap.values()));
    } catch (e) {
      toast({ title: 'Error fetching taxonomy', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const handleSave = async () => {
    try {
      if (editData.id && isEditing) {
        // Assume update if already exists in nodes (simplification)
        const exists = nodes.find(n => n.id === editData.id);
        if (exists) {
            await updateTaxonomyNode(activeTab, editData.id, editData);
            toast({ title: 'Updated successfully' });
        } else {
            await createTaxonomyNode(activeTab, editData as any);
            toast({ title: 'Created successfully' });
        }
      }
      setIsEditing(false);
      fetchData(activeTab);
    } catch (error) {
      toast({ title: 'Error saving node', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Taxonomy & Categories</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaxonomyType)} className="space-y-4">
        <TabsList>
          {taxonomyTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="capitalize">{activeTab} List</CardTitle>
            <Button onClick={() => { setEditData({ id: '', name: '', slug: '' }); setIsEditing(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing && (
              <div className="mb-6 space-y-4 border p-4 rounded bg-slate-50 dark:bg-slate-900">
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="ID (slug-like)" value={editData.id || ''} onChange={(e) => setEditData({...editData, id: e.target.value})} disabled={!!nodes.find(n => n.id === editData.id)} />
                  <Input placeholder="Name" value={editData.name || ''} onChange={(e) => {
                    const newName = e.target.value;
                    const newSlug = slugify(newName);
                    const isNew = !nodes.find(n => n.id === editData.id);
                    setEditData({
                      ...editData, 
                      name: newName, 
                      slug: newSlug,
                      ...(isNew ? { id: newSlug } : {})
                    });
                  }} />
                  <Input placeholder="Slug" value={editData.slug || ''} onChange={(e) => setEditData({...editData, slug: e.target.value})} />
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">SEO Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-500">Custom Title</label>
                      <Input placeholder="Custom Title Override" value={editData.seo?.customTitle || ''} onChange={(e) => setEditData({...editData, seo: {...editData.seo, customTitle: e.target.value}})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-500">Focus Keyword</label>
                      <Input placeholder="Focus Keyword" value={editData.seo?.focusKeyword || ''} onChange={(e) => setEditData({...editData, seo: {...editData.seo, focusKeyword: e.target.value}})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm text-slate-500">Custom Description</label>
                      <Input placeholder="Custom Meta Description" value={editData.seo?.customDescription || ''} onChange={(e) => setEditData({...editData, seo: {...editData.seo, customDescription: e.target.value}})} />
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <input 
                        type="checkbox" 
                        id="useCustomSeo" 
                        checked={editData.seo?.useCustomSeo || false} 
                        onChange={(e) => setEditData({...editData, seo: {...editData.seo, useCustomSeo: e.target.checked}})} 
                      />
                      <label htmlFor="useCustomSeo" className="text-sm text-slate-700 dark:text-slate-300">Force Custom SEO (Disable Dynamic Fallback)</label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full">Save</Button>
              </div>
            )}
          
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4}><Loader2 className="animate-spin" /></TableCell></TableRow>
                ) : nodes.length === 0 ? (
                  <TableRow><TableCell colSpan={4}>No data found.</TableCell></TableRow>
                ) : (
                  nodes.map(node => (
                    <TableRow key={node.id}>
                      <TableCell>{node.id}</TableCell>
                      <TableCell className="font-medium">
                          {node.name}
                          {(node as any).isGuide && <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase font-semibold">Guide</span>}
                      </TableCell>
                      <TableCell>{node.slug}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditData(node); setIsEditing(true); }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                                await deleteTaxonomyNode(activeTab, node.id);
                                fetchData(activeTab);
                            }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
