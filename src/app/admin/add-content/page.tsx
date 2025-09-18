

'use client';

import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { addContent, getContentTypes, getSubjects, addSubject, getBoards, addBoard, getExamTypes, addExamType, getChaptersBySubjectId, addChapter, getExamsByCategory, addExam } from '@/lib/firebase/firestore';
import { PlusCircle, Trash2, Loader2, Save } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
});

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().min(1, 'Please specify the correct answer.'),
});

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  board: z.string().min(1, 'Please select or add a board.'),
  examCategory: z.string().min(1, 'Please select or add an exam category.'),
  exam: z.string().min(1, 'Please select or add an exam.'),
  subject: z.string().min(1, 'Please select or add a subject.'),
  chapter: z.string().min(1, 'Please select or add a chapter.'),
  newSubject: z.string().optional(),
  newBoard: z.string().optional(),
  newExamCategory: z.string().optional(),
  newExam: z.string().optional(),
  newChapterNo: z.string().optional(),
  newChapterName: z.string().optional(),
  testType: z.string().min(1, 'Please select a content type.'),
  description: z.string().optional(),
  duration: z.coerce
    .number()
    .int()
    .positive('Duration must be a positive number of minutes.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  access: z.enum(['free', 'premium', 'pro']),
  questions: z.array(questionSchema).min(1, 'Please add at least one question.'),
});

type FormValues = z.infer<typeof formSchema>;
type ContentType = { id: string, name: string };
type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ExamType = { id: string, name: string };
type Exam = { id: string, name: string };
type Chapter = { id: string; chapterNo: string; chapterName: string };

