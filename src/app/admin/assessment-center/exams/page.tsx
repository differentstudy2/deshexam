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
import { ExamPaper } from '@/lib/assessment-types';
import { getAssessments, saveAssessment, deleteAssessment } from '@/lib/firebase/assessment';
import { QuestionPickerModal } from '@/components/assessment/QuestionPickerModal';
import { QuestionBankEntry } from '@/lib/question-bank-types';

export default function ExamPapersPage() {
    const { toast } = useToast();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [editData, setEditData] = useState<Partial<ExamPaper>>({});
    
    // Question Picker State
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        fetchExamPapers();
    }, []);

    const fetchExamPapers = async () => {
        setLoading(true);
        try {
            const data = await getAssessments('examPapers');
            setExamPapers(data as ExamPaper[]);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error fetching exam papers', variant: 'destructive' });
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
            examName: '',
            yearId: '',
            pdfUrl: '',
            solutionsPdfUrl: '',
            answerKeyPdfUrl: '',
            verificationStatus: 'Unverified'
        });
    };

    const handleEdit = (paper: ExamPaper) => {
        setEditData(paper);
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exam paper?')) return;
        try {
            await deleteAssessment('examPapers', id);
            toast({ title: 'Exam Paper deleted' });
            fetchExamPapers();
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
            const id = editData.id || `ep_${Date.now()}`;
            const slug = editData.slug || editData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            await saveAssessment('examPapers', id, {
                ...editData,
                slug,
                questionIds: editData.questionIds || [],
                status: editData.status || 'Draft',
                difficulty: editData.difficulty || 'Hard'
            });
            
            toast({ title: 'Saved successfully' });
            setView('list');
            fetchExamPapers();
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
                    <h1 className="text-2xl font-bold">{editData.id ? 'Edit Exam Paper' : 'Create Exam Paper'}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Paper Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Paper Title</label>
                                    <Input value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} placeholder="E.g., WBCS Prelims 2024 Question Paper" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Slug</label>
                                    <Input value={editData.slug || ''} onChange={e => setEditData({...editData, slug: e.target.value})} placeholder="wbcs-prelims-2024" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Exam Name</label>
                                        <Input value={editData.examName || ''} onChange={e => setEditData({...editData, examName: e.target.value})} placeholder="WBCS" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Year</label>
                                        <Input value={editData.yearId || ''} onChange={e => setEditData({...editData, yearId: e.target.value})} placeholder="2024" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={2} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle>Interactive Questions ({editData.questionIds?.length || 0})</CardTitle>
                                <Button size="sm" onClick={() => setShowPicker(true)}>
                                    <ListPlus className="h-4 w-4 mr-2" /> Add Questions
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {(!editData.questionIds || editData.questionIds.length === 0) ? (
                                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed text-sm">
                                        Attach interactive questions if you want students to solve this paper online.
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

                        <Card>
                            <CardHeader><CardTitle>PDF Resources</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Question Paper PDF URL</label>
                                    <Input value={editData.pdfUrl || ''} onChange={e => setEditData({...editData, pdfUrl: e.target.value})} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Solutions PDF URL</label>
                                    <Input value={editData.solutionsPdfUrl || ''} onChange={e => setEditData({...editData, solutionsPdfUrl: e.target.value})} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Answer Key PDF URL</label>
                                    <Input value={editData.answerKeyPdfUrl || ''} onChange={e => setEditData({...editData, answerKeyPdfUrl: e.target.value})} placeholder="https://..." />
                                </div>
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
                                    <label className="text-sm font-medium">Verification Status</label>
                                    <Select value={editData.verificationStatus || 'Unverified'} onValueChange={v => setEditData({...editData, verificationStatus: v})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unverified">Unverified</SelectItem>
                                            <SelectItem value="Verified">Verified Official Paper</SelectItem>
                                            <SelectItem value="Memory Based">Memory Based</SelectItem>
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

                                <Button className="w-full mt-4" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                                    Save Exam Paper
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
                <h1 className="text-3xl font-bold">Exam Papers</h1>
                <Button onClick={() => { resetForm(); setView('editor'); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Exam Paper
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Previous Year / Official Papers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Exam</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Verified</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6}><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                            ) : examPapers.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No exam papers found.</TableCell></TableRow>
                            ) : (
                                examPapers.map(paper => (
                                    <TableRow key={paper.id}>
                                        <TableCell className="font-medium">{paper.title}</TableCell>
                                        <TableCell>{paper.examName}</TableCell>
                                        <TableCell>{paper.yearId}</TableCell>
                                        <TableCell>{paper.verificationStatus}</TableCell>
                                        <TableCell>{paper.status}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(paper)}><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(paper.id)}><Trash2 className="h-4 w-4" /></Button>
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
