
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import { deleteTextbook, getAllTextbooks, getSubjects, getClasses, getGradesByClass, getBoards, getSchools } from '@/lib/firebase/firestore';
import type { Textbook } from '@/lib/types';
import { collection, getDocs, doc } from 'firebase/firestore';
import { Book, Edit, Trash2, PlusCircle, Layers, FileText, CheckSquare, Eye, Award } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { TextbookStats } from '@/components/feature/textbook-stats';
import { TextbookFilters } from '@/components/feature/textbook-filters';
import { Loader2 } from 'lucide-react';

type MetafieldItem = { id: string, name: string };

export default function ManageTextbooksPage() {
  const [allTextbooks, setAllTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [textbookToDelete, setTextbookToDelete] = useState<Textbook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<MetafieldItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [classCategories, setClassCategories] = useState<MetafieldItem[]>([]);
  const [selectedClassCategory, setSelectedClassCategory] = useState('all');
  const [grades, setGrades] = useState<MetafieldItem[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [boards, setBoards] = useState<MetafieldItem[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('all');

  const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [
          textbookData,
          subjectsData,
          classesData,
          boardsData,
          schoolsData
        ] = await Promise.all([
          getAllTextbooks(),
          getSubjects(),
          getClasses(),
          getBoards(),
          getSchools(),
        ]);
        
        setAllTextbooks(textbookData as Textbook[]);
        setSubjects(subjectsData);
        setClassCategories(classesData);
        setBoards(boardsData);
        setSchools(schoolsData.map(s => s.name || '').filter(Boolean));

      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error fetching data",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchInitialData();
  }, [toast]);
  
  useEffect(() => {
    const fetchGrades = async () => {
        if(selectedClassCategory !== 'all') {
            const fetchedGrades = await getGradesByClass(selectedClassCategory);
            setGrades(fetchedGrades);
        } else {
            setGrades([]);
        }
        setSelectedGrade('all');
    };
    fetchGrades();
  }, [selectedClassCategory]);

  const filteredTextbooks = useMemo(() => {
    return allTextbooks.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || book.subject === selectedSubject;
      const matchesClass = selectedGrade === 'all' || book.class === selectedGrade;
      const matchesBoard = selectedBoard === 'all' || book.board === selectedBoard;
      const matchesSchool = selectedSchool === 'all' || (book as any).school === selectedSchool;
      const matchesClassCategory = selectedClassCategory === 'all' || book.classCategory === selectedClassCategory;
      return matchesSearch && matchesSubject && matchesClass && matchesBoard && matchesSchool && matchesClassCategory;
    });
  }, [allTextbooks, searchQuery, selectedSubject, selectedGrade, selectedClassCategory, selectedBoard, selectedSchool]);


  const handleDeleteClick = (book: Textbook) => {
    setTextbookToDelete(book);
  };

  const handleConfirmDelete = async () => {
    if (!textbookToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTextbook(textbookToDelete.id);
      toast({
        title: "Textbook Deleted",
        description: `"${textbookToDelete.title}" and all its content have been removed.`,
      });
      fetchInitialData(); // Refetch the list
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Deleting Textbook",
        description: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
      setTextbookToDelete(null);
    }
  };


  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Textbooks...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Manage Textbooks</h1>
          <p className="text-muted-foreground">
            A list of all textbooks available on the platform.
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
            <Link href="/admin/textbooks/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Textbook
            </Link>
        </Button>
      </div>

       <TextbookFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            classCategories={classCategories}
            selectedClassCategory={selectedClassCategory}
            onClassCategoryChange={setSelectedClassCategory}
            grades={grades}
            selectedGrade={selectedGrade}
            onGradeChange={setSelectedGrade}
            boards={boards}
            selectedBoard={selectedBoard}
            onBoardChange={setSelectedBoard}
            schools={schools}
            selectedSchool={selectedSchool}
            onSchoolChange={setSelectedSchool}
        />
        
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTextbooks.map((book) => (
          <Card key={book.id} className="flex flex-col max-h-[550px]">
            <CardHeader className="p-0 relative h-48 flex-shrink-0">
               <Image 
                src={book.featureImage || `https://picsum.photos/seed/${book.id}/400/300`}
                alt={book.title}
                fill
                className="object-cover rounded-t-lg"
               />
            </CardHeader>
            <CardContent className="flex-grow p-4 flex flex-col overflow-y-auto">
              <h3 className="font-bold text-lg flex items-center gap-2 flex-grow"><Book /> {book.title}</h3>
              {book.board && <Badge variant="outline">{book.board}</Badge>}
              <TextbookStats textbookId={book.id} />
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4 border-t">
                <div className="flex gap-2 w-full">
                    <Button asChild className="w-full" variant="secondary">
                        <Link href={`/textbook-solutions/${book.id}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                    </Button>
                    <Button asChild className="w-full" variant="outline">
                        <Link href={`/admin/textbooks/${book.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>
                 <Button asChild className="w-full">
                    <Link href={`/admin/textbooks/${book.id}`}>Manage Chapters</Link>
                </Button>
                 <Button asChild className="w-full">
                    <Link href={`/admin/textbooks/${book.id}/add-exam`}>Add Exam</Link>
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => handleDeleteClick(book)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </CardFooter>
          </Card>
        ))}
         {filteredTextbooks.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
                <p>No textbooks found matching your criteria.</p>
            </div>
        )}
      </div>

       <AlertDialog open={!!textbookToDelete} onOpenChange={(open) => !open && setTextbookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the textbook "{textbookToDelete?.title}" and all of its chapters, topics, and questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
