'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Pencil, Trash2, Loader2, Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PracticeSet } from '@/lib/assessment-types';
import { getAssessments, saveAssessment, deleteAssessment } from '@/lib/firebase/assessment';
import { submitReview, bulkSubmitReviews } from '@/lib/firebase/reviews';
import { getTaxonomyNodesByTrack, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { AssessmentEditor } from '@/components/admin/AssessmentEditor';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Star, MessageSquare, Wand2, Copy as CopyIcon, CheckSquare, MoreVertical, Unlock, Lock, ImageIcon, LayoutGrid, List, Search, Printer } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export default function PracticeSetsPage() {
    const { toast } = useToast();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState<Partial<PracticeSet>>({});
    
    // Add Review Modal State
    const [reviewTest, setReviewTest] = useState<PracticeSet | null>(null);
    const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, content: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Bulk Import Modal State
    const [bulkImportTest, setBulkImportTest] = useState<PracticeSet | null>(null);
    const [bulkJson, setBulkJson] = useState('');
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

    // Bulk Edit State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [bulkEditData, setBulkEditData] = useState<Partial<PracticeSet>>({});

    // Display Mode State
    const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('list');

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [accessFilter, setAccessFilter] = useState('all');

    // Taxonomy States
    const [boards, setBoards] = useState<TaxonomyNode[]>([]);
    const [classes, setClasses] = useState<TaxonomyNode[]>([]);
    const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
    const [exams, setExams] = useState<TaxonomyNode[]>([]);
    
    // Taxonomy Filter State
    const [boardFilter, setBoardFilter] = useState('all');
    const [classFilter, setClassFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [examFilter, setExamFilter] = useState('all');

    const filteredPracticeSets = practiceSets.filter(test => {
        const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
        const matchesAccess = accessFilter === 'all' || test.accessType === accessFilter;
        
        const testAny = test as any;
        const matchesBoard = boardFilter === 'all' || testAny.boardId === boardFilter;
        const matchesClass = classFilter === 'all' || testAny.classId === classFilter;
        const matchesSubject = subjectFilter === 'all' || testAny.subjectId === subjectFilter;
        const matchesExam = examFilter === 'all' || testAny.examId === examFilter || (Array.isArray(testAny.examIds) && testAny.examIds.includes(examFilter));

        return matchesSearch && matchesStatus && matchesAccess && matchesBoard && matchesClass && matchesSubject && matchesExam;
    });

    useEffect(() => {
        fetchPracticeSets();
    }, []);

    const fetchPracticeSets = async () => {
        setLoading(true);
        try {
            const data = await getAssessments('practiceSets');
            setPracticeSets(data as PracticeSet[]);

            // Fetch taxonomies
            const allAcademic = await getTaxonomyNodesByTrack('academic');
            setBoards(allAcademic.filter((n: any) => n.type === 'board'));
            setClasses(allAcademic.filter((n: any) => n.type === 'class'));
            setSubjects(allAcademic.filter((n: any) => n.type === 'subject'));

            const allCompetitive = await getTaxonomyNodesByTrack('competitive');
            setExams(allCompetitive.filter((n: any) => n.type === 'exam'));
        } catch (error) {
            console.error(error);
            toast({ title: 'Error fetching practice sets', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (test: PracticeSet) => {
        setEditData(test);
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this practice set?')) return;
        try {
            await deleteAssessment('practiceSets', id);
            toast({ title: 'Mock test deleted' });
            fetchPracticeSets();
        } catch(e) {
            toast({ title: 'Delete failed', variant: 'destructive' });
        }
    };

    const handleClone = async (test: PracticeSet) => {
        try {
            const newId = `mt_${Date.now()}`;
            const newTitle = `Copy of ${test.title}`;
            const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            const clonedTest: PracticeSet = {
                ...test,
                id: newId,
                title: newTitle,
                slug: newSlug,
                status: 'Draft',
                createdAt: undefined,
                updatedAt: undefined
            };
            
            await saveAssessment('practiceSets', newId, clonedTest);
            toast({ title: 'Mock test cloned successfully' });
            fetchPracticeSets();
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
            fetchPracticeSets(); // Refresh stats in table
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
            fetchPracticeSets();
        } catch (e) {
            console.error(e);
            toast({ title: 'Invalid JSON. Please ensure it is perfectly formatted.', variant: 'destructive' });
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    const getAiPrompt = (title: string) => {
        return `Act as 10 different students who just completed a practice set titled '${title}'. Write 10 realistic reviews for this specific test. Mix the languages (70% Bengali, 30% English). Give realistic ratings between 4 and 5. Return ONLY a valid JSON array in this exact format, with no markdown formatting or extra text: \n\n[\n  { "name": "Student Name", "rating": 5, "content": "The review text..." }\n]`;
    };

    const handleToggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(practiceSets.map(t => t.id));
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
                const existingTest = practiceSets.find(t => t.id === id);
                if (existingTest) {
                    await saveAssessment('practiceSets', id, { ...existingTest, ...cleanedBulkData });
                }
            }));
            
            toast({ title: `Successfully updated ${selectedIds.length} practice sets!` });
            setIsBulkEditModalOpen(false);
            setBulkEditData({});
            setSelectedIds([]);
            fetchPracticeSets();
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to update practice sets', variant: 'destructive' });
        } finally {
            setIsBulkEditing(false);
        }
    };

    if (view === 'editor') {
        return (
            <AssessmentEditor
                initialData={editData}
                title="Practice Set"
                collectionPath="practice-sets"
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
                    
                    await saveAssessment('practiceSets', id, cleanData);
                    
                    toast({ title: 'Saved successfully' });
                    setView('list');
                    fetchPracticeSets();
                }}
            />
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Practice Sets</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={() => setDisplayMode('list')} 
                            className={`p-2 rounded-md transition-all ${displayMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setDisplayMode('grid')} 
                            className={`p-2 rounded-md transition-all ${displayMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    <Button onClick={() => { setEditData({}); setView('editor'); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Practice Set
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search practice sets by title..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={accessFilter} onValueChange={setAccessFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Access Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Access</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="subscription">Subscription</SelectItem>
                            <SelectItem value="one_time">One Time</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Taxonomy Filters */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Select value={boardFilter} onValueChange={setBoardFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Board" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Boards</SelectItem>
                            {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={examFilter} onValueChange={setExamFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Exam" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Exams</SelectItem>
                            {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Practice Sets</CardTitle>
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">{selectedIds.length} selected</span>
                                <Button size="sm" variant="outline" className="bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50" onClick={() => setIsBulkEditModalOpen(true)}>
                                    <CheckSquare className="w-4 h-4 mr-2" /> Bulk Edit
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {displayMode === 'list' && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox 
                                        checked={practiceSets.length > 0 && selectedIds.length === practiceSets.length}
                                        onCheckedChange={(checked) => handleToggleSelectAll(!!checked)}
                                    />
                                </TableHead>
                                <TableHead className="w-[60px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Pricing</TableHead>
                                <TableHead>Reviews</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={9}><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                            ) : filteredPracticeSets.length === 0 ? (
                                <TableRow><TableCell colSpan={9} className="text-center">No practice sets found matching your filters.</TableCell></TableRow>
                            ) : (
                                filteredPracticeSets.map(test => (
                                    <TableRow key={test.id} className={selectedIds.includes(test.id) ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedIds.includes(test.id)}
                                                onCheckedChange={(checked) => handleToggleSelect(test.id, !!checked)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {test.thumbnail ? (
                                                <img src={test.thumbnail} alt={test.title} className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
                                            ) : (
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                    <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{test.title}</TableCell>
                                        <TableCell>{(test as any).durationMin || '-'} min</TableCell>
                                        <TableCell>{(test as any).totalMarks || '-'}</TableCell>
                                        <TableCell>{test.questionIds?.length || 0}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${test.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : test.status === 'Archived' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {test.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                                                {test.accessType === 'free' ? (
                                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                                ) : (
                                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                                )}
                                                <span>₹ {test.accessType === 'free' ? '0' : (test.price || 0)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-sm font-medium">
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                    {test.reviewStats?.averageRating || 0}
                                                </div>
                                                <span className="text-xs text-slate-500">{test.reviewStats?.totalReviews || 0} reviews</span>
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
                                                        <Link href={`/practice/${test.slug}`} target="_blank" className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> View on Site
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(test)} className="cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleClone(test)} className="cursor-pointer">
                                                        <Copy className="mr-2 h-4 w-4" /> Clone
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(`/admin/assessment-center/practice-sets/${test.id}/answer-sheet`, '_blank')} className="cursor-pointer">
                                                        <Printer className="mr-2 h-4 w-4" /> Print Answer Sheet
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
                    )}
                    
                    {displayMode === 'grid' && (
                        <div className="mt-4">
                            {loading ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" /></div>
                            ) : filteredPracticeSets.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">No practice sets found matching your filters.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredPracticeSets.map(test => (
                                        <div key={test.id} className={`group relative flex flex-col bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${selectedIds.includes(test.id) ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-200 dark:border-slate-800'}`}>
                                            {/* Top Image Area */}
                                            <div className="relative h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                                                {test.thumbnail ? (
                                                    <img src={test.thumbnail} alt={test.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                                )}
                                                
                                                {/* Checkbox */}
                                                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded p-1 shadow-sm">
                                                    <Checkbox 
                                                        checked={selectedIds.includes(test.id)}
                                                        onCheckedChange={(checked) => handleToggleSelect(test.id, !!checked)}
                                                    />
                                                </div>

                                                {/* Status Badge */}
                                                <div className="absolute top-3 right-3">
                                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm ${test.status === 'Published' ? 'bg-emerald-500 text-white' : test.status === 'Archived' ? 'bg-slate-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                        {test.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 pr-6">{test.title}</h3>
                                                
                                                {/* Meta Info */}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 mb-4 mt-auto">
                                                    <div><span className="font-medium text-slate-700 dark:text-slate-300">{(test as any).durationMin || '-'}</span> min</div>
                                                    <div><span className="font-medium text-slate-700 dark:text-slate-300">{(test as any).totalMarks || '-'}</span> marks</div>
                                                    <div><span className="font-medium text-slate-700 dark:text-slate-300">{test.questionIds?.length || 0}</span> Qs</div>
                                                </div>

                                                {/* Footer Line: Price & Actions */}
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 text-sm">
                                                        {test.accessType === 'free' ? (
                                                            <Unlock className="w-4 h-4 text-emerald-600" />
                                                        ) : (
                                                            <Lock className="w-4 h-4 text-amber-600" />
                                                        )}
                                                        <span>₹ {test.accessType === 'free' ? '0' : (test.price || 0)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm font-medium ml-3">
                                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                        {test.reviewStats?.averageRating || 0}
                                                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">({test.reviewStats?.totalReviews || 0})</span>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/practice/${test.slug}`} target="_blank" className="cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4" /> View on Site
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEdit(test)} className="cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleClone(test)} className="cursor-pointer">
                                                                <Copy className="mr-2 h-4 w-4" /> Clone
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => window.open(`/admin/assessment-center/practice-sets/${test.id}/answer-sheet`, '_blank')} className="cursor-pointer">
                                                                <Printer className="mr-2 h-4 w-4" /> Print Answer Sheet
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
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
                        <DialogTitle>Bulk Edit Practice Sets ({selectedIds.length} selected)</DialogTitle>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Board</label>
                                <Select 
                                    value={(bulkEditData as any).boardId || ''} 
                                    onValueChange={(val: any) => setBulkEditData(prev => ({ ...prev, boardId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Class</label>
                                <Select 
                                    value={(bulkEditData as any).classId || ''} 
                                    onValueChange={(val: any) => setBulkEditData(prev => ({ ...prev, classId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Select 
                                    value={(bulkEditData as any).subjectId || ''} 
                                    onValueChange={(val: any) => setBulkEditData(prev => ({ ...prev, subjectId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Exam</label>
                                <Select 
                                    value={(bulkEditData as any).examId || ''} 
                                    onValueChange={(val: any) => setBulkEditData(prev => ({ ...prev, examId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
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
