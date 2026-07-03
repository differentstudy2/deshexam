'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getQuestions, getTaxonomyNodes } from '@/lib/firebase/question-bank';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { Loader2, Search, Edit, ArrowRight, BookOpen, AlertCircle, Sparkles, Filter, ChevronDown, Bot } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation';

interface InitialFilters {
  boardId: string;
  classId: string;
  subjectId: string;
  textbookId: string;
  chapterId: string;
  topicId: string;
}

export default function QuestionSelectionInterface({ initialFilters }: { initialFilters: InitialFilters }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paperName, setPaperName] = useState('');

  // Auto-fill paper name based on taxonomy
  useEffect(() => {
    const fetchDefaultPaperName = async () => {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/client');

      let isAcademic = false;

      const fetchNodeName = async (id: string | undefined) => {
        if (!id || id === 'all') return null;
        const d = await getDoc(doc(db, 'taxonomy_nodes', id));
        if (d.exists()) {
          if (d.data().track === 'academic') isAcademic = true;
          return d.data().title || d.data().name || '';
        }
        return null;
      };

      const boardName = await fetchNodeName(initialFilters.boardId);
      const className = await fetchNodeName(initialFilters.classId);
      const subName = await fetchNodeName(initialFilters.subjectId);
      const chapName = await fetchNodeName(initialFilters.chapterId);

      const names: string[] = [];
      if (isAcademic) {
        if (boardName) names.push(boardName);
        if (className) names.push(className);
      }
      if (subName) names.push(subName);
      if (chapName) names.push(chapName);

      if (names.length > 0) {
        setPaperName(names.join(' - '));
      }
    };
    fetchDefaultPaperName();
  }, [initialFilters]);

  // Selections
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Taxonomy Maps for displaying names
  const [examMap, setExamMap] = useState<Record<string, string>>({});
  const [yearMap, setYearMap] = useState<Record<string, string>>({});
  const [boardMap, setBoardMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTaxonomies = async () => {
      try {
        const [exams, years, boards] = await Promise.all([
          getTaxonomyNodes('exam'),
          getTaxonomyNodes('year'),
          getTaxonomyNodes('board')
        ]);
        const eMap: Record<string, string> = {};
        exams.forEach((e: any) => eMap[e.id] = e.name);
        setExamMap(eMap);
        const yMap: Record<string, string> = {};
        years.forEach((y: any) => yMap[y.id] = y.name);
        setYearMap(yMap);
        const bMap: Record<string, string> = {};
        boards.forEach((b: any) => bMap[b.id] = b.name);
        setBoardMap(bMap);
      } catch (e) {
        console.error("Failed to load taxonomies", e);
      }
    };
    fetchTaxonomies();
  }, []);

  // Local active filters
  const [activeFilters, setActiveFilters] = useState({
    subjectId: initialFilters.subjectId,
    chapterId: initialFilters.chapterId,
    topicId: initialFilters.topicId,
    difficulty: 'all',
    type: 'all',
    search: ''
  });

  // Sidebar filters (mock arrays based on screenshot)
  const questionTypes = [
    { id: 'mcq', label: 'বহুনির্বাচনি প্রশ্ন' },
    { id: 'cq', label: 'সৃজনশীল প্রশ্ন' },
    { id: 'gk', label: 'সাধারণ জ্ঞান' },
    { id: 'board', label: 'বোর্ড প্রশ্ন' }
  ];

  const sourceBoards = [
    { id: 'all', label: 'সকল বোর্ড' },
    { id: 'dhaka', label: 'ঢাকা বোর্ড' },
    { id: 'rajshahi', label: 'রাজশাহী বোর্ড' },
    { id: 'cumilla', label: 'কুমিল্লা বোর্ড' },
    { id: 'jessore', label: 'যশোর বোর্ড' },
    { id: 'chittagong', label: 'চট্টগ্রাম বোর্ড' },
    { id: 'barishal', label: 'বরিশাল বোর্ড' },
    { id: 'sylhet', label: 'সিলেট বোর্ড' },
    { id: 'dinajpur', label: 'দিনাজপুর বোর্ড' },
    { id: 'mymensingh', label: 'ময়মনসিংহ বোর্ড' },
  ];

  const schools = [
    'ভিকারুননিসা নূন স্কুল এন্ড কলেজ, ঢাকা',
    'আইডিয়াল স্কুল অ্যান্ড কলেজ, মতিঝিল, ঢাকা',
    'উইলস্ লিট্ল ফ্লাওয়ার স্কুল এন্ড কলেজ, ঢাকা',
    'মির্জাপুর ক্যাডেট কলেজ , টাঙ্গাইল',
    'ময়মনসিংহ গার্লস ক্যাডেট কলেজ',
    'রাজশাহী ক্যাডেট কলেজ',
    'পাবনা ক্যাডেট কলেজ'
  ];

  const levels = [
    'বোর্ড পরীক্ষা প্রশ্ন',
    'অনুশীলনীর প্রশ্ন',
    'বুকমার্ক প্রশ্ন',
    'পছন্দের প্রশ্ন'
  ];

  const sortOptions = [
    'Most View',
    'Most Vote',
    'Most Bookmark',
    'Recently Added',
    'Oldest First',
    'Last Week',
    'Last Month'
  ];

  const years = ['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

  useEffect(() => {
    fetchQuestions();
  }, [activeFilters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const qFilters: any = {};

      // Map frontend filters to backend fields. 
      // Use only the most specific node to avoid missing questions if higher-up taxonomy tree is broken.
      if (activeFilters.topicId && activeFilters.topicId !== 'all') {
        qFilters.topicId = activeFilters.topicId;
      } else if (activeFilters.chapterId && activeFilters.chapterId !== 'all') {
        qFilters.chapterId = activeFilters.chapterId;
      } else if (activeFilters.subjectId && activeFilters.subjectId !== 'all') {
        qFilters.subjectId = activeFilters.subjectId;
      }

      if (activeFilters.difficulty !== 'all') qFilters.difficulty = activeFilters.difficulty;

      let data = await getQuestions(qFilters, 50);

      if (activeFilters.search) {
        const lowerSearch = activeFilters.search.toLowerCase();
        data = data.filter(q => q.questionText.toLowerCase().includes(lowerSearch));
      }

      if (activeFilters.type !== 'all') {
        if (activeFilters.type === 'MCQ') {
          data = data.filter(q => q.options?.a); // simple check
        } else {
          data = data.filter(q => !q.options?.a);
        }
      }

      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleNextStep = () => {
    if (selectedIds.size === 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    // Save selected question IDs to sessionStorage so the next page can load them
    sessionStorage.setItem('selectedQuestionIds', JSON.stringify(Array.from(selectedIds)));

    // Push to the new page with search parameters
    const params = new URLSearchParams();
    if (initialFilters.boardId && initialFilters.boardId !== 'all') params.set('board_id', initialFilters.boardId);
    if (initialFilters.classId && initialFilters.classId !== 'all') params.set('class_id', initialFilters.classId);
    if (initialFilters.textbookId && initialFilters.textbookId !== 'all') params.set('textbook_id', initialFilters.textbookId);
    if (activeFilters.subjectId && activeFilters.subjectId !== 'all') params.set('subject_id', activeFilters.subjectId);
    if (activeFilters.chapterId && activeFilters.chapterId !== 'all') params.set('chapter_id', activeFilters.chapterId);
    if (paperName) params.set('paper_name', paperName);

    router.push(`/e-question-builder/create-question?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row max-w-[1400px] mx-auto bg-[#f8f9fa] min-h-screen">

      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block overflow-y-auto h-screen sticky top-0">
        <div className="p-4">
          {/* Top Filter Header & Button */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <Filter className="w-4 h-4" /> ফিল্টার
              </h3>
              <Button variant="outline" size="sm" className="h-8 text-xs border-gray-300">
                রিসেট
              </Button>
            </div>
            <Button
              onClick={handleNextStep}
              className="w-full bg-[#388e3c] hover:bg-[#2e7d32] text-white font-bold py-6 rounded-md text-lg shadow-sm"
            >
              প্রশ্ন তৈরি ({selectedIds.size}) <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Type */}
          <div className="mb-6 border border-blue-50 rounded-md bg-[#f8f9fa]">
            <h3 className="font-bold text-gray-800 bg-[#e3f2fd] text-[#1e88e5] px-4 py-2 flex justify-between items-center text-sm">
              টাইপ <span className="text-lg leading-none">-</span>
            </h3>
            <div className="mt-2 space-y-1 px-2 pb-3 pt-1">
              {['গাণিতিক প্রশ্ন', 'চিত্রযুক্ত প্রশ্ন', 'উদ্দীপক প্রশ্ন', 'ব্যাখ্যাসহ প্রশ্ন'].map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
                  <Checkbox id={`type-${i}`} />
                  <label htmlFor={`type-${i}`} className="text-[15px] text-gray-800 cursor-pointer flex-1">{t}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 border border-blue-50 rounded-md">
            <h3 className="font-bold text-gray-800 bg-[#4caf50] text-white px-4 py-2 rounded flex justify-between items-center">
              বিষয় <Filter className="w-4 h-4" />
            </h3>
            <div className="mt-2 space-y-1">
              {questionTypes.map(qt => (
                <div key={qt.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <Checkbox id={`qt-${qt.id}`} />
                  <label htmlFor={`qt-${qt.id}`} className="text-sm text-gray-700 cursor-pointer">{qt.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 bg-[#e3f2fd] text-[#1e88e5] px-4 py-2 flex justify-between items-center text-sm">
              উৎস বোর্ড <span className="text-lg leading-none">-</span>
            </h3>
            <div className="mt-2 space-y-1 px-2">
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input className="h-8 pl-7 text-xs bg-white" placeholder="Search..." />
              </div>
              <div className="max-h-40 overflow-y-auto pr-1">
                {sourceBoards.map(sb => (
                  <div key={sb.id} className="flex items-start gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <Checkbox id={`sb-${sb.id}`} className="mt-0.5" />
                    <label htmlFor={`sb-${sb.id}`} className="text-sm text-gray-700 cursor-pointer flex-1 leading-snug">{sb.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schools */}
          <div className="mb-6 border border-blue-50 rounded-md">
            <h3 className="font-bold text-gray-800 bg-[#e3f2fd] text-[#1e88e5] px-4 py-2 flex justify-between items-center text-sm">
              সকল স্কুল <span className="text-lg leading-none">-</span>
            </h3>
            <div className="mt-2 space-y-1 px-2 pb-2">
              <div className="relative mb-2">
                <Input className="h-8 pl-3 text-xs bg-white" placeholder="Search..." />
              </div>
              <div className="max-h-48 overflow-y-auto pr-1">
                {schools.map((school, i) => (
                  <div key={i} className="flex items-start gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <Checkbox id={`sc-${i}`} className="mt-0.5" />
                    <label htmlFor={`sc-${i}`} className="text-[13px] text-gray-700 cursor-pointer flex-1 leading-tight">{school}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Level */}
          <div className="mb-6 border border-blue-50 rounded-md bg-[#f8f9fa]">
            <h3 className="font-bold text-gray-800 bg-[#e3f2fd] text-[#1e88e5] px-4 py-2 flex justify-between items-center text-sm">
              লেভেল <span className="text-lg leading-none">-</span>
            </h3>
            <div className="mt-2 space-y-1 px-2 pb-3 pt-1">
              {levels.map((level, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
                  <Checkbox id={`lv-${i}`} />
                  <label htmlFor={`lv-${i}`} className="text-[15px] text-gray-800 cursor-pointer flex-1">{level}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="mb-6 border border-blue-50 rounded-md">
            <h3 className="font-bold text-gray-800 bg-[#e3f2fd] text-[#1e88e5] px-4 py-2 flex justify-between items-center text-sm">
              Sort By <span className="text-lg leading-none">-</span>
            </h3>
            <div className="mt-2 px-3 pb-3 pt-2">
              <RadioGroup defaultValue="Recently Added" className="space-y-3">
                {sortOptions.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`sort-${i}`} />
                    <label htmlFor={`sort-${i}`} className="text-[15px] text-gray-800 cursor-pointer">{opt}</label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Years */}
          <div className="mb-6 border border-blue-50 rounded-md bg-[#f8f9fa]">
            <h3 className="font-bold text-gray-800 bg-[#e3f2fd] text-[#1e88e5] px-4 py-2 flex justify-between items-center text-sm">
              সকল সাল <span className="text-lg leading-none">-</span>
            </h3>
            <div className="mt-2 space-y-1 px-2 pb-2 max-h-48 overflow-y-auto pr-1">
              {years.map((year, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
                  <Checkbox id={`yr-${i}`} />
                  <label htmlFor={`yr-${i}`} className="text-[15px] text-gray-800 cursor-pointer flex-1">{year}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Random Question Selection & AI */}
          <div className="mb-6 bg-white p-3 rounded-md shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-base">র‌্যান্ডম প্রশ্ন নির্বাচন:</h3>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Max 4000" className="flex-1" />
              <Button className="bg-[#c8e6c9] hover:bg-[#a5d6a7] text-gray-800">প্রয়োগ</Button>
            </div>
            <Button variant="outline" className="w-full border-green-400 text-gray-800 font-semibold shadow-sm hover:bg-green-50">
              <Bot className="w-5 h-5 text-blue-500 mr-2" /> Generate AI Questions
            </Button>
          </div>

          {/* Pricing Tables */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-4 text-center text-lg">কম খরচে প্রশ্নপত্র তৈরি করুন</h3>
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-transparent gap-0 mb-2">
                <TabsTrigger value="monthly" className="data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] rounded-none shadow-none text-gray-500">Monthly</TabsTrigger>
                <TabsTrigger value="yearly" className="data-[state=active]:text-gray-800 data-[state=active]:border-gray-200 border border-transparent rounded-t-md data-[state=active]:border data-[state=active]:border-b-white data-[state=active]:shadow-sm">Yearly</TabsTrigger>
              </TabsList>
              <TabsContent value="monthly">
                <div className="overflow-hidden border border-[#a5d6a7] rounded-md">
                  <table className="w-full text-sm text-center">
                    <thead className="bg-[#a5d6a7] text-gray-800">
                      <tr>
                        <th className="py-2 px-1 font-semibold border-r border-[#81c784]">Package</th>
                        <th className="py-2 px-1 font-semibold border-r border-[#81c784]">Price</th>
                        <th className="py-2 px-1 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-1 border-r border-gray-100">T-BASIC</td>
                        <td className="py-3 px-1 border-r border-gray-100"><span className="text-red-400 line-through text-xs mr-1">799</span><span className="font-semibold text-gray-700 text-base">599৳</span></td>
                        <td className="py-3 px-1"><Button variant="secondary" size="sm" className="h-7 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">SUBSCRIBE</Button></td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-1 border-r border-gray-100">T-PLUS</td>
                        <td className="py-3 px-1 border-r border-gray-100"><span className="text-red-400 line-through text-xs mr-1">1599</span><span className="font-semibold text-gray-700 text-base">1199৳</span></td>
                        <td className="py-3 px-1"><Button variant="secondary" size="sm" className="h-7 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">SUBSCRIBE</Button></td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-1 border-r border-gray-100">T-PRO</td>
                        <td className="py-3 px-1 border-r border-gray-100 flex flex-col items-center justify-center"><span className="text-red-400 line-through text-xs">1999</span><span className="font-semibold text-gray-700 text-base">1599৳</span></td>
                        <td className="py-3 px-1"><Button variant="secondary" size="sm" className="h-7 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">SUBSCRIBE</Button></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-1 border-r border-gray-100">T-Pro-<br />Max</td>
                        <td className="py-3 px-1 border-r border-gray-100 flex flex-col items-center justify-center"><span className="text-red-400 line-through text-xs">5000</span><span className="font-semibold text-gray-700 text-base">2200৳</span></td>
                        <td className="py-3 px-1"><Button variant="secondary" size="sm" className="h-7 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">SUBSCRIBE</Button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mb-6 pt-4 border-t">
            <h3 className="font-bold text-gray-800 mb-4 text-center text-[15px]">প্রাইসিং তালিকা (প্যাকেজ ছাড়া)</h3>
            <div className="overflow-hidden border border-gray-200 rounded-md">
              <table className="w-full text-sm text-center">
                <thead className="bg-[#e8eaf6] text-gray-800">
                  <tr>
                    <th className="py-2 px-1 font-semibold border-r border-gray-200">প্রশ্ন পরিসর</th>
                    <th className="py-2 px-1 font-semibold">মূল্য (৳)</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-1 border-r border-gray-100 text-gray-700">1 - 30</td>
                    <td className="py-2 px-1 text-gray-800 font-medium">৳.60/প্রশ্ন</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-[#fbfbfc]">
                    <td className="py-2 px-1 border-r border-gray-100 text-gray-700">31 - 50</td>
                    <td className="py-2 px-1 text-gray-800 font-medium">৳.55/প্রশ্ন</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-1 border-r border-gray-100 text-gray-700">51 - 70</td>
                    <td className="py-2 px-1 text-gray-800 font-medium">৳.50/প্রশ্ন</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-[#fbfbfc]">
                    <td className="py-2 px-1 border-r border-gray-100 text-gray-700">71 - 100</td>
                    <td className="py-2 px-1 text-gray-800 font-medium">৳.45/প্রশ্ন</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-1 border-r border-gray-100 text-gray-700">101 - 200</td>
                    <td className="py-2 px-1 text-gray-800 font-medium">৳.40/প্রশ্ন</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-[#fbfbfc]">
                    <td className="py-2 px-1 border-r border-gray-100 text-gray-700">201 - 500</td>
                    <td className="py-2 px-1 text-gray-800 font-medium">৳.35/প্রশ্ন</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-1 border-r border-gray-100 text-gray-700">501 - 1000</td>
                    <td className="py-2 px-1 text-gray-800 font-medium">৳.30/প্রশ্ন</td>
                  </tr>
                  <tr className="bg-[#fbfbfc]">
                    <td className="py-2 px-1 border-r border-gray-100 text-gray-700">1001 - 5000</td>
                    <td className="py-2 px-1 text-gray-800 font-medium">৳.25/প্রশ্ন</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen relative pb-24">

        {/* BANNER */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 m-4 rounded-xl flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-yellow-200" />
              মাত্র ১৫ পয়সায় প্রশ্নপত্র তৈরি করুন আজই!
            </h2>
            <p className="text-sm opacity-90">এক ক্লিকে, দারুন ফরমেটিংয়ে</p>
          </div>
          <div className="mt-4 md:mt-0 text-center z-10">
            <div className="text-sm font-semibold mb-2">E-BASIC থেকে E-PRO সেরা প্যাকেজ বেছে নিন</div>
            <Button className="bg-[#b91c1c] hover:bg-red-800 text-white rounded-full px-6 shadow-md border border-red-500/50">
              SUBSCRIBE NOW <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* TOP TAXONOMY FILTERS */}
        <div className="px-4 pb-2">
          <div className="bg-white p-3 rounded-t-lg border-b border-gray-100 flex flex-wrap gap-4 items-end shadow-sm">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-bold text-gray-500 mb-1 block">বিষয়</label>
              <Select value={activeFilters.subjectId} onValueChange={v => setActiveFilters({ ...activeFilters, subjectId: v })}>
                <SelectTrigger className="h-9 border-gray-200"><SelectValue placeholder="বিষয়" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বিষয়</SelectItem>
                  {/* Normally populate dynamically, keeping placeholder for UI demo */}
                  <SelectItem value={activeFilters.subjectId !== 'all' ? activeFilters.subjectId : 'temp'}>নির্বাচিত বিষয়</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-bold text-gray-500 mb-1 block">অধ্যায়</label>
              <Select value={activeFilters.chapterId} onValueChange={v => setActiveFilters({ ...activeFilters, chapterId: v })}>
                <SelectTrigger className="h-9 border-gray-200"><SelectValue placeholder="অধ্যায়" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল অধ্যায়</SelectItem>
                  {activeFilters.chapterId !== 'all' && <SelectItem value={activeFilters.chapterId}>নির্বাচিত অধ্যায়</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-bold text-gray-500 mb-1 block">টপিক</label>
              <Select value={activeFilters.topicId} onValueChange={v => setActiveFilters({ ...activeFilters, topicId: v })}>
                <SelectTrigger className="h-9 border-gray-200"><SelectValue placeholder="টপিক" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল টপিক</SelectItem>
                  {activeFilters.topicId !== 'all' && <SelectItem value={activeFilters.topicId}>নির্বাচিত টপিক</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SUB FILTERS */}
          <div className="bg-white p-3 rounded-b-lg border border-gray-200 flex flex-wrap items-center justify-between gap-3 shadow-sm border-t-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600">ফিল্টার:</span>
              <Select value={activeFilters.difficulty} onValueChange={v => setActiveFilters({ ...activeFilters, difficulty: v })}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="কাঠিন্য" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল কাঠিন্য</SelectItem>
                  <SelectItem value="Easy">সহজ</SelectItem>
                  <SelectItem value="Medium">মধ্যম</SelectItem>
                  <SelectItem value="Hard">কঠিন</SelectItem>
                </SelectContent>
              </Select>

              <Select value={activeFilters.type} onValueChange={v => setActiveFilters({ ...activeFilters, type: v })}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="ধরন" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল ধরন</SelectItem>
                  <SelectItem value="MCQ">বহুনির্বাচনি</SelectItem>
                  <SelectItem value="CQ">সৃজনশীল</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  className="h-8 pl-7 text-xs w-[200px]"
                  placeholder="প্রশ্ন খুঁজুন..."
                  value={activeFilters.search}
                  onChange={e => setActiveFilters({ ...activeFilters, search: e.target.value })}
                />
              </div>
              <Button variant="outline" className="h-8 text-xs px-3 border-gray-300">ক্লিয়ার</Button>
              <Button className="h-8 text-xs bg-[#e91e63] hover:bg-pink-700 text-white px-4">+ নতুন</Button>
            </div>
          </div>
        </div>

        {/* QUESTION LIST */}
        <div className="px-4 mt-2 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-lg p-10 text-center border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">কোনো প্রশ্ন পাওয়া যায়নি</h3>
              <p className="text-gray-500 text-sm">অনুগ্রহ করে ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, index) => {
                const isSelected = selectedIds.has(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleSelect(q.id)}
                    className={`bg-white border rounded-lg p-4 shadow-sm transition-colors cursor-pointer ${isSelected ? 'border-[#4caf50] ring-1 ring-[#4caf50] bg-[#f1f8e9]' : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="font-bold text-gray-600 mt-0.5">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="text-gray-800 text-[15px] font-medium leading-relaxed mb-3">
                            <div dangerouslySetInnerHTML={{ __html: q.questionText }} />
                          </div>

                          {/* OPTIONS (If MCQ) */}
                          {(!q.questionType || q.questionType === 'MCQ') && q.options?.a && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${q.correctAnswer === 'a' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                  {q.correctAnswer === 'a' ? '✓' : 'ক'}
                                </div>
                                <span>{q.options.a}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${q.correctAnswer === 'b' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                  {q.correctAnswer === 'b' ? '✓' : 'খ'}
                                </div>
                                <span>{q.options.b}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${q.correctAnswer === 'c' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                  {q.correctAnswer === 'c' ? '✓' : 'গ'}
                                </div>
                                <span>{q.options.c}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${q.correctAnswer === 'd' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                  {q.correctAnswer === 'd' ? '✓' : 'ঘ'}
                                </div>
                                <span>{q.options.d}</span>
                              </div>
                            </div>
                          )}

                           {/* TRUE / FALSE */}
                           {q.questionType === 'T/F' && (
                               <div className="flex gap-4 mt-2">
                                  <div className={`px-4 py-2 border rounded-lg text-sm font-medium ${q.correctAnswer?.toLowerCase() === 'true' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200'}`}>
                                      {q.correctAnswer?.toLowerCase() === 'true' && <span className="mr-2 text-green-600">✓</span>} True
                                  </div>
                                  <div className={`px-4 py-2 border rounded-lg text-sm font-medium ${q.correctAnswer?.toLowerCase() === 'false' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200'}`}>
                                      {q.correctAnswer?.toLowerCase() === 'false' && <span className="mr-2 text-green-600">✓</span>} False
                                  </div>
                               </div>
                           )}

                           {/* FILL IN THE BLANK (FIB) */}
                           {q.questionType === 'FIB' && (
                               <div className="mt-3 text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded border border-gray-100">
                                  {q.correctAnswer && (
                                      <div className="flex gap-2 items-center flex-wrap">
                                          <span className="font-semibold text-gray-700">Answers:</span>
                                          {q.correctAnswer.split(',').map((ans: string, i: number) => (
                                              <span key={i} className="text-green-700 bg-green-100 px-2 py-0.5 rounded font-medium border border-green-200">{ans.trim()}</span>
                                          ))}
                                      </div>
                                  )}
                                  {(q.options?.a || q.options?.b || q.options?.c || q.options?.d) && (
                                      <div className="flex gap-2 items-center flex-wrap mt-2">
                                          <span className="font-semibold text-gray-700">Distractors:</span>
                                          {['a', 'b', 'c', 'd'].map(opt => q.options?.[opt as keyof typeof q.options] && (
                                              <span key={opt} className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs border border-red-100">
                                                  {q.options[opt as keyof typeof q.options]}
                                              </span>
                                          ))}
                                      </div>
                                  )}
                               </div>
                           )}

                          {/* MATCHING PAIRS (If Match) */}
                          {q.questionType === 'Match' && q.matchingPairs && q.matchingPairs.length > 0 && (
                            <div className="mt-3 bg-gray-50 p-3 rounded border border-gray-100">
                              <div className="grid grid-cols-2 gap-x-4 mb-2 font-bold text-gray-800 border-b border-gray-200 pb-2">
                                <div>Column A</div>
                                <div>Column B</div>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                                {q.matchingPairs.map((pair: any, idx: number) => (
                                  <React.Fragment key={idx}>
                                    <div className="font-medium flex items-start gap-2">
                                      <span className="text-gray-500">{idx + 1}.</span> {pair.left}
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-gray-500">{String.fromCharCode(65 + idx)}.</span> {pair.right}
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* TAGS */}
                          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-500">
                            <span className="bg-[#eef2ec] text-[#4a634a] font-bold tracking-wider px-2 py-1 rounded uppercase">[{q.questionType || 'MCQ'}]</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">[{q.difficulty || 'Medium'}]</span>
                            {(q.sourceBoard || (q.boardId && boardMap[q.boardId])) && <span className="bg-gray-100 px-2 py-1 rounded">[{q.sourceBoard || boardMap[q.boardId!]}]</span>}
                            {(q.sourceYear || (q.yearId && yearMap[q.yearId])) && <span className="bg-gray-100 px-2 py-1 rounded">[{q.sourceYear || yearMap[q.yearId!]}]</span>}
                            {(q.sourceExam || (q.examIds?.length ? q.examIds.map(id => examMap[id]).filter(Boolean).join(', ') : '')) && <span className="bg-gray-100 px-2 py-1 rounded">[{q.sourceExam || (q.examIds?.length ? q.examIds.map(id => examMap[id]).filter(Boolean).join(', ') : '')}]</span>}
                            {q.tags && q.tags.map((tag, i) => (
                              <span key={i} className="bg-gray-100 px-2 py-1 rounded">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS (Right Side) */}
                      <div className="flex flex-col items-end justify-between h-full space-y-8">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 text-xs text-blue-600 hover:text-blue-800 p-0 px-2 border border-transparent hover:border-blue-200"
                        >
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(q.id)}
                            className="w-5 h-5 rounded border-gray-300 text-[#4caf50] focus:ring-[#4caf50]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FLOATING ACTION BUTTON */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleNextStep}
            disabled={selectedIds.size === 0}
            className="bg-[#4caf50] hover:bg-green-600 text-white rounded-full px-6 py-6 shadow-xl flex items-center gap-2 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white"
          >
            পরবর্তী ধাপ ({selectedIds.size}) <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* CONFIRMATION MODAL */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="max-w-md p-6 bg-white border-0 shadow-2xl">
            <DialogHeader className="text-center mb-2">
              <DialogTitle className="text-xl font-bold text-gray-800 flex justify-center w-full">প্রিন্ট কপি নাম লিখুন</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <Button className="w-full bg-[#ffb74d] hover:bg-[#ffa726] text-white font-bold h-10 shadow-sm text-[15px]">
                কম খরচে প্রশ্নপত্র তৈরি করুন <span className="ml-1 text-lg leading-none">🔥</span> <span className="underline ml-1">বিস্তারিত</span>
              </Button>

              <div className="bg-[#f8f9fa] rounded-md p-3 flex justify-between items-center font-bold text-[15px] border border-gray-100">
                <span className="text-gray-800">আপনার ব্যালেন্স:</span>
                <span className="text-gray-800">₹ 5</span>
              </div>

              <div className="border border-gray-200 rounded-md p-4 bg-white">
                <div className="flex justify-between text-gray-500 font-medium mb-3 pb-3 border-b border-gray-100 text-sm">
                  <span>0.60 × {selectedIds.size} (প্রশ্ন)</span>
                  <span className="font-bold text-gray-700">₹ {(0.60 * selectedIds.size).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg text-[#03a9f4]">
                  <span>মোট:</span>
                  <span>₹ {(0.60 * selectedIds.size).toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-[#ffebee] border border-[#ffcdd2] text-[#d32f2f] text-[13px] font-medium p-2.5 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                উক্ত এমাউন্টটি আপনার ব্যালেন্স থেকে কেটে নেয়া হবে।
              </div>

              <Input
                value={paperName}
                onChange={e => setPaperName(e.target.value)}
                placeholder="বাংলা ১ম পত্র"
                className="h-11 border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              />

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  variant="outline"
                  className="flex-1 bg-[#78909c] hover:bg-[#607d8b] text-white border-transparent h-11 text-[15px] hover:text-white"
                >
                  ✕ বাতিল করুন
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!paperName.trim()}
                  className={`flex-1 h-11 text-[15px] text-white transition-colors ${paperName.trim()
                    ? 'bg-[#4caf50] hover:bg-green-600 shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  ✓ কনফার্ম করুন
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
