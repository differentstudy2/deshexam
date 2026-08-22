'use client';

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  BookOpen, 
  Bookmark,
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreVertical,
  Layers,
  Search,
  DatabaseZap,
  Edit2,
  Trash2,
  ListPlus,
  BarChart3,
  AlignLeft
} from 'lucide-react';
import { 
  getTaxonomyNodesByTrack,
  createTaxonomyNode,
  updateTaxonomyNode,
  deleteTaxonomyNode,
  generateSlug,
  TaxonomyNode
} from '@/lib/firebase/taxonomy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function ExamTaxonomyPage() {
  // Data States
  const [categories, setCategories] = useState<TaxonomyNode[]>([]);
  const [subcategories, setSubcategories] = useState<TaxonomyNode[]>([]);
  const [exams, setExams] = useState<TaxonomyNode[]>([]);
  const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
  const [chapters, setChapters] = useState<TaxonomyNode[]>([]);
  const [topics, setTopics] = useState<TaxonomyNode[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded nodes state
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [expandedSubcats, setExpandedSubcats] = useState<Record<string, boolean>>({});
  const [expandedExams, setExpandedExams] = useState<Record<string, boolean>>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Modal State (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'subcategory' | 'exam' | 'subject' | 'chapter' | 'topic'>('category');
  const [modalAction, setModalAction] = useState<'add' | 'edit'>('add');
  const [activeParentId, setActiveParentId] = useState<string>('');
  const [activeGrandparentId, setActiveGrandparentId] = useState<string>(''); 
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '', description: '', id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk Add Children State
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkAddType, setBulkAddType] = useState<'exam'|'subject'|'chapter'|'topic'>('exam');
  const [bulkText, setBulkText] = useState('');

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allNodes = await getTaxonomyNodesByTrack('competitive');
      
      setCategories(allNodes.filter(n => n.type === 'category'));
      setSubcategories(allNodes.filter(n => n.type === 'subcategory'));
      setExams(allNodes.filter(n => n.type === 'exam'));
      setSubjects(allNodes.filter(n => n.type === 'subject'));
      setChapters(allNodes.filter(n => n.type === 'chapter'));
      setTopics(allNodes.filter(n => n.type === 'topic'));
      
    } catch (err) {
      console.error(err);
      alert('Failed to load taxonomy data');
    } finally {
      setLoading(false);
    }
  };

  // Tree Toggles
  const toggleCat = (id: string) => setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSubcat = (id: string) => setExpandedSubcats(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleExam = (id: string) => setExpandedExams(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSubject = (id: string) => setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleChapter = (id: string) => setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));

  // Form Handlers
  const openAddModal = (type: any, parentId?: string, grandParentId?: string) => {
    setModalType(type); setModalAction('add'); setActiveParentId(parentId || ''); setActiveGrandparentId(grandParentId || '');
    setFormData({ name: '', slug: '', icon: '', description: '', id: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (type: any, item: any) => {
    setModalType(type); setModalAction('edit');
    setFormData({ 
      id: item.id, 
      name: item.title, 
      slug: item.slug || generateSlug(item.title), 
      icon: item.icon || '', 
      description: item.description || '' 
    });
    setIsModalOpen(true);
  };

  const openBulkAddModal = (type: any, parentId: string, grandParentId?: string) => {
    setBulkAddType(type); setActiveParentId(parentId); setActiveGrandparentId(grandParentId || ''); setBulkText('');
    setIsBulkAddOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      name, 
      slug: (modalAction === 'edit' && prev.id) ? prev.slug : generateSlug(name)
    }));
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    try {
      if (modalAction === 'edit') {
        await updateTaxonomyNode(formData.id, {
          title: formData.name,
          icon: formData.icon,
          description: formData.description,
        });
      } else {
        await createTaxonomyNode({
          title: formData.name,
          slug: formData.slug,
          icon: formData.icon,
          description: formData.description,
          type: modalType,
          track: 'competitive',
          parentId: activeParentId || null,
          rootId: activeGrandparentId || null,
          status: 'active'
        });
      }
      setIsModalOpen(false); 
      fetchData();
    } catch (e) { console.error(e); alert('Failed to save'); } finally { setIsSubmitting(false); }
  };

  const handleBulkAddSave = async () => {
    if (!bulkText.trim()) return;
    setIsSubmitting(true);
    try {
      const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l);
      for (const line of lines) {
        await createTaxonomyNode({
          title: line,
          slug: generateSlug(line),
          type: bulkAddType,
          track: 'competitive',
          parentId: activeParentId || null,
          rootId: activeGrandparentId || null,
          status: 'active'
        });
      }
      setIsBulkAddOpen(false); 
      fetchData();
    } catch(e) { console.error(e); alert('Bulk add failed'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item AND all of its sub-items?')) return;
    try {
      await deleteTaxonomyNode(id);
      fetchData();
    } catch (e: any) { 
      console.error(e); 
      alert(`Delete failed: ${e?.message || "Unknown error"}`); 
    }
  };

  const renderTree = () => {
    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Taxonomy...</div>;

    const filteredCats = categories.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="space-y-4">
        {filteredCats.map((cat) => {
          const catSubs = subcategories.filter(s => s.parentId === cat.id);
          const isCatExpanded = expandedCats[cat.id];

          return (
            <div key={cat.id} className="border border-gray-100 rounded-lg bg-white overflow-hidden shadow-sm transition-all">
              
              {/* Category Header */}
              <div className="group flex items-center justify-between p-3 mb-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => toggleCat(cat.id)}
                >
                  <div className="w-5 flex justify-center text-emerald-500">
                    {isCatExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <div className="p-1.5 bg-emerald-100 rounded-md">
                    <FolderOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-gray-800">{cat.title}</span>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-emerald-600 hover:bg-emerald-50" onClick={() => openAddModal('subcategory', cat.id)}>
                    <Plus className="w-4 h-4 mr-1" /> Subcategory
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); openEditModal('category', cat); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Subcategories */}
              {isCatExpanded && (
                <div className="pl-6 pr-4 pb-4 space-y-2 relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                  {catSubs.length === 0 ? (
                    <div className="text-sm text-gray-400 pl-6 italic py-2">No subcategories.</div>
                  ) : catSubs.map(sub => {
                    const subExams = exams.filter(e => e.parentId === sub.id);
                    const isSubExpanded = expandedSubcats[sub.id];

                    return (
                      <div key={sub.id} className="relative z-10 pl-4">
                        <div className="group flex items-center justify-between p-2.5 rounded-r-lg bg-emerald-50/50 border-y border-r border-transparent border-l-4 border-l-emerald-400 hover:border-emerald-200 transition-all">
                          <div 
                            className="flex items-center gap-2 cursor-pointer flex-1"
                            onClick={() => toggleSubcat(sub.id)}
                          >
                            <div className="w-4 flex justify-center text-emerald-600">
                              {isSubExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                            <Folder className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-emerald-900 text-sm">{sub.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-indigo-600 hover:bg-indigo-50" onClick={() => openAddModal('exam', sub.id, cat.id)}>
                              <Plus className="w-3 h-3 mr-1" /> Exam
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50" onClick={() => openBulkAddModal('exam', sub.id, cat.id)} title="Bulk Add Exams">
                              <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); openEditModal('subcategory', sub); }}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Exams */}
                        {isSubExpanded && (
                          <div className="pl-6 pt-2 pb-2 space-y-2 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-indigo-100">
                            {subExams.length === 0 ? (
                              <div className="text-xs text-gray-400 pl-4 italic py-1">No exams.</div>
                            ) : subExams.map(exam => {
                              const examSubjects = subjects.filter(s => s.parentId === exam.id);
                              const isExamExpanded = expandedExams[exam.id];

                              return (
                                <div key={exam.id} className="relative z-10 pl-2">
                                  <div className="group flex items-center justify-between p-2 rounded-r-lg bg-indigo-50/50 border-l-4 border-l-indigo-400 hover:bg-indigo-50 transition-colors">
                                    <div 
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                      onClick={() => toggleExam(exam.id)}
                                    >
                                      <div className="w-4 flex justify-center text-indigo-500">
                                        {isExamExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                      </div>
                                      <Bookmark className="w-4 h-4 text-indigo-500" />
                                      <span className="font-medium text-indigo-900 text-sm">{exam.title}</span>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-amber-600 hover:bg-amber-50" onClick={() => openAddModal('subject', exam.id)}>
                                        <Plus className="w-3 h-3 mr-1" /> Subject
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600 hover:bg-blue-50" onClick={() => openBulkAddModal('subject', exam.id)}>
                                        <AlignLeft className="w-3 h-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-600 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); openEditModal('exam', exam); }}>
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Subjects */}
                                  {isExamExpanded && (
                                    <div className="pl-5 pt-1.5 pb-1.5 space-y-1.5 relative before:absolute before:left-[10px] before:top-0 before:bottom-0 before:w-px before:bg-amber-100">
                                      {examSubjects.length === 0 ? (
                                        <div className="text-xs text-gray-400 pl-4 italic">No subjects.</div>
                                      ) : examSubjects.map(subj => {
                                        const subjChapters = chapters.filter(c => c.parentId === subj.id);
                                        const isSubjectExpanded = expandedSubjects[subj.id];

                                        return (
                                          <div key={subj.id} className="relative z-10 pl-2">
                                            <div className="group flex items-center justify-between p-1.5 rounded-r-lg bg-amber-50/50 border-l-4 border-l-amber-400 hover:bg-amber-50 transition-colors">
                                              <div 
                                                className="flex items-center gap-2 cursor-pointer flex-1"
                                                onClick={() => toggleSubject(subj.id)}
                                              >
                                                <div className="w-3 flex justify-center text-amber-500">
                                                  {isSubjectExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                </div>
                                                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                                <span className="text-amber-900 text-xs font-medium">{subj.title}</span>
                                              </div>
                                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-rose-600 hover:bg-rose-50" onClick={() => openAddModal('chapter', subj.id)}>
                                                  <Plus className="w-2.5 h-2.5 mr-0.5" /> Chapter
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 text-blue-600 hover:bg-blue-50" onClick={() => openBulkAddModal('chapter', subj.id)}>
                                                  <AlignLeft className="w-3 h-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 text-amber-600 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); openEditModal('subject', subj); }}>
                                                  <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(subj.id); }}>
                                                  <Trash2 className="w-2.5 h-2.5" />
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Chapters */}
                                            {isSubjectExpanded && (
                                              <div className="pl-4 pt-1 pb-1 space-y-1 relative before:absolute before:left-[10px] before:top-0 before:bottom-0 before:w-px before:bg-rose-100">
                                                {subjChapters.length === 0 ? (
                                                  <div className="text-[10px] text-gray-400 pl-3 italic">No chapters.</div>
                                                ) : subjChapters.map(chap => {
                                                  const chapTopics = topics.filter(t => t.parentId === chap.id);
                                                  const isChapterExpanded = expandedChapters[chap.id];

                                                  return (
                                                    <div key={chap.id} className="relative z-10 pl-1.5">
                                                      <div className="group flex items-center justify-between p-1 rounded-r-md bg-rose-50/50 border-l-4 border-l-rose-400 hover:bg-rose-50 transition-colors">
                                                        <div 
                                                          className="flex items-center gap-1.5 cursor-pointer flex-1"
                                                          onClick={() => toggleChapter(chap.id)}
                                                        >
                                                          <div className="w-3 flex justify-center text-rose-500">
                                                            {isChapterExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                          </div>
                                                          <Layers className="w-3 h-3 text-rose-600" />
                                                          <span className="text-rose-900 text-[11px]">{chap.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] text-sky-600 hover:bg-sky-50" onClick={() => openAddModal('topic', chap.id)}>
                                                            <Plus className="w-2 h-2 mr-0.5" /> Topic
                                                          </Button>
                                                          <Button variant="ghost" size="icon" className="h-5 w-5 text-blue-600 hover:bg-blue-50" onClick={() => openBulkAddModal('topic', chap.id)}>
                                                            <AlignLeft className="w-3 h-3" />
                                                          </Button>
                                                          <Button variant="ghost" size="icon" className="h-5 w-5 text-amber-600 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); openEditModal('chapter', chap); }}>
                                                            <Edit2 className="w-3 h-3" />
                                                          </Button>
                                                          <Button variant="ghost" size="icon" className="h-5 w-5 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(chap.id); }}>
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                          </Button>
                                                        </div>
                                                      </div>

                                                      {/* Topics */}
                                                      {isChapterExpanded && (
                                                        <div className="pl-3 pt-1 space-y-0.5 relative before:absolute before:left-[10px] before:top-0 before:bottom-0 before:w-px before:bg-sky-100">
                                                          {chapTopics.length === 0 ? (
                                                            <div className="text-[9px] text-gray-400 pl-2 italic">No topics.</div>
                                                          ) : chapTopics.map(topic => (
                                                            <div key={topic.id} className="relative z-10 pl-1.5 group flex items-center justify-between hover:bg-sky-50 rounded-r-md py-0.5 pr-1 border-l-2 border-transparent hover:border-l-sky-300">
                                                              <div className="flex items-center gap-1.5 flex-1">
                                                                <FileText className="w-2.5 h-2.5 text-sky-500" />
                                                                <span className="text-sky-900 text-[10px]">{topic.title}</span>
                                                              </div>
                                                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                                                                <Button variant="ghost" size="icon" className="h-4 w-4 text-amber-600 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); openEditModal('topic', topic); }}>
                                                                  <Edit2 className="w-2 h-2" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-4 w-4 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(topic.id); }}>
                                                                  <Trash2 className="w-2 h-2" />
                                                                </Button>
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            Exam Taxonomy (Universal API)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage the 6-level hierarchy for competitive exams and test prep.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => openAddModal('category')} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add Main Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Tree Section */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Search main categories..." 
              className="pl-10 h-12 bg-white border-gray-200 rounded-xl shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {renderTree()}
        </div>

        {/* Right Sidebar Section */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm sticky top-6">
            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Folder className="w-4 h-4 text-indigo-500" />
                6-Level Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="text-xs text-slate-600 space-y-3 font-medium">
                <li className="flex flex-col gap-1 border-l-2 border-emerald-400 pl-3">
                  <span className="flex items-center gap-2 text-emerald-700"><FolderOpen className="w-3 h-3" /> 1. Category</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. Government Jobs</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-emerald-300 pl-3 ml-2">
                  <span className="flex items-center gap-2 text-emerald-600"><Folder className="w-3 h-3" /> 2. Subcategory</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. SSC, Banking, Railways</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-indigo-400 pl-3 ml-4">
                  <span className="flex items-center gap-2 text-indigo-700"><Bookmark className="w-3 h-3" /> 3. Exam</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. SSC CGL, IBPS PO</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-amber-400 pl-3 ml-6">
                  <span className="flex items-center gap-2 text-amber-700"><BookOpen className="w-3 h-3" /> 4. Subject</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. Mathematics, English</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-rose-400 pl-3 ml-8">
                  <span className="flex items-center gap-2 text-rose-700"><Layers className="w-3 h-3" /> 5. Chapter</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. Arithmetic, Grammar</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-sky-400 pl-3 ml-10">
                  <span className="flex items-center gap-2 text-sky-700"><FileText className="w-3 h-3" /> 6. Topic</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. Profit & Loss, Tenses</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Database Counts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><FolderOpen className="w-3 h-3 text-emerald-500" /> Categories</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{categories.length}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><Folder className="w-3 h-3 text-emerald-400" /> Subcategories</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{subcategories.length}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><Bookmark className="w-3 h-3 text-indigo-500" /> Exams</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{exams.length}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><BookOpen className="w-3 h-3 text-amber-500" /> Subjects</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{subjects.length}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><Layers className="w-3 h-3 text-rose-500" /> Chapters</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{chapters.length}</span></li>
                <li className="flex items-center justify-between"><div className="flex items-center gap-2"><FileText className="w-3 h-3 text-sky-500" /> Topics</div> <span className="font-mono bg-gray-100 px-1.5 rounded">{topics.length}</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modalAction === 'add' ? `Add New ${modalType}` : `Edit ${modalType}`}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name / Title</Label>
              <Input value={formData.name} onChange={handleNameChange} placeholder="e.g. Mathematics" />
            </div>
            {modalType === 'category' && (
              <div className="grid gap-2">
                <Label>Icon (optional)</Label>
                <Input value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} placeholder="lucide icon name" />
              </div>
            )}
            {modalType === 'exam' && (
              <div className="grid gap-2">
                <Label>Description (optional)</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Exam details..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name || isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSubmitting ? 'Saving...' : modalAction === 'add' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Modal */}
      <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Add {bulkAddType}s</DialogTitle>
            <DialogDescription>Paste multiple names separated by commas or new lines. This will instantly create all of them inside the parent folder.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder="Maths\nScience\nEnglish" className="min-h-[150px]" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkAddOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkAddSave} disabled={isSubmitting || !bulkText.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSubmitting ? 'Saving...' : 'Bulk Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
