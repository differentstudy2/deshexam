'use client';

import React, { useEffect, useState } from 'react';
import { getGuideSubjects, getCurriculumBySubject, saveGuideSubject, saveGuideChapter, saveGuideTopic, deleteGuideTopic, deleteGuideChapter, deleteGuideSubject } from '@/lib/firebase/guide';
import { SidebarSubject, Chapter } from '@/app/guide/guide-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, FolderTree, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function GuideManagerPage() {
  const [subjects, setSubjects] = useState<SidebarSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('sahitya-kanika');
  const [curriculum, setCurriculum] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInit = async () => {
    setLoading(true);
    const subs = await getGuideSubjects();
    setSubjects(subs);
    if (subs.length > 0 && !subs.find(s => s.id === selectedSubject)) {
      setSelectedSubject(subs[0].id);
    }
    setLoading(false);
  };

  const fetchCurr = async () => {
    if (!selectedSubject) return;
    const curr = await getCurriculumBySubject(selectedSubject);
    setCurriculum(curr);
  };

  useEffect(() => {
    fetchInit();
  }, []);

  useEffect(() => {
    fetchCurr();
  }, [selectedSubject]);

  const handleAddSubject = async () => {
    const title = window.prompt("Enter new Subject Title:");
    if (!title) return;
    const id = window.prompt("Enter Subject ID (e.g. math-class-9):");
    if (!id) return;
    
    await saveGuideSubject(id, { id, title, countStr: '0', orderIndex: subjects.length });
    fetchInit();
  };

  const handleAddChapter = async () => {
    if (!selectedSubject) return alert("Select a subject first");
    const title = window.prompt("Enter new Chapter Title:");
    if (!title) return;
    const id = window.prompt("Enter Chapter ID (e.g. c1):");
    if (!id) return;
    
    await saveGuideChapter(id, { id, title, subjectId: selectedSubject, orderIndex: curriculum.length });
    fetchCurr();
  };

  const handleAddTopic = async (chapterId: string, chapterTitle: string, currentTopicCount: number) => {
    if (!selectedSubject) return;
    const title = window.prompt(`Enter new Topic Title for ${chapterTitle}:`);
    if (!title) return;
    const id = window.prompt("Enter Topic ID (e.g. topic-1):");
    if (!id) return;
    
    await saveGuideTopic(id, { id, title, subjectId: selectedSubject, chapterId, subtopics: [], orderIndex: currentTopicCount });
    fetchCurr();
  };

  const handleDeleteTopic = async (id: string) => {
    if (!window.confirm(`Delete topic ${id}?`)) return;
    await deleteGuideTopic(id);
    fetchCurr();
  };

  const handleDeleteChapter = async (id: string) => {
    if (!window.confirm(`Delete chapter ${id}? This will not automatically delete its topics.`)) return;
    await deleteGuideChapter(id);
    fetchCurr();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FolderTree className="w-8 h-8 text-emerald-600" />
          Guide Curriculum Manager
        </h1>
        <p className="text-slate-500 mt-2">Manage the subjects, chapters, and topics for the Guide section.</p>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {subjects.map(sub => (
          <Button 
            key={sub.id} 
            variant={selectedSubject === sub.id ? 'default' : 'outline'}
            className={selectedSubject === sub.id ? 'bg-[#107c41] hover:bg-[#0b5c30]' : ''}
            onClick={() => setSelectedSubject(sub.id)}
          >
            {sub.title}
          </Button>
        ))}
        <Button variant="outline" className="border-dashed border-2" onClick={handleAddSubject}>
          <Plus className="w-4 h-4 mr-2" /> Add Subject
        </Button>
      </div>

      {loading ? (
        <div className="p-10 text-center">Loading...</div>
      ) : (
        <div className="grid gap-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-bold">Chapters in {subjects.find(s => s.id === selectedSubject)?.title}</h2>
              <p className="text-sm text-slate-500">Manage the hierarchy of chapters and topics.</p>
            </div>
            <Button className="bg-[#107c41] hover:bg-[#0b5c30]" onClick={handleAddChapter}>
              <Plus className="w-4 h-4 mr-2" /> Add Chapter
            </Button>
          </div>

          {curriculum.length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed rounded-xl text-slate-500">
              No chapters found for this subject.
            </div>
          ) : (
            curriculum.map(chapter => (
              <Card key={chapter.id} className="shadow-sm border-slate-200 dark:border-slate-800">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400">{chapter.title}</CardTitle>
                      <CardDescription className="mt-1">ID: {chapter.id}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDeleteChapter(chapter.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {chapter.topics.map((topic: any) => (
                      <div key={topic.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            {topic.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">ID: {topic.id} • {topic.subtopics?.length || 0} Subtopics</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Link href={`/admin/guide/content?topicId=${topic.id}`} className="flex-1 sm:flex-none">
                            <Button variant="secondary" size="sm" className="w-full sm:w-auto bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">
                              Manage Content
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteTopic(topic.id)}><Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" /></Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 mt-2" onClick={() => handleAddTopic(chapter.id, chapter.title, chapter.topics.length)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Topic to {chapter.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
