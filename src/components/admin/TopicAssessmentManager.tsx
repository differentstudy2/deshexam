'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, ArrowLeft, Loader2, ListPlus, ExternalLink } from 'lucide-react';
import { getAssessmentsByNode, saveAssessment, deleteAssessment, AssessmentCollectionType } from '@/lib/firebase/assessment';
import { getTopicHierarchy } from '@/lib/firebase/guide';
import { QuestionPickerModal } from '@/components/assessment/QuestionPickerModal';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TopicAssessmentManagerProps { topicId: string; tabType: string; nodeLevel?: 'chapter' | 'topic'; }

export function TopicAssessmentManager({ topicId, tabType, nodeLevel = 'topic' }: TopicAssessmentManagerProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [showPicker, setShowPicker] = useState(false);

  const mapTabToCollection = (tab: string): AssessmentCollectionType => {
    if (tab === 'practice_sets') return 'practiceSets';
    if (tab === 'quizzes') return 'quizzes';
    if (tab === 'mock_tests' || tab === 'model_test') return 'mockTests';
    if (tab === 'exams_papers') return 'examPapers';
    return 'practiceSets';
  };
  const collectionName = mapTabToCollection(tabType);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      console.log(`[DEBUG] TopicAssessmentManager fetching for tabType=${tabType}, collectionName=${collectionName}, topicId=${topicId}, nodeLevel=${nodeLevel}`);
      const data = await getAssessmentsByNode(collectionName, nodeLevel, topicId);
      console.log(`[DEBUG] Fetched data:`, data);
      setAssessments(data);
    } catch (e) { 
      console.error(e);
      toast({ title: 'Error fetching', variant: 'destructive' }); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAssessments();
    setView('list');
    getTopicHierarchy(topicId).then(setHierarchy);
  }, [topicId, tabType]);

  const resetForm = () => setEditData({ title: '', slug: '', description: '', questionIds: [], difficulty: 'Medium', status: 'Published', topicId, estimatedTimeMin: 15, timeLimitMin: 15, passingScorePercent: 40, durationMin: 60, totalMarks: 100 });

  const handleEdit = (item: any) => { setEditData(item); setView('editor'); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    try { await deleteAssessment(collectionName, id); toast({ title: 'Deleted' }); fetchAssessments(); }
    catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const handleSave = async () => {
    if (!editData.title) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      const id = editData.id || `${collectionName}_${Date.now()}`;
      const slug = editData.slug || editData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await saveAssessment(collectionName, id, { ...editData, slug, questionIds: editData.questionIds || [], status: editData.status || 'Draft', difficulty: editData.difficulty || 'Medium', topicId, boardId: hierarchy?.boardId || '', classId: hierarchy?.classId || '', subjectId: hierarchy?.subjectId || '', textbookId: hierarchy?.textbookId || '', chapterId: hierarchy?.chapterId || '' });
      toast({ title: 'Saved!' });
      setView('list');
      fetchAssessments();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setIsSaving(false); }
  };

  const DIFFICULTY_COLORS: Record<string, string> = { Easy: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30', Medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', Hard: 'text-red-600 bg-red-50 dark:bg-red-900/30', Expert: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' };
  const STATUS_COLORS: Record<string, string> = { Published: 'text-emerald-700 bg-emerald-50', Draft: 'text-slate-600 bg-slate-100', Archived: 'text-slate-400 bg-slate-50' };

  // ── Editor View ──
  if (view === 'editor') {
    return (
      <div className="space-y-3 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button onClick={() => setView('list')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex-1">{editData.id ? 'Edit' : 'Create'} {tabType.replace(/_/g, ' ')}</h3>
          <button onClick={handleSave} disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold rounded-full bg-[#107c41] text-white flex items-center gap-1.5 disabled:opacity-60">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>

        {/* Basic Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Basic Details</p>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Title *</label>
            <Input className="h-9 text-sm" placeholder="e.g. Chapter 1 Mock Test" value={editData.title || ''} onChange={e => setEditData({ ...editData, title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Description</label>
            <Textarea className="text-sm resize-none" rows={2} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Settings</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Status</label>
              <select className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm" value={editData.status || 'Draft'} onChange={e => setEditData({ ...editData, status: e.target.value })}>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Difficulty</label>
              <select className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm" value={editData.difficulty || 'Medium'} onChange={e => setEditData({ ...editData, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option><option>Expert</option>
              </select>
            </div>
            {collectionName === 'practiceSets' && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Est. Time (min)</label>
                <Input type="number" className="h-9 text-sm" value={editData.estimatedTimeMin || ''} onChange={e => setEditData({ ...editData, estimatedTimeMin: parseInt(e.target.value) })} />
              </div>
            )}
            {collectionName === 'quizzes' && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Time Limit (min)</label>
                <Input type="number" className="h-9 text-sm" value={editData.timeLimitMin || ''} onChange={e => setEditData({ ...editData, timeLimitMin: parseInt(e.target.value) })} />
              </div>
            )}
            {collectionName === 'mockTests' && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Duration (min)</label>
                <Input type="number" className="h-9 text-sm" value={editData.durationMin || ''} onChange={e => setEditData({ ...editData, durationMin: parseInt(e.target.value) })} />
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Questions ({editData.questionIds?.length || 0})</p>
            <button onClick={() => setShowPicker(true)} className="px-3 py-1 text-xs font-semibold rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <ListPlus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {(!editData.questionIds || editData.questionIds.length === 0) ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400">
              No questions attached yet. Tap "Add" to pick questions.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[30vh] overflow-y-auto">
              {editData.questionIds.map((id: string, idx: number) => (
                <div key={id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <span className="flex-1 text-xs text-slate-600 dark:text-slate-400 font-mono truncate">{id}</span>
                  <button onClick={() => setEditData({ ...editData, questionIds: editData.questionIds?.filter((qid: string) => qid !== id) })} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <QuestionPickerModal open={showPicker} onOpenChange={setShowPicker} onSelectQuestions={(qs: QuestionBankEntry[]) => { const newIds = qs.map(q => q.id); setEditData((p: any) => ({ ...p, questionIds: [...(p.questionIds || []), ...newIds] })); }} preSelectedIds={editData.questionIds || []} />
      </div>
    );
  }

  // ── List View ──
  const displayTab = tabType.replace(/_/g, ' ');
  const tabTitle = displayTab.endsWith('s') ? displayTab : displayTab + 's';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 capitalize">{tabTitle}</p>
        <button onClick={() => { resetForm(); setView('editor'); }}
          className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#107c41] text-white flex items-center gap-1.5">
          <PlusCircle className="w-3.5 h-3.5" /> Create New
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#107c41]" /></div>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-sm text-slate-400 capitalize">No {tabTitle} yet</p>
          <button onClick={() => { resetForm(); setView('editor'); }} className="mt-3 px-4 py-2 text-xs font-semibold rounded-full bg-[#107c41] text-white">Create First</button>
        </div>
      ) : (
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {assessments.map(set => (
            <div key={set.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{set.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", DIFFICULTY_COLORS[set.difficulty] || DIFFICULTY_COLORS.Medium)}>{set.difficulty}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_COLORS[set.status] || STATUS_COLORS.Draft)}>{set.status}</span>
                    <span className="text-[10px] text-slate-400">{set.questionIds?.length || 0} Qs</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(set)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(set.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
