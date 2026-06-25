'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, ArrowLeft, Loader2, Copy, ExternalLink } from 'lucide-react';
import { getAssessmentsByNode, saveAssessment, deleteAssessment, AssessmentCollectionType } from '@/lib/firebase/assessment';
import { getTopicHierarchy } from '@/lib/firebase/guide';
import { AssessmentEditor } from '@/components/admin/AssessmentEditor';
import { cn } from '@/lib/utils';

interface TopicAssessmentManagerProps { topicId: string; tabType: string; nodeLevel?: 'chapter' | 'topic'; }

export function TopicAssessmentManager({ topicId, tabType, nodeLevel = 'topic' }: TopicAssessmentManagerProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});

  const mapTabToCollection = (tab: string): AssessmentCollectionType => {
    if (tab === 'practice_sets') return 'practiceSets';
    if (tab === 'quizzes') return 'quizzes';
    if (tab === 'mock_tests' || tab === 'model_test') return 'mockTests';
    if (tab === 'exams_papers') return 'examPapers';
    return 'practiceSets';
  };
  const collectionName = mapTabToCollection(tabType);

  const getFrontendUrl = (tab: string, slug: string) => {
    if (tab === 'practice_sets') return `/practice/${slug}`;
    if (tab === 'quizzes') return `/quizzes/${slug}`;
    if (tab === 'mock_tests' || tab === 'model_test') return `/mock-tests/${slug}`;
    if (tab === 'exams_papers') return `/previous-year-papers/${slug}`;
    return `/practice/${slug}`;
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const data = await getAssessmentsByNode(collectionName, nodeLevel, topicId);
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

  const resetForm = () => setEditData({ 
    title: '', 
    slug: '', 
    description: '', 
    questionIds: [], 
    difficulty: 'Medium', 
    status: 'Published', 
    topicId,
    estimatedTimeMin: 15, 
    timeLimitMin: 15, 
    passingScorePercent: 40, 
    durationMin: 60, 
    totalMarks: 100,
    boardId: hierarchy?.boardId || '', 
    classId: hierarchy?.classId || '', 
    subjectId: hierarchy?.subjectId || '', 
    textbookId: hierarchy?.textbookId || '', 
    chapterId: hierarchy?.chapterId || '' 
  });

  const handleEdit = (item: any) => { setEditData(item); setView('editor'); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    try { await deleteAssessment(collectionName, id); toast({ title: 'Deleted' }); fetchAssessments(); }
    catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const handleClone = async (test: any) => {
      try {
          const newId = `${collectionName}_${Date.now()}`;
          const newTitle = `Copy of ${test.title}`;
          const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          
          const clonedTest = {
              ...test,
              id: newId,
              title: newTitle,
              slug: newSlug,
              status: 'Draft',
              createdAt: undefined,
              updatedAt: undefined
          };
          
          await saveAssessment(collectionName, newId, clonedTest);
          toast({ title: 'Cloned successfully' });
          fetchAssessments();
      } catch(e) {
          toast({ title: 'Clone failed', variant: 'destructive' });
      }
  };

  const DIFFICULTY_COLORS: Record<string, string> = { Easy: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30', Medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', Hard: 'text-red-600 bg-red-50 dark:bg-red-900/30', Expert: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' };
  const STATUS_COLORS: Record<string, string> = { Published: 'text-emerald-700 bg-emerald-50', Draft: 'text-slate-600 bg-slate-100', Archived: 'text-slate-400 bg-slate-50' };

  const displayTab = tabType.replace(/_/g, ' ');
  const tabTitle = displayTab.endsWith('s') ? displayTab : displayTab + 's';

  // ── Editor View ──
  if (view === 'editor') {
    return (
      <div className="bg-slate-50 -m-6 p-6 min-h-screen">
        <AssessmentEditor
          initialData={editData}
          title={tabType.replace(/_/g, ' ')}
          onCancel={() => setView('list')}
          onSave={async (data) => {
            const id = data.id || `${collectionName}_${Date.now()}`;
            const slug = data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            // Ensure hierarchy is preserved if not modified by editor
            const dataToSave = {
                ...data,
                id,
                slug,
                questionIds: data.questionIds || [],
                status: data.status || 'Draft',
                difficulty: data.difficulty || 'Medium',
                topicId: data.topicId || topicId,
                boardId: data.boardId || hierarchy?.boardId || '', 
                classId: data.classId || hierarchy?.classId || '', 
                subjectId: data.subjectId || hierarchy?.subjectId || '', 
                textbookId: data.textbookId || hierarchy?.textbookId || '', 
                chapterId: data.chapterId || hierarchy?.chapterId || ''
            };
            const cleanData = JSON.parse(JSON.stringify(dataToSave));
            
            await saveAssessment(collectionName, id, cleanData);
            
            toast({ title: 'Saved successfully' });
            setView('list');
            fetchAssessments();
          }}
        />
      </div>
    );
  }

  // ── List View ──
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
                  <a href={getFrontendUrl(tabType, set.slug || set.id)} target="_blank" rel="noopener noreferrer" title="View Frontend" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  </a>
                  <button onClick={() => handleEdit(set)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button onClick={() => handleClone(set)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
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
