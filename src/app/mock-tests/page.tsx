
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, HelpCircle, BarChart } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { useToast } from '@/hooks/use-toast';
import { getAllContent, getSubjects, getClasses, getGradesByClass, getBoards, getAllTextbooks } from '@/lib/firebase/firestore';
import { MockTestFilters } from "@/components/mock-test-filters";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Textbook } from '@/lib/types';


type Test = {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  questions: any[];
  duration: number;
  difficulty: string | string[];
  questionSource?: string | string[];
  access: "free" | "premium" | "pro";
  testType: string;
  textbookId?: string;
  textbookTitle?: string;
  chapterId?: string;
  topicId?: string;
  board?: string;
  classCategory?: string;
  class?: string;
};

type MetafieldItem = { id: string, name: string };

function getUrlForTest(test: Test) {
    if (test.textbookId && test.chapterId) {
        const topicSegment = test.topicId || 'null';
        return `/textbook-solutions/mock-test/${test.id}/textbook/${test.textbookId}/chapter/${test.chapterId}/topic/${topicSegment}`;
    }
    if (test.textbookId) {
        return `/textbook-solutions/mock-test/${test.id}/textbook/${test.textbookId}`;
    }
    const typeSlug = test.testType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${test.id}`;
}

export default function MockTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
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


  useEffect(() => {
    document.title = "Mock Tests | DeshExam";
    const descriptionMeta = document.querySelector('meta[name="description"]');
    descriptionMeta?.setAttribute('content', 'Practice with our extensive library of mock tests for NEET, JEE, UPSC and more. Simulate real exam conditions and get detailed performance analysis.');
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fetchedTests, allTextbooks, subjectsData, classesData, boardsData] = await Promise.all([
          getAllContent("Mock Test"),
          getAllTextbooks(),
          getSubjects(),
          getClasses(),
          getBoards(),
        ]);
        
        const textbooksMap = new Map((allTextbooks as Textbook[]).map(book => [book.id, book]));

        const testsWithTextbookMeta = (fetchedTests as Test[]).map(test => {
            if (test.textbookId && textbooksMap.has(test.textbookId)) {
                const textbook = textbooksMap.get(test.textbookId);
                return {
                    ...test,
                    textbookTitle: textbook?.title,
                    subject: test.subject || textbook?.subject,
                    board: test.board || textbook?.board,
                    classCategory: test.classCategory || textbook?.classCategory,
                    class: test.class || textbook?.class,
                };
            }
            return test;
        });

        setTests(testsWithTextbookMeta);
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
    }
    
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

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || (test.subtitle && test.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubject = selectedSubject === 'all' || test.subject === selectedSubject;
      const matchesBoard = selectedBoard === 'all' || test.board === selectedBoard;
      const matchesClassCategory = selectedClassCategory === 'all' || test.classCategory === selectedClassCategory;
      const matchesGrade = selectedGrade === 'all' || test.class === selectedGrade;

      return matchesSearch && matchesSubject && matchesBoard && matchesClassCategory && matchesGrade;
    });
  }, [tests, searchQuery, selectedSubject, selectedBoard, selectedClassCategory, selectedGrade]);

  return (
    <div className="container py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Mock Tests</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Challenge yourself with our extensive library of mock tests designed to simulate the real exam experience.
        </p>
      </header>

      <MockTestFilters 
        subjects={subjects}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        boards={boards}
        selectedBoard={selectedBoard}
        onBoardChange={setSelectedBoard}
        classCategories={classCategories}
        selectedClassCategory={selectedClassCategory}
        onClassCategoryChange={setSelectedClassCategory}
        grades={grades}
        selectedGrade={selectedGrade}
        onGradeChange={setSelectedGrade}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex flex-col overflow-hidden">
                <Skeleton className="w-full h-[225px]" />
                <CardContent className="flex-grow p-4 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center space-x-4 pt-2">
                       <Skeleton className="h-4 w-1/3" />
                       <Skeleton className="h-4 w-1/3" />
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
              <CardHeader className="p-0 relative">
                <Image
                  src={`https://picsum.photos/seed/${test.id}/400/225`}
                  alt={test.title}
                  width={400}
                  height={225}
                  className="w-full h-auto object-cover"
                  data-ai-hint={`${test.subject} abstract`}
                />
                <div className="absolute top-2 right-2">
                  <ContentBadge type={test.access} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <div className="flex flex-wrap gap-1 mb-2">
                    {test.subject && <Badge variant="secondary">{test.subject}</Badge>}
                    {test.board && <Badge variant="outline">{test.board}</Badge>}
                    {test.class && <Badge variant="outline">{test.class}</Badge>}
                </div>
                <CardTitle className="font-headline text-lg mt-1 leading-snug">
                  {test.subtitle && <span className="text-primary block text-sm font-medium">{test.subtitle}</span>}
                  {test.title}
                </CardTitle>
                 {test.textbookTitle && <p className="text-xs text-muted-foreground mt-1">From: {test.textbookTitle}</p>}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{test.questions?.length || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{test.duration || test.questions?.length || 0} min</span>
                  </div>
                  {test.difficulty && (
                    <div className="flex items-center gap-1.5">
                      <BarChart className="w-4 h-4" />
                      <span>{Array.isArray(test.difficulty) ? test.difficulty.join(', ') : test.difficulty}</span>
                    </div>
                  )}
                  {test.questionSource && (
                    <div className="flex items-center gap-1.5">
                      <BarChart className="w-4 h-4" />
                      <span>{Array.isArray(test.questionSource) ? test.questionSource.join(', ') : test.questionSource}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={getUrlForTest(test)}>Start Test</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No mock tests found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
