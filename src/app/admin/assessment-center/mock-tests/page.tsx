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
import { MockTest } from '@/lib/assessment-types';
import { getAssessments, saveAssessment, deleteAssessment } from '@/lib/firebase/assessment';
import { QuestionPickerModal } from '@/components/assessment/QuestionPickerModal';
import { QuestionBankEntry } from '@/lib/question-bank-types';

export default function MockTestsPage() {
    const { toast } = useToast();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [mockTests, setMockTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [editData, setEditData] = useState<Partial<MockTest>>({});
    
    // Question Picker State
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        fetchMockTests();
    }, []);

    const fetchMockTests = async () => {
        setLoading(true);
        try {
            const data = await getAssessments('mockTests');
            setMockTests(data as MockTest[]);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error fetching mock tests', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditData({
            title: '',
            slug: '',
            description: '',
            questionIds: [],
            difficulty: 'Hard',
            status: 'Draft',
            durationMin: 60,
            totalMarks: 100,
            negativeMarking: 0.25,
            passingMarks: 40,
            attemptsAllowed: 1, // Strict for mock tests usually
            instructions: '',
            examRules: ''
        });
    };

    const handleEdit = (test: MockTest) => {
        setEditData(test);
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mock test?')) return;
        try {
            await deleteAssessment('mockTests', id);
            toast({ title: 'Mock test deleted' });
            fetchMockTests();
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
            const id = editData.id || `mt_${Date.now()}`;
            const slug = editData.slug || editData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            await saveAssessment('mockTests', id, {
                ...editData,
                slug,
                questionIds: editData.questionIds || [],
                status: editData.status || 'Draft',
                difficulty: editData.difficulty || 'Hard'
            });
            
            toast({ title: 'Saved successfully' });
            setView('list');
            fetchMockTests();
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
    };

    if (view === 'editor') {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setView('list')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                    <h1 className="text-2xl font-bold">{editData.id ? 'Edit Mock Test' : 'Create Mock Test'}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Test Title</label>
                                    <Input value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} placeholder="E.g., WBCS Prelims Full Mock 1" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Slug</label>
                                    <Input value={editData.slug || ''} onChange={e => setEditData({...editData, slug: e.target.value})} placeholder="wbcs-prelims-mock-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={2} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Instructions for Students</label>
                                    <Textarea value={editData.instructions || ''} onChange={e => setEditData({...editData, instructions: e.target.value})} rows={3} placeholder="Read carefully before starting..." />
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
                            <CardHeader><CardTitle>Exam Configuration</CardTitle></CardHeader>
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
                                    <Select value={editData.difficulty || 'Hard'} onValueChange={v => setEditData({...editData, difficulty: v as any})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                            <SelectItem value="Expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Duration (Min)</label>
                                        <Input type="number" value={editData.durationMin || ''} onChange={e => setEditData({...editData, durationMin: parseInt(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Total Marks</label>
                                        <Input type="number" value={editData.totalMarks || ''} onChange={e => setEditData({...editData, totalMarks: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Pass Marks</label>
                                        <Input type="number" value={editData.passingMarks || ''} onChange={e => setEditData({...editData, passingMarks: parseInt(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Negative Mark</label>
                                        <Input type="number" step="0.25" value={editData.negativeMarking ?? ''} onChange={e => setEditData({...editData, negativeMarking: parseFloat(e.target.value)})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Attempts Allowed</label>
                                    <Input type="number" value={editData.attemptsAllowed ?? 1} onChange={e => setEditData({...editData, attemptsAllowed: parseInt(e.target.value)})} />
                                    <p className="text-xs text-slate-500 mt-1">Set 0 for unlimited, 1 for strict simulation.</p>
                                </div>

                                <Button className="w-full mt-4" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                                    Save Mock Test
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
                <h1 className="text-3xl font-bold">Mock Tests</h1>
                <Button onClick={() => { resetForm(); setView('editor'); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Mock Test
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Mock Tests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6}><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                            ) : mockTests.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No mock tests found.</TableCell></TableRow>
                            ) : (
                                mockTests.map(test => (
                                    <TableRow key={test.id}>
                                        <TableCell className="font-medium">{test.title}</TableCell>
                                        <TableCell>{test.durationMin} min</TableCell>
                                        <TableCell>{test.totalMarks}</TableCell>
                                        <TableCell>{test.questionIds?.length || 0}</TableCell>
                                        <TableCell>{test.status}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(test)}><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(test.id)}><Trash2 className="h-4 w-4" /></Button>
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
