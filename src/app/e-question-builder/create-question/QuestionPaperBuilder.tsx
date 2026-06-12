'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Share2, Settings, Type, FileText, Shuffle, Save, ArrowLeft, Plus, Edit, Loader2 } from 'lucide-react';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { QuestionBankEntry } from '@/lib/question-bank-types';

interface Props {
  subjectId?: string;
  chapterId?: string;
  paperName?: string;
}

export default function QuestionPaperBuilder({ subjectId, chapterId, paperName }: Props) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [format, setFormat] = useState('question');
  const [optionStyle, setOptionStyle] = useState('ka');
  const [editingMode, setEditingMode] = useState(false);

  // Content Display State
  const [showTitle, setShowTitle] = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [showClassName, setShowClassName] = useState(true);

  useEffect(() => {
    const fetchSelectedQuestions = async () => {
      try {
        const storedIds = sessionStorage.getItem('selectedQuestionIds');
        if (storedIds) {
          const ids = JSON.parse(storedIds);
          if (ids && ids.length > 0) {
            const fetched = await getQuestionsByIds(ids);
            setQuestions(fetched);
          }
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSelectedQuestions();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const convertToBengaliNumber = (num: number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] print:bg-white">
      {/* Top Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Create Question Paper</h1>
            <div className="text-sm text-gray-500">Home &gt; E-Question Builder &gt; Create Question</div>
          </div>
        </div>
        <Button onClick={handlePrint} className="bg-[#c8e6c9] hover:bg-[#a5d6a7] text-green-800 font-semibold px-6 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> ডাউনলোড
        </Button>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full p-4 gap-6 relative print:p-0 print:m-0 print:static">

        {/* LEFT SIDEBAR - SETTINGS */}
        <aside className="w-72 bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-24 print:hidden shrink-0">

          {/* Header */}
          <div className="bg-[#1e88e5] text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4" /> ফিল্টার সেটিংস</h3>
            <Button size="sm" className="bg-[#5c6bc0] hover:bg-[#3f51b5] h-7 px-3 text-xs">
              <Save className="w-3 h-3 mr-1" /> সংরক্ষণ
            </Button>
          </div>

          <div className="p-4 space-y-4 border-b border-gray-100">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-gray-600 border-gray-300">
                <FileText className="w-4 h-4 mr-2" /> Page Setup
              </Button>
              <Button variant="outline" className="flex-1 text-gray-600 border-gray-300">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
            <Button onClick={handlePrint} className="w-full bg-[#c8e6c9] hover:bg-[#a5d6a7] text-green-800 border-transparent shadow-none">
              <Download className="w-4 h-4 mr-2" /> প্রিভিউ এবং ডাউনলোড
            </Button>
          </div>

          {/* Basic Settings */}
          <div className="p-4 border-b border-gray-100">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-4 text-sm"><Settings className="w-4 h-4 text-gray-400" /> বেসিক সেটিংস</h4>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">ফাইল ফরমেটিং</label>
              <RadioGroup value={format} onValueChange={setFormat} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="qa" id="fmt-qa" />
                  <label htmlFor="fmt-qa" className="text-sm text-gray-600 cursor-pointer">প্রশ্ন ও উত্তর</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="question" id="fmt-q" />
                  <label htmlFor="fmt-q" className="text-sm text-gray-600 cursor-pointer">প্রশ্ন</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="answer" id="fmt-ans" />
                  <label htmlFor="fmt-ans" className="text-sm text-gray-600 cursor-pointer">উত্তরপত্র</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suggestion" id="fmt-sug" />
                  <label htmlFor="fmt-sug" className="text-sm text-gray-600 cursor-pointer">সাজেশন</label>
                </div>
              </RadioGroup>
            </div>

            <div className="mb-5 flex flex-wrap gap-2 justify-between">
              {['ka', 'circle', 'u', 'ans', 'uttarmala'].map(opt => (
                <div
                  key={opt}
                  onClick={() => setOptionStyle(opt)}
                  className={`px-2 py-1 rounded cursor-pointer text-xs border ${optionStyle === opt ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}
                >
                  {opt === 'ka' && '(ক)'}
                  {opt === 'circle' && 'O'}
                  {opt === 'u' && 'উঃ'}
                  {opt === 'ans' && 'Ans:'}
                  {opt === 'uttarmala' && 'উত্তরমালা:'}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-md border border-gray-100">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><Edit className="w-3.5 h-3.5 text-blue-500" /> এডিটিং মুড</span>
              <Switch checked={editingMode} onCheckedChange={setEditingMode} />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center justify-between text-gray-600 text-sm">
                এলোমেলো করুন <Shuffle className="w-3.5 h-3.5" />
              </div>
              <Button size="sm" className="bg-[#03a9f4] hover:bg-[#0288d1] text-white">
                পেজ সেট
              </Button>
            </div>
          </div>

          {/* Content Display */}
          <div className="p-4">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-4 text-sm"><Type className="w-4 h-4 text-gray-400" /> কন্টেন্ট ডিসপ্লে</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2"><span className="font-bold text-yellow-500">H</span> টাইটেল</span>
                <Switch checked={showTitle} onCheckedChange={setShowTitle} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2"><span className="text-red-400">📍</span> ঠিকানা</span>
                <Switch checked={showAddress} onCheckedChange={setShowAddress} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">🏛</span> ক্লাসের নাম</span>
                <Switch checked={showClassName} onCheckedChange={setShowClassName} />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN PAPER AREA */}
        <main className="flex-1 overflow-x-auto pb-24 print:pb-0">
          <style dangerouslySetInnerHTML={{
            __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-paper, #printable-paper * {
                visibility: visible;
              }
              #printable-paper {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                background: white !important;
              }
              @page {
                size: A4;
                margin: 0.5in;
              }
            }
          `}} />
          <div id="printable-paper" className="min-w-[800px] max-w-[900px] mx-auto bg-white shadow-xl print:shadow-none print:w-full print:max-w-full print:min-w-0">

            <div className="p-10 min-h-[1100px] print:px-4 print:pb-4 print:pt-0 print:min-h-0 relative">

              {loading ? (
                <div className="flex justify-center items-center h-64 print:hidden">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 print:opacity-40">
                    <span className="text-gray-100/50 text-[120px] font-bold -rotate-45 select-none tracking-widest uppercase">
                      DeshExam
                    </span>
                  </div>

                  <div className="relative z-10">
                    {/* PAPER HEADER */}
                    <div className="relative mb-4">
                      {/* Left: Marks Box */}
                      <div className="absolute top-8 left-0 flex border border-black">
                        <div className="bg-black text-white text-[11px] px-2 py-1 flex items-center">প্রাপ্ত নম্বর</div>
                        <div className="w-16"></div>
                      </div>

                      {/* Right: Set & Subject Code */}
                      <div className="absolute top-6 right-0 text-right">
                        <div className="border border-black flex items-center justify-center font-bold text-sm mb-1 inline-flex w-24">
                          <span className="flex-1 text-center py-0.5">সেট</span>
                          <span className="border-l border-black flex-1 text-center py-0.5">ক</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[13px] font-medium text-gray-800">
                          বিষয় কোড :
                          <div className="flex">
                            <span className="border border-black w-5 h-6 flex items-center justify-center">০</span>
                            <span className="border-y border-r border-black w-5 h-6 flex items-center justify-center">০</span>
                            <span className="border-y border-r border-black w-5 h-6 flex items-center justify-center">০</span>
                          </div>
                        </div>
                      </div>

                      {/* Center Info */}
                      <div className="text-center">
                        {showTitle && <h1 className="text-2xl font-bold text-gray-900 mb-1">স্যাট একাডেমি</h1>}
                        {showAddress && <p className="text-[13px] text-gray-700 mb-1">৬/এ, রাবেয়া ভিলা, বড়বটতলা, ওয়ার্ড-২৭, বোয়ালিয়া, রাজশাহী - ৬২০৪</p>}
                        {showClassName && <h2 className="text-[15px] font-bold text-gray-800 mb-1">অষ্টম শ্রেণি (মাধ্যমিক) - ২০২৬</h2>}
                        <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">বিষয়: {paperName || 'শারীরিক শিক্ষা ও স্বাস্থ্য'}</h3>
                        <h4 className="text-[13px] text-gray-700">অধ্যায়ের নাম</h4>
                      </div>
                    </div>

                    {/* Rules */}
                    <div className="border-b border-black mb-2 flex justify-between text-[14px] font-bold text-gray-800 pb-1">
                      <span>সময়— {convertToBengaliNumber(questions.length)} মিনিট</span>
                      <span>পূর্ণমান— {convertToBengaliNumber(questions.length)}</span>
                    </div>

                    <div className="text-center text-[12px] text-gray-800 mb-4 font-medium leading-relaxed px-4">
                      <p>দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসম্বলিত বৃত্ত সমূহ হতে সঠিক উত্তরের বৃত্তটি ⬤ বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট করো। প্রতিটি প্রশ্নের মান ১।</p>
                      <p className="mt-1 font-bold">প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবেনা।</p>
                    </div>

                    {/* Candidate Info */}
                    <div className="flex justify-between items-end mb-4 text-[14px] font-bold text-gray-800">
                      <div className="flex-1 flex">
                        <span className="whitespace-nowrap">পরীক্ষার্থীর নামঃ</span>
                        <div className="border-b border-dashed border-gray-400 flex-1 ml-2 mr-6"></div>
                      </div>
                      <div className="w-[300px] flex">
                        <span className="whitespace-nowrap">রোলঃ</span>
                        <div className="border-b border-dashed border-gray-400 flex-1 ml-2"></div>
                      </div>
                    </div>

                    <hr className="border-t-[1.5px] border-gray-300 mb-6" />

                    {/* QUESTIONS COLUMNS */}
                    <div
                      className="gap-x-12 text-justify"
                      style={{ columnCount: 2, columnRule: '1px solid #e5e7eb' }}
                    >
                      {questions.map((q, index) => (
                        <div key={q.id} className="text-[14px] text-gray-900 leading-snug mb-5 break-inside-avoid">
                          <div className="flex items-start gap-1.5 mb-2">
                            <span className="font-bold min-w-[18px]">{convertToBengaliNumber(index + 1)}.</span>
                            <div
                              className={`flex-1 ${editingMode ? 'hover:bg-blue-50 cursor-text p-1 -m-1 rounded border border-transparent hover:border-blue-200' : ''}`}
                              dangerouslySetInnerHTML={{ __html: q.questionText }}
                            />
                          </div>

                          {/* Options */}
                          {q.options && (
                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 pl-6">
                              {['a', 'b', 'c', 'd'].map((optKey, idx) => {
                                const optValue = (q.options as any)[optKey];
                                if (!optValue) return null;

                                const markers = ['ক', 'খ', 'গ', 'ঘ'];
                                const marker = markers[idx];

                                return (
                                  <div key={optKey} className={`flex items-start gap-1.5 ${editingMode ? 'hover:bg-blue-50 cursor-text rounded p-0.5' : ''}`}>
                                    <span className="shrink-0 mt-0.5">
                                      {optionStyle === 'ka' ? `(${marker})` :
                                        optionStyle === 'circle' ? <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border border-gray-600 text-[11px] leading-none pb-[1px]">{marker}</span> :
                                          `${marker}.`}
                                    </span>
                                    <span className={format === 'qa' && q.correctAnswer === optKey ? 'font-bold underline' : ''}>
                                      {optValue}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer Logo */}
                    <div className="mt-8 text-right text-[12px] font-bold text-gray-800">
                      সৌজন্যে: DeshExam
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action button beneath paper (hidden in print) */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 text-center print:hidden rounded-b-lg">
              <Button className="bg-[#c8e6c9] hover:bg-[#a5d6a7] text-green-800 border-transparent font-medium shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> আরও প্রশ্ন যোগ
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Footer Banner */}
      <footer className="bg-[#1e293b] text-white text-center py-4 text-sm font-semibold print:hidden">
        ©2026 Satt Academy. All rights reserved.
      </footer>
    </div>
  );
}
