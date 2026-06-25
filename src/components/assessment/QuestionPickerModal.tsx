'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getQuestions } from '@/lib/firebase/question-bank';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { Loader2, Search, Filter, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuestionPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectQuestions: (questions: QuestionBankEntry[]) => void;
    preSelectedIds?: string[];
    initialFilters?: Record<string, string | undefined>;
}

export function QuestionPickerModal({ open, onOpenChange, onSelectQuestions, preSelectedIds = [], initialFilters }: QuestionPickerModalProps) {
    const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMap, setSelectedMap] = useState<Record<string, QuestionBankEntry>>({});
    
    // Filters
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState<string>('all');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [applyTaxonomyFilters, setApplyTaxonomyFilters] = useState(true);

    const hasInitialFilters = initialFilters && Object.values(initialFilters).some(v => !!v);

    useEffect(() => {
        if (open) {
            fetchQuestions();
            // Initialize pre-selected map if needed, though usually we only append.
            const initialMap: Record<string, QuestionBankEntry> = {};
            // We don't have the full objects for preSelectedIds, so we just track them by ID if needed.
            setSelectedMap({});
        }
    }, [open]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            // Note: In a real prod environment with Algolia, we'd use Algolia here.
            // For now, using standard getQuestions. We limit to 50 for performance.
            const filters: any = {};
            if (applyTaxonomyFilters && initialFilters) {
                Object.assign(filters, initialFilters);
            }
            if (difficulty !== 'all') filters.difficulty = difficulty;
            
            let data = await getQuestions(filters, 50);
            
            if (verifiedOnly) {
                data = data.filter(q => q.isVerified);
            }
            if (search) {
                const lowerSearch = search.toLowerCase();
                data = data.filter(q => 
                    q.questionText.toLowerCase().includes(lowerSearch) || 
                    (q.title && q.title.toLowerCase().includes(lowerSearch))
                );
            }
            
            setQuestions(data);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (q: QuestionBankEntry) => {
        const newMap = { ...selectedMap };
        if (newMap[q.id]) {
            delete newMap[q.id];
        } else {
            newMap[q.id] = q;
        }
        setSelectedMap(newMap);
    };

    const toggleSelectAll = () => {
        if (Object.keys(selectedMap).length === questions.length) {
            setSelectedMap({});
        } else {
            const newMap: Record<string, QuestionBankEntry> = {};
            questions.forEach(q => newMap[q.id] = q);
            setSelectedMap(newMap);
        }
    };

    const handleConfirm = () => {
        onSelectQuestions(Object.values(selectedMap));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Questions</DialogTitle>
                    <DialogDescription>Browse and select questions from the Question Bank to add to your assessment.</DialogDescription>
                </DialogHeader>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 py-4 border-b">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search questions..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchQuestions()}
                            className="pl-9"
                        />
                    </div>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="w-[150px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 border rounded-md px-3 bg-slate-50">
                        <Checkbox 
                            id="verified-only" 
                            checked={verifiedOnly} 
                            onCheckedChange={(c) => setVerifiedOnly(!!c)} 
                        />
                        <label htmlFor="verified-only" className="text-sm font-medium flex items-center cursor-pointer">
                            <ShieldCheck className="w-4 h-4 mr-1 text-indigo-500" />
                            Verified
                        </label>
                    </div>
                    {hasInitialFilters && (
                        <div className="flex items-center gap-2 border rounded-md px-3 bg-blue-50/50 border-blue-200">
                            <Checkbox 
                                id="taxonomy-filter" 
                                checked={applyTaxonomyFilters} 
                                onCheckedChange={(c) => {
                                    setApplyTaxonomyFilters(!!c);
                                    // Let the next render handle fetch if needed, or user can click Filter manually.
                                    // Actually better to just let user click Filter.
                                }} 
                            />
                            <label htmlFor="taxonomy-filter" className="text-sm font-medium flex items-center cursor-pointer whitespace-nowrap text-blue-800">
                                <Filter className="w-4 h-4 mr-1 text-blue-500" />
                                Match Taxonomy
                            </label>
                        </div>
                    )}
                    <Button onClick={fetchQuestions} variant="secondary">Filter</Button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            No questions found matching your criteria.
                        </div>
                    ) : (
                        <div className="space-y-2 py-4">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b">
                                <div className="flex items-center gap-2">
                                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium">
                                        {Object.keys(selectedMap).length === questions.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                        Select All
                                    </button>
                                </div>
                                <div className="text-sm text-slate-500">
                                    Showing {questions.length} questions
                                </div>
                            </div>
                            
                            {questions.map(q => {
                                const isSelected = !!selectedMap[q.id];
                                const isPreSelected = preSelectedIds.includes(q.id);
                                return (
                                    <div 
                                        key={q.id} 
                                        onClick={() => !isPreSelected && toggleSelect(q)}
                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                            isPreSelected ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' : 
                                            isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-100'
                                        }`}
                                    >
                                        <div className="mt-1">
                                            {isPreSelected ? (
                                                <CheckSquare className="w-5 h-5 text-slate-400" />
                                            ) : isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-slate-800 line-clamp-2 mb-1">{q.questionText}</div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded">{q.difficulty}</span>
                                                {q.options?.a ? <span>MCQ</span> : <span>Subjective</span>}
                                                {q.isVerified && (
                                                    <span className="flex items-center text-indigo-600 font-medium">
                                                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                                                    </span>
                                                )}
                                                {isPreSelected && <span className="text-red-500 font-medium">Already in Assessment</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t mt-auto">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm font-medium text-slate-600">
                            {Object.keys(selectedMap).length} selected
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleConfirm} disabled={Object.keys(selectedMap).length === 0}>
                                Add {Object.keys(selectedMap).length} Questions
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
