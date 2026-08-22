'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Plus, Pencil, Trash2, Loader2, Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PracticeSet } from '@/lib/assessment-types';
import { getAssessments, saveAssessment, deleteAssessment } from '@/lib/firebase/assessment';
import { submitReview, bulkSubmitReviews } from '@/lib/firebase/reviews';
import { getTaxonomyNodesByTrack, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { AssessmentEditor } from '@/components/admin/AssessmentEditor';
import Link from 'next/link';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
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
        fetchPracticeSets(true);
    }, []);

    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchPracticeSets = async (isInitial = false) => {
        setLoading(true);
        try {
            // Note: Since we are migrating to pagination, we can't easily filter all items on the client.
            // For now, we fetch the latest 50 items. In a real system with complex search, we'd need Algolia.
            const colRef = collection(db, 'practice_sets');
            let q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
            
            if (!isInitial && lastDoc) {
                q = query(colRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(50));
            }

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (isInitial) {
                let hardcodedData = [];
                try {
                    const res = await fetch('/api/admin/hardcoded-assessments?type=practiceSets');
                    if (res.ok) {
                        const json = await res.json();
                        hardcodedData = json.assessments || [];
                    }
                } catch (e) {
                    console.error("Failed to fetch hardcoded practice sets", e);
                }
                setPracticeSets([...hardcodedData, ...(data as PracticeSet[])]);
            } else {
                setPracticeSets(prev => [...prev, ...(data as PracticeSet[])]);
            }

            if (snapshot.docs.length > 0) {
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }
            if (snapshot.docs.length < 50) {
                setHasMore(false);
            }

            // Fetch taxonomies only on initial load
            if (isInitial) {
                const allAcademic = await getTaxonomyNodesByTrack('academic');
                setBoards(allAcademic.filter((n: any) => n.type === 'board'));
                setClasses(allAcademic.filter((n: any) => n.type === 'class'));
                setSubjects(allAcademic.filter((n: any) => n.type === 'subject'));

                const allCompetitive = await getTaxonomyNodesByTrack('competitive');
                setExams(allCompetitive.filter((n: any) => n.type === 'exam'));
            }
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
        <div className="p-4 md:p-6 space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Practice Sets</h1>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
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
                    <Button onClick={() => { setEditData({}); setView('editor'); }} className="shrink-0 w-10 h-10 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-transform hover:scale-105" title="Create Practice Set">
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    <div className="relative flex-none min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search practice sets by title..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-slate-50 dark:bg-slate-800/50"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] shrink-0 bg-slate-50 dark:bg-slate-800/50">
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
                        <SelectTrigger className="w-[130px] shrink-0 bg-slate-50 dark:bg-slate-800/50">
                            <SelectValue placeholder="Access" />
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
                    <Select value={boardFilter} onValueChange={setBoardFilter}>
                        <SelectTrigger className="w-[130px] shrink-0 bg-slate-50 dark:bg-slate-800/50">
                            <SelectValue placeholder="Board" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Boards</SelectItem>
                            {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                        <SelectTrigger className="w-[130px] shrink-0 bg-slate-50 dark:bg-slate-800/50">
                            <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-[130px] shrink-0 bg-slate-50 dark:bg-slate-800/50">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={examFilter} onValueChange={setExamFilter}>
                        <SelectTrigger className="w-[130px] shrink-0 bg-slate-50 dark:bg-slate-800/50">
                            <SelectValue placeholder="Exam" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Exams</SelectItem>
                            {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className={`mt-6 ${displayMode === 'list' ? 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] overflow-hidden' : ''}`}>
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${displayMode === 'list' ? 'p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50' : 'mb-6'}`}>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">All Practice Sets</h2>
                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
                            <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">{selectedIds.length} selected</span>
                            <Button size="sm" variant="outline" className="bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 shadow-sm" onClick={() => setIsBulkEditModalOpen(true)}>
                                <CheckSquare className="w-4 h-4 mr-2" /> Bulk Edit
                            </Button>
                        </div>
                    )}
                </div>

                <div className={displayMode === 'list' ? 'p-0' : ''}>
                    {displayMode === 'list' && (
                    <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                            <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                <TableHead className="w-[50px] pl-5">
                                    <Checkbox 
                                        checked={practiceSets.length > 0 && selectedIds.length === practiceSets.length}
                                        onCheckedChange={(checked) => handleToggleSelectAll(!!checked)}
                                    />
                                </TableHead>
                                <TableHead className="w-[60px] font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Image</TableHead>
                                <TableHead className="min-w-[200px] font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Title</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Duration</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Marks</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Questions</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Attempts</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Pricing</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Reviews</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wider text-[10px] text-right pr-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={11}><Loader2 className="animate-spin mx-auto my-10 text-indigo-500" /></TableCell></TableRow>
                            ) : filteredPracticeSets.length === 0 ? (
                                <TableRow><TableCell colSpan={11} className="text-center py-10 text-slate-500">No practice sets found matching your filters.</TableCell></TableRow>
                            ) : (
                                filteredPracticeSets.map(test => (
                                    <TableRow key={test.id} className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100/80 dark:border-slate-800/80 ${selectedIds.includes(test.id) ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}`}>
                                        <TableCell className="pl-5">
                                            <Checkbox 
                                                checked={selectedIds.includes(test.id)}
                                                onCheckedChange={(checked) => handleToggleSelect(test.id, !!checked)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {test.thumbnail && (!Array.isArray(test.thumbnail) || test.thumbnail.length > 0) ? (
                                                <img src={Array.isArray(test.thumbnail) ? test.thumbnail[0] : test.thumbnail} alt={test.title} className="w-12 h-12 object-cover rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700" />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                                    <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-start gap-2">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">{test.title}</span>
                                                {(test as any).isHardcoded && (
                                                    <span className="px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5">Hardcoded</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-600 dark:text-slate-400">{(test as any).durationMin || '-'} min</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-600 dark:text-slate-400">{(test as any).totalMarks || '-'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-600 dark:text-slate-400">{(test as any).questionCount ?? test.questionIds?.length ?? 0}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-600 dark:text-slate-400">{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(test.attemptCount || 0)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${test.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30' : test.status === 'Archived' ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30'}`}>
                                                {test.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-700 dark:text-slate-300">
                                                {test.accessType === 'free' ? (
                                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/30">
                                                        <Unlock className="w-3.5 h-3.5" /> Free
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/30">
                                                        <Lock className="w-3.5 h-3.5" /> ₹ {test.price || 0}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                    {test.reviewStats?.averageRating || 0}
                                                </div>
                                                <span className="text-[11px] text-slate-400 font-medium">{test.reviewStats?.totalReviews || 0} reviews</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-5">
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
                                                    {!(test as any).isHardcoded && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleEdit(test)} className="cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleClone(test)} className="cursor-pointer">
                                                                <Copy className="mr-2 h-4 w-4" /> Clone
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
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
                                                    {!(test as any).isHardcoded && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleDelete(test.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
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
                            {loading && !lastDoc ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" /></div>
                            ) : filteredPracticeSets.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">No practice sets found matching your filters.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredPracticeSets.map(test => (
                                        <div key={test.id} className={`group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 ${selectedIds.includes(test.id) ? 'ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                            {/* Top Image Area */}
                                            <div className="relative h-44 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                                                {test.thumbnail && (!Array.isArray(test.thumbnail) || test.thumbnail.length > 0) ? (
                                                    <img src={Array.isArray(test.thumbnail) ? test.thumbnail[0] : test.thumbnail} alt={test.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-indigo-900/20 dark:to-slate-800 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                                                        <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 drop-shadow-sm" />
                                                    </div>
                                                )}
                                                
                                                {/* Gradient Overlay for Image Text/Badges */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                                                {/* Checkbox */}
                                                <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-md p-1 shadow-sm border border-white/20">
                                                    <Checkbox 
                                                        checked={selectedIds.includes(test.id)}
                                                        onCheckedChange={(checked) => handleToggleSelect(test.id, !!checked)}
                                                    />
                                                </div>

                                                {/* Status Badge */}
                                                <div className="absolute top-3 right-3">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm backdrop-blur-md ${test.status === 'Published' ? 'bg-emerald-500/90 text-white border border-emerald-400/50' : test.status === 'Archived' ? 'bg-slate-600/90 text-white border border-slate-500/50' : 'bg-amber-500/90 text-white border border-amber-400/50'}`}>
                                                        {test.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50">
                                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{test.title}</h3>
                                                    {(test as any).isHardcoded && (
                                                        <span className="px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">Hardcoded</span>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-5">
                                                    <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                                                        <span className="font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] sm:text-[10px]">Time</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{(test as any).durationMin || '-'}m</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                                                        <span className="font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] sm:text-[10px]">Marks</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{(test as any).totalMarks || '-'}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                                                        <span className="font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] sm:text-[10px]">Qs</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{(test as any).questionCount ?? test.questionIds?.length ?? 0}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
                                                        {test.accessType === 'free' ? (
                                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                                                                <Unlock className="w-3.5 h-3.5" />
                                                                <span>Free</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/30">
                                                                <Lock className="w-3.5 h-3.5" />
                                                                <span>₹ {test.price || 0}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/practice/${test.slug}`} target="_blank" className="cursor-pointer">
                                                                        <Eye className="mr-2 h-4 w-4" /> View on Site
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {!(test as any).isHardcoded && (
                                                                    <>
                                                                        <DropdownMenuItem onClick={() => handleEdit(test)} className="cursor-pointer">
                                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleClone(test)} className="cursor-pointer">
                                                                            <Copy className="mr-2 h-4 w-4" /> Clone
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
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
                                                                {!(test as any).isHardcoded && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={() => handleDelete(test.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {hasMore && !loading && (
                        <div className="flex justify-center mt-6">
                            <Button variant="outline" onClick={() => fetchPracticeSets(false)}>
                                Load More Practice Sets
                            </Button>
                        </div>
                    )}
                    {loading && lastDoc && (
                        <div className="flex justify-center mt-6">
                            <Loader2 className="animate-spin text-indigo-500" />
                        </div>
                    )}
                </div>
            </div>

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
