'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const [jsonText, setJsonText] = useState('');
    const jsonFileInputRef = useRef<HTMLInputElement>(null);

    const demoJsonData = [
      {
        "Question Type": "Multiple Choice",
        "Subject": "General Knowledge",
        "Chapter": "Geography",
        "Question": "What is the capital of France?",
        "Option A": "Berlin",
        "Option B": "Madrid",
        "Option C": "Paris",
        "Option D": "Rome",
        "Correct Answer": "C",
        "Difficulty": "Easy",
        "Explanation": "Paris is the capital and most populous city of France."
      },
      {
        "Question Type": "True/False",
        "Subject": "Science",
        "Chapter": "Astronomy",
        "Question": "The Earth is the fourth planet from the Sun.",
        "Option A": "True",
        "Option B": "False",
        "Correct Answer": "B",
        "Difficulty": "Medium",
        "Explanation": "Earth is the third planet from the Sun. Mars is the fourth."
      },
      {
        "Question Type": "Fill in the Blank",
        "Subject": "Biology",
        "Chapter": "Cellular Biology",
        "Question": "The powerhouse of the cell is the ___.",
        "Correct Answer": "mitochondria",
        "Difficulty": "Easy",
        "Explanation": "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
      },
      {
        "Question Type": "Matching",
        "Subject": "History",
        "Chapter": "World War II",
        "Question": "Match the leader to their respective country.",
        "Option A": "Churchill=UK, FDR=USA",
        "Correct Answer": "1-A, 2-B",
        "Difficulty": "Hard",
        "Explanation": "Winston Churchill was the PM of the UK, and Franklin D. Roosevelt was the President of the USA."
      },
      {
        "Question Type": "Descriptive",
        "Subject": "Science",
        "Chapter": "Botany",
        "Question": "Explain the process of photosynthesis in detail.",
        "Correct Answer": "Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy.",
        "Difficulty": "Medium"
      }
    ];

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
                    'Question Type': row['Question Type'] || 'Multiple Choice',
                    'Option A': row['Option A'] || '',
                    'Option B': row['Option B'] || '',
                    'Option C': row['Option C'] || '',
                    'Option D': row['Option D'] || '',
                    'Option E': row['Option E'] || '',
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

    const parseJSON = (text: string) => {
        try {
            const data = JSON.parse(text);
            const questions = Array.isArray(data) ? data : (data.questions || []);
            const mappedData: QuestionImportRow[] = questions.map((row: any) => ({
                Board: row.Board || '',
                Class: row.Class || '',
                Subject: row.Subject || '',
                Textbook: row.Textbook || '',
                Chapter: row.Chapter || '',
                Topic: row.Topic || '',
                Question: row.Question || row.questionText || row.text || '',
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
            
            setPreviewData(mappedData);
            setIsParsing(false);
        } catch (err: any) {
            toast({ title: 'Error parsing JSON', description: err.message, variant: 'destructive' });
            setIsParsing(false);
        }
    };
    
    const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setIsParsing(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                parseJSON(event.target?.result as string);
            };
            reader.readAsText(selectedFile);
        }
    };
    
    const handleJsonPaste = () => {
        if (!jsonText.trim()) return;
        setIsParsing(true);
        parseJSON(jsonText);
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
                <p className="text-slate-500 mt-2">Upload a CSV or JSON file to batch import questions to the Question Bank.</p>
            </div>

            <Tabs defaultValue="upload-csv" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload-csv">Upload CSV</TabsTrigger>
                    <TabsTrigger value="upload-json">Upload JSON</TabsTrigger>
                    <TabsTrigger value="paste-json">Paste JSON</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload-csv">
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
                                Select CSV File
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="upload-json">
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                                <FileText className="h-8 w-8 text-[#00a651]" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Upload JSON File</h3>
                            <p className="text-sm text-slate-500 max-w-sm mb-6">
                                Upload an array of question objects matching the Question Bank format.
                            </p>
                            <input 
                                type="file" 
                                accept=".json" 
                                className="hidden" 
                                ref={jsonFileInputRef}
                                onChange={handleJsonFileChange}
                            />
                            <Button onClick={() => jsonFileInputRef.current?.click()} disabled={isParsing || isUploading}>
                                Select JSON File
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="paste-json">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="json-paste">Paste JSON Data</Label>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setJsonText(JSON.stringify(demoJsonData, null, 2))}
                                    >
                                        Load Demo Data
                                    </Button>
                                </div>
                                <Textarea 
                                    id="json-paste"
                                    placeholder='[ { "Question": "What is 2+2?", "Correct Answer": "4" } ]'
                                    className="min-h-[250px] font-mono text-xs"
                                    value={jsonText}
                                    onChange={(e) => setJsonText(e.target.value)}
                                    disabled={isParsing || isUploading}
                                />
                            </div>
                            <Button onClick={handleJsonPaste} disabled={isParsing || isUploading || !jsonText.trim()} className="w-full">
                                {isParsing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing...</> : 'Import JSON'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="templates">
                    <AccordionTrigger className="text-xl font-semibold">CSV Templates & Demos</AccordionTrigger>
                    <AccordionContent>
                        <Tabs defaultValue="mcq" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                                <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
                                <TabsTrigger value="tf">True/False</TabsTrigger>
                                <TabsTrigger value="fitb">Fill in the Blank</TabsTrigger>
                                <TabsTrigger value="matching">Matching</TabsTrigger>
                                <TabsTrigger value="descriptive">Descriptive/Grouped</TabsTrigger>
                            </TabsList>
                            <TabsContent value="mcq" className="pt-4">
                                <div className="mb-6">
                                    <h4 className="font-semibold text-sm mb-2">JSON Format:</h4>
                                    <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
{`[
  {
    "Question Type": "Multiple Choice",
    "Question": "What is the capital of France?",
    "Option A": "Berlin",
    "Option B": "Madrid",
    "Option C": "Paris",
    "Option D": "Rome",
    "Correct Answer": "C"
  }
]`}
                                    </pre>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Multiple Choice Template</CardTitle>
                                        <CardDescription>Format for standard MCQ questions.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Question Type</TableHead>
                                                    <TableHead>Question Text</TableHead>
                                                    <TableHead>Option A</TableHead>
                                                    <TableHead>Option B</TableHead>
                                                    <TableHead>Option C</TableHead>
                                                    <TableHead>Option D</TableHead>
                                                    <TableHead>Correct Answer</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Multiple Choice</TableCell>
                                                    <TableCell>What is the capital of France?</TableCell>
                                                    <TableCell>Berlin</TableCell>
                                                    <TableCell>Madrid</TableCell>
                                                    <TableCell>Paris</TableCell>
                                                    <TableCell>Rome</TableCell>
                                                    <TableCell>C</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="tf" className="pt-4">
                                <div className="mb-6">
                                    <h4 className="font-semibold text-sm mb-2">JSON Format:</h4>
                                    <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
{`[
  {
    "Question Type": "True/False",
    "Question": "The Earth is flat.",
    "Option A": "True",
    "Option B": "False",
    "Correct Answer": "B"
  }
]`}
                                    </pre>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>True/False Template</CardTitle>
                                        <CardDescription>Format for True/False statements.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Question Type</TableHead>
                                                    <TableHead>Question Text</TableHead>
                                                    <TableHead>Option A</TableHead>
                                                    <TableHead>Option B</TableHead>
                                                    <TableHead>Correct Answer</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>True/False</TableCell>
                                                    <TableCell>The Earth is flat.</TableCell>
                                                    <TableCell>True</TableCell>
                                                    <TableCell>False</TableCell>
                                                    <TableCell>B</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="fitb" className="pt-4">
                                <div className="mb-6">
                                    <h4 className="font-semibold text-sm mb-2">JSON Format:</h4>
                                    <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
{`[
  {
    "Question Type": "Fill in the Blank",
    "Question": "The powerhouse of the cell is the ___.",
    "Correct Answer": "mitochondria",
    "Explanation": "Mitochondria generate most of the cell's ATP."
  }
]`}
                                    </pre>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Fill in the Blank Template</CardTitle>
                                        <CardDescription>Format for Fill in the Blank questions. Use ___ for the blank.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Question Type</TableHead>
                                                    <TableHead>Question Text</TableHead>
                                                    <TableHead>Correct Answer</TableHead>
                                                    <TableHead>Explanation</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Fill in the Blank</TableCell>
                                                    <TableCell>The powerhouse of the cell is the ___.</TableCell>
                                                    <TableCell>mitochondria</TableCell>
                                                    <TableCell>Mitochondria generate most of the cell's ATP.</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="matching" className="pt-4">
                                <div className="mb-6">
                                    <h4 className="font-semibold text-sm mb-2">JSON Format:</h4>
                                    <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
{`[
  {
    "Question Type": "Matching",
    "Question": "Match the country to its capital.",
    "Option A": "France=Paris, Italy=Rome",
    "Correct Answer": "1-A, 2-B"
  }
]`}
                                    </pre>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Matching Template</CardTitle>
                                        <CardDescription>Format for Matching questions. Use JSON for complex formats or pair columns.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Question Type</TableHead>
                                                    <TableHead>Question Text</TableHead>
                                                    <TableHead>Option A (Pairs)</TableHead>
                                                    <TableHead>Correct Answer</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Matching</TableCell>
                                                    <TableCell>Match the country to its capital.</TableCell>
                                                    <TableCell>France=Paris, Italy=Rome</TableCell>
                                                    <TableCell>1-A, 2-B</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="descriptive" className="pt-4">
                                <div className="mb-6">
                                    <h4 className="font-semibold text-sm mb-2">JSON Format:</h4>
                                    <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
{`[
  {
    "Question Type": "Descriptive",
    "Question": "Explain the process of photosynthesis in detail.",
    "Correct Answer": "Photosynthesis is the process used by plants..."
  }
]`}
                                    </pre>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Descriptive / Grouped Template</CardTitle>
                                        <CardDescription>Format for long-form answers or paragraph-based questions.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Question Type</TableHead>
                                                    <TableHead>Question Text</TableHead>
                                                    <TableHead>Correct Answer</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Descriptive</TableCell>
                                                    <TableCell>Explain the process of photosynthesis in detail.</TableCell>
                                                    <TableCell>Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy.</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

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
                                    <TableHead>Question Type</TableHead>
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
                                        <TableCell>{row['Question Type']}</TableCell>
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
