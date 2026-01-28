
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Chapter, Question } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, PlusCircle, Edit, Trash2, FileJson, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


const jsonExample = `
{
  "questions": [
    {
      "text": "What is the capital of France?",
      "type": "Multiple Choice",
      "marks": 1,
      "options": [
        { "text": "Berlin", "explanation": "Incorrect. Berlin is the capital of Germany." },
        { "text": "Madrid", "explanation": "Incorrect. Madrid is the capital of Spain." },
        { "text": "Paris", "explanation": "Correct. Paris is the capital of France." },
        { "text": "Rome", "explanation": "Incorrect. Rome is the capital of Italy." }
      ],
      "correctAnswer": "Paris",
      "explanation": "Paris is the capital and most populous city of France."
    }
  ]
}
`;

const jsonExampleTF = `
{
  "questions": [
    {
      "text": "The Earth is flat.",
      "type": "True/False",
      "marks": 1,
      "options": [
        {"text": "True", "explanation": "This is incorrect. The Earth is an oblate spheroid."},
        {"text": "False", "explanation": "This is correct. Scientific evidence overwhelmingly shows the Earth is round."}
      ],
      "correctAnswer": "False",
      "explanation": "The Earth is roughly a sphere. Evidence includes satellite photos, the way ships disappear over the horizon, and the existence of different time zones."
    }
  ]
}
`;
const jsonExampleSA = `
{
  "questions": [
    {
      "text": "What is the chemical symbol for water?",
      "type": "Short Answer",
      "marks": 1,
      "correctAnswer": "H2O",
      "explanation": "Water is a chemical compound consisting of two hydrogen atoms and one oxygen atom."
    }
  ]
}
`;
const jsonExampleFIB = `
{
  "questions": [
    {
      "text": "The powerhouse of the cell is the ____.",
      "type": "Fill in the Blank",
      "marks": 1,
      "correctAnswer": "mitochondrion",
      "explanation": "Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell's biochemical reactions."
    }
  ]
}
`;
const jsonExampleMatching = `
{
  "questions": [
    {
      "text": "Match the countries to their capitals.",
      "type": "Matching",
      "marks": 3,
      "correctAnswer": [
        { "a": "Japan", "b": "Tokyo" },
        { "a": "Canada", "b": "Ottawa" },
        { "a": "Australia", "b": "Canberra" }
      ],
      "explanation": "This tests knowledge of world geography and capital cities."
    }
  ]
}
`;


