'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { AssessmentBase } from '@/lib/assessment-types';
import { getAssessments } from '@/lib/firebase/assessment';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { AssessmentCollectionType } from '@/lib/firebase/assessment';
import { getTaxonomyNodesByTrack, TaxonomyNode } from '@/lib/firebase/taxonomy';

interface AssessmentListingProps {
  collectionName: AssessmentCollectionType;
  title: string;
  description: string;
  type: 'Practice' | 'Quiz' | 'Mock Test' | 'Exam';
  baseHref: string;
}

export function AssessmentListing({ collectionName, title, description, type, baseHref }: AssessmentListingProps) {
  const [assessments, setAssessments] = useState<AssessmentBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  
  // Taxonomy States
  const [boards, setBoards] = useState<TaxonomyNode[]>([]);
  const [classes, setClasses] = useState<TaxonomyNode[]>([]);
  const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
  
  // Selected Filters
  const [boardId, setBoardId] = useState('All');
  const [classId, setClassId] = useState('All');
  const [subjectId, setSubjectId] = useState('All');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAssessments(collectionName);
        // Only show published
        setAssessments((data as AssessmentBase[]).filter(a => a.status === 'Published'));
        
        // Fetch taxonomies
        const allAcademic = await getTaxonomyNodesByTrack('academic');
        setBoards(allAcademic.filter((n: any) => n.type === 'board'));
        setClasses(allAcademic.filter((n: any) => n.type === 'class'));
        setSubjects(allAcademic.filter((n: any) => n.type === 'subject'));
        
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [collectionName]);

  const filtered = assessments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          (a.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficulty === 'All' || a.difficulty === difficulty;
    
    // Explicitly cast to any because boardId/classId/subjectId are not on AssessmentBase but are on MockTest/PracticeSet
    const assessmentWithTaxonomy = a as any;
    
    const matchesBoard = boardId === 'All' || assessmentWithTaxonomy.boardId === boardId;
    const matchesClass = classId === 'All' || assessmentWithTaxonomy.classId === classId;
    const matchesSubject = subjectId === 'All' || assessmentWithTaxonomy.subjectId === subjectId;
    
    return matchesSearch && matchesDiff && matchesBoard && matchesClass && matchesSubject;
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{title}</h1>
        <p className="text-xl text-slate-500 max-w-3xl">{description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div>
            <div className="flex items-center gap-2 font-semibold text-lg mb-4 pb-2 border-b">
              <SlidersHorizontal className="w-5 h-5 text-[#00a651]" /> Filters
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Keywords..." 
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Taxonomy Filters */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Board</label>
                <Select value={boardId} onValueChange={setBoardId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Boards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Boards</SelectItem>
                    {boards.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Class</label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Classes</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Subject</label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Subjects</SelectItem>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading {title}...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-lg text-slate-500">No {title.toLowerCase()} found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(assessment => (
                <AssessmentCard 
                  key={assessment.id} 
                  assessment={assessment} 
                  type={type} 
                  href={`${baseHref}/${assessment.slug}`} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
