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
import { Star, MessageSquare, Wand2, Copy as CopyIcon, CheckSquare, MoreVertical, Unlock, Lock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

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

    // Bulk Edit State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [bulkEditData, setBulkEditData] = useState<Partial<MockTest>>({});

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

    const handleToggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(mockTests.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(testId => testId !== id));
        }
    };

    const handleBulkEditSubmit = async () => {
        if (selectedIds.length === 0) return;
        
        // Remove undefined/empty fields from bulkEditData to avoid overwriting existing valid data with empty strings
        const cleanedBulkData: any = {};
        if (bulkEditData.status) cleanedBulkData.status = bulkEditData.status;
        if (bulkEditData.difficulty) cleanedBulkData.difficulty = bulkEditData.difficulty;
        if (bulkEditData.accessType) cleanedBulkData.accessType = bulkEditData.accessType;
        if (bulkEditData.price !== undefined && bulkEditData.price !== null && bulkEditData.price.toString() !== '') cleanedBulkData.price = Number(bulkEditData.price);

        if (Object.keys(cleanedBulkData).length === 0) {
            toast({ title: 'No changes selected for bulk edit', variant: 'destructive' });
            return;
        }

        setIsBulkEditing(true);
        try {
            // Update all selected tests concurrently
            await Promise.all(selectedIds.map(async (id) => {
                const existingTest = mockTests.find(t => t.id === id);
                if (existingTest) {
                    await saveAssessment('mockTests', id, { ...existingTest, ...cleanedBulkData });
                }
            }));
            
            toast({ title: `Successfully updated ${selectedIds.length} mock tests!` });
            setIsBulkEditModalOpen(false);
            setBulkEditData({});
            setSelectedIds([]);
            fetchMockTests();
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to update mock tests', variant: 'destructive' });
        } finally {
            setIsBulkEditing(false);
        }
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
                    <div className="flex items-center justify-between">
                        <CardTitle>All Mock Tests</CardTitle>
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                                <span className="text-sm font-medium text-indigo-800">{selectedIds.length} selected</span>
                                <Button size="sm" variant="outline" className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-100" onClick={() => setIsBulkEditModalOpen(true)}>
                                    <CheckSquare className="w-4 h-4 mr-2" /> Bulk Edit
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox 
                                        checked={mockTests.length > 0 && selectedIds.length === mockTests.length}
                                        onCheckedChange={(checked) => handleToggleSelectAll(!!checked)}
                                    />
                                </TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Pricing</TableHead>
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
                                    <TableRow key={test.id} className={selectedIds.includes(test.id) ? "bg-indigo-50/50" : ""}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedIds.includes(test.id)}
                                                onCheckedChange={(checked) => handleToggleSelect(test.id, !!checked)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{test.title}</TableCell>
                                        <TableCell>{test.durationMin} min</TableCell>
                                        <TableCell>{test.totalMarks}</TableCell>
                                        <TableCell>{test.questionIds?.length || 0}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${test.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : test.status === 'Archived' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {test.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                {test.accessType === 'free' ? (
                                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                                ) : (
                                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                                )}
                                                <span>₹ {test.accessType === 'free' ? '0' : (test.price || 0)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/mock-tests/${test.slug}`} target="_blank" className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> View on Site
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(test)} className="cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleClone(test)} className="cursor-pointer">
                                                        <Copy className="mr-2 h-4 w-4" /> Clone
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setReviewTest(test)} className="cursor-pointer">
                                                        <MessageSquare className="mr-2 h-4 w-4 text-indigo-500" /> Add Review
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setBulkImportTest(test)} className="cursor-pointer">
                                                        <Wand2 className="mr-2 h-4 w-4 text-purple-500" /> AI Bulk Import
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(test.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
            {/* Bulk Edit Modal */}
            <Dialog open={isBulkEditModalOpen} onOpenChange={setIsBulkEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Edit Mock Tests ({selectedIds.length} selected)</DialogTitle>
                        <DialogDescription>
                            Leave fields empty if you don't want to change them.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select 
                                    value={bulkEditData.status || ''} 
                                    onValueChange={(val: any) => setBulkEditData(prev => ({ ...prev, status: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Published">Published</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Difficulty</label>
                                <Select 
                                    value={bulkEditData.difficulty || ''} 
                                    onValueChange={(val: any) => setBulkEditData(prev => ({ ...prev, difficulty: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Access Type</label>
                                <Select 
                                    value={bulkEditData.accessType || ''} 
                                    onValueChange={(val: any) => setBulkEditData(prev => ({ ...prev, accessType: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="subscription">Subscription</SelectItem>
                                        <SelectItem value="one_time">One Time Purchase</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (INR)</label>
                                <Input 
                                    type="number"
                                    placeholder="Leave empty for no change"
                                    value={bulkEditData.price ?? ''}
                                    onChange={(e) => setBulkEditData(prev => ({ ...prev, price: e.target.value ? Number(e.target.value) : undefined }))}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsBulkEditModalOpen(false); setBulkEditData({}); }}>Cancel</Button>
                        <Button onClick={handleBulkEditSubmit} disabled={isBulkEditing}>
                            {isBulkEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Apply Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
