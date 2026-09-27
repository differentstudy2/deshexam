'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuestionBuilderFilters() {
  const [taxonomies, setTaxonomies] = useState({
    boards: [] as any[],
    classes: [] as any[],
    subjects: [] as any[],
    textbooks: [] as any[],
    chapters: [] as any[],
    topics: [] as any[]
  });
  const [filters, setFilters] = useState({
    boardId: 'all',
    classId: 'all',
    subjectId: 'all',
    textbookId: 'all',
    chapterId: 'all',
    topicId: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxonomies = async () => {
      setLoading(true);
      try {
        const { getHardcodedTaxonomyNodes } = await import('@/data/hardcoded/taxonomy');
        const allNodes = getHardcodedTaxonomyNodes();
        
        let fetchedBoards = allNodes.filter(n => n.type === 'board' || n.type === 'category');
        
        setTaxonomies({
          boards: fetchedBoards,
          classes: allNodes.filter(n => n.type === 'class' || n.type === 'subcategory'),
          subjects: allNodes.filter(n => n.type === 'subject'),
          textbooks: allNodes.filter(n => n.type === 'textbook' || n.type === 'exam'),
          chapters: allNodes.filter(n => n.type === 'chapter'),
          topics: allNodes.filter(n => n.type === 'topic')
        });
      } catch (error) {
        console.error("Failed to fetch taxonomies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTaxonomies();
  }, []);

  // Cascading filter logic using parentId
  const filteredClasses = useMemo(() => {
    if (filters.boardId === 'all') return [];
    return taxonomies.classes.filter(c => c.parentId === filters.boardId);
  }, [taxonomies.classes, filters.boardId]);

  const filteredSubjects = useMemo(() => {
    if (filters.classId === 'all') return [];
    return taxonomies.subjects.filter(s => s.parentId === filters.classId);
  }, [taxonomies.subjects, filters.classId]);

  const filteredTextbooks = useMemo(() => {
    if (filters.subjectId === 'all') return [];
    return taxonomies.textbooks.filter(t => t.parentId === filters.subjectId);
  }, [taxonomies.textbooks, filters.subjectId]);

  const filteredChapters = useMemo(() => {
    if (filters.textbookId === 'all') return [];
    return taxonomies.chapters.filter(c => c.parentId === filters.textbookId);
  }, [taxonomies.chapters, filters.textbookId]);

  const filteredTopics = useMemo(() => {
    if (filters.chapterId === 'all') return [];
    return taxonomies.topics.filter(t => t.parentId === filters.chapterId);
  }, [taxonomies.topics, filters.chapterId]);

  // Handlers to reset children
  const handleBoardChange = (v: string) => setFilters(prev => ({ ...prev, boardId: v, classId: 'all', subjectId: 'all', textbookId: 'all', chapterId: 'all', topicId: 'all' }));
  const handleClassChange = (v: string) => setFilters(prev => ({ ...prev, classId: v, subjectId: 'all', textbookId: 'all', chapterId: 'all', topicId: 'all' }));
  const handleSubjectChange = (v: string) => setFilters(prev => ({ ...prev, subjectId: v, textbookId: 'all', chapterId: 'all', topicId: 'all' }));
  const handleTextbookChange = (v: string) => setFilters(prev => ({ ...prev, textbookId: v, chapterId: 'all', topicId: 'all' }));
  const handleChapterChange = (v: string) => setFilters(prev => ({ ...prev, chapterId: v, topicId: 'all' }));
  const handleTopicChange = (v: string) => setFilters(prev => ({ ...prev, topicId: v }));

  const router = useRouter();

  const handleCreate = () => {
    const params = new URLSearchParams();
    if (filters.boardId !== 'all') params.set('boardId', filters.boardId);
    if (filters.classId !== 'all') params.set('classId', filters.classId);
    if (filters.subjectId !== 'all') params.set('subjectId', filters.subjectId);
    if (filters.textbookId !== 'all') params.set('textbookId', filters.textbookId);
    if (filters.chapterId !== 'all') params.set('chapterId', filters.chapterId);
    if (filters.topicId !== 'all') params.set('topicId', filters.topicId);
    
    router.push(`/e-question-builder/select-question?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Loading filters...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
      <Select value={filters.boardId} onValueChange={handleBoardChange}>
        <SelectTrigger className="bg-white dark:bg-slate-900 rounded-sm h-9 text-sm"><SelectValue placeholder="Board" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All Boards</SelectItem>{taxonomies.boards.map(b => <SelectItem key={b.id} value={b.id}>{b.acronym || b.shortName || b.name || b.title}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={filters.classId} onValueChange={handleClassChange}>
        <SelectTrigger className="bg-white dark:bg-slate-900 rounded-sm h-9 text-sm"><SelectValue placeholder="Class" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All Classes</SelectItem>{filteredClasses.map(b => <SelectItem key={b.id} value={b.id}>{b.name || b.title}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={filters.subjectId} onValueChange={handleSubjectChange}>
        <SelectTrigger className="bg-white dark:bg-slate-900 rounded-sm h-9 text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All Subjects</SelectItem>{filteredSubjects.map(b => <SelectItem key={b.id} value={b.id}>{b.name || b.title}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={filters.textbookId} onValueChange={handleTextbookChange}>
        <SelectTrigger className="bg-white dark:bg-slate-900 rounded-sm h-9 text-sm"><SelectValue placeholder="Textbook" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All Textbooks</SelectItem>{filteredTextbooks.map(b => <SelectItem key={b.id} value={b.id}>{b.name || b.title}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={filters.chapterId} onValueChange={handleChapterChange}>
        <SelectTrigger className="bg-white dark:bg-slate-900 rounded-sm h-9 text-sm"><SelectValue placeholder="Chapter" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All Chapters</SelectItem>{filteredChapters.map(b => <SelectItem key={b.id} value={b.id}>{b.name || b.title}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={filters.topicId} onValueChange={handleTopicChange}>
        <SelectTrigger className="bg-white dark:bg-slate-900 rounded-sm h-9 text-sm"><SelectValue placeholder="Topic" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All Topics</SelectItem>{filteredTopics.map(b => <SelectItem key={b.id} value={b.id}>{b.name || b.title}</SelectItem>)}</SelectContent>
      </Select>
      <Button onClick={handleCreate} className="bg-[#6b21a8] hover:bg-[#581c87] text-white font-semibold w-full rounded-sm h-9 text-sm">
        Create
      </Button>
    </div>
  );
}
