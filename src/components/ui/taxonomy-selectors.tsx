'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  getCategories, 
  getSubcategories, 
  getExams, 
  getSubjects, 
  getChapters,
  getTopics 
} from '@/lib/firebase/exam-taxonomy';

interface TaxonomySelectorProps {
  onSelectionChange: (selection: {
    category: string;
    subcategory: string;
    exam: string;
    subject: string;
    chapter: string;
    topic: string;
  }) => void;
  initialValues?: {
    category?: string;
    subcategory?: string;
    exam?: string;
    subject?: string;
    chapter?: string;
    topic?: string;
  };
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function ExamTaxonomySelector({ 
  onSelectionChange, 
  initialValues,
  orientation = 'vertical',
  className = ''
}: TaxonomySelectorProps) {
  
  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  // Selection States
  const [selectedCat, setSelectedCat] = useState(initialValues?.category || '');
  const [selectedSub, setSelectedSub] = useState(initialValues?.subcategory || '');
  const [selectedExam, setSelectedExam] = useState(initialValues?.exam || '');
  const [selectedSubj, setSelectedSubj] = useState(initialValues?.subject || '');
  const [selectedChapter, setSelectedChapter] = useState(initialValues?.chapter || '');
  const [selectedTopic, setSelectedTopic] = useState(initialValues?.topic || '');

  // Loading States
  const [loading, setLoading] = useState({
    cat: false, sub: false, exam: false, subj: false, chap: false, topic: false
  });

  // Notify parent
  useEffect(() => {
    onSelectionChange({
      category: selectedCat,
      subcategory: selectedSub,
      exam: selectedExam,
      subject: selectedSubj,
      chapter: selectedChapter,
      topic: selectedTopic
    });
  }, [selectedCat, selectedSub, selectedExam, selectedSubj, selectedChapter, selectedTopic]);

  // Load Categories on mount
  useEffect(() => {
    const loadCats = async () => {
      setLoading(p => ({ ...p, cat: true }));
      try {
        const data = await getCategories();
        setCategories(data);
      } finally {
        setLoading(p => ({ ...p, cat: false }));
      }
    };
    loadCats();
  }, []);

  // Cascading loads
  useEffect(() => {
    if (!selectedCat) {
      setSubcategories([]); setExams([]); setSubjects([]); setChapters([]); setTopics([]);
      return;
    }
    const loadSubs = async () => {
      setLoading(p => ({ ...p, sub: true }));
      try {
        const data = await getSubcategories(selectedCat);
        setSubcategories(data);
      } finally {
        setLoading(p => ({ ...p, sub: false }));
      }
    };
    loadSubs();
  }, [selectedCat]);

  useEffect(() => {
    if (!selectedSub) {
      setExams([]); setSubjects([]); setChapters([]); setTopics([]);
      return;
    }
    const loadExams = async () => {
      setLoading(p => ({ ...p, exam: true }));
      try {
        const data = await getExams(selectedSub);
        setExams(data);
      } finally {
        setLoading(p => ({ ...p, exam: false }));
      }
    };
    loadExams();
  }, [selectedSub]);

  useEffect(() => {
    if (!selectedExam) {
      setSubjects([]); setChapters([]); setTopics([]);
      return;
    }
    const loadSubjs = async () => {
      setLoading(p => ({ ...p, subj: true }));
      try {
        const data = await getSubjects(selectedExam);
        setSubjects(data);
      } finally {
        setLoading(p => ({ ...p, subj: false }));
      }
    };
    loadSubjs();
  }, [selectedExam]);

  useEffect(() => {
    if (!selectedSubj) {
      setChapters([]); setTopics([]);
      return;
    }
    const loadChapters = async () => {
      setLoading(p => ({ ...p, chap: true }));
      try {
        const data = await getChapters(selectedSubj);
        setChapters(data);
      } finally {
        setLoading(p => ({ ...p, chap: false }));
      }
    };
    loadChapters();
  }, [selectedSubj]);

  useEffect(() => {
    if (!selectedChapter) {
      setTopics([]);
      return;
    }
    const loadTopics = async () => {
      setLoading(p => ({ ...p, topic: true }));
      try {
        const data = await getTopics(selectedChapter);
        setTopics(data);
      } finally {
        setLoading(p => ({ ...p, topic: false }));
      }
    };
    loadTopics();
  }, [selectedChapter]);

  const containerClass = orientation === 'vertical' 
    ? 'flex flex-col gap-4' 
    : 'grid grid-cols-1 md:grid-cols-6 gap-4';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-gray-500">Category</Label>
        <Select 
          value={selectedCat} 
          onValueChange={(val) => { setSelectedCat(val); setSelectedSub(''); setSelectedExam(''); setSelectedSubj(''); setSelectedChapter(''); setSelectedTopic(''); }}
          disabled={loading.cat}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={loading.cat ? "Loading..." : "Select Category"} />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-gray-500">Subcategory</Label>
        <Select 
          value={selectedSub} 
          onValueChange={(val) => { setSelectedSub(val); setSelectedExam(''); setSelectedSubj(''); setSelectedChapter(''); setSelectedTopic(''); }}
          disabled={!selectedCat || loading.sub}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={!selectedCat ? "Select Category First" : loading.sub ? "Loading..." : "Select Subcategory"} />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Exam */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-gray-500">Exam</Label>
        <Select 
          value={selectedExam} 
          onValueChange={(val) => { setSelectedExam(val); setSelectedSubj(''); setSelectedChapter(''); setSelectedTopic(''); }}
          disabled={!selectedSub || loading.exam}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={!selectedSub ? "Select Subcategory First" : loading.exam ? "Loading..." : "Select Exam"} />
          </SelectTrigger>
          <SelectContent>
            {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-gray-500">Subject</Label>
        <Select 
          value={selectedSubj} 
          onValueChange={(val) => { setSelectedSubj(val); setSelectedChapter(''); setSelectedTopic(''); }}
          disabled={!selectedExam || loading.subj}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={!selectedExam ? "Select Exam First" : loading.subj ? "Loading..." : "Select Subject"} />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Chapter */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-gray-500">Chapter</Label>
        <Select 
          value={selectedChapter} 
          onValueChange={(val) => { setSelectedChapter(val); setSelectedTopic(''); }}
          disabled={!selectedSubj || loading.chap}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={!selectedSubj ? "Select Subject First" : loading.chap ? "Loading..." : "Select Chapter"} />
          </SelectTrigger>
          <SelectContent>
            {chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Topic */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-gray-500">Topic</Label>
        <Select 
          value={selectedTopic} 
          onValueChange={setSelectedTopic}
          disabled={!selectedChapter || loading.topic}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={!selectedChapter ? "Select Chapter First" : loading.topic ? "Loading..." : "Select Topic"} />
          </SelectTrigger>
          <SelectContent>
            {topics.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
