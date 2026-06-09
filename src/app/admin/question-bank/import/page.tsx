'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { createQuestion } from '@/lib/firebase/question-bank';
import { QuestionImportRow } from '@/lib/question-bank-types';
import { slugify } from '@/lib/utils';

export default function BulkImportPage() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<QuestionImportRow[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (fileToParse: File) => {
        setIsParsing(true);
        Papa.parse(fileToParse, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Map the rows to match the flat structure we expect. 
                // Papaparse handles mapping to column headers automatically if header: true
                const data = results.data as any[];
                
                const mappedData: QuestionImportRow[] = data.map(row => ({
                    Board: row['Board'] || '',
                    Class: row['Class'] || '',
                    Subject: row['Subject'] || '',
                    Textbook: row['Textbook'] || '',
                    Chapter: row['Chapter'] || '',
                    Topic: row['Topic'] || '',
                    Question: row['Question Text'] || row['Question'] || '',
                    'Option A': row['Option A'] || '',
                    'Option B': row['Option B'] || '',
                    'Option C': row['Option C'] || '',
                    'Option D': row['Option D'] || '',
                    'Correct Answer': row['Correct Answer'] || '',
                    Explanation: row['Explanation'] || '',
                    Difficulty: row['Difficulty'] || 'Medium',
                    Exam: row['Exam'] || '',
                    Year: row['Year'] || '',
                    Tags: row['Tags'] || '',
                    Slug: row['Slug'] || '',
                    Status: row['Status'] || 'Published'
                }));
                
                setPreviewData(mappedData);
                setIsParsing(false);
            },
            error: (err) => {
                toast({ title: 'Error parsing file', description: err.message, variant: 'destructive' });
                setIsParsing(false);
            }
        });
    };

    const handleUpload = async () => {
        if (previewData.length === 0) return;
        
        setIsUploading(true);
        setUploadProgress({ current: 0, total: previewData.length });

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < previewData.length; i++) {
            const row = previewData[i];
            
            try {
                // In a production app, we would resolve Board, Class, Subject to actual taxonomy IDs first here
                // For now, we will create the question entry mapped as closely as possible
                
                const questionData: any = {
                    id: `q_${Date.now()}_${i}`,
                    questionText: row.Question,
                    options: {
                        a: row['Option A'],
                        b: row['Option B'],
                        c: row['Option C'],
                        d: row['Option D'],
                    },
                    correctAnswer: row['Correct Answer'],
                    explanation: row.Explanation,
                    difficulty: row.Difficulty as any,
                    status: row.Status as any,
                    marks: 1,
                    slug: row.Slug || slugify(row.Question.substring(0, 50)),
                    tags: row.Tags ? row.Tags.split(',').map(t => t.trim()) : [],
                    language: 'English',
                    // Temporarily storing string mappings for the taxonomy fields to prevent data loss
                    _import_raw_taxonomy: {
                        board: row.Board,
                        class: row.Class,
                        subject: row.Subject,
                        chapter: row.Chapter,
                        topic: row.Topic
                    }
                };

                await createQuestion(questionData);
                successCount++;
            } catch (err) {
                console.error('Failed to upload row:', i, err);
                failCount++;
            }
            
            setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setIsUploading(false);
        toast({ 
            title: 'Import Complete', 
            description: `Successfully imported ${successCount} questions. Failed: ${failCount}` 
        });
        
        // Reset
        setFile(null);
        setPreviewData([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Question Import</h1>
                <p className="text-slate-500 mt-2">Upload an Excel/CSV file to batch import questions to the Question Bank.</p>
            </div>

            <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                        <Upload className="h-8 w-8 text-[#00a651]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">
                        Your file should include columns like Board, Class, Subject, Question Text, Option A, B, C, D, Correct Answer, etc.
                    </p>
                    <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isParsing || isUploading}>
                        Select File
                    </Button>
                </CardContent>
            </Card>

            {previewData.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Preview Data</CardTitle>
                            <CardDescription>Found {previewData.length} valid rows.</CardDescription>
                        </div>
                        <Button onClick={handleUpload} disabled={isUploading} className="bg-[#00a651] hover:bg-[#009045]">
                            {isUploading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading {uploadProgress.current}/{uploadProgress.total}</>
                            ) : (
                                <><CheckCircle2 className="mr-2 h-4 w-4" /> Start Import</>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent className="overflow-auto max-h-[500px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Row</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Chapter</TableHead>
                                    <TableHead>Question Text</TableHead>
                                    <TableHead>Correct Answer</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewData.slice(0, 100).map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>{row.Subject}</TableCell>
                                        <TableCell>{row.Chapter}</TableCell>
                                        <TableCell className="max-w-xs truncate">{row.Question}</TableCell>
                                        <TableCell>{row['Correct Answer']}</TableCell>
                                        <TableCell>{row.Difficulty}</TableCell>
                                    </TableRow>
                                ))}
                                {previewData.length > 100 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-4">
                                            And {previewData.length - 100} more rows...
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
