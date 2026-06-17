'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTaxonomyNodeById, getTaxonomyNodesByParent, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Layers, Target, FileText, Activity, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface TopicData extends TaxonomyNode {
  contentsCount: number;
  questionCount: number;
}

interface ChapterData extends TaxonomyNode {
  topics: TopicData[];
}

export default function TextbookDetailsPage() {
  const params = useParams();
  const textbookId = params.id as string;

  const [textbook, setTextbook] = useState<TaxonomyNode | null>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!textbookId) return;

      try {
        // 1. Fetch the textbook
        const tbNode = await getTaxonomyNodeById(textbookId);
        setTextbook(tbNode);

        if (tbNode) {
          // 2. Fetch all chapters for this textbook
          const chapterNodes = await getTaxonomyNodesByParent(textbookId);
          
          // 3. For each chapter, fetch topics and their content counts
          const fullChapters: ChapterData[] = await Promise.all(
            chapterNodes.map(async (chap) => {
              const topicNodes = await getTaxonomyNodesByParent(chap.id);
              
              const fullTopics: TopicData[] = await Promise.all(
                topicNodes.map(async (top) => {
                  // Fetch question count for this topic
                  const qQuery = query(collection(db, 'questions'), where('topicId', '==', top.id));
                  const qSnap = await getDocs(qQuery);
                  
                  // Fetch content (resources/videos/etc) count for this topic
                  const cQuery = query(collection(db, 'content'), where('topicId', '==', top.id));
                  const cSnap = await getDocs(cQuery);

                  return {
                    ...top,
                    questionCount: qSnap.size,
                    contentsCount: cSnap.size
                  };
                })
              );

              return {
                ...chap,
                topics: fullTopics
              };
            })
          );

          setChapters(fullChapters);
        }
      } catch (error) {
        console.error('Error fetching textbook details:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [textbookId]);

  if (loading) {
    return <div className="p-12 text-center text-gray-500 animate-pulse">Loading textbook data...</div>;
  }

  if (!textbook) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Textbook Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/textbook">Return to Textbooks</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full">
          <Link href="/admin/textbook">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            {textbook.title}
          </h1>
          <div className="text-gray-500 flex items-center gap-2 mt-1">
            <Badge variant="outline">{textbook.track} Track</Badge>
            {textbook.status === 'active' || textbook.status === 'published' ? (
               <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Published</Badge>
            ) : (
               <Badge variant="secondary">Draft</Badge>
            )}
            <span className="text-sm border-l pl-2 border-gray-300">ID: {textbook.id}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/textbook-solutions/${textbook.id}`} target="_blank">
              <Eye className="w-4 h-4" /> View Client Page
            </Link>
          </Button>
        </div>
      </div>

      {/* Chapters & Topics Accordion */}
      <Card>
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-xl flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            Chapters & Topics Content Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {chapters.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="text-gray-500 mb-4">No chapters have been added to this textbook yet.</p>
              <Button asChild variant="outline">
                <Link href="/admin/chapters">Manage Chapters</Link>
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4" defaultValue={chapters.map(c => c.id)}>
              {chapters.map((chapter) => (
                <AccordionItem 
                  key={chapter.id} 
                  value={chapter.id} 
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-5 py-4 hover:bg-gray-50 hover:no-underline transition-colors data-[state=open]:bg-indigo-50/30">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-md text-indigo-600">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-lg text-gray-900 text-left">{chapter.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/textbook-solutions/${textbook.id}/chapter/${chapter.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </Link>
                        </Button>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          {chapter.topics.length} Topics
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-0 pb-0">
                    <div className="border-t border-gray-100">
                      {chapter.topics.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 bg-gray-50 text-sm">
                          No topics found under this chapter.
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {chapter.topics.map((topic) => (
                            <li key={topic.id} className="p-4 pl-12 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <Target className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                <span className="font-medium text-gray-800">{topic.title}</span>
                                <Button asChild variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link href={`/textbook-solutions/${textbook.id}/chapter/${chapter.id}/topic/${topic.id}`} target="_blank">
                                    <ExternalLink className="h-3 w-3 text-indigo-600" />
                                  </Link>
                                </Button>
                              </div>
                              
                              {/* Contents Types & Counts */}
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 font-normal ${topic.contentsCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                >
                                  <FileText className="h-3 w-3" />
                                  {topic.contentsCount} Resources
                                </Badge>
                                
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 font-normal ${topic.questionCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                >
                                  <Activity className="h-3 w-3" />
                                  {topic.questionCount} Questions
                                </Badge>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