export default function ManageChapterQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const { toast } = useToast();

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

    const importFileRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [jsonText, setJsonText] = useState('');


    const fetchData = useCallback(async () => {
        if (!textbookId || !chapterId) return;
        setLoading(true);

        const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
        const chapterSnap = await getDoc(chapterRef);
        if (chapterSnap.exists()) {
            const chapterData = { id: chapterSnap.id, ...chapterSnap.data() } as Chapter;
            setChapter(chapterData);
            setQuestions(chapterData.textbookQuestions || []);
        }
        setLoading(false);
    }, [textbookId, chapterId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const saveQuestionsToFirestore = async (updatedQuestions: Question[]) => {
        const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
        await updateDoc(chapterRef, { textbookQuestions: updatedQuestions });
    }
    
    const handleDeleteQuestion = async (questionId: string) => {
        if(!questionId) return;
        try {
            const updatedQuestions = questions.filter(q => q.id !== questionId);
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            toast({ title: 'Question Deleted' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setQuestionToDelete(null);
        }
    }
    
    const handleSelectQuestion = (questionId: string) => {
        setSelectedQuestions(prev => prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, id]);
    };
    
    const handleSelectAllQuestions = (checked: boolean) => {
        if (checked) {
            setSelectedQuestions(questions.map(q => q.id));
        } else {
            setSelectedQuestions([]);
        }
    };
    
    const handleDeleteSelected = async () => {
        try {
            const updatedQuestions = questions.filter(q => !selectedQuestions.includes(q.id));
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            toast({ title: `${selectedQuestions.length} question(s) deleted.` });
            setSelectedQuestions([]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error deleting questions', description: (error as Error).message });
        }
    }
    
    const processJsonImport = async (jsonText: string) => {
        try {
            const parsedJson = JSON.parse(jsonText);
            const questionsToImport = (parsedJson.questions || []).map((q: any) => ({
                ...q,
                id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9),
            }));

            if (!Array.isArray(questionsToImport) || questionsToImport.length === 0) {
                throw new Error("No valid question array found in the JSON.");
            }
            
            const updatedQuestions = [...questions, ...questionsToImport];
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            
            toast({
              title: 'Import Successful!',
              description: `${questionsToImport.length} questions have been added.`,
            });
            setIsImportDialogOpen(false);
            setJsonText('');
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: (error as Error).message,
            });
          } finally {
            setIsImporting(false);
          }
    }

    const handleBulkImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/json' && file.type !== 'text/plain') {
          toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a valid JSON or TXT file.',
          });
          return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          processJsonImport(text);
           if(importFileRef.current) {
                importFileRef.current.value = '';
            }
        };
        reader.readAsText(file);
      };
      
      const handleBulkImportFromText = () => {
        if (!jsonText.trim()) {
             toast({
                variant: "destructive",
                title: 'Import Failed',
                description: "Textbox cannot be empty."
            });
            return;
        }
        setIsImporting(true);
        processJsonImport(jsonText);
      }
    
    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chapters
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Chapter Questions: <span className="text-primary">{chapter?.title}</span></h1>
                <p className="text-muted-foreground mt-1">Manage the original textbook questions and their solutions for this chapter.</p>
            </header>

            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Questions ({questions.length})</CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button size="sm" asChild className="w-full">
                           <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions/add`}>
                                <PlusCircle className="mr-2"/> Add Question
                           </Link>
                        </Button>
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="w-full"><FileJson className="mr-2"/> Bulk Import</Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Bulk Import Questions</DialogTitle>
                                    <DialogDescription>Upload a JSON file or paste JSON text containing an array of questions.</DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="upload">Upload File</TabsTrigger><TabsTrigger value="paste">Paste JSON</TabsTrigger></TabsList>
                                    <TabsContent value="upload">
                                        <div className="py-4"><div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="json-import">JSON/TXT File</Label>
                                            <Input id="json-import" type="file" accept=".json,.txt" onChange={handleBulkImportFromFile} ref={importFileRef} disabled={isImporting} />
                                            {isImporting && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" /> Importing...</p>}
                                        </div></div>
                                    </TabsContent>
                                    <TabsContent value="paste">
                                        <div className="py-4 space-y-4">
                                            <Textarea placeholder='Paste your JSON content here...' value={jsonText} onChange={(e) => setJsonText(e.target.value)} className="min-h-[200px] font-mono text-xs" disabled={isImporting}/>
                                            <Button onClick={handleBulkImportFromText} disabled={isImporting || !jsonText.trim()}>{isImporting ? <><Loader2 className="animate-spin mr-2"/>Processing...</> : 'Import from Text'}</Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                <Accordion type="single" collapsible className="w-full"><AccordionItem value="item-1">
                                    <AccordionTrigger>View JSON Format Example</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground mb-4">Your JSON file must contain a single key "questions" which is an array of question objects.</p>
                                        <Tabs defaultValue="mcq" className="w-full">
                                            <TabsList className="h-auto flex-wrap justify-start">
                                                <TabsTrigger value="mcq">MCQ</TabsTrigger>
                                                <TabsTrigger value="tf">T/F</TabsTrigger>
                                                <TabsTrigger value="sa">Short Answer</TabsTrigger>
                                                <TabsTrigger value="fib">Fill in Blank</TabsTrigger>
                                                <TabsTrigger value="matching">Matching</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="mcq"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExample}</pre></TabsContent>
                                            <TabsContent value="tf"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExampleTF}</pre></TabsContent>
                                            <TabsContent value="sa"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExampleSA}</pre></TabsContent>
                                            <TabsContent value="fib"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExampleFIB}</pre></TabsContent>
                                            <TabsContent value="matching"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExampleMatching}</pre></TabsContent>
                                        </Tabs>
                                    </AccordionContent>
                                </AccordionItem></Accordion>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                     {selectedQuestions.length > 0 && (
                        <div className="mb-4">
                             <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete Selected ({selectedQuestions.length})</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedQuestions.length} question(s). This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                    {questions.length > 0 ? (
                        <ul className="space-y-2">
                             <li className="flex items-center p-3 border-b">
                                <Checkbox id="select-all" checked={selectedQuestions.length === questions.length && questions.length > 0} onCheckedChange={handleSelectAllQuestions} className="mr-4" />
                                <label htmlFor="select-all" className="flex-1 font-semibold text-sm">Select All</label>
                            </li>
                            {questions.map(q => (
                                <li key={q.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md gap-4">
                                    <div className="flex items-start flex-1 min-w-0">
                                        <Checkbox id={`select-${q.id}`} checked={selectedQuestions.includes(q.id)} onCheckedChange={() => handleSelectQuestion(q.id)} className="mr-4 mt-1" />
                                        <label htmlFor={`select-${q.id}`} className="flex-1">{q.text}</label>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/question/${q.id}`} target="_blank">
                                                <Eye className="h-4 w-4"/>
                                            </Link>
                                        </Button>
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions/${q.id}/edit`}>
                                                <Edit className="h-4 w-4"/>
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone and will permanently delete this question.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteQuestion(q.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : ( <p className="text-muted-foreground text-center py-8">No questions added to this chapter yet.</p>)}
                </CardContent>
            </Card>

            <AlertDialog open={!!questionToDelete} onOpenChange={() => setQuestionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this question. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteQuestion(questionToDelete!.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

    