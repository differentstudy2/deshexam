
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { getAllTextbooks, getSubjects, getClasses, getGradesByClass, getBoards, getSchools } from '@/lib/firebase/firestore';
import { TextbookFilters } from "@/components/feature/textbook-filters";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Textbook } from '@/lib/types';
import { TextbookStats } from '@/components/feature/textbook-stats';

type MetafieldItem = { id: string, name: string };

export default function TextbookSolutionsListPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchMetadataAndTextbooks = async () => {
      try {
        setLoading(true);
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
        
        setTextbooks(textbookData as Textbook[]);
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

    fetchMetadataAndTextbooks();
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
    return textbooks.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || book.subject === selectedSubject;
      const matchesClass = selectedGrade === 'all' || book.class === selectedGrade;
      const matchesBoard = selectedBoard === 'all' || book.board === selectedBoard;
      const matchesSchool = selectedSchool === 'all' || (book as any).school === selectedSchool;
      const matchesClassCategory = selectedClassCategory === 'all' || book.classCategory === selectedClassCategory;
      return matchesSearch && matchesSubject && matchesClass && matchesBoard && matchesSchool && matchesClassCategory;
    });
  }, [textbooks, searchQuery, selectedSubject, selectedGrade, selectedClassCategory, selectedBoard, selectedSchool]);

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Textbook Solutions
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Find solutions and practice sets for your school textbooks. Covers all subjects and boards.
          </p>
        </header>

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

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="p-0 relative h-48">
                            <Skeleton className="w-full h-full rounded-t-lg" />
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                             <Skeleton className="h-4 w-1/3" />
                             <Skeleton className="h-6 w-full" />
                             <Skeleton className="h-16 w-full" />
                        </CardContent>
                        <CardFooter className="p-4">
                             <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : filteredTextbooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTextbooks.map((book) => (
              <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
                <Link href={`/textbook-solutions/${book.id}`} className="block">
                    <CardHeader className="p-0 relative h-48">
                        <Image
                            src={book.featureImage || `https://picsum.photos/seed/${book.id}/400/225`}
                            alt={book.title}
                            fill
                            className="object-cover"
                            data-ai-hint={`${book.subject || ''} textbook`}
                        />
                    </CardHeader>
                </Link>
                <CardContent className="flex-grow p-4">
                    <p className="text-sm font-medium text-primary">{book.subject}</p>
                    <Link href={`/textbook-solutions/${book.id}`}>
                        <CardTitle className="font-headline text-lg mt-1 mb-2 leading-snug hover:text-primary transition-colors">
                        {book.title.length > 50
                            ? `${book.title.substring(0, 50)}...`
                            : book.title}
                        </CardTitle>
                    </Link>
                    <TextbookStats textbookId={book.id} />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                        <Link href={`/textbook-solutions/${book.id}`}><BookOpen className="mr-2"/> View Solutions</Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No textbooks found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
