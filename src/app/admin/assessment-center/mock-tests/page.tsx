'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Pencil, Trash2, Loader2, Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MockTest } from '@/lib/assessment-types';
import { getAssessments, saveAssessment, deleteAssessment } from '@/lib/firebase/assessment';
import { submitReview, bulkSubmitReviews } from '@/lib/firebase/reviews';
import { AssessmentEditor } from '@/components/admin/AssessmentEditor';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Star, MessageSquare, Wand2, Copy as CopyIcon } from 'lucide-react';

export default function MockTestsPage() {
    const { toast } = useToast();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [mockTests, setMockTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState<Partial<MockTest>>({});
    
    // Add Review Modal State
    const [reviewTest, setReviewTest] = useState<MockTest | null>(null);
    const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, content: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Bulk Import Modal State
    const [bulkImportTest, setBulkImportTest] = useState<MockTest | null>(null);
    const [bulkJson, setBulkJson] = useState('');
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

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

    const handleClone = async (test: MockTest) => {
        try {
            const newId = `mt_${Date.now()}`;
            const newTitle = `Copy of ${test.title}`;
            const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            const clonedTest: MockTest = {
                ...test,
                id: newId,
                title: newTitle,
                slug: newSlug,
                status: 'Draft',
                createdAt: undefined,
                updatedAt: undefined
            };
            
            await saveAssessment('mockTests', newId, clonedTest);
            toast({ title: 'Mock test cloned successfully' });
            fetchMockTests();
        } catch(e) {
            toast({ title: 'Clone failed', variant: 'destructive' });
        }
    };

    const handleAddReview = async () => {
        if (!reviewTest) return;
        if (!reviewForm.name || !reviewForm.content) {
            toast({ title: 'Please fill all fields', variant: 'destructive' });
            return;
        }

        setIsSubmittingReview(true);
        try {
            const fakeUserId = `admin_gen_${Date.now()}`;
            const fakeAvatar = reviewForm.name.charAt(0).toUpperCase();
            
            await submitReview(
                reviewTest.id,
                fakeUserId,
                reviewForm.name,
                fakeAvatar,
                reviewForm.rating,
                reviewForm.content
            );
            
            toast({ title: 'Review added successfully!' });
            setReviewTest(null);
            setReviewForm({ name: '', rating: 5, content: '' });
            fetchMockTests(); // Refresh stats in table
        } catch(e) {
            console.error(e);
            toast({ title: 'Failed to add review', variant: 'destructive' });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleBulkImport = async () => {
        if (!bulkImportTest) return;
        if (!bulkJson.trim()) {
            toast({ title: 'Please paste the JSON output', variant: 'destructive' });
            return;
        }

        try {
            const parsedData = JSON.parse(bulkJson);
            if (!Array.isArray(parsedData)) {
                toast({ title: 'Invalid format. Must be a JSON array.', variant: 'destructive' });
                return;
            }

            // Validate schema roughly
            const isValid = parsedData.every(item => item.name && item.rating && item.content);
            if (!isValid) {
                toast({ title: 'Invalid JSON schema. Missing name, rating, or content in some items.', variant: 'destructive' });
                return;
            }

            setIsBulkSubmitting(true);
            await bulkSubmitReviews(bulkImportTest.id, parsedData);
            
            toast({ title: `Successfully imported ${parsedData.length} reviews!` });
            setBulkImportTest(null);
            setBulkJson('');
            fetchMockTests();
        } catch (e) {
            console.error(e);
            toast({ title: 'Invalid JSON. Please ensure it is perfectly formatted.', variant: 'destructive' });
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    const getAiPrompt = (title: string) => {
        return `Act as 10 different students who just completed a mock test titled '${title}'. Write 10 realistic reviews for this specific test. Mix the languages (70% Bengali, 30% English). Give realistic ratings between 4 and 5. Return ONLY a valid JSON array in this exact format, with no markdown formatting or extra text: \n\n[\n  { "name": "Student Name", "rating": 5, "content": "The review text..." }\n]`;
    };

    if (view === 'editor') {
        return (
            <AssessmentEditor
                initialData={editData}
                title="Mock Test"
                onCancel={() => setView('list')}
                onSave={async (data) => {
                    const id = data.id || `mt_${Date.now()}`;
                    const slug = data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    
                    const dataToSave = {
                        ...data,
                        id,
                        slug,
                        questionIds: data.questionIds || [],
                        status: data.status || 'Draft',
                        difficulty: data.difficulty || 'Hard'
                    };
                    const cleanData = JSON.parse(JSON.stringify(dataToSave));
                    
                    await saveAssessment('mockTests', id, cleanData);
                    
                    toast({ title: 'Saved successfully' });
                    setView('list');
                    fetchMockTests();
                }}
            />
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Mock Tests</h1>
                <Button onClick={() => { setEditData({}); setView('editor'); }}>
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
                                                <Button variant="ghost" size="sm" asChild title="View on Site">
                                                    <Link href={`/mock-tests/${test.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setReviewTest(test)} title="Add Review">
                                                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setBulkImportTest(test)} title="AI Bulk Import">
                                                    <Wand2 className="h-4 w-4 text-purple-500" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(test)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleClone(test)} title="Clone"><Copy className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(test.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Custom Review Modal */}
            <Dialog open={!!reviewTest} onOpenChange={(open) => !open && setReviewTest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Custom Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-500">
                            Adding a review for: <strong>{reviewTest?.title}</strong>
                        </p>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Student Name</label>
                            <input 
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Amit Kumar"
                                value={reviewForm.name}
                                onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                        key={star} 
                                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                                        className={`p-1 ${reviewForm.rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                                    >
                                        <Star className="w-6 h-6 fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Review Text</label>
                            <textarea 
                                className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Write the review content..."
                                value={reviewForm.content}
                                onChange={e => setReviewForm({...reviewForm, content: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewTest(null)}>Cancel</Button>
                        <Button onClick={handleAddReview} disabled={isSubmittingReview}>
                            {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Submit Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Bulk Import Modal */}
            <Dialog open={!!bulkImportTest} onOpenChange={(open) => !open && setBulkImportTest(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-600">
                            <Wand2 className="w-5 h-5" /> AI Bulk Import Reviews
                        </DialogTitle>
                        <DialogDescription>
                            Use ChatGPT or Claude to generate realistic reviews for <strong>{bulkImportTest?.title}</strong> in bulk.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">1. Copy this Prompt to ChatGPT</label>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                        if (bulkImportTest) {
                                            navigator.clipboard.writeText(getAiPrompt(bulkImportTest.title));
                                            toast({ title: 'Prompt Copied!' });
                                        }
                                    }}
                                >
                                    <CopyIcon className="w-3 h-3 mr-2" /> Copy Prompt
                                </Button>
                            </div>
                            <div className="text-xs text-slate-500 bg-white p-3 rounded border border-slate-200 whitespace-pre-wrap">
                                {bulkImportTest ? getAiPrompt(bulkImportTest.title) : ''}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">2. Paste JSON Output Here</label>
                            <textarea 
                                className="flex min-h-[200px] w-full rounded-xl border border-slate-300 bg-transparent px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y font-mono text-xs"
                                placeholder="[\n  {\n    &#34;name&#34;: &#34;Student Name&#34;,\n    &#34;rating&#34;: 5,\n    &#34;content&#34;: &#34;Review...&#34;\n  }\n]"
                                value={bulkJson}
                                onChange={e => setBulkJson(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkImportTest(null)}>Cancel</Button>
                        <Button onClick={handleBulkImport} disabled={isBulkSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                            {isBulkSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Validate & Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
