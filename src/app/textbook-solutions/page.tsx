

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import { Book, Layers, FileText, CheckSquare, Library } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentBadge } from '@/components/content-badge';
import { getSubjects, getClasses, getBoards, getGradesByClass } from '@/lib/firebase/firestore';
import { TextbookFilters } from '@/components/feature/textbook-filters';

type Textbook = {
    id: string;
    title: string;
    description: string;
    subject: string;
    class: string;
    classCategory: string; // Ensure this field exists or is added
    board?: string;
    school?: string;
    featureImage?: string;
    access: 'free' | 'premium' | 'pro';
};

const TextbookStats = ({ textbookId }: { textbookId: string }) => {
    const [stats, setStats] = useState({ chapterCount: 0, topicCount: 0, practiceSetCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            let chapterCount = 0;
            let topicCount = 0;
            let practiceSetCount = 0;
            
            const chaptersRef = collection(db, 'textbooks', textbookId, 'chapters');
            const chaptersSnapshot = await getDocs(chaptersRef);
            chapterCount = chaptersSnapshot.size;

            for (const chapterDoc of chaptersSnapshot.docs) {
                const topicsRef = collection(chapterDoc.ref, "topics");
                const topicsSnapshot = await getDocs(topicsRef);
                topicCount += topicsSnapshot.size;

                 for (const topicDoc of topicsSnapshot.docs) {
                    const practiceSetsRef = collection(topicDoc.ref, "practiceSets");
                    const practiceSetsSnapshot = await getDocs(practiceSetsRef);
                    practiceSetCount += practiceSetsSnapshot.size;
                }
            }
            setStats({ chapterCount, topicCount, practiceSetCount });
            setLoading(false);
        };
        fetchStats();
    }, [textbookId]);

    if (loading) {
        return (
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                    <Layers className="h-4 w-4" />
                    <span>... Chapters</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>... Topics</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <CheckSquare className="h-4 w-4" />
                    <span>... Sets</span>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{stats.chapterCount} Chapters</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{stats.topicCount} Topics</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                <span>{stats.practiceSetCount} Sets</span>
            </div>
        </div>
    );
};

export default function TextbookSolutionsListPage() {
  const [allTextbooks, setAllTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [subjects, setSubjects] = useState<{ id: string, name: string }[]>([]);
  const [classCategories, setClassCategories] = useState<{ id: string, name: string }[]>([]);
  const [grades, setGrades] = useState<{ id: string, name: string }[]>([]);
  const [boards, setBoards] = useState<{ id: string, name: string }[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClassCategory, setSelectedClassCategory] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');
  
  useEffect(() => {
    document.title = "Textbook Solutions | DeshExam";
    const descriptionMeta = document.querySelector('meta[name="description"]');
    descriptionMeta?.setAttribute('content', "Find free and comprehensive solutions for your school textbooks. Covers all subjects and boards like NCERT, CBSE, etc.");
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    keywordsMeta?.setAttribute('content', 'textbook solutions, ncert solutions, cbse solutions, free textbook solutions, exam preparation');
    
    // Add structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Textbook Solutions | DeshExam",
        "description": "Find free and comprehensive solutions for your school textbooks.",
        "url": "https://deshexam.com/textbook-solutions"
    });
    document.head.appendChild(script);

    return () => {
        document.head.removeChild(script);
    }
}, []);


  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const textbooksCollectionRef = collection(db, 'textbooks');
      
      try {
        const [
            textbooksSnapshot, 
            subjectsData, 
            classesData, 
            boardsData
        ] = await Promise.all([
            getDocs(textbooksCollectionRef),
            getSubjects(),
            getClasses(),
            getBoards()
        ]);
        
        const textbooksData = textbooksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Textbook[];

        setAllTextbooks(textbooksData);
        setSubjects(subjectsData);
        setClassCategories(classesData);
        setBoards(boardsData);
        
        const uniqueSchools = Array.from(new Set(textbooksData.map(book => book.school).filter(Boolean))) as string[];
        setSchools(uniqueSchools);

      } catch (error) {
          console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
        if(selectedClassCategory !== 'all') {
            const fetchedGrades = await getGradesByClass(selectedClassCategory);
            setGrades(fetchedGrades);
        } else {
            setGrades([]);
        }
        setSelectedGrade('all');
    }
    fetchGrades();
  }, [selectedClassCategory]);

  const filteredTextbooks = useMemo(() => {
      const gradeNames = grades.map(g => g.name);

      return allTextbooks.filter(book => {
          const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesSubject = selectedSubject === 'all' || book.subject === selectedSubject;
          const matchesBoard = selectedBoard === 'all' || book.board === selectedBoard;
          const matchesSchool = selectedSchool === 'all' || book.school === selectedSchool;
          
          let matchesClass = true;
          if (selectedClassCategory !== 'all') {
              if (selectedGrade !== 'all') {
                  matchesClass = book.class === selectedGrade;
              } else {
                  matchesClass = gradeNames.includes(book.class);
              }
          }

          return matchesSearch && matchesSubject && matchesClass && matchesBoard && matchesSchool;
      });
  }, [allTextbooks, searchQuery, selectedSubject, selectedClassCategory, selectedGrade, selectedBoard, selectedSchool, grades]);


  if (loading) {
    return (
        <div className="container mx-auto py-8 space-y-6 max-w-7xl">
            <header className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Textbook Solutions</h1>
                <p className="text-lg text-muted-foreground mt-2">
                Select a textbook to view its solutions, topics, and practice questions.
                </p>
            </header>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({length: 4}).map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
       <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Textbook Solutions</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Select a textbook to view its solutions, topics, and practice questions.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTextbooks.map((book) => (
          <Card key={book.id} className="overflow-hidden flex flex-col group">
            <div className="relative w-full h-48 overflow-hidden bg-secondary">
                <Image
                    src={book.featureImage || `https://picsum.photos/seed/${book.id}/400/300`}
                    alt={book.title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
                 <div className="absolute top-2 right-2">
                    <ContentBadge type={book.access} />
                </div>
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
              <div className="flex flex-wrap gap-2 mb-2">
                  {book.subject && <Badge variant="secondary">{book.subject}</Badge>}
                  {book.class && <Badge variant="secondary">{book.class}</Badge>}
                  {book.board && <Badge variant="outline">{book.board}</Badge>}
              </div>
              <h3 className="font-bold text-lg flex items-center gap-2 flex-grow">{book.title}</h3>
              <TextbookStats textbookId={book.id} />
            </CardContent>
            <CardContent className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/textbook-solutions/${book.id}`}>View Solutions</Link>
                </Button>
            </CardContent>
          </Card>
        ))}
         {filteredTextbooks.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
                <p>No textbooks found matching your filters.</p>
            </div>
        )}
      </div>
    </div>
  );
}
