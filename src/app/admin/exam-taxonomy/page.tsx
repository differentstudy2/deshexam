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
  getCategories, 
  getSubcategories, 
  getExams, 
  getSubjects, 
  getChapters,
  getTopics,
  generateSlug,
  bulkImportTaxonomy,
  importCustomTaxonomy,
  addCategory,
  addSubcategory,
  addExam,
  addSubject,
  addChapter,
  addTopic,
  updateCategory,
  updateSubcategory,
  updateExam,
  updateSubject,
  updateChapter,
  updateTopic,
  deleteCategory,
  deleteSubcategory,
  deleteExam,
  deleteSubject,
  deleteChapter,
  deleteTopic
} from '@/lib/firebase/exam-taxonomy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function ExamTaxonomyPage() {
  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  
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

  // Bulk Import State (Full Taxonomy)
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [jsonImportData, setJsonImportData] = useState('');
  const [importingState, setImportingState] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, subs, exs, subjs, chaps, tops] = await Promise.all([
        getCategories(), getSubcategories(), getExams(), getSubjects(), getChapters(), getTopics()
      ]);
      setCategories(cats); setSubcategories(subs); setExams(exs); setSubjects(subjs); setChapters(chaps); setTopics(tops);
    } catch (err) {
      console.error(err);
      alert('Failed to load taxonomy data');
    } finally {
      setLoading(false);
    }
  };

  // Full Taxonomy Bulk Handlers
  const handleBulkImport = async () => {
    if (!confirm('This will wipe your current database and insert predefined taxonomy data. Continue?')) return;
    try {
      setImportingState(true);
      await bulkImportTaxonomy();
      alert('Import successful!');
      setIsBulkImportModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Import failed');
    } finally {
      setImportingState(false);
    }
  };

  const handleCustomImport = async () => {
    try {
      const data = JSON.parse(jsonImportData);
      if (!Array.isArray(data)) { alert("Invalid format: Root element must be an array of categories."); return; }
      setImportingState(true);
      await importCustomTaxonomy(data);
      alert('Custom import successful!');
      setIsBulkImportModalOpen(false);
      setJsonImportData('');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Import failed. Please check your JSON format.');
    } finally {
      setImportingState(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setJsonImportData(event.target?.result as string);
      reader.readAsText(file);
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
    setFormData({ id: item.id, name: item.name, slug: item.slug || '', icon: item.icon || '', description: item.description || '' });
    setIsModalOpen(true);
  };

  const openBulkAddModal = (type: any, parentId: string, grandParentId?: string) => {
    setBulkAddType(type); setActiveParentId(parentId); setActiveGrandparentId(grandParentId || ''); setBulkText('');
    setIsBulkAddOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (modalAction === 'add') setFormData({ ...formData, name, slug: generateSlug(name) });
    else setFormData({ ...formData, name });
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    try {
      if (modalAction === 'edit') {
        if (modalType === 'category') await updateCategory(formData.id, { name: formData.name, icon: formData.icon });
        else if (modalType === 'subcategory') await updateSubcategory(formData.id, { name: formData.name });
        else if (modalType === 'exam') await updateExam(formData.id, { name: formData.name, description: formData.description });
        else if (modalType === 'subject') await updateSubject(formData.id, { name: formData.name });
        else if (modalType === 'chapter') await updateChapter(formData.id, { name: formData.name });
        else if (modalType === 'topic') await updateTopic(formData.id, { name: formData.name });
      } else {
        if (modalType === 'category') await addCategory({ name: formData.name, slug: formData.slug, icon: formData.icon, status: 'active' });
        else if (modalType === 'subcategory') await addSubcategory({ categoryId: activeParentId, name: formData.name, slug: formData.slug, status: 'active' });
        else if (modalType === 'exam') await addExam({ categoryId: activeGrandparentId, subCategoryId: activeParentId, name: formData.name, slug: formData.slug, description: formData.description, status: 'active' });
        else if (modalType === 'subject') await addSubject({ examId: activeParentId, name: formData.name });
        else if (modalType === 'chapter') await addChapter({ subjectId: activeParentId, name: formData.name });
        else if (modalType === 'topic') await addTopic({ chapterId: activeParentId, name: formData.name });
      }
      setIsModalOpen(false); fetchData();
    } catch (e) { console.error(e); alert('Failed to save'); } finally { setIsSubmitting(false); }
  };

  const handleBulkAddSave = async () => {
    if (!bulkText.trim()) return;
    setIsSubmitting(true);
    try {
      const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l);
      for (const line of lines) {
        if (bulkAddType === 'exam') await addExam({ categoryId: activeGrandparentId, subCategoryId: activeParentId, name: line, slug: generateSlug(line), status: 'active' });
        else if (bulkAddType === 'subject') await addSubject({ examId: activeParentId, name: line });
        else if (bulkAddType === 'chapter') await addChapter({ subjectId: activeParentId, name: line });
        else if (bulkAddType === 'topic') await addTopic({ chapterId: activeParentId, name: line });
      }
      setIsBulkAddOpen(false); fetchData();
    } catch(e) { console.error(e); alert('Bulk add failed'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'category') await deleteCategory(id);
      else if (type === 'subcategory') await deleteSubcategory(id);
      else if (type === 'exam') await deleteExam(id);
      else if (type === 'subject') await deleteSubject(id);
      else if (type === 'chapter') await deleteChapter(id);
      else if (type === 'topic') await deleteTopic(id);
      fetchData();
    } catch (e) { console.error(e); alert('Delete failed'); }
  };

  const renderTree = () => {
    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Taxonomy...</div>;

    const filteredCats = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="space-y-2">
        {filteredCats.map(cat => {
          const catSubs = subcategories.filter(s => s.categoryId === cat.id);
          const isCatExpanded = expandedCats[cat.id];

          return (
            <div key={cat.id} className="border border-gray-100 rounded-lg bg-white overflow-hidden shadow-sm transition-all">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 group">
                <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleCat(cat.id)}>
                  {isCatExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <Folder className="w-5 h-5 text-blue-500 fill-blue-100" />
                  <span className="font-semibold text-gray-800">{cat.name}</span>
                  <Badge variant="secondary" className="text-[10px] ml-2">{catSubs.length} Subs</Badge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500" onClick={(e) => { e.stopPropagation(); openEditModal('category', cat); }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('category', cat.id); }}><Trash2 className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-dashed ml-2" onClick={(e) => { e.stopPropagation(); openAddModal('subcategory', cat.id); }}>
                    <Plus className="w-3 h-3 mr-1" /> Subcategory
                  </Button>
                </div>
              </div>

              {isCatExpanded && (
                <div className="pl-6 pr-3 pb-3 border-t border-gray-50 bg-gray-50/50">
                  {catSubs.length === 0 ? (
                    <div className="text-sm text-gray-400 italic py-2">No subcategories yet.</div>
                  ) : (
                    <div className="space-y-1 mt-2">
                      {catSubs.map(sub => {
                        const subExams = exams.filter(e => e.subCategoryId === sub.id);
                        const isSubExpanded = expandedSubcats[sub.id];

                        return (
                          <div key={sub.id} className="border border-gray-200 rounded bg-white">
                            <div className="flex items-center justify-between p-2.5 hover:bg-gray-50 group">
                              <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleSubcat(sub.id)}>
                                {isSubExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                <Layers className="w-4 h-4 text-purple-500" />
                                <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                                <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-200 ml-2">{subExams.length} Exams</Badge>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-500" onClick={(e) => { e.stopPropagation(); openEditModal('subcategory', sub); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('subcategory', sub.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                                <Button variant="outline" size="sm" className="h-7 text-[11px] border-dashed ml-2" onClick={(e) => { e.stopPropagation(); openBulkAddModal('exam', sub.id, cat.id); }}>
                                  <AlignLeft className="w-3 h-3 mr-1" /> Bulk
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 text-[11px] border-dashed" onClick={(e) => { e.stopPropagation(); openAddModal('exam', sub.id, cat.id); }}>
                                  <Plus className="w-3 h-3 mr-1" /> Exam
                                </Button>
                              </div>
                            </div>

                            {isSubExpanded && (
                              <div className="pl-6 pr-2 pb-2 bg-gray-50 border-t border-gray-100">
                                {subExams.length === 0 ? (
                                  <div className="text-xs text-gray-400 italic py-1.5">No exams yet.</div>
                                ) : (
                                  <div className="space-y-1 mt-1.5">
                                    {subExams.map(exam => {
                                      const examSubjects = subjects.filter(s => s.examId === exam.id);
                                      const isExamExpanded = expandedExams[exam.id];

                                      return (
                                        <div key={exam.id} className="border border-gray-200 rounded-sm bg-white">
                                          <div className="flex items-center justify-between p-2 hover:bg-gray-50 group">
                                            <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleExam(exam.id)}>
                                              {isExamExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                              <FileText className="w-4 h-4 text-emerald-500" />
                                              <span className="text-sm font-bold text-gray-800">{exam.name}</span>
                                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[9px] px-1.5 py-0 border-none ml-2">{examSubjects.length} Subj</Badge>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-500" onClick={(e) => { e.stopPropagation(); openEditModal('exam', exam); }}><Edit2 className="w-3 h-3" /></Button>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('exam', exam.id); }}><Trash2 className="w-3 h-3" /></Button>
                                              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-dashed bg-emerald-50 text-emerald-700 border-emerald-200 ml-2" onClick={(e) => { e.stopPropagation(); openBulkAddModal('subject', exam.id); }}>
                                                <AlignLeft className="w-3 h-3 mr-1" /> Bulk
                                              </Button>
                                              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-dashed bg-emerald-50 text-emerald-700 border-emerald-200" onClick={(e) => { e.stopPropagation(); openAddModal('subject', exam.id); }}>
                                                <Plus className="w-3 h-3 mr-1" /> Subject
                                              </Button>
                                            </div>
                                          </div>

                                          {isExamExpanded && (
                                            <div className="pl-6 pr-2 pb-2 bg-emerald-50/30 border-t border-gray-100">
                                              {examSubjects.length === 0 ? (
                                                <div className="text-xs text-gray-400 italic py-1">No subjects yet.</div>
                                              ) : (
                                                <div className="space-y-1 mt-1">
                                                  {examSubjects.map(subj => {
                                                    const subjChapters = chapters.filter(c => c.subjectId === subj.id);
                                                    const isSubjExpanded = expandedSubjects[subj.id];

                                                    return (
                                                      <div key={subj.id} className="border border-emerald-100 rounded-sm bg-white">
                                                        <div className="flex items-center justify-between p-1.5 hover:bg-emerald-50 group">
                                                          <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleSubject(subj.id)}>
                                                            {isSubjExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                                                            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                                                            <span className="text-[13px] font-medium text-gray-700">{subj.name}</span>
                                                          </div>
                                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-blue-500" onClick={(e) => { e.stopPropagation(); openEditModal('subject', subj); }}><Edit2 className="w-3 h-3" /></Button>
                                                            <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('subject', subj.id); }}><Trash2 className="w-3 h-3" /></Button>
                                                            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1 text-orange-600 hover:bg-orange-100 ml-2" onClick={(e) => { e.stopPropagation(); openBulkAddModal('chapter', subj.id); }}>
                                                              <AlignLeft className="w-3 h-3 mr-0.5" /> Bulk
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1 text-orange-600 hover:bg-orange-100" onClick={(e) => { e.stopPropagation(); openAddModal('chapter', subj.id); }}>
                                                              <Plus className="w-3 h-3 mr-0.5" /> Chapter
                                                            </Button>
                                                          </div>
                                                        </div>

                                                        {isSubjExpanded && (
                                                          <div className="pl-6 pr-2 pb-1.5 bg-orange-50/30 border-t border-orange-100/50">
                                                            {subjChapters.length === 0 ? (
                                                              <div className="text-[11px] text-gray-400 italic py-0.5">No chapters yet.</div>
                                                            ) : (
                                                              <div className="space-y-1 mt-1">
                                                                {subjChapters.map(chap => {
                                                                  const chapTopics = topics.filter(t => t.chapterId === chap.id);
                                                                  const isChapExpanded = expandedChapters[chap.id];

                                                                  return (
                                                                    <div key={chap.id} className="border border-orange-200 rounded-sm bg-white">
                                                                      <div className="flex items-center justify-between p-1 hover:bg-orange-50 group">
                                                                        <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleChapter(chap.id)}>
                                                                          {isChapExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                                                                          <Bookmark className="w-3 h-3 text-pink-400" />
                                                                          <span className="text-[12px] font-medium text-gray-700">{chap.name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                          <Button variant="ghost" size="icon" className="h-4 w-4 text-gray-400 hover:text-blue-500" onClick={(e) => { e.stopPropagation(); openEditModal('chapter', chap); }}><Edit2 className="w-2.5 h-2.5" /></Button>
                                                                          <Button variant="ghost" size="icon" className="h-4 w-4 text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('chapter', chap.id); }}><Trash2 className="w-2.5 h-2.5" /></Button>
                                                                          <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1 text-pink-600 hover:bg-pink-100 ml-2" onClick={(e) => { e.stopPropagation(); openBulkAddModal('topic', chap.id); }}>
                                                                            <AlignLeft className="w-2.5 h-2.5 mr-0.5" /> Bulk
                                                                          </Button>
                                                                          <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1 text-pink-600 hover:bg-pink-100" onClick={(e) => { e.stopPropagation(); openAddModal('topic', chap.id); }}>
                                                                            <Plus className="w-2.5 h-2.5 mr-0.5" /> Topic
                                                                          </Button>
                                                                        </div>
                                                                      </div>

                                                                      {isChapExpanded && (
                                                                        <div className="pl-6 pr-2 pb-1.5 bg-pink-50/30 border-t border-pink-100/50">
                                                                          {chapTopics.length === 0 ? (
                                                                            <div className="text-[10px] text-gray-400 italic py-0.5">No topics yet.</div>
                                                                          ) : (
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                              {chapTopics.map(topic => (
                                                                                <span key={topic.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600 group hover:border-red-200">
                                                                                  <button onClick={(e) => { e.stopPropagation(); openEditModal('topic', topic); }} className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-600 focus:outline-none">
                                                                                    <Edit2 className="w-2.5 h-2.5" />
                                                                                  </button>
                                                                                  {topic.name}
                                                                                  <button onClick={(e) => { e.stopPropagation(); handleDelete('topic', topic.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 focus:outline-none">
                                                                                    &times;
                                                                                  </button>
                                                                                </span>
                                                                              ))}
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  );
                                                                })}
                                                              </div>
                                                            )}
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredCats.length === 0 && (
          <div className="text-center py-8 text-gray-500">No categories found.</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taxonomy Explorer</h1>
          <p className="text-sm text-gray-500">Manage categories, subcategories, exams, subjects, chapters, and topics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsBulkImportModalOpen(true)} variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
            <DatabaseZap className="w-4 h-4 mr-2" /> Full Bulk Import
          </Button>
          <Button onClick={() => openAddModal('category')} className="bg-[#10b981] hover:bg-[#059669] text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Main Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Workspace (Tree) */}
        <div className="lg:col-span-3">
          <Card className="p-4 border-gray-200 shadow-sm rounded-xl">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search main categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200"
              />
            </div>
            {renderTree()}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-purple-50/50 border-purple-100 shadow-sm rounded-xl">
            <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-2">
              <ListPlus className="w-4 h-4" /> 6-Level Hierarchy
            </h3>
            <ul className="text-xs text-purple-700 space-y-2">
              <li className="flex items-center justify-between"><div className="flex items-center gap-2"><Folder className="w-3 h-3" /> 1. Category</div> <span className="font-semibold bg-purple-100 px-1.5 rounded-sm">{categories.length}</span></li>
              <li className="flex items-center justify-between ml-2"><div className="flex items-center gap-2"><Layers className="w-3 h-3" /> 2. Subcategory</div> <span className="font-semibold bg-purple-100 px-1.5 rounded-sm">{subcategories.length}</span></li>
              <li className="flex items-center justify-between ml-4"><div className="flex items-center gap-2"><FileText className="w-3 h-3" /> 3. Exam</div> <span className="font-semibold bg-purple-100 px-1.5 rounded-sm">{exams.length}</span></li>
              <li className="flex items-center justify-between ml-6"><div className="flex items-center gap-2"><BookOpen className="w-3 h-3" /> 4. Subject</div> <span className="font-semibold bg-purple-100 px-1.5 rounded-sm">{subjects.length}</span></li>
              <li className="flex items-center justify-between ml-8"><div className="flex items-center gap-2"><Bookmark className="w-3 h-3" /> 5. Chapter</div> <span className="font-semibold bg-purple-100 px-1.5 rounded-sm">{chapters.length}</span></li>
              <li className="flex items-center justify-between ml-10"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> 6. Topic</div> <span className="font-semibold bg-purple-100 px-1.5 rounded-sm">{topics.length}</span></li>
            </ul>
          </Card>

          <Card className="p-4 bg-white border-gray-200 shadow-sm rounded-xl">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-500" /> Database Counts
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Categories</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">{categories.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subcategories</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">{subcategories.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Exams</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">{exams.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subjects</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">{subjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chapters</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">{chapters.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Topics</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">{topics.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{modalAction} {modalType}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-500">Name</Label>
              <Input id="name" value={formData.name} onChange={handleNameChange} autoFocus />
            </div>
            {['category', 'subcategory', 'exam'].includes(modalType) && (
              <div className="grid gap-2">
                <Label htmlFor="slug" className="text-gray-500">Slug (Auto-generated)</Label>
                <Input id="slug" value={formData.slug} disabled className="bg-gray-50" />
              </div>
            )}
            {modalType === 'exam' && (
              <div className="grid gap-2">
                <Label htmlFor="desc" className="text-gray-500">Description (Optional)</Label>
                <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
            )}
            {modalType === 'category' && (
              <div className="grid gap-2">
                <Label htmlFor="icon" className="text-gray-500">Icon (Optional)</Label>
                <Input id="icon" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} placeholder="Icon name or URL" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name || isSubmitting} className="bg-[#10b981] hover:bg-[#059669]">
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Children Modal */}
      <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">Bulk Add {bulkAddType}s</DialogTitle>
            <DialogDescription>
              Paste a list of names, one per line. They will all be created instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              rows={8} 
              placeholder={`Example:\nItem 1\nItem 2\nItem 3`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="bg-white font-mono text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkAddOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkAddSave} disabled={!bulkText.trim() || isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? 'Saving...' : `Add ${bulkAddType}s`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Taxonomy Bulk Import Modal */}
      <Dialog open={isBulkImportModalOpen} onOpenChange={setIsBulkImportModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Full Taxonomy Import</DialogTitle>
            <DialogDescription>
              Wipe and replace your entire database with a nested JSON hierarchy.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="preset" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preset">Preset Data</TabsTrigger>
              <TabsTrigger value="upload">JSON Upload</TabsTrigger>
              <TabsTrigger value="paste">Paste JSON</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preset" className="p-4 bg-gray-50 rounded-lg mt-2 space-y-4">
              <p className="text-sm text-gray-600">
                Load the default DeshExam taxonomy (6-Level Hierarchy). Note: This will wipe existing taxonomy data first to avoid duplicates.
              </p>
              <Button onClick={handleBulkImport} disabled={importingState} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {importingState ? 'Importing...' : 'Load Preset Data'}
              </Button>
            </TabsContent>
            
            <TabsContent value="upload" className="p-4 bg-gray-50 rounded-lg mt-2 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="json-upload">Upload .json file</Label>
                <Input id="json-upload" type="file" accept=".json" onChange={handleFileUpload} className="bg-white" />
              </div>
              <Button onClick={handleCustomImport} disabled={!jsonImportData || importingState} className="w-full">
                {importingState ? 'Importing...' : 'Process JSON File'}
              </Button>
            </TabsContent>

            <TabsContent value="paste" className="p-4 bg-gray-50 rounded-lg mt-2 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="json-paste">Paste JSON Array</Label>
                <Textarea 
                  id="json-paste" 
                  rows={10} 
                  placeholder={'[\n  {\n    "name": "Category Name",\n    "subcategories": [\n      {\n        "name": "Subcategory Name",\n        "exams": [\n          {\n            "name": "Exam Name",\n            "subjects": [\n              {\n                "name": "Subject Name",\n                "chapters": [\n                  {\n                    "name": "Chapter Name",\n                    "topics": ["Topic 1", "Topic 2"]\n                  }\n                ]\n              }\n            ]\n          }\n        ]\n      }\n    ]\n  }\n]'}
                  value={jsonImportData}
                  onChange={(e) => setJsonImportData(e.target.value)}
                  className="bg-white font-mono text-[10px]"
                />
              </div>
              <Button onClick={handleCustomImport} disabled={!jsonImportData || importingState} className="w-full">
                {importingState ? 'Importing...' : 'Import JSON Data'}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