export default function CreateTestPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [examCategories, setExamCategories] = useState<ExamType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [isAddingNewBoard, setIsAddingNewBoard] = useState(false);
  const [isAddingNewExamCategory, setIsAddingNewExamCategory] = useState(false);
  const [isAddingNewExam, setIsAddingNewExam] = useState(false);
  const [isAddingNewChapter, setIsAddingNewChapter] = useState(false);


  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoadingData(true);
      const [types, subjectData, boardData, examTypeData] = await Promise.all([
          getContentTypes(),
          getSubjects(),
          getBoards(),
          getExamTypes()
      ]);
      
      setContentTypes(types);
      setSubjects(subjectData);
      setBoards(boardData);
      setExamCategories(examTypeData);

      if (types.length > 0 && !form.getValues('testType')) {
          form.setValue('testType', types[0].name);
      }
    } catch (error) {
      toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Could not load form data from the database."
      });
    } finally {
      setLoadingData(false);
    }
  };


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      board: '',
      examCategory: '',
      exam: '',
      subject: '',
      chapter: '',
      newSubject: '',
      newBoard: '',
      newExamCategory: '',
      newExam: '',
      newChapterNo: '',
      newChapterName: '',
      testType: '',
      description: '',
      duration: 60,
      difficulty: 'Medium',
      access: 'free',
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const handleFormSubmit = async (data: FormValues, resetType: 'full' | 'partial') => {
    try {
      let subjectName = data.subject;
      let subjectId = subjects.find(s => s.name === data.subject)?.id;
      if(data.subject === 'add_new_subject' && data.newSubject) {
        const newSubId = await addSubject(data.newSubject);
        subjectName = data.newSubject;
        subjectId = newSubId;
        setIsAddingNewSubject(false);
      }
      
      let boardName = data.board;
      if(data.board === 'add_new_board' && data.newBoard) {
        await addBoard(data.newBoard);
        boardName = data.newBoard;
        setIsAddingNewBoard(false);
      }

      let examCategoryName = data.examCategory;
      let examCategoryId = examCategories.find(e => e.name === data.examCategory)?.id;
      if(data.examCategory === 'add_new_exam_category' && data.newExamCategory) {
        const newExamCatId = await addExamType(data.newExamCategory);
        examCategoryName = data.newExamCategory;
        examCategoryId = newExamCatId;
        setIsAddingNewExamCategory(false);
      }
      
      let examName = data.exam;
      if(data.exam === 'add_new_exam' && data.newExam && examCategoryId) {
        await addExam(examCategoryId, { name: data.newExam });
        examName = data.newExam;
        setIsAddingNewExam(false);
      }

      let chapterName = data.chapter;
      if (data.chapter === 'add_new_chapter' && data.newChapterNo && data.newChapterName && subjectId) {
        await addChapter(subjectId, { chapterNo: data.newChapterNo, chapterName: data.newChapterName });
        chapterName = `${data.newChapterNo}. ${data.newChapterName}`;
        setIsAddingNewChapter(false);
      }
      
      const contentToSave = { ...data, subject: subjectName, board: boardName, examCategory: examCategoryName, exam: examName, chapter: chapterName };
      delete (contentToSave as any).newSubject;
      delete (contentToSave as any).newBoard;
      delete (contentToSave as any).newExamCategory;
      delete (contentToSave as any).newExam;
      delete (contentToSave as any).newChapterNo;
      delete (contentToSave as any).newChapterName;


      await addContent(contentToSave);
      toast({
        title: 'Content Created!',
        description: `The ${data.testType.toLowerCase()} "${data.title}" has been successfully saved.`,
      });
      
      if (resetType === 'full') {
         form.reset({
            ...form.getValues(),
            title: '',
            board: '',
            examCategory: '',
            exam: '',
            subject: '',
            chapter: '',
            description: '',
            duration: 60,
            access: 'free',
            questions: [],
            newSubject: '',
            newBoard: '',
            newExamCategory: '',
            newExam: '',
            newChapterNo: '',
            newChapterName: '',
            difficulty: 'Medium',
        });
        setChapters([]);
        setExams([]);
      } else { // partial reset
         form.reset({
            ...form.getValues(),
            title: '',
            description: '',
            duration: 60,
            access: 'free',
            questions: [],
            difficulty: 'Medium',
         });
      }
      
      fetchFormData();

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Creating Content',
        description: (error as Error).message,
      });
    }
  }

  const handleTabChange = (value: string) => {
    form.setValue('testType', value, { shouldValidate: true });
  }

  const handleSubjectChange = async (value: string) => {
      form.setValue('subject', value);
      form.setValue('chapter', '');
      setChapters([]);
      setIsAddingNewChapter(false);

      if (value === 'add_new_subject') {
          setIsAddingNewSubject(true);
      } else {
          setIsAddingNewSubject(false);
          const selectedSubject = subjects.find(s => s.name === value);
          if (selectedSubject) {
              const fetchedChapters = await getChaptersBySubjectId(selectedSubject.id);
              setChapters(fetchedChapters);
          }
      }
  }

  const handleBoardChange = (value: string) => {
      form.setValue('board', value);
      if (value === 'add_new_board') {
          setIsAddingNewBoard(true);
      } else {
          setIsAddingNewBoard(false);
      }
  }

  const handleExamCategoryChange = async (value: string) => {
      form.setValue('examCategory', value);
      form.setValue('exam', '');
      setExams([]);
      setIsAddingNewExam(false);

      if (value === 'add_new_exam_category') {
          setIsAddingNewExamCategory(true);
          setIsAddingNewExam(true);
          form.setValue('exam', 'add_new_exam');
      } else {
          setIsAddingNewExamCategory(false);
          const selectedExamCategory = examCategories.find(e => e.name === value);
          if (selectedExamCategory) {
              const fetchedExams = await getExamsByCategory(selectedExamCategory.id);
              setExams(fetchedExams);
          }
      }
  }
  
  const handleExamChange = (value: string) => {
      form.setValue('exam', value);
      if (value === 'add_new_exam') {
          setIsAddingNewExam(true);
      } else {
          setIsAddingNewExam(false);
      }
  }

   const handleChapterChange = (value: string) => {
    form.setValue('chapter', value);
    if (value === 'add_new_chapter') {
      setIsAddingNewChapter(true);
    } else {
      setIsAddingNewChapter(false);
    }
  };

  if (loadingData) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Form Data...</p>
        </div>
    )
  }

  const selectedChapterValue = form.watch('chapter');
  const selectedChapter = chapters.find(c => `${c.chapterNo}. ${c.chapterName}` === selectedChapterValue);

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Add New Content</h1>
      <p className="text-muted-foreground mb-6">
        Select a content type and fill out the form to create a new mock test, quiz, or practice questions.
      </p>

    {contentTypes.length > 0 && (
      <Tabs defaultValue={form.getValues('testType') || contentTypes[0].name} className="w-full mb-6" onValueChange={handleTabChange}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${contentTypes.length}, 1fr)`}}>
          {contentTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.name}>{type.name}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    )}


      <Form {...form}>
        <form className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>
                Provide the essential information for your new content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., NEET Full Syllabus Physics - 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="board"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board</FormLabel>
                      {!isAddingNewBoard ? (
                            <Select onValueChange={handleBoardChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a board" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {boards.map((board) => (
                                    <SelectItem key={board.id} value={board.name}>
                                    {board.name}
                                    </SelectItem>
                                ))}
                                 <SelectItem value="add_new_board">Add new board...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField
                                    control={form.control}
                                    name="newBoard"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter new board name" />
                                    )}
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewBoard(false); form.setValue('board', ''); }}>Cancel</Button>
                             </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                        {!isAddingNewSubject ? (
                            <Select onValueChange={handleSubjectChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.name}>
                                    {subject.name}
                                    </SelectItem>
                                ))}
                                 <SelectItem value="add_new_subject">Add new subject...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField
                                    control={form.control}
                                    name="newSubject"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter new subject name" />
                                    )}
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewSubject(false); form.setValue('subject', ''); }}>Cancel</Button>
                             </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="chapter"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Chapter</FormLabel>
                        {!isAddingNewChapter ? (
                            <Select onValueChange={handleChapterChange} value={field.value} disabled={!form.watch('subject') || form.watch('subject') === 'add_new_subject'}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a chapter" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {chapters.map(chap => <SelectItem key={chap.id} value={`${chap.chapterNo}. ${chap.chapterName}`}>{chap.chapterNo}. {chap.chapterName}</SelectItem>)}
                                    <SelectItem value="add_new_chapter">Add new chapter...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField control={form.control} name="newChapterNo" render={({ field }) => (<Input {...field} placeholder="Chapter No." />)} />
                                <FormField control={form.control} name="newChapterName" render={({ field }) => (<Input {...field} placeholder="Chapter Name" />)} />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewChapter(false); form.setValue('chapter', ''); }}>Cancel</Button>
                            </div>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {selectedChapter && (
                    <FormItem>
                        <FormLabel>Chapter Name</FormLabel>
                        <FormControl>
                        <Input value={selectedChapter.chapterName} readOnly disabled />
                        </FormControl>
                    </FormItem>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="examCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Category</FormLabel>
                      {!isAddingNewExamCategory ? (
                            <Select onValueChange={handleExamCategoryChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an exam category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {examCategories.map((exam) => (
                                    <SelectItem key={exam.id} value={exam.name}>
                                    {exam.name}
                                    </SelectItem>
                                ))}
                                 <SelectItem value="add_new_exam_category">Add new exam category...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField
                                    control={form.control}
                                    name="newExamCategory"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter new exam category name" />
                                    )}
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewExamCategory(false); form.setValue('examCategory', ''); }}>Cancel</Button>
                             </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="exam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam</FormLabel>
                      {!isAddingNewExam ? (
                            <Select onValueChange={handleExamChange} value={field.value} disabled={!form.watch('examCategory') || form.watch('examCategory') === 'add_new_exam_category'}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an exam" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {exams.map((exam) => (
                                    <SelectItem key={exam.id} value={exam.name}>
                                    {exam.name}
                                    </SelectItem>
                                ))}
                                 <SelectItem value="add_new_exam">Add new exam...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField
                                    control={form.control}
                                    name="newExam"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter new exam name" />
                                    )}
                                />
                                {!isAddingNewExamCategory && (
                                  <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewExam(false); form.setValue('exam', ''); }}>Cancel</Button>
                                )}
                             </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief description of the test content."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (in minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="access"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                      </Select>
                       <FormDescription>
                          Choose who can access this content.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                       <FormDescription>
                          Set the difficulty level for this content.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add questions to your content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {fields.map((question, index) => {
                    const questionType = form.watch(`questions.${index}.type`);
                    return (
                        <Card key={question.id} className="p-4">
                            <div className="flex justify-between items-center mb-4 gap-4">
                                <h4 className="font-semibold text-lg whitespace-nowrap">Question {index + 1}</h4>
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a question type" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                    <SelectItem value="True/False">True/False</SelectItem>
                                                    <SelectItem value="Short Answer">Short Answer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.text`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Text</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                {questionType === 'Multiple Choice' && (
                                    <>
                                        <FormLabel>Options</FormLabel>
                                        <Controller
                                            control={form.control}
                                            name={`questions.${index}.correctAnswer`}
                                            render={({ field }) => (
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {[0, 1, 2, 3].map(optionIndex => (
                                                         <FormField
                                                            key={optionIndex}
                                                            control={form.control}
                                                            name={`questions.${index}.options.${optionIndex}.text`}
                                                            render={({ field: optionField }) => (
                                                                <FormItem className="flex items-center gap-4">
                                                                     <FormControl>
                                                                        <RadioGroupItem value={optionField.value} />
                                                                     </FormControl>
                                                                    <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </RadioGroup>
                                            )}
                                        />
                                        <FormMessage>{form.formState.errors.questions?.[index]?.correctAnswer?.message}</FormMessage>

                                    </>
                                )}
                                {questionType === 'True/False' && (
                                     <FormField
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Correct Answer</FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {questionType === 'Short Answer' && (
                                    <FormField
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter the correct answer" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </Card>
                    );
                 })}
            </CardContent>
            <CardFooter>
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ text: '', type: 'Multiple Choice', options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}], correctAnswer: '' })}
                >
                    <PlusCircle className="mr-2" />
                    Add Question
                </Button>
            </CardFooter>
          </Card>
          
           <div className="flex items-center gap-4">
                <Button 
                    type="button" 
                    onClick={form.handleSubmit(data => handleFormSubmit(data, 'full'))} 
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Adding..." : "Add Content"}
                </Button>
                <Button 
                    type="button" 
                    variant="secondary"
                    onClick={form.handleSubmit(data => handleFormSubmit(data, 'partial'))} 
                    disabled={form.formState.isSubmitting}
                >
                    <Save className="mr-2 h-4 w-4"/>
                    {form.formState.isSubmitting ? "Saving..." : "Save and Add Another"}
                </Button>
           </div>
        </form>
      </Form>
    </div>
  );
}
