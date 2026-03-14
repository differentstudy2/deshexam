
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, FileText, CheckSquare, BookOpen } from "lucide-react";
import { getAllTextbooks, getSubjects, getClasses, getGradesByClass, getBoards, getSchoolsByClass } from '@/lib/firebase/firestore';
import { TextbookFilters } from "@/components/feature/textbook-filters";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Textbook } from '@/lib/types';
import { TextbookStats } from '@/components/feature/textbook-stats';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContentBadge } from '@/components/content-badge';


type MetafieldItem = { id: string, name: string };
const ITEMS_PER_PAGE = 8;

export default function TextbookSolutionsListPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
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
  const [schools, setSchools] = useState<MetafieldItem[]>([]);
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
        ] = await Promise.all([
          getAllTextbooks(),
          getSubjects(),
          getClasses(),
          getBoards(),
        ]);
        
        setTextbooks(textbookData as Textbook[]);
        setSubjects(subjectsData);
        setClassCategories(classesData);
        setBoards(boardsData);

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
    const fetchDependentData = async () => {
        if(selectedClassCategory !== 'all') {
            const [fetchedGrades, fetchedSchools] = await Promise.all([
                getGradesByClass(selectedClassCategory),
                getSchoolsByClass(selectedClassCategory),
            ]);
            setGrades(fetchedGrades);
            setSchools(fetchedSchools);
        } else {
            setGrades([]);
            setSchools([]);
        }
        setSelectedGrade('all');
        setSelectedSchool('all');
    };
    fetchDependentData();
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
  
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };
  
  const visibleTextbooks = useMemo(() => {
    return filteredTextbooks.slice(0, visibleCount);
  }, [filteredTextbooks, visibleCount]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedSubject, selectedGrade, selectedClassCategory, selectedBoard, selectedSchool]);

  return (
    <div>
        <section className="relative w-full py-20 md:py-28 lg:py-36 text-white bg-textbook-hero-gradient">
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg wave-text">
                    <span>Unlock</span> <span>Every</span> <span>Answer</span>
                </h1>
                <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto drop-shadow-md">
                    Navigate your studies with ease. Access comprehensive, step-by-step solutions for all your textbook questions, from NCERT to top competitive exam books. Your path to academic excellence starts here.
                </p>
            </div>
        </section>

      <div className="container py-12 md:py-16">
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleTextbooks.map((book) => (
                <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow bg-textbook-card-gradient text-white">
                  <CardHeader className="p-0 relative bg-black/20 flex items-center justify-center h-48">
                    <Link href={`/textbook-solutions/${book.id}`} className="block w-full h-full">
                        <Image
                          src={book.featureImage || `https://picsum.photos/seed/${book.id}/200/280`}
                          alt={book.title}
                          width={200}
                          height={280}
                          className="w-full h-full object-contain"
                          data-ai-hint={`${book.subject || ''} textbook`}
                        />
                    </Link>
                     <div className="absolute top-2 right-2">
                        <ContentBadge type={book.access} />
                      </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-3 space-y-2">
                      <div className="flex flex-wrap gap-1">
                          {book.subject && <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/80">{book.subject}</Badge>}
                          {book.class && <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/80">{book.class}</Badge>}
                          {book.board && <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/80">{book.board}</Badge>}
                      </div>
                      <Link href={`/textbook-solutions/${book.id}`}>
                          <CardTitle className="font-headline text-base mt-1 leading-snug text-white hover:text-primary-foreground/80 transition-colors">
                              {book.title.length > 52 ? book.title.substring(0, 52) + '...' : book.title}
                          </CardTitle>
                      </Link>
                       <p className="text-xs text-primary-foreground/70">by {(book as any).authorName || 'DeshExam'}</p>
                      <TextbookStats textbookId={book.id} />
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                      <Button asChild className="w-full">
                          <Link href={`/textbook-solutions/${book.id}`}><BookOpen className="mr-2"/> View Solutions</Link>
                      </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
             {visibleCount < filteredTextbooks.length && (
              <div className="mt-12 text-center">
                <Button onClick={handleLoadMore} size="lg">
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No textbooks found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
