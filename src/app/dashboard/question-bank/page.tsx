'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, Printer, Play, Loader2, BookOpen } from 'lucide-react';
import { getTaxonomyNodes, TaxonomyType, QUESTIONS_COLLECTION } from '@/lib/firebase/question-bank';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/question-bank-types';

type TabDef = {
  id: TaxonomyType;
  name: string;
  countField: string;
  isArray?: boolean;
};

const tabs: TabDef[] = [
  { id: 'subject', name: 'বিষয় ভিত্তিক', countField: 'subjectId' },
  { id: 'board', name: 'বোর্ড ভিত্তিক', countField: 'boardId' },
  { id: 'class', name: 'স্কুল/ক্লাস ভিত্তিক', countField: 'classId' },
  { id: 'exam', name: 'পরীক্ষা ভিত্তিক', countField: 'examIds', isArray: true },
];

interface NodeWithCount extends TaxonomyNode {
  questionCount: number;
}

export default function QuestionBankPage() {
  const [activeTab, setActiveTab] = useState<TabDef>(tabs[0]);
  const [nodes, setNodes] = useState<NodeWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch all taxonomy nodes for the active tab (e.g., all subjects)
        const taxonomyNodes = await getTaxonomyNodes(activeTab.id);
        
        // Fetch question counts for each node
        const nodesWithCounts: NodeWithCount[] = await Promise.all(
          taxonomyNodes.map(async (node) => {
            const colRef = collection(db, QUESTIONS_COLLECTION);
            let countQuery;
            if (activeTab.isArray) {
              countQuery = query(colRef, where(activeTab.countField, 'array-contains', node.id));
            } else {
              countQuery = query(colRef, where(activeTab.countField, '==', node.id));
            }
            const snapshot = await getCountFromServer(countQuery);
            return {
              ...(node as TaxonomyNode),
              questionCount: snapshot.data().count
            };
          })
        );
        
        // Sort by count descending
        nodesWithCounts.sort((a, b) => b.questionCount - a.questionCount);
        setNodes(nodesWithCounts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [activeTab]);

  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1400px] mx-auto text-slate-800 dark:text-slate-100">
      
      {/* Top Navigation & Search Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button 
              key={tab.id} 
              onClick={() => setActiveTab(tab)}
              variant={activeTab.id === tab.id ? "default" : "outline"}
              className={`rounded-full h-9 px-5 text-sm font-medium transition-colors ${
                activeTab.id === tab.id 
                  ? "bg-green-600 hover:bg-green-700 text-white border-transparent" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tab.name}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder={`${activeTab.name} খুঁজুন`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-slate-100/80 dark:bg-slate-800/80 border-transparent focus-visible:ring-1 focus-visible:ring-green-500 rounded-full w-full text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Header Titles */}
      <div className="mt-4 mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">সকল {activeTab.name} প্রশ্নব্যাংক</h1>
        <p className="text-sm font-medium text-slate-400">বিষয়ভিত্তিক সাজানো প্রশ্ন ও অনুশীলন</p>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
              <CardContent className="p-5 flex flex-col h-[140px] justify-between">
                <div className="flex justify-between">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNodes.map((node) => (
            <Card key={node.id} className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl hover:border-green-200 dark:hover:border-green-700 transition-colors">
              <CardContent className="p-5 flex flex-col h-full justify-between gap-6">
                
                {/* Card Header (Title & Actions) */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight mt-1">{node.name}</h3>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 text-xs font-semibold">
                      <BookOpen className="w-3.5 h-3.5" />
                      View
                    </button>
                  </div>
                </div>

                {/* Badges Footer */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-md">
                    <span className="text-slate-500 dark:text-slate-400">Total Questions</span> {node.questionCount}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-md cursor-pointer transition-colors">
                    <Play className="w-3 h-3 fill-slate-500 text-slate-500 dark:fill-slate-400 dark:text-slate-400" />
                    প্রাকটিস
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">কোনো তথ্য পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন।</p>
        </div>
      )}
    </div>
  );
}
