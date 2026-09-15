'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { createQuestion } from '@/lib/firebase/question-bank';
import { QuestionImportRow } from '@/lib/question-bank-types';
import { slugify } from '@/lib/utils';

interface QuestionImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportComplete: (newQuestionIds: string[]) => void;
}

export function QuestionImportModal({ open, onOpenChange, onImportComplete }: QuestionImportModalProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const jsonFileInputRef = useRef<HTMLInputElement>(null);
    const [jsonText, setJsonText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (fileToParse: File) => {
        setIsParsing(true);
        Papa.parse(fileToParse, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                processParsedData(data);
            },
            error: (err) => {
                toast({ title: 'Error parsing file', description: err.message, variant: 'destructive' });
                setIsParsing(false);
            }
        });
    };

    const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setIsParsing(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    const questions = Array.isArray(data) ? data : (data.questions || []);
                    processParsedData(questions);
                } catch (err: any) {
                    toast({ title: 'Error parsing JSON', description: err.message, variant: 'destructive' });
                    setIsParsing(false);
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleJsonPaste = () => {
        if (!jsonText.trim()) return;
        setIsParsing(true);
        try {
            const data = JSON.parse(jsonText);
            const questions = Array.isArray(data) ? data : (data.questions || []);
            processParsedData(questions);
        } catch (err: any) {
            toast({ title: 'Error parsing JSON', description: err.message, variant: 'destructive' });
            setIsParsing(false);
        }
    };

    const processParsedData = async (data: any[]) => {
        const mappedData: QuestionImportRow[] = data.map(row => ({
            Board: row.Board || '',
            Class: row.Class || '',
            Subject: row.Subject || '',
            Textbook: row.Textbook || '',
            Chapter: row.Chapter || '',
            Topic: row.Topic || '',
            Question: row.Question || row.questionText || row['Question Text'] || row.text || '',
            'Question Type': row['Question Type'] || row.type || row.questionType || 'Multiple Choice',
            'Option A': row['Option A'] || (row.options && row.options[0]?.text) || (row.options?.a) || '',
            'Option B': row['Option B'] || (row.options && row.options[1]?.text) || (row.options?.b) || '',
            'Option C': row['Option C'] || (row.options && row.options[2]?.text) || (row.options?.c) || '',
            'Option D': row['Option D'] || (row.options && row.options[3]?.text) || (row.options?.d) || '',
            'Option E': row['Option E'] || (row.options && row.options[4]?.text) || (row.options?.e) || '',
            'Correct Answer': row['Correct Answer'] || row.correctAnswer || '',
            Explanation: row.Explanation || row.explanation || '',
            Difficulty: row.Difficulty || row.difficulty || 'Medium',
            Exam: row.Exam || '',
            Year: row.Year || '',
            Tags: row.Tags || '',
            Slug: row.Slug || '',
            Status: row.Status || 'Published'
        }));

        await uploadQuestions(mappedData);
    };

    const uploadQuestions = async (previewData: QuestionImportRow[]) => {
        if (previewData.length === 0) {
            toast({ title: 'No valid questions found' });
            setIsParsing(false);
            return;
        }
        
        setIsUploading(true);
        setUploadProgress({ current: 0, total: previewData.length });

        let successCount = 0;
        let failCount = 0;
        const newIds: string[] = [];

        for (let i = 0; i < previewData.length; i++) {
            const row = previewData[i];
            
            try {
                const qId = `q_${Date.now()}_${i}`;
                const questionData: any = {
                    id: qId,
                    questionText: row.Question,
                    questionType: row['Question Type'] as any,
                    options: {
                        a: row['Option A'],
                        b: row['Option B'],
                        c: row['Option C'],
                        d: row['Option D'],
                        e: row['Option E'],
                    },
                    correctAnswer: row['Correct Answer'],
                    explanation: row.Explanation,
                    difficulty: row.Difficulty as any,
                    status: row.Status as any,
                    marks: 1,
                    slug: row.Slug || slugify(row.Question.substring(0, 50)),
                    tags: row.Tags ? row.Tags.split(',').map((t: string) => t.trim()) : [],
                    language: 'English',
                    _import_raw_taxonomy: {
                        board: row.Board,
                        class: row.Class,
                        subject: row.Subject,
                        chapter: row.Chapter,
                        topic: row.Topic
                    }
                };

                await createQuestion(questionData);
                newIds.push(qId);
                successCount++;
            } catch (err) {
                console.error('Failed to upload row:', i, err);
                failCount++;
            }
            
            setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setIsUploading(false);
        setIsParsing(false);
        
        toast({ 
            title: 'Import Complete', 
            description: `Successfully imported ${successCount} questions. Failed: ${failCount}` 
        });
        
        if (successCount > 0) {
            onImportComplete(newIds);
        }
        
        // Reset
        setJsonText('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isUploading && onOpenChange(val)}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Import Questions Directly</DialogTitle>
                    <DialogDescription>
                        Upload a CSV/JSON file or paste JSON to directly create and attach questions to this assessment.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="upload-csv" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upload-csv" disabled={isUploading}>Upload CSV</TabsTrigger>
                        <TabsTrigger value="upload-json" disabled={isUploading}>Upload JSON</TabsTrigger>
                        <TabsTrigger value="paste-json" disabled={isUploading}>Paste JSON</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload-csv" className="mt-4">
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                            <Upload className="h-8 w-8 text-[#00a651] mb-4" />
                            <h3 className="text-sm font-semibold mb-2">Upload CSV File</h3>
                            <input 
                                type="file" 
                                accept=".csv" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <Button onClick={() => fileInputRef.current?.click()} disabled={isParsing || isUploading}>
                                {isUploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` : 'Select CSV File'}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="upload-json" className="mt-4">
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                            <FileText className="h-8 w-8 text-[#00a651] mb-4" />
                            <h3 className="text-sm font-semibold mb-2">Upload JSON File</h3>
                            <input 
                                type="file" 
                                accept=".json" 
                                className="hidden" 
                                ref={jsonFileInputRef}
                                onChange={handleJsonFileChange}
                            />
                            <Button onClick={() => jsonFileInputRef.current?.click()} disabled={isParsing || isUploading}>
                                {isUploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` : 'Select JSON File'}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="paste-json" className="mt-4">
                        <div className="space-y-4">
                            <Textarea 
                                placeholder='[ { "Question": "What is 2+2?", "Correct Answer": "4" } ]'
                                className="min-h-[200px] font-mono text-xs"
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                disabled={isParsing || isUploading}
                            />
                            <Button onClick={handleJsonPaste} disabled={isParsing || isUploading || !jsonText.trim()} className="w-full">
                                {isUploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` : (isParsing ? 'Parsing...' : 'Import JSON')}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
