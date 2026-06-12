'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, ArrowLeft, Loader2, ListPlus, ExternalLink } from 'lucide-react';
import { getAssessmentsByTopic, saveAssessment, deleteAssessment, AssessmentCollectionType } from '@/lib/firebase/assessment';
import { getTopicHierarchy } from '@/lib/firebase/guide';
import { QuestionPickerModal } from '@/components/assessment/QuestionPickerModal';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TopicAssessmentManagerProps {
  topicId: string;
  tabType: string;
}

export function TopicAssessmentManager({ topicId, tabType }: TopicAssessmentManagerProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hierarchy, setHierarchy] = useState<any>(null);
  
  const [editData, setEditData] = useState<any>({});
  const [showPicker, setShowPicker] = useState(false);
  const [attachedQuestions, setAttachedQuestions] = useState<QuestionBankEntry[]>([]);

  const mapTabToCollection = (tab: string): AssessmentCollectionType => {
      if (tab === 'practice_sets') return 'practiceSets';
      if (tab === 'quizzes') return 'quizzes';
      if (tab === 'mock_tests' || tab === 'model_test') return 'mockTests';
      if (tab === 'exams_papers') return 'examPapers';
      return 'practiceSets';
  };
  
  const collectionName = mapTabToCollection(tabType);

  const fetchTopicAssessments = async () => {
    setLoading(true);
    try {
      const data = await getAssessmentsByTopic(collectionName, topicId);
      setAssessments(data);
    } catch (error) {
      toast({ title: 'Error fetching assessments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicAssessments();
    setView('list');
    getTopicHierarchy(topicId).then(setHierarchy);
  }, [topicId, tabType]);

  const resetForm = () => {
    setEditData({
      title: '',
      slug: '',
      description: '',
      questionIds: [],
      difficulty: 'Medium',
      status: 'Published',
      topicId: topicId,
      // Generic defaults
      estimatedTimeMin: 15,
      timeLimitMin: 15,
      passingScorePercent: 40,
      durationMin: 60,
      totalMarks: 100
    });
    setAttachedQuestions([]);
  };

  const handleEdit = (item: any) => {
    setEditData(item);
    setView('editor');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
        await deleteAssessment(collectionName, id);
        toast({ title: 'Deleted successfully' });
        fetchTopicAssessments();
    } catch(e) {
        toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!editData.title) {
        toast({ title: 'Title is required', variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    try {
        const id = editData.id || `${collectionName}_${Date.now()}`;
        const slug = editData.slug || editData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        await saveAssessment(collectionName, id, {
            ...editData,
            slug,
            questionIds: editData.questionIds || [],
            status: editData.status || 'Draft',
            difficulty: editData.difficulty || 'Medium',
            topicId: topicId,
            // Attach hierarchy metadata
            boardId: hierarchy?.boardId || '',
            classId: hierarchy?.classId || '',
            subjectId: hierarchy?.subjectId || '',
            textbookId: hierarchy?.textbookId || '',
            chapterId: hierarchy?.chapterId || '',
        });
        
        toast({ title: 'Saved successfully' });
        setView('list');
        fetchTopicAssessments();
    } catch(e) {
        toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleQuestionsSelected = (questions: QuestionBankEntry[]) => {
    const newIds = questions.map(q => q.id);
    setEditData((prev: any) => ({
        ...prev,
        questionIds: [...(prev.questionIds || []), ...newIds]
    }));
  };

  if (view === 'editor') {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setView('list')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                    <h3 className="text-xl font-bold">{editData.id ? 'Edit' : 'Create'} {tabType.replace('_', ' ')}</h3>
                </div>
                <Button className="bg-[#107c41] hover:bg-[#0b5c30]" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                    Save Assessment
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} placeholder="E.g., Chapter 1 Mock Test" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={3} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle>Attached Questions ({editData.questionIds?.length || 0})</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => setShowPicker(true)}>
                                <ListPlus className="h-4 w-4 mr-2" /> Add Questions
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {(!editData.questionIds || editData.questionIds.length === 0) ? (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                                    No questions attached yet.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {editData.questionIds.map((id: string, idx: number) => (
                                        <div key={id} className="flex items-center justify-between p-3 border rounded bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-slate-500 w-6">{idx + 1}.</span>
                                                <span className="text-sm font-mono text-slate-600">{id}</span>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500 h-8 w-8 p-0"
                                                onClick={() => setEditData({...editData, questionIds: editData.questionIds?.filter((qid: string) => qid !== id)})}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Status</Label>
                                <Select value={editData.status || 'Draft'} onValueChange={v => setEditData({...editData, status: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Published">Published</SelectItem>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Difficulty</Label>
                                <Select value={editData.difficulty || 'Medium'} onValueChange={v => setEditData({...editData, difficulty: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {collectionName === 'practiceSets' && (
                                <div>
                                    <Label>Est. Time (Minutes)</Label>
                                    <Input type="number" value={editData.estimatedTimeMin || ''} onChange={e => setEditData({...editData, estimatedTimeMin: parseInt(e.target.value)})} />
                                </div>
                            )}
                            {collectionName === 'quizzes' && (
                                <div>
                                    <Label>Time Limit (Minutes)</Label>
                                    <Input type="number" value={editData.timeLimitMin || ''} onChange={e => setEditData({...editData, timeLimitMin: parseInt(e.target.value)})} />
                                </div>
                            )}
                            {collectionName === 'mockTests' && (
                                <div>
                                    <Label>Duration (Minutes)</Label>
                                    <Input type="number" value={editData.durationMin || ''} onChange={e => setEditData({...editData, durationMin: parseInt(e.target.value)})} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <QuestionPickerModal 
                open={showPicker} 
                onOpenChange={setShowPicker} 
                onSelectQuestions={handleQuestionsSelected}
                preSelectedIds={editData.questionIds || []}
            />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 border rounded-lg">
          <div>
              <h3 className="text-lg font-semibold capitalize">{tabType.replace('_', ' ')}s for this Topic</h3>
              <p className="text-sm text-slate-500">Manage assessments attached specifically to this topic.</p>
          </div>
          <div className="flex flex-wrap gap-2">
              <Button onClick={() => { resetForm(); setView('editor'); }} className="bg-[#107c41] hover:bg-[#0b5c30]">
                  <PlusCircle className="w-4 h-4 mr-2" /> Create New
              </Button>
          </div>
      </div>

      <div className="space-y-4">
          {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#107c41]" /></div>
          ) : assessments.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-500">
                  No {tabType.replace('_', ' ')}s found for this topic yet.
              </div>
          ) : (
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assessments.map(set => (
                        <TableRow key={set.id}>
                            <TableCell className="font-medium">{set.title}</TableCell>
                            <TableCell>{set.questionIds?.length || 0}</TableCell>
                            <TableCell>{set.difficulty}</TableCell>
                            <TableCell>{set.status}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(set)}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(set.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          )}
      </div>
    </div>
  );
}
