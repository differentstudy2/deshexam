'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCategories, getSubcategories, getExams, getSubjects as getExamSubjects, getChapters as getExamChapters, getTopics as getExamTopics } from '@/lib/firebase/exam-taxonomy';
import { getGuideBoards, getGuideClasses, getGuideAllChapters, getGuideTextbooks, getGuideTopicsByChapter } from '@/lib/firebase/guide';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { createTaxonomyNode } from '@/lib/firebase/taxonomy';
import { migrateOldTextbooksToGuide } from '@/lib/firebase/guide';
import { Loader2 } from 'lucide-react';

export default function MigrateTaxonomyPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isMigratingCompetitive, setIsMigratingCompetitive] = useState(false);
  const [isMigratingAcademic, setIsMigratingAcademic] = useState(false);
  const [isMigratingLegacy, setIsMigratingLegacy] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
    console.log(msg);
  };

  const handleMigrateCompetitive = async () => {
    if (!confirm('Are you sure you want to run the Competitive Migration? This will copy data to taxonomy_nodes.')) return;
    setIsMigratingCompetitive(true);
    setLogs(['Starting Competitive Migration...']);

    try {
      // 1. Categories
      addLog('Fetching Categories...');
      const categories = await getCategories();
      for (const cat of categories) {
        await createTaxonomyNode({
          title: cat.name,
          slug: cat.slug || '',
          type: 'category',
          track: 'competitive',
          parentId: null,
          status: cat.status as any || 'published',
          icon: cat.icon || '',
        }, cat.id); // KEEP ID
      }
      addLog(`Migrated ${categories.length} Categories`);

      // 2. Subcategories
      addLog('Fetching Subcategories...');
      const subcategories = await getSubcategories();
      for (const sub of subcategories) {
        await createTaxonomyNode({
          title: sub.name,
          slug: sub.slug || '',
          type: 'subcategory',
          track: 'competitive',
          parentId: sub.categoryId, // points to Category
          status: sub.status as any || 'published',
        }, sub.id);
      }
      addLog(`Migrated ${subcategories.length} Subcategories`);

      // 3. Exams
      addLog('Fetching Exams...');
      const exams = await getExams();
      for (const exam of exams) {
        await createTaxonomyNode({
          title: exam.name,
          slug: exam.slug || '',
          type: 'exam',
          track: 'competitive',
          parentId: exam.subCategoryId, // points to Subcategory
          grandParentId: exam.categoryId, // optional helpful field
          description: exam.description || '',
          status: exam.status as any || 'published',
        }, exam.id);
      }
      addLog(`Migrated ${exams.length} Exams`);

      // 4. Subjects
      addLog('Fetching Subjects...');
      const subjects = await getExamSubjects();
      for (const subj of subjects) {
        await createTaxonomyNode({
          title: subj.name,
          type: 'subject',
          track: 'competitive',
          parentId: subj.examId, // points to Exam
          status: 'published',
        }, subj.id);
      }
      addLog(`Migrated ${subjects.length} Subjects`);

      // 5. Chapters
      addLog('Fetching Chapters...');
      const chapters = await getExamChapters();
      for (const chap of chapters) {
        await createTaxonomyNode({
          title: chap.name,
          type: 'chapter',
          track: 'competitive',
          parentId: chap.subjectId, // points to Subject
          status: 'published',
        }, chap.id);
      }
      addLog(`Migrated ${chapters.length} Chapters`);

      // 6. Topics
      addLog('Fetching Topics...');
      const topics = await getExamTopics();
      for (const topic of topics) {
        await createTaxonomyNode({
          title: topic.name,
          type: 'topic',
          track: 'competitive',
          parentId: topic.chapterId, // points to Chapter
          status: 'published',
        }, topic.id);
      }
      addLog(`Migrated ${topics.length} Topics`);

      addLog('🎉 Competitive Migration Complete!');
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setIsMigratingCompetitive(false);
    }
  };

  const handleMigrateAcademic = async () => {
    if (!confirm('Are you sure you want to run the Academic Migration?')) return;
    setIsMigratingAcademic(true);
    setLogs(['Starting Academic Migration...']);

    try {
      // 1. Boards
      addLog('Fetching Boards...');
      const boards = await getGuideBoards();
      for (const board of boards) {
        await createTaxonomyNode({
          title: board.title || board.name,
          type: 'board',
          track: 'academic',
          parentId: null,
          status: board.status || 'published',
          seoTitle: board.seoTitle || '',
          slug: board.slug || '',
        }, board.id);
      }
      addLog(`Migrated ${boards.length} Boards`);

      // 2. Classes
      addLog('Fetching Classes...');
      const classes = await getGuideClasses();
      for (const cls of classes) {
        await createTaxonomyNode({
          title: cls.title || cls.name,
          type: 'class',
          track: 'academic',
          parentId: cls.boardId, // points to Board
          status: cls.status || 'published',
        }, cls.id);
      }
      addLog(`Migrated ${classes.length} Classes`);

      // 3. Subjects
      addLog('Fetching Guide Subjects...');
      const subjectsSnap = await getDocs(query(collection(db, 'guide_subjects')));
      const subjects = subjectsSnap.docs.map(d => ({id: d.id, ...d.data() as any}));
      for (const subj of subjects) {
        await createTaxonomyNode({
          title: subj.title || subj.name,
          type: 'subject',
          track: 'academic',
          parentId: subj.classId, // points to Class
          status: subj.status || 'published',
        }, subj.id);
      }
      addLog(`Migrated ${subjects.length} Subjects`);

      // 4. Textbooks
      addLog('Fetching Textbooks...');
      const textbooks = await getGuideTextbooks();
      for (const book of textbooks) {
        await createTaxonomyNode({
          title: book.title || book.name,
          type: 'textbook',
          track: 'academic',
          parentId: book.subjectId, // points to Subject
          author: book.author || '',
          status: book.status || 'published',
        }, book.id);
      }
      addLog(`Migrated ${textbooks.length} Textbooks`);

      // 5. Chapters
      addLog('Fetching Chapters...');
      const chapters = await getGuideAllChapters();
      for (const chap of chapters) {
        await createTaxonomyNode({
          title: chap.title || chap.name,
          type: 'chapter',
          track: 'academic',
          parentId: chap.textbookId, // points to Textbook
          author: chap.author || '',
          status: chap.status || 'published',
        }, chap.id);
      }
      addLog(`Migrated ${chapters.length} Chapters`);

      // 6. Topics
      addLog('Fetching Topics...');
      const topicsSnap = await getDocs(query(collection(db, 'guide_topics')));
      const topics = topicsSnap.docs.map(d => ({id: d.id, ...d.data() as any}));
      for (const topic of topics) {
        await createTaxonomyNode({
          title: topic.title || topic.name,
          type: 'topic',
          track: 'academic',
          parentId: topic.chapterId, // points to Chapter
          author: topic.author || '',
          status: topic.status || 'published',
        }, topic.id);
      }
      addLog(`Migrated ${topics.length} Topics`);

      addLog('🎉 Academic Migration Complete!');
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setIsMigratingAcademic(false);
    }
  };

  const handleMigrateLegacy = async () => {
    if (!confirm('Are you sure you want to run the Legacy Textbook Migration?')) return;
    setIsMigratingLegacy(true);
    setLogs(['Starting Legacy Textbook Migration...']);
    try {
      await migrateOldTextbooksToGuide((msg) => addLog(msg));
      addLog('🎉 Legacy Migration Complete! You can now run Academic Migration to sync them to taxonomy_nodes.');
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setIsMigratingLegacy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Universal Taxonomy Migration</h1>
      <p className="text-gray-500">Run these scripts ONCE to copy data into the new `taxonomy_nodes` collection.</p>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Competitive Track</CardTitle>
            <CardDescription>Migrates categories, subcategories, exams, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleMigrateCompetitive} disabled={isMigratingCompetitive} className="w-full">
              {isMigratingCompetitive && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run Competitive Migration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Track</CardTitle>
            <CardDescription>Migrates boards, classes, textbooks, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleMigrateAcademic} disabled={isMigratingAcademic} className="w-full bg-indigo-600 hover:bg-indigo-700 mb-3">
              {isMigratingAcademic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run Academic Migration
            </Button>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">If you have unmigrated textbooks in the legacy <code>textbooks</code> collection, run this first:</p>
              <Button onClick={handleMigrateLegacy} disabled={isMigratingLegacy} variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                {isMigratingLegacy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                1. Migrate Legacy Textbooks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 text-green-400 font-mono text-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base">Migration Logs</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          {logs.length === 0 && <span className="text-gray-500">Waiting to start...</span>}
        </CardContent>
      </Card>
    </div>
  );
}
