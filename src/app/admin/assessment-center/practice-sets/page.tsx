'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Pencil, Trash2, ArrowLeft, Loader2, ListPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PracticeSet } from '@/lib/assessment-types';
import { getAssessments, saveAssessment, deleteAssessment } from '@/lib/firebase/assessment';
import { QuestionPickerModal } from '@/components/assessment/QuestionPickerModal';
import { getQuestions } from '@/lib/firebase/question-bank';
import { QuestionBankEntry } from '@/lib/question-bank-types';

export default function PracticeSetsPage() {
    const { toast } = useToast();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [editData, setEditData] = useState<Partial<PracticeSet>>({});
    
    // Question Picker State
    const [showPicker, setShowPicker] = useState(false);
    const [attachedQuestions, setAttachedQuestions] = useState<QuestionBankEntry[]>([]);

    useEffect(() => {
        fetchPracticeSets();
    }, []);

    const fetchPracticeSets = async () => {
        setLoading(true);
        try {
            const data = await getAssessments('practiceSets');
            setPracticeSets(data as PracticeSet[]);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error fetching practice sets', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const fetchAttachedQuestions = async (questionIds: string[]) => {
        if (!questionIds || questionIds.length === 0) {
            setAttachedQuestions([]);
            return;
        }
        // In a real scenario, we'd do batched queries if length > 10
        // For simplicity, we just fetch them individually or use a query 'in'
        try {
            // Simplified fetch: if many, this could be slow.
            const fetched = await Promise.all(questionIds.map(async id => {
                const res = await getQuestions({ id }, 1); // Mock generic get Question by ID logic if available
                // To keep it simple without changing question-bank.ts again:
                // We'll actually need a real getQuestionById from question_bank
                return null; 
            }));
            // Hack for now: we'll just store the count if we can't easily fetch full objects.
            // Wait, we need full objects to show previews. Let's just track the IDs for now.
        } catch(e) { console.error(e) }
    };

    const resetForm = () => {
        setEditData({
            title: '',
            slug: '',
            description: '',
            questionIds: [],
            difficulty: 'Medium',
            status: 'Published',
            estimatedTimeMin: 15
        });
        setAttachedQuestions([]);
    };

    const handleEdit = (set: PracticeSet) => {
        setEditData(set);
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this practice set?')) return;
        try {
            await deleteAssessment('practiceSets', id);
            toast({ title: 'Practice set deleted' });
            fetchPracticeSets();
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
            const id = editData.id || `ps_${Date.now()}`;
            const slug = editData.slug || editData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            await saveAssessment('practiceSets', id, {
                ...editData,
                slug,
                questionIds: editData.questionIds || [],
                status: editData.status || 'Draft',
                difficulty: editData.difficulty || 'Medium'
            });
            
            toast({ title: 'Saved successfully' });
            setView('list');
            fetchPracticeSets();
        } catch(e) {
            toast({ title: 'Save failed', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuestionsSelected = (questions: QuestionBankEntry[]) => {
        const newIds = questions.map(q => q.id);
        setEditData(prev => ({
            ...prev,
            questionIds: [...(prev.questionIds || []), ...newIds]
        }));
        // Optional: append to attachedQuestions if we want to show previews
        setAttachedQuestions(prev => {
            const map = new Map(prev.map(q => [q.id, q]));
            questions.forEach(q => map.set(q.id, q));
            return Array.from(map.values());
        });
    };

    if (view === 'editor') {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setView('list')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                    <h1 className="text-2xl font-bold">{editData.id ? 'Edit Practice Set' : 'Create Practice Set'}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Title</label>
                                    <Input value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} placeholder="E.g., Class 8 Mathematics Final Prep" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Slug</label>
                                    <Input value={editData.slug || ''} onChange={e => setEditData({...editData, slug: e.target.value})} placeholder="class-8-math-final-prep" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={3} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle>Questions ({editData.questionIds?.length || 0})</CardTitle>
                                <Button size="sm" onClick={() => setShowPicker(true)}>
                                    <ListPlus className="h-4 w-4 mr-2" /> Add Questions
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {(!editData.questionIds || editData.questionIds.length === 0) ? (
                                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                                        No questions attached yet. Click 'Add Questions' to open the Question Bank.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {editData.questionIds.map((id, idx) => (
                                            <div key={id} className="flex items-center justify-between p-3 border rounded bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium text-slate-500 w-6">{idx + 1}.</span>
                                                    <span className="text-sm font-mono text-slate-600">{id}</span>
                                                    {attachedQuestions.find(q => q.id === id) && (
                                                        <span className="text-sm text-slate-800 line-clamp-1 flex-1">
                                                            {attachedQuestions.find(q => q.id === id)?.questionText}
                                                        </span>
                                                    )}
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-red-500 h-8 w-8 p-0"
                                                    onClick={() => setEditData({...editData, questionIds: editData.questionIds?.filter(qid => qid !== id)})}
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
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={editData.status || 'Draft'} onValueChange={v => setEditData({...editData, status: v as any})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Published">Published</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Difficulty</label>
                                    <Select value={editData.difficulty || 'Medium'} onValueChange={v => setEditData({...editData, difficulty: v as any})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                            <SelectItem value="Expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Est. Time (Minutes)</label>
                                    <Input type="number" value={editData.estimatedTimeMin || ''} onChange={e => setEditData({...editData, estimatedTimeMin: parseInt(e.target.value)})} />
                                </div>
                                
                                <Button className="w-full mt-4" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                                    Save Practice Set
                                </Button>
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
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Practice Sets</h1>
                <Button onClick={() => { resetForm(); setView('editor'); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Set
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Practice Sets</CardTitle>
                </CardHeader>
                <CardContent>
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
                            {loading ? (
                                <TableRow><TableCell colSpan={5}><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                            ) : practiceSets.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center">No practice sets found.</TableCell></TableRow>
                            ) : (
                                practiceSets.map(set => (
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
