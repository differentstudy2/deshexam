'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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

  // Page Setup State
  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false);
  const [orientation, setOrientation] = useState('Portrait');
  const [paperSize, setPaperSize] = useState('Letter');
  const [margins, setMargins] = useState({ top: '0.2', right: '0.2', bottom: '0.2', left: '0.2' });

  // Set Code State
  const [isSetCodeOpen, setIsSetCodeOpen] = useState(false);
  const [activeSetCode, setActiveSetCode] = useState('ক');
  const [tempSetCode, setTempSetCode] = useState('ক');
  const [savedSets, setSavedSets] = useState<{code: string, questions: QuestionBankEntry[]}[]>([]);

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

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  };

  const handleSaveSet = () => {
    setActiveSetCode(tempSetCode);
    setSavedSets(prev => {
      const filtered = prev.filter(s => s.code !== tempSetCode);
      const newSets = [...filtered, { code: tempSetCode, questions: [...questions] }];
      const order = ['ক', 'খ', 'গ', 'ঘ'];
      return newSets.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
    });
    setIsSetCodeOpen(false);
  };

  const getEditableProps = (baseClassName: string = '') => ({
    contentEditable: editingMode,
    suppressContentEditableWarning: true,
    className: `${baseClassName} ${editingMode ? 'hover:bg-blue-50 cursor-text p-0.5 -m-0.5 rounded outline-none ring-1 ring-transparent hover:ring-blue-200 transition-all' : 'outline-none'}`
  });

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
              <Button variant="outline" className="flex-1 text-gray-600 border-gray-300" onClick={() => setIsPageSetupOpen(true)}>
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
              <div 
                className="flex-1 bg-gray-50 hover:bg-gray-100 cursor-pointer p-2 rounded-md border border-gray-100 flex items-center justify-between text-gray-600 text-sm transition-colors"
                onClick={handleShuffle}
              >
                এলোমেলো করুন <Shuffle className="w-3.5 h-3.5" />
              </div>
              <Button 
                size="sm" 
                className="bg-[#03a9f4] hover:bg-[#0288d1] text-white"
                onClick={() => { setTempSetCode(activeSetCode); setIsSetCodeOpen(true); }}
              >
                সেভ সেট
              </Button>
            </div>

            {savedSets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="font-bold text-gray-800 text-sm mb-2">সেভ করা সেটসমূহঃ</h5>
                <div className="flex flex-wrap gap-2 p-3 border border-dashed border-gray-300 rounded bg-gray-50/50 min-h-[30px]">
                  {savedSets.map((set) => (
                    <button
                      key={set.code}
                      onClick={() => {
                        setActiveSetCode(set.code);
                        setQuestions(set.questions);
                      }}
                      className={`px-3 py-1 text-[13px] font-medium border bg-[#f8fafc] rounded-sm ${activeSetCode === set.code ? 'border-[#0ea5e9] text-[#0284c7]' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                    >
                      সেটঃ {set.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            .preview-page-container {
              width: ${orientation === 'Landscape' ? (paperSize === 'Letter' ? 11 : paperSize === 'Legal' ? 14 : 11.69) : (paperSize === 'Letter' ? 8.5 : paperSize === 'Legal' ? 8.5 : 8.27)}in;
              min-height: ${orientation === 'Landscape' ? (paperSize === 'Letter' ? 8.5 : paperSize === 'Legal' ? 8.5 : 8.27) : (paperSize === 'Letter' ? 11 : paperSize === 'Legal' ? 14 : 11.69)}in;
            }
            .preview-page-padding {
              padding: ${margins.top || '0'}in ${margins.right || '0'}in ${margins.bottom || '0'}in ${margins.left || '0'}in;
            }

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
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                background: white !important;
              }
              .preview-page-padding {
                padding: 0 !important; /* Let @page handle print margins */
              }
              @page {
                size: ${paperSize === 'A4' ? 'A4' : paperSize === 'Letter' ? 'letter' : 'legal'} ${orientation.toLowerCase()};
                margin: ${margins.top || '0'}in ${margins.right || '0'}in ${margins.bottom || '0'}in ${margins.left || '0'}in;
              }
            }
          `}} />
          <div id="printable-paper" className="preview-page-container mx-auto bg-white shadow-xl print:shadow-none transition-all duration-300">

            <div className="preview-page-padding relative transition-all duration-300">

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
                        <div {...getEditableProps("bg-black text-white text-[11px] px-2 py-1 flex items-center")}>প্রাপ্ত নম্বর</div>
                        <div className="w-16"></div>
                      </div>

                      {/* Right: Set & Subject Code */}
                      <div className="absolute top-6 right-0 text-right">
                        <div className="border border-black flex items-center justify-center font-bold text-sm mb-1 inline-flex w-24">
                          <span {...getEditableProps("flex-1 text-center py-0.5")}>সেট</span>
                          <span {...getEditableProps("border-l border-black flex-1 text-center py-0.5")}>{activeSetCode}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[13px] font-medium text-gray-800">
                          <span {...getEditableProps()}>বিষয় কোড :</span>
                          <div className="flex">
                            <span {...getEditableProps("border border-black w-5 h-6 flex items-center justify-center")}>০</span>
                            <span {...getEditableProps("border-y border-r border-black w-5 h-6 flex items-center justify-center")}>০</span>
                            <span {...getEditableProps("border-y border-r border-black w-5 h-6 flex items-center justify-center")}>০</span>
                          </div>
                        </div>
                      </div>

                      {/* Center Info */}
                      <div className="text-center">
                        {showTitle && <h1 {...getEditableProps("text-2xl font-bold text-gray-900 mb-1")}>DeshExam</h1>}
                        {showAddress && <p {...getEditableProps("text-[13px] text-gray-700 mb-1")}>৬/এ, রাবেয়া ভিলা, বড়বটতলা, ওয়ার্ড-২৭, বোয়ালিয়া, রাজশাহী - ৬২০৪</p>}
                        {showClassName && <h2 {...getEditableProps("text-[15px] font-bold text-gray-800 mb-1")}>অষ্টম শ্রেণি (মাধ্যমিক) - ২০২৬</h2>}
                        <h3 {...getEditableProps("text-[14px] font-bold text-gray-800 mb-0.5")}>বিষয়: {paperName || 'শারীরিক শিক্ষা ও স্বাস্থ্য'}</h3>
                        <h4 {...getEditableProps("text-[13px] text-gray-700")}>অধ্যায়ের নাম</h4>
                      </div>
                    </div>

                    {format !== 'answer' && (
                      <>
                        {/* Rules */}
                        <div className="border-b border-black mb-2 flex justify-between text-[14px] font-bold text-gray-800 pb-1">
                          <span {...getEditableProps()}>সময়— {convertToBengaliNumber(questions.length)} মিনিট</span>
                          <span {...getEditableProps()}>পূর্ণমান— {convertToBengaliNumber(questions.length)}</span>
                        </div>

                        <div className="text-center text-[12px] text-gray-800 mb-4 font-medium leading-relaxed px-4">
                          <p {...getEditableProps()}>দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসম্বলিত বৃত্ত সমূহ হতে সঠিক উত্তরের বৃত্তটি ⬤ বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট করো। প্রতিটি প্রশ্নের মান ১।</p>
                          <p {...getEditableProps("mt-1 font-bold")}>প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবেনা।</p>
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
                      </>
                    )}

                    <hr className="border-t-[1.5px] border-gray-300 mb-6" />

                    {format === 'answer' && (
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-red-500">নিচে উত্তরপত্র</h3>
                      </div>
                    )}

                    {/* QUESTIONS OR ANSWERS */}
                    {format === 'answer' && optionStyle === 'uttarmala' ? (
                      <div className="mt-4 mb-10 overflow-x-auto">
                        <span className="text-sm font-bold text-gray-800 block mb-2">উত্তর মালা:</span>
                        <table className="border-collapse border border-gray-300 text-center text-sm">
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 font-bold px-3 py-2 bg-gray-50">প্রশ্ন</td>
                              {questions.map((q, idx) => (
                                <td key={`q-${idx}`} className="border border-gray-300 px-3 py-2 font-bold">{convertToBengaliNumber(idx + 1)}.</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="border border-gray-300 font-bold px-3 py-2 bg-gray-50">উত্তর</td>
                              {questions.map((q, idx) => {
                                const optIdx = ['a', 'b', 'c', 'd'].indexOf((q.correctAnswer || 'a').toLowerCase());
                                const marker = ['ক', 'খ', 'গ', 'ঘ'][optIdx !== -1 ? optIdx : 0];
                                return (
                                  <td key={`a-${idx}`} className="border border-gray-300 px-3 py-2">{marker}</td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : format === 'answer' ? (
                      <div 
                        className="gap-x-12 text-justify mb-10"
                        style={{ columnCount: 2, columnRule: '1px solid #e5e7eb' }}
                      >
                        {questions.map((q, index) => {
                          const optIdx = ['a', 'b', 'c', 'd'].indexOf((q.correctAnswer || 'a').toLowerCase());
                          const marker = ['ক', 'খ', 'গ', 'ঘ'][optIdx !== -1 ? optIdx : 0];
                          
                          return (
                            <div key={q.id} className="text-[14px] text-gray-900 leading-snug mb-3 break-inside-avoid flex items-center gap-2 font-bold">
                              <span>{convertToBengaliNumber(index + 1)}.</span>
                              {optionStyle === 'u' && <span>উঃ {marker}</span>}
                              {optionStyle === 'ans' && <span>Ans: {marker}</span>}
                              {(optionStyle === 'ka' || optionStyle === 'circle') && (
                                <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-full bg-gray-800 text-white text-[12px] leading-none pb-[1px]">{marker}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className="gap-x-12 text-justify"
                        style={{ columnCount: 2, columnRule: '1px solid #e5e7eb' }}
                      >
                        {questions.map((q, index) => (
                          <div key={q.id} className="text-[14px] text-gray-900 leading-snug mb-5 break-inside-avoid">
                            <div className="flex items-start gap-1.5 mb-2">
                              <span className="font-bold min-w-[18px]">{convertToBengaliNumber(index + 1)}.</span>
                              <div
                                {...getEditableProps("flex-1")}
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
                                  const isCorrect = format === 'qa' && (q.correctAnswer || '').toLowerCase() === optKey;

                                  return (
                                    <div key={optKey} className="flex items-start gap-1.5">
                                      <span className="shrink-0 mt-[1px]">
                                        {optionStyle === 'ka' ? (
                                          isCorrect ? <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-gray-800 text-white text-[11px] leading-none pb-[1px]">{marker}</span> : `(${marker})`
                                        ) : optionStyle === 'circle' ? (
                                          <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border border-gray-600 text-[11px] leading-none pb-[1px] ${isCorrect ? 'bg-gray-800 text-white border-transparent' : ''}`}>{marker}</span>
                                        ) : (
                                          isCorrect ? <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-gray-800 text-white text-[11px] leading-none pb-[1px]">{marker}</span> : `${marker}.`
                                        )}
                                      </span>
                                      <span {...getEditableProps(isCorrect ? 'font-bold' : '')}>
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
                    )}

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
        ©2026 DeshExam. All rights reserved.
      </footer>

      {/* Set Code Dialog */}
      <Dialog open={isSetCodeOpen} onOpenChange={setIsSetCodeOpen}>
        <DialogContent className="max-w-[400px] text-center p-8 print:hidden rounded-xl border-none shadow-2xl">
          <DialogTitle className="text-2xl font-bold text-gray-700 mb-8 mt-2 text-center">কোন সেটে সেভ করবেন?</DialogTitle>
          
          <div className="mb-10">
            <label className="text-gray-600 block mb-4 text-[15px]">সেট কোড:</label>
            <Select value={tempSetCode} onValueChange={setTempSetCode}>
              <SelectTrigger className="w-[80px] mx-auto border-gray-500 h-11 shadow-none text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ক">ক</SelectItem>
                <SelectItem value="খ">খ</SelectItem>
                <SelectItem value="গ">গ</SelectItem>
                <SelectItem value="ঘ">ঘ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center gap-4 mb-2">
            <Button className="bg-[#6b4ef8] hover:bg-[#5839db] text-white px-8 h-[42px] text-sm font-medium rounded-md" onClick={handleSaveSet}>
              সেভ করুন
            </Button>
            <Button variant="secondary" className="bg-[#6b7280] hover:bg-[#4b5563] text-white px-8 h-[42px] text-sm font-medium rounded-md" onClick={() => setIsSetCodeOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Page Setup Dialog */}
      <Dialog open={isPageSetupOpen} onOpenChange={setIsPageSetupOpen}>
        <DialogContent className="max-w-[500px] print:hidden gap-0 p-0 overflow-hidden border-none rounded-xl">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="flex items-center gap-2 text-[#1c2b4f] text-xl font-bold">
              <Settings className="w-5 h-5 text-gray-500" /> Page Setup & Print Settings
            </DialogTitle>
          </DialogHeader>

          <div className="border-b px-5 flex">
            <div className="px-5 py-2.5 border border-b-0 rounded-t-lg text-[#64748b] bg-[#f8fafc] text-sm font-medium -mb-[1px] bg-white border-gray-200">
              Page Setup
            </div>
          </div>

          <div className="p-6 space-y-6 bg-white">
            {/* Page Orientation & Size */}
            <div>
              <h3 className="font-bold text-[#1c2b4f] mb-3 text-[15px]">Page Orientation & Size</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Orientation</label>
                  <Select value={orientation} onValueChange={setOrientation}>
                    <SelectTrigger className="border-gray-200 shadow-none h-[42px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Portrait">Portrait</SelectItem>
                      <SelectItem value="Landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Paper Size</label>
                  <Select value={paperSize} onValueChange={setPaperSize}>
                    <SelectTrigger className="border-gray-200 shadow-none h-[42px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                      <SelectItem value="A4">A4 (8.27 × 11.69 in)</SelectItem>
                      <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Margins */}
            <div>
              <h3 className="font-bold text-[#1c2b4f] mb-3 text-[15px]">Margins (inches)</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Top</label>
                  <Input className="border-gray-200 shadow-none h-[42px]" type="number" step="0.1" value={margins.top} onChange={e => setMargins({...margins, top: e.target.value})} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Right</label>
                  <Input className="border-gray-200 shadow-none h-[42px]" type="number" step="0.1" value={margins.right} onChange={e => setMargins({...margins, right: e.target.value})} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Bottom</label>
                  <Input className="border-gray-200 shadow-none h-[42px]" type="number" step="0.1" value={margins.bottom} onChange={e => setMargins({...margins, bottom: e.target.value})} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Left</label>
                  <Input className="border-gray-200 shadow-none h-[42px]" type="number" step="0.1" value={margins.left} onChange={e => setMargins({...margins, left: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-white border-t flex justify-end gap-3 sm:justify-end">
            <Button variant="secondary" className="bg-[#e8eaf6] text-[#3949ab] hover:bg-[#c5cae9] px-6 h-[42px] rounded-md font-medium" onClick={() => setIsPageSetupOpen(false)}>Cancel</Button>
            <Button className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-green-800 px-6 h-[42px] rounded-md font-medium" onClick={() => { setIsPageSetupOpen(false); handlePrint(); }}>
              প্রিভিউ এবং ডাউনলোড
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
