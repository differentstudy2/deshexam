'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Download, Settings, FileText, Shuffle, Save, ArrowLeft, Edit, Book, Monitor, Lightbulb, User, Tag, Star, Grid3X3, Columns, Barcode, Hash, LayoutGrid, FileDigit, Heading, MapPin, Landmark, Layers, HelpCircle, RefreshCw, Printer, Languages, QrCode, ImageIcon, Waves, PlusCircle, Plus, CheckCircle, CircleDot, Zap, Loader2, GripVertical, Trash2, Database, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { t, localizeNumber, localizeOptionLabel, AppLanguage, translations } from '@/lib/i18n';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { QuestionBankModal } from './QuestionBankModal';
import { AiQuestionGeneratorModal } from './AiQuestionGeneratorModal';
import 'katex/dist/katex.min.css';

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
  const [savedSets, setSavedSets] = useState<{ code: string, questions: QuestionBankEntry[] }[]>([]);

  // Content Display State
  const [showTitle, setShowTitle] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showClassName, setShowClassName] = useState(true);
  const [showSubjectName, setShowSubjectName] = useState(true);
  const [showChapterName, setShowChapterName] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCandidateInfo, setShowCandidateInfo] = useState(true);
  const [showQuestionTags, setShowQuestionTags] = useState(false);
  const [showQuestionMarks, setShowQuestionMarks] = useState(false);
  const [showOMR, setShowOMR] = useState(false);
  const [showColumnDivider, setShowColumnDivider] = useState(true);
  const [showSubjectCode, setShowSubjectCode] = useState(true);
  const [showMarksBox, setShowMarksBox] = useState(true);
  const [showSetCode, setShowSetCode] = useState(true);
  const [showPageNumber, setShowPageNumber] = useState(true);
  const [showAnswerKeySheet, setShowAnswerKeySheet] = useState(false);
  const [showOMRSheetAttachment, setShowOMRSheetAttachment] = useState(false);
  const [answerKeyColumns, setAnswerKeyColumns] = useState(3);
  const [enableLatex, setEnableLatex] = useState(false);

  // Center & Exam Settings State
  const [headerSettingsEnabled, setHeaderSettingsEnabled] = useState(true);
  const [headerTitle, setHeaderTitle] = useState('দেশ এক্সাম একাডেমী');
  const [headerAddress, setHeaderAddress] = useState('দ্বারিকামারী, পেটলা, দিনহাটা, কোচবিহার, পশ্চিমবঙ্গ, ৭৩৬১৩৫');
  const [headerClassName, setHeaderClassName] = useState('অষ্টম শ্রেণি (মাধ্যমিক) - ২০২৬');
  const [headerSubjectName, setHeaderSubjectName] = useState('বাংলা');
  const [headerChapterName, setHeaderChapterName] = useState('প্রথম অধ্যায়');


  const [headerTime, setHeaderTime] = useState('');
  const [headerMarks, setHeaderMarks] = useState('');

  // QR Code State
  const [qrCodeEnabled, setQrCodeEnabled] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('https://deshexam.com');

  // Question Format State
  const [paperColumns, setPaperColumns] = useState(2);
  const [optionShape, setOptionShape] = useState('circle');
  const [optionLabelType, setOptionLabelType] = useState('bangla');
  const [optionColumns, setOptionColumns] = useState(2);
  const [rowGap, setRowGap] = useState(20);
  const [colGap, setColGap] = useState(48);
  const [fontFamily, setFontFamily] = useState('bangla');
  const [fontSize, setFontSize] = useState(14);

  // Branding State
  const [brandingEnabled, setBrandingEnabled] = useState(true);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [watermarkSize, setWatermarkSize] = useState(90);
  const [watermarkOpacity, setWatermarkOpacity] = useState(20);
  const [watermarkRepeat, setWatermarkRepeat] = useState(false);
  const [watermarkRepeatCount, setWatermarkRepeatCount] = useState(5);
  const [watermarkFont, setWatermarkFont] = useState('sutonnymj');

  // Header Image State
  const [headerImageEnabled, setHeaderImageEnabled] = useState(false);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [headerImageFit, setHeaderImageFit] = useState('cover');

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Custom Question Modal State
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState({ text: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: 'a' });
  const [addQuestionMode, setAddQuestionMode] = useState<'single' | 'bulk'>('single');
  const [bulkQuestionText, setBulkQuestionText] = useState('');

  // Section Header Modal State
  const [isSectionHeaderOpen, setIsSectionHeaderOpen] = useState(false);
  const [forceNewColumn, setForceNewColumn] = useState(false);
  const [sectionHeaderText, setSectionHeaderText] = useState('');
  
  // Question Bank Modal
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  // Enhanced Settings State
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('bn');

  useEffect(() => {
    const isDefault = (val: string, key: string) => {
      if (!val) return true;
      return val === translations['bn'][key] || val === translations['en'][key] || val === translations['hi'][key];
    };

    if (isDefault(headerTitle, 'defaultHeaderTitle')) setHeaderTitle(t('defaultHeaderTitle', appLanguage));
    if (isDefault(headerAddress, 'defaultHeaderAddress')) setHeaderAddress(t('defaultHeaderAddress', appLanguage));
    if (isDefault(headerClassName, 'defaultHeaderClass')) setHeaderClassName(t('defaultHeaderClass', appLanguage));
    if (isDefault(headerSubjectName, 'defaultHeaderSubject')) setHeaderSubjectName(t('defaultHeaderSubject', appLanguage));
    if (isDefault(headerChapterName, 'defaultHeaderChapter')) setHeaderChapterName(t('defaultHeaderChapter', appLanguage));
  }, [appLanguage, headerTitle, headerAddress, headerClassName, headerSubjectName, headerChapterName]);
  const [footerText, setFooterText] = useState('');
  const [questionOptionGap, setQuestionOptionGap] = useState(8);
  const [showExplanations, setShowExplanations] = useState(false);

  const handleAddFromBank = (newQs: QuestionBankEntry[]) => {
    setQuestions([...questions, ...newQs]);
  };

  // Helper to convert \( \) and \[ \] into $ and $$ for remark-math
  const formatLatex = (text: string) => {
    if (!text) return text;
    return text
      .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  };

  // Template Management
  const handleSaveTemplate = () => {
    const settings = {
      format, optionStyle, paperColumns, optionShape, optionLabelType,
      optionColumns, rowGap, colGap, fontFamily, fontSize, questionOptionGap,
      headerTitle, headerAddress, headerClassName, headerSubjectName,
      headerSettingsEnabled, brandingEnabled, watermarkText, watermarkSize, watermarkOpacity,
      footerText, enableLatex
    };
    localStorage.setItem('deshexam_paper_template', JSON.stringify(settings));
    alert(t('templateSavedSuccess', appLanguage));
  };

  const handleLoadTemplate = () => {
    const saved = localStorage.getItem('deshexam_paper_template');
    if (saved) {
      const s = JSON.parse(saved);
      if (s.format) setFormat(s.format);
      if (s.optionStyle) setOptionStyle(s.optionStyle);
      if (s.paperColumns) setPaperColumns(s.paperColumns);
      if (s.optionShape) setOptionShape(s.optionShape);
      if (s.optionLabelType) setOptionLabelType(s.optionLabelType);
      if (s.optionColumns) setOptionColumns(s.optionColumns);
      if (s.rowGap !== undefined) setRowGap(s.rowGap);
      if (s.colGap !== undefined) setColGap(s.colGap);
      if (s.fontFamily) setFontFamily(s.fontFamily);
      if (s.fontSize) setFontSize(s.fontSize);
      if (s.questionOptionGap !== undefined) setQuestionOptionGap(s.questionOptionGap);
      if (s.headerTitle) setHeaderTitle(s.headerTitle);
      if (s.headerAddress) setHeaderAddress(s.headerAddress);
      if (s.headerClassName) setHeaderClassName(s.headerClassName);
      try {
        const s = JSON.parse(saved);
        if (s.format) setFormat(s.format);
        if (s.optionStyle) setOptionStyle(s.optionStyle);
        if (s.paperColumns) setPaperColumns(s.paperColumns);
        if (s.optionShape) setOptionShape(s.optionShape);
        if (s.optionLabelType) setOptionLabelType(s.optionLabelType);
        if (s.optionColumns) setOptionColumns(s.optionColumns);
        if (s.rowGap !== undefined) setRowGap(s.rowGap);
        if (s.colGap !== undefined) setColGap(s.colGap);
        if (s.fontFamily) setFontFamily(s.fontFamily);
        if (s.fontSize) setFontSize(s.fontSize);
        if (s.questionOptionGap !== undefined) setQuestionOptionGap(s.questionOptionGap);
        if (s.headerTitle) setHeaderTitle(s.headerTitle);
        if (s.headerAddress) setHeaderAddress(s.headerAddress);
        if (s.headerClassName) setHeaderClassName(s.headerClassName);
        if (s.headerSubjectName) setHeaderSubjectName(s.headerSubjectName);
        if (s.headerSettingsEnabled !== undefined) setHeaderSettingsEnabled(s.headerSettingsEnabled);
        if (s.brandingEnabled !== undefined) setBrandingEnabled(s.brandingEnabled);
        if (s.watermarkText !== undefined) setWatermarkText(s.watermarkText);
        if (s.watermarkSize !== undefined) setWatermarkSize(s.watermarkSize);
        if (s.watermarkOpacity !== undefined) setWatermarkOpacity(s.watermarkOpacity);
        if (s.footerText !== undefined) setFooterText(s.footerText);
        if (s.enableLatex !== undefined) setEnableLatex(s.enableLatex);
      } catch (e) {};
    }
  };

  // Export Handlers
  const handleExportPDF = async () => {
    const element = document.getElementById('printable-paper');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: orientation === 'Landscape' ? 'landscape' : 'portrait',
      unit: 'in',
      format: paperSize === 'A4' ? 'a4' : paperSize === 'Letter' ? 'letter' : 'legal'
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save((paperName || 'Question_Paper') + '.pdf');
  };

  const handleExportWord = () => {
    const element = document.getElementById('printable-paper');
    if (!element) return;
    const htmlContent = element.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export Document</title></head><body>`;
    const footer = `</body></html>`;
    const sourceHTML = header + htmlContent + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = (paperName || 'Question_Paper') + '.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!editingMode) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    (e.target as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!editingMode || draggedIndex === null || draggedIndex === index) return;

    const newQuestions = [...questions];
    const draggedItem = newQuestions[draggedIndex];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedItem);

    setQuestions(newQuestions);
    setDraggedIndex(index);
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm(t('confirmDeleteQuestion', appLanguage))) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const handleAddCustomQuestionSubmit = () => {
    if (addQuestionMode === 'single') {
      if (!customQuestion.text) return;
      const newQuestion: any = {
        id: `custom_${Date.now()}`,
        questionText: customQuestion.text,
        options: { a: customQuestion.optA, b: customQuestion.optB, c: customQuestion.optC, d: customQuestion.optD },
        correctAnswer: customQuestion.correctAnswer,
        explanation: '',
        difficulty: 'Medium',
        status: 'Published',
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'custom-' + Date.now(),
        breakBeforeColumn: forceNewColumn
      };
      setQuestions([...questions, newQuestion]);
      setIsAddQuestionOpen(false);
      setCustomQuestion({ text: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: 'a' });
      setForceNewColumn(false);
    } else {
      if (!bulkQuestionText.trim()) return;

      let newQuestions: any[] = [];

      try {
        const parsed = JSON.parse(bulkQuestionText);
        if (Array.isArray(parsed)) {
          newQuestions = parsed.map((item, idx) => ({
            id: `custom_bulk_${Date.now()}_${idx}`,
            questionText: item.questionText || '',
            options: {
              a: item.options?.a || '',
              b: item.options?.b || '',
              c: item.options?.c || '',
              d: item.options?.d || ''
            },
            correctAnswer: item.correctAnswer || 'a',
            explanation: item.explanation || '',
            difficulty: 'Medium',
            status: 'Published',
            createdAt: new Date(),
            updatedAt: new Date(),
            slug: `custom-bulk-${Date.now()}-${idx}`,
            breakBeforeColumn: idx === 0 && forceNewColumn
          }));
        }
      } catch (e) {
        const blocks = bulkQuestionText.split(/\n\s*\n/);

        blocks.forEach((block, idx) => {
          const lines = block.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length > 0) {
            let qTextLines: string[] = [];
            let optA = '', optB = '', optC = '', optD = '';
            let correctAns = 'a';
            
            const optionRegex = /^([a-dক-ঘ])[\.\)]\s*(.*)/i;
            const answerRegex = /^(?:answer|উত্তর|সঠিক উত্তর|ans|ans\.)[\s:-]*([a-dক-ঘ])/i;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              
              const ansMatch = line.match(answerRegex);
              if (ansMatch) {
                const char = ansMatch[1].toLowerCase();
                if (char === 'a' || char === 'ক') correctAns = 'a';
                if (char === 'b' || char === 'খ') correctAns = 'b';
                if (char === 'c' || char === 'গ') correctAns = 'c';
                if (char === 'd' || char === 'ঘ') correctAns = 'd';
                continue;
              }

              const optMatch = line.match(optionRegex);
              if (optMatch) {
                const char = optMatch[1].toLowerCase();
                const val = optMatch[2];
                if (char === 'a' || char === 'ক') optA = val;
                else if (char === 'b' || char === 'খ') optB = val;
                else if (char === 'c' || char === 'গ') optC = val;
                else if (char === 'd' || char === 'ঘ') optD = val;
                continue;
              }

              // If it's not an answer and not an option, and we haven't found any options yet, it's a question line
              if (!optA && !optB && !optC && !optD) {
                qTextLines.push(line);
              }
            }

            const qText = qTextLines.join('<br/>').replace(/^\d+[\.)]\s*/, '');

            newQuestions.push({
              id: `custom_bulk_${Date.now()}_${idx}`,
              questionText: qText,
              options: { a: optA, b: optB, c: optC, d: optD },
              correctAnswer: correctAns,
              explanation: '',
              difficulty: 'Medium',
              status: 'Published',
              createdAt: new Date(),
              updatedAt: new Date(),
              slug: `custom-bulk-${Date.now()}-${idx}`,
              breakBeforeColumn: idx === 0 && forceNewColumn
            });
          }
        });
      }

      if (newQuestions.length > 0) {
        setQuestions([...questions, ...newQuestions]);
        setIsAddQuestionOpen(false);
        setBulkQuestionText('');
        setForceNewColumn(false);
      }
    }
  };

  const handleAddSectionHeaderSubmit = () => {
    if (!sectionHeaderText) return;
    const newQ: QuestionBankEntry = {
      id: 'section-' + Date.now(),
      questionType: 'Exam Paper',
      questionText: `[[SECTION_HEADER]]${sectionHeaderText}`,
      correctAnswer: 'a',
      difficulty: 'Medium',
      status: 'Published',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'section-' + Date.now()
    };
    setQuestions([...questions, newQ]);
    setIsSectionHeaderOpen(false);
    setSectionHeaderText('');
  };

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

  const getWatermarkFontFamily = () => {
    switch (watermarkFont) {
      case 'kalpurush': return '"Kalpurush", sans-serif';
      case 'siyamrupali': return '"Siyam Rupali", sans-serif';
      case 'solaimanlipi': return '"SolaimanLipi", sans-serif';
      case 'sutonnymj': return '"SutonnyMJ", "SutonnyOMJ", sans-serif';
      case 'nikosh': return '"Nikosh", sans-serif';
      default: return '"Kalpurush", sans-serif';
    }
  };

  const handleResetFormat = () => {
    setPaperColumns(2);
    setOptionShape('circle');
    setOptionLabelType('bangla');
    setOptionColumns(2);
    setRowGap(20);
    setColGap(48);
    setFontFamily('bangla');
    setFontSize(14);
  };

  const handleAutoLayout = () => {
    setPaperColumns(2);
    setOptionShape('paren');
    setOptionLabelType('bangla');
    setOptionColumns(4);
    setRowGap(12);
    setColGap(32);
    setFontFamily('siyamrupali');
    setFontSize(13);
  };

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setWatermarkImage(url);
    }
  };

  const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setHeaderImage(url);
    }
  };

  const renderSidebarSettings = () => (
    <>

          <div className="bg-[#1e88e5] text-white p-3 rounded-t-lg flex justify-between items-center sticky top-0 z-20">
            <h3 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4" /> {t('quickActions', appLanguage)}</h3>
            <Button size="sm" className="bg-[#5c6bc0] hover:bg-[#3f51b5] h-7 px-3 text-xs" onClick={handleSaveTemplate}>
              <Save className="w-3 h-3 mr-1" /> {t('saveTemplate', appLanguage)}
            </Button>
          </div>

          <div className="p-4 space-y-4 border-b border-gray-100">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-gray-600 border-gray-300" onClick={() => setIsPageSetupOpen(true)}>
                <FileText className="w-4 h-4 mr-2" /> {t('pageSetup', appLanguage)}
              </Button>
              <Button variant="outline" className="flex-1 text-gray-600 border-gray-300" onClick={handleLoadTemplate}>
                <RefreshCw className="w-4 h-4 mr-2" /> {t('loadTemplate', appLanguage)}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1 bg-[#c8e6c9] hover:bg-[#a5d6a7] text-green-800 border-transparent shadow-none px-2 h-9 text-[12px]">
                <Download className="w-3.5 h-3.5 mr-1" /> {t('print', appLanguage)}
              </Button>
              <Button onClick={handleExportPDF} className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 border-transparent shadow-none px-2 h-9 text-[12px]">
                <FileText className="w-3.5 h-3.5 mr-1" /> PDF
              </Button>
              <Button onClick={handleExportWord} className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 border-transparent shadow-none px-2 h-9 text-[12px]">
                <FileText className="w-3.5 h-3.5 mr-1" /> Word
              </Button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-4 text-sm"><Settings className="w-4 h-4 text-gray-400" /> {t('basicSettings', appLanguage)}</h4>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">{t('fileFormatting', appLanguage)}</label>
              <RadioGroup value={format} onValueChange={setFormat} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="qa" id="fmt-qa" />
                  <label htmlFor="fmt-qa" className="text-sm text-gray-600 cursor-pointer">{t('qAndA', appLanguage)}</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="question" id="fmt-q" />
                  <label htmlFor="fmt-q" className="text-sm text-gray-600 cursor-pointer">{t('questionOnly', appLanguage)}</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="answer" id="fmt-ans" />
                  <label htmlFor="fmt-ans" className="text-sm text-gray-600 cursor-pointer">{t('answerKeyOnly', appLanguage)}</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suggestion" id="fmt-sug" />
                  <label htmlFor="fmt-sug" className="text-sm text-gray-600 cursor-pointer">{t('suggestion', appLanguage)}</label>
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
                  {opt === 'ka' && t('kaOptionPrefix', appLanguage)}
                  {opt === 'circle' && 'O'}
                  {opt === 'u' && t('answerPrefix', appLanguage)}
                  {opt === 'ans' && 'Ans:'}
                  {opt === 'uttarmala' && t('answerKeyTitle', appLanguage)}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-md border border-gray-100">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><Edit className="w-3.5 h-3.5 text-blue-500" /> {t('editingMode', appLanguage)}</span>
              <Switch checked={editingMode} onCheckedChange={setEditingMode} />
            </div>

            <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-md border border-gray-100">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><Book className="w-3.5 h-3.5 text-green-600" /> {t('ansWithExplanation', appLanguage)}</span>
              <Switch checked={showExplanations} onCheckedChange={setShowExplanations} />
            </div>

            <div className="flex gap-2">
              <div
                className="flex-1 bg-gray-50 hover:bg-gray-100 cursor-pointer p-2 rounded-md border border-gray-100 flex items-center justify-between text-gray-600 text-sm transition-colors"
                onClick={handleShuffle}
              >
                {t('shuffle', appLanguage)} <Shuffle className="w-3.5 h-3.5" />
              </div>
              <Button
                size="sm"
                className="bg-[#03a9f4] hover:bg-[#0288d1] text-white"
                onClick={() => { setTempSetCode(activeSetCode); setIsSetCodeOpen(true); }}
              >
                {t('saveSet', appLanguage)}
              </Button>
            </div>

            {savedSets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="font-bold text-gray-800 text-sm mb-2">{t('savedSets', appLanguage)}</h5>
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
                      {t('setPrefix', appLanguage)} {set.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center & Exam Settings */}
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-700 flex items-center gap-2 text-[15px]"><Landmark className="w-4 h-4 text-purple-500" /> {t('centerAndExamSettings', appLanguage)}</h4>
              <Switch checked={headerSettingsEnabled} onCheckedChange={setHeaderSettingsEnabled} className="data-[state=checked]:bg-blue-600" />
            </div>

            {headerSettingsEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] text-gray-700 mb-1.5 block">{t('instituteName', appLanguage)}</label>
                  <Input value={headerTitle} onChange={e => setHeaderTitle(e.target.value)} className="h-8 text-[13px]" placeholder={t('institutePlaceholder', appLanguage)} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 mb-1.5 block">{t('address', appLanguage)}</label>
                  <Input value={headerAddress} onChange={e => setHeaderAddress(e.target.value)} className="h-8 text-[13px]" placeholder={t('addressPlaceholder', appLanguage)} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 mb-1.5 block">{t('classAndYear', appLanguage)}</label>
                  <Input value={headerClassName} onChange={e => setHeaderClassName(e.target.value)} className="h-8 text-[13px]" placeholder={t('classPlaceholder', appLanguage)} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 mb-1.5 block">{t('subject', appLanguage)}</label>
                  <Input value={headerSubjectName} onChange={e => setHeaderSubjectName(e.target.value)} className="h-8 text-[13px]" placeholder={t('subjectPlaceholder', appLanguage)} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 mb-1.5 block">{t('chapterName', appLanguage)}</label>
                  <Input value={headerChapterName} onChange={e => setHeaderChapterName(e.target.value)} className="h-8 text-[13px]" placeholder={t('chapterPlaceholder', appLanguage)} />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[13px] text-gray-700 mb-1.5 block">{t('timeMins', appLanguage)}</label>
                    <Input value={headerTime} onChange={e => setHeaderTime(e.target.value)} className="h-8 text-[13px]" placeholder={t('automatic', appLanguage)} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[13px] text-gray-700 mb-1.5 block">{t('fullMarks', appLanguage)}</label>
                    <Input value={headerMarks} onChange={e => setHeaderMarks(e.target.value)} className="h-8 text-[13px]" placeholder={t('automatic', appLanguage)} />
                  </div>
                </div>

                {/* QR Code Settings */}
                <div className="pt-3 mt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-gray-700 font-medium flex items-center gap-2"><QrCode className="w-4 h-4 text-blue-500" /> {t('qrCode', appLanguage)}</span>
                    <Switch checked={qrCodeEnabled} onCheckedChange={setQrCodeEnabled} className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200" />
                  </div>
                  {qrCodeEnabled && (
                    <div className="mt-2">
                      <label className="text-[12px] text-gray-500 mb-1.5 block">{t('qrLink', appLanguage)}</label>
                      <Input value={qrCodeValue} onChange={e => setQrCodeValue(e.target.value)} className="h-8 text-[13px]" placeholder="e.g.: https://yourwebsite.com" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Content Display */}
          <div className="p-4 bg-slate-50/50">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-6 text-[15px]"><Layers className="w-4 h-4 text-gray-500" /> {t('contentDisplay', appLanguage)}</h4>
            
            <div className="flex justify-between items-start mb-4 bg-white p-3 rounded-md border border-gray-100 shadow-sm">
              <div>
                <span className="text-[13px] text-gray-700 font-medium flex items-center gap-2">{t('enableLatex', appLanguage)}</span>
                <p className="text-[10px] text-gray-500 mt-0.5">{t('enableLatexTip', appLanguage)}</p>
              </div>
              <Switch checked={enableLatex} onCheckedChange={setEnableLatex} className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Heading className="w-4 h-4 text-yellow-500" /> {t('titleToggle', appLanguage)}</span>
                <Switch checked={showTitle} onCheckedChange={setShowTitle} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><MapPin className="w-4 h-4 text-red-500" /> {t('addressToggle', appLanguage)}</span>
                <Switch checked={showAddress} onCheckedChange={setShowAddress} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Landmark className="w-4 h-4 text-green-500" /> {t('classToggle', appLanguage)}</span>
                <Switch checked={showClassName} onCheckedChange={setShowClassName} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Book className="w-4 h-4 text-green-500" /> {t('subjectToggle', appLanguage)}</span>
                <Switch checked={showSubjectName} onCheckedChange={setShowSubjectName} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Monitor className="w-4 h-4 text-green-500" /> {t('chapterToggle', appLanguage)}</span>
                <Switch checked={showChapterName} onCheckedChange={setShowChapterName} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Lightbulb className="w-4 h-4 text-green-500" /> {t('instructionsToggle', appLanguage)}</span>
                <Switch checked={showInstructions} onCheckedChange={setShowInstructions} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><User className="w-4 h-4 text-green-500" /> {t('studentInfo', appLanguage)}</span>
                <Switch checked={showCandidateInfo} onCheckedChange={setShowCandidateInfo} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Tag className="w-4 h-4 text-green-500" /> {t('questionTags', appLanguage)}</span>
                <Switch checked={showQuestionTags} onCheckedChange={setShowQuestionTags} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Star className="w-4 h-4 text-green-500" /> {t('questionMarksToggle', appLanguage)}</span>
                <Switch checked={showQuestionMarks} onCheckedChange={setShowQuestionMarks} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Grid3X3 className="w-4 h-4 text-green-500" /> {t('omrAttached', appLanguage)}</span>
                <Switch checked={showOMR} onCheckedChange={setShowOMR} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Columns className="w-4 h-4 text-green-500" /> {t('columnDivider', appLanguage)}</span>
                <Switch checked={showColumnDivider} onCheckedChange={setShowColumnDivider} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Barcode className="w-4 h-4 text-green-500" /> {t('subjectCodeToggle', appLanguage)}</span>
                <Switch checked={showSubjectCode} onCheckedChange={setShowSubjectCode} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><Hash className="w-4 h-4 text-green-500" /> {t('marksBox', appLanguage)}</span>
                <Switch checked={showMarksBox} onCheckedChange={setShowMarksBox} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><LayoutGrid className="w-4 h-4 text-green-500" /> {t('setCodeToggle', appLanguage)}</span>
                <Switch checked={showSetCode} onCheckedChange={setShowSetCode} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-3"><FileDigit className="w-4 h-4 text-green-500" /> {t('pageNumberToggle', appLanguage)}</span>
                <Switch checked={showPageNumber} onCheckedChange={setShowPageNumber} />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-800 flex items-center gap-3 font-bold"><CheckCircle className="w-4 h-4 text-blue-500" /> {t('separateAnswerKey', appLanguage)}</span>
                  <Switch checked={showAnswerKeySheet} onCheckedChange={setShowAnswerKeySheet} className="data-[state=checked]:bg-blue-600" />
                </div>
                {showAnswerKeySheet && (
                  <div className="mt-3 pl-7 flex justify-between items-center">
                    <span className="text-[13px] text-gray-600">{t('columnCount', appLanguage)}</span>
                    <Select value={answerKeyColumns.toString()} onValueChange={v => setAnswerKeyColumns(Number(v))}>
                      <SelectTrigger className="w-[80px] h-7 text-[12px] min-h-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 {t('columnsLabel', appLanguage)}</SelectItem>
                        <SelectItem value="3">3 {t('columnsLabel', appLanguage)}</SelectItem>
                        <SelectItem value="4">4 {t('columnsLabel', appLanguage)}</SelectItem>
                        <SelectItem value="5">5 {t('columnsLabel', appLanguage)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-800 flex items-center gap-3 font-bold"><CircleDot className="w-4 h-4 text-purple-500" /> {t('separateOMR', appLanguage)}</span>
                  <Switch checked={showOMRSheetAttachment} onCheckedChange={setShowOMRSheetAttachment} className="data-[state=checked]:bg-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Question Format */}
          <div className="p-4 bg-slate-50/50 mt-2 border-t border-gray-200/60">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-6 text-[15px]">
              <HelpCircle className="w-4 h-4 text-gray-400 fill-gray-200" /> {t('questionFormat', appLanguage)}
            </h4>

            {/* Column Count */}
            <div className="mb-6">
              <span className="text-sm text-gray-700 mb-3 block">{t('columnCount', appLanguage)}</span>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(col => (
                  <button
                    key={col}
                    onClick={() => setPaperColumns(col)}
                    className={`flex flex-col items-center justify-center p-2 border rounded-md bg-white ${paperColumns === col ? 'border-green-600 ring-1 ring-green-600' : 'border-gray-200'}`}
                  >
                    <div className="flex gap-0.5 mb-1 opacity-20">
                      {Array(col).fill(0).map((_, i) => <div key={i} className="w-2.5 h-4 bg-gray-600 rounded-sm"></div>)}
                    </div>
                    <span className="text-[11px] text-gray-600">{localizeNumber(col, appLanguage)} {t('columnLabel', appLanguage)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Option Style */}
            <div className="mb-6">
              <span className="text-sm text-gray-700 mb-3 block">{t('optionStyleLabel', appLanguage)}</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'circle', label: '⭕' },
                  { id: 'dot', label: '•' },
                  { id: 'parens', label: '()' },
                  { id: 'paren', label: ')' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOptionShape(opt.id)}
                    className={`h-9 flex items-center justify-center border rounded-md bg-white ${optionShape === opt.id ? 'border-green-600 ring-1 ring-green-600 font-bold' : 'border-gray-200 text-gray-500'}`}
                  >
                    {opt.id === 'circle' ? <div className="w-4 h-4 rounded-full border-[1.5px] border-gray-500"></div> : opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Option Label */}
            <div className="mb-6">
              <span className="text-sm text-gray-700 mb-3 block">{t('optionLabel', appLanguage)}</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'bangla', label: t('banglaLabel', appLanguage) },
                  { id: 'english', label: t('englishLabel', appLanguage) },
                  { id: 'number', label: t('numberLabel', appLanguage) },
                  { id: 'roman', label: t('romanLabel', appLanguage) }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOptionLabelType(opt.id)}
                    className={`h-9 flex items-center justify-center border rounded-md bg-white text-[12px] truncate px-1 ${optionLabelType === opt.id ? 'border-green-600 ring-1 ring-green-600 text-gray-800 font-medium' : 'border-gray-200 text-gray-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Option Column Count */}
            <div className="mb-6">
              <span className="text-sm text-gray-700 mb-3 block">{t('optionColumnCount', appLanguage)}</span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(col => (
                  <button
                    key={col}
                    onClick={() => setOptionColumns(col)}
                    className={`h-9 flex items-center justify-center border rounded-md bg-white text-[13px] ${optionColumns === col ? 'border-green-600 ring-1 ring-green-600 text-gray-800 font-medium' : 'border-gray-200 text-gray-600'}`}
                  >
                    {localizeNumber(col, appLanguage)}
                  </button>
                ))}
              </div>
            </div>

            {/* Option Auto Layout Box */}
            <div className="mb-6 border border-green-500 rounded-sm p-3 bg-white relative">
              <div className="absolute bottom-0 left-0 right-0 border-b-[1.5px] border-yellow-400"></div>
              <div className="absolute top-0 right-0 bottom-0 border-r-[1.5px] border-yellow-400"></div>
              <h5 className="font-bold text-gray-800 text-[13px] mb-3">{t('optionAutoLayout', appLanguage)}</h5>
              <div className="flex items-center justify-between gap-3">
                <button onClick={handleResetFormat} className="flex items-center gap-1 text-[13px] text-gray-700 hover:text-gray-900 p-1 border rounded bg-gray-50 border-gray-200">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> {t('resetBtn', appLanguage)}
                </button>
                <button onClick={handleAutoLayout} className="flex-1 flex items-center justify-center gap-1.5 bg-[#4ade80] hover:bg-[#22c55e] text-white py-1.5 rounded-sm text-sm font-medium transition-colors shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> {t('autoLayoutBtn', appLanguage)}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-3">{t('autoLayoutTip', appLanguage)}</p>
            </div>

            {/* Gaps */}
            <div className="mb-6 space-y-4">
              <div>
                <span className="text-sm text-gray-700 mb-2 block">{t('rowGap', appLanguage)}</span>
                <input type="range" min="0" max="40" value={rowGap} onChange={e => setRowGap(Number(e.target.value))} className="w-full accent-[#2563eb] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <span className="text-sm text-gray-700 mb-2 block">{t('columnGap', appLanguage)}</span>
                <input type="range" min="0" max="100" value={colGap} onChange={e => setColGap(Number(e.target.value))} className="w-full accent-[#2563eb] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <span className="text-sm text-gray-700 mb-2 block">{t('questionOptionGap', appLanguage)}</span>
                <input type="range" min="0" max="40" value={questionOptionGap} onChange={e => setQuestionOptionGap(Number(e.target.value))} className="w-full accent-[#2563eb] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>

            {/* Font Settings */}
            <div className="mb-6">
              <h5 className="font-bold text-gray-800 text-[14px] mb-4">{t('fontSettings', appLanguage)}</h5>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[13px] text-gray-700 w-16">{t('font', appLanguage)}</span>
                <div className="flex-1">
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger className="h-8 text-[13px]">
                      <SelectValue placeholder={t('banglaDefault', appLanguage)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bangla">{t('banglaDefault', appLanguage)}</SelectItem>
                      <SelectItem value="solaimanlipi">{t('solaimanLipi', appLanguage)}</SelectItem>
                      <SelectItem value="kalpurush">{t('kalpurush', appLanguage)}</SelectItem>
                      <SelectItem value="nikosh">{t('nikosh', appLanguage)}</SelectItem>
                      <SelectItem value="siyamrupali">{t('siyamRupali', appLanguage)}</SelectItem>
                      <SelectItem value="sutonnymj">{t('sutonnyMj', appLanguage)}</SelectItem>
                      <SelectItem value="timesnewroman">{t('timesNewRoman', appLanguage)}</SelectItem>
                      <SelectItem value="arial">{t('arial', appLanguage)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-700 w-16">{t('size', appLanguage)}</span>
                <div className="flex items-center">
                  <button onClick={() => setFontSize(Math.max(8, fontSize - 1))} className="w-8 h-9 border border-gray-200 rounded-l-md bg-gray-50 flex items-center justify-center hover:bg-gray-100">-</button>
                  <div className="w-12 h-9 border-y border-gray-200 flex items-center justify-center text-[15px] font-bold bg-white text-gray-900">
                    {localizeNumber(fontSize, appLanguage)}
                  </div>
                  <button onClick={() => setFontSize(Math.min(32, fontSize + 1))} className="w-8 h-9 border border-gray-200 rounded-r-md bg-gray-50 flex items-center justify-center hover:bg-gray-100">+</button>
                </div>
              </div>
            </div>

            {/* Branding Settings */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-[#3f51b5] flex items-center gap-2 text-[14px]">
                  <Waves className="w-4 h-4 text-[#3f51b5]" /> {t('brandingSettings', appLanguage)}
                </h4>
                <Switch checked={brandingEnabled} onCheckedChange={setBrandingEnabled} className="data-[state=checked]:bg-blue-600" />
              </div>

              {brandingEnabled && (
                <div className="space-y-5">
                  {/* Text */}
                  <div>
                    <label className="text-[13px] text-gray-700 mb-2 block">{t('footerTextLabel', appLanguage)}</label>
                    <Input
                      value={footerText}
                      onChange={e => setFooterText(e.target.value)}
                      placeholder={t('institutePlaceholder', appLanguage)}
                      className="h-10 text-[14px] bg-white text-gray-700 border-gray-200 mb-4"
                    />
                    <label className="text-[13px] text-gray-700 mb-2 block">{t('watermarkText', appLanguage)}</label>
                    <Input
                      value={watermarkText}
                      onChange={e => setWatermarkText(e.target.value)}
                      placeholder={t('institutePlaceholder', appLanguage)}
                      className="h-10 text-[14px] bg-white text-gray-700 border-gray-200"
                    />
                  </div>

                  {/* Font */}
                  <div>
                    <label className="text-[13px] text-gray-700 mb-2 block">{t('watermarkFont', appLanguage)}</label>
                    <Select value={watermarkFont} onValueChange={setWatermarkFont}>
                      <SelectTrigger className="h-10 text-[14px] bg-white text-gray-700 border-gray-200">
                        <SelectValue placeholder={t('selectFont', appLanguage)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kalpurush">{t('kalpurush', appLanguage)}</SelectItem>
                        <SelectItem value="siyamrupali">{t('siyamRupali', appLanguage)}</SelectItem>
                        <SelectItem value="solaimanlipi">{t('solaimanLipi', appLanguage)}</SelectItem>
                        <SelectItem value="sutonnymj">{t('sutonnyMj', appLanguage)}</SelectItem>
                        <SelectItem value="nikosh">{t('nikosh', appLanguage)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="text-[13px] text-gray-700 mb-2 block">{t('watermarkIcon', appLanguage)}</label>
                    {!watermarkImage ? (
                      <label className="border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 bg-white relative overflow-hidden transition-all h-20">
                        <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleWatermarkImageUpload} />
                        <span className="text-[13px] text-gray-400 font-medium text-center">{t('uploadImageClick', appLanguage)}</span>
                        <span className="text-[11px] text-gray-300 text-center mt-1">(Max size ~5MB, PNG/JPG)</span>
                      </label>
                    ) : (
                      <div className="flex flex-col items-center gap-3 border border-gray-200 rounded-md p-3 bg-white">
                        <img src={watermarkImage} alt="Watermark Preview" className="w-12 h-12 object-contain" />
                        <button onClick={() => setWatermarkImage(null)} className="flex items-center justify-center gap-1.5 w-full py-1.5 border border-red-200 text-red-600 rounded-sm hover:bg-red-50 text-[13px] transition-colors font-medium">
                          <Trash2 className="w-3.5 h-3.5" /> {t('deleteIcon', appLanguage)}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Size */}
                  <div>
                    <span className="text-[13px] text-gray-700 mb-2 block">{t('size', appLanguage)}: {watermarkSize}px</span>
                    <input type="range" min="20" max="300" value={watermarkSize} onChange={e => setWatermarkSize(Number(e.target.value))} className="w-full accent-[#2563eb] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  {/* Opacity */}
                  <div>
                    <span className="text-[13px] text-gray-700 mb-2 block">{t('opacity', appLanguage)}: {watermarkOpacity}%</span>
                    <input type="range" min="0" max="100" value={watermarkOpacity} onChange={e => setWatermarkOpacity(Number(e.target.value))} className="w-full accent-[#2563eb] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  {/* Repeat */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] text-gray-700">{t('watermarkRepeat', appLanguage)}</span>
                      <Switch checked={watermarkRepeat} onCheckedChange={setWatermarkRepeat} className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200" />
                    </div>
                    {watermarkRepeat && (
                      <div>
                        <input type="range" min="1" max="20" value={watermarkRepeatCount} onChange={e => setWatermarkRepeatCount(Number(e.target.value))} className="w-full accent-[#2563eb] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2" />
                        <div className="text-[13px] text-gray-700">{watermarkRepeatCount} times</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Header Image Settings */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-[#1e88e5] flex items-center gap-2 text-[14px]">
                  <ImageIcon className="w-4 h-4 text-[#1e88e5]" /> {t('headerImageSettings', appLanguage)}
                </h4>
                <Switch checked={headerImageEnabled} onCheckedChange={setHeaderImageEnabled} className="data-[state=checked]:bg-blue-600" />
              </div>

              {headerImageEnabled && (
                <div className="space-y-4">
                  {/* Header Image */}
                  <div>
                    <label className="text-[13px] text-gray-700 mb-2 block">{t('headerImageLabel', appLanguage)}</label>
                    <div className="border border-gray-200 rounded-md bg-white p-1 flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeaderImageUpload}
                        className="text-[13px] text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-[13px] file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 w-full"
                      />
                    </div>
                  </div>

                  {/* Image Fit */}
                  <div>
                    <label className="text-[13px] text-gray-700 mb-2 block">{t('imageFitLabel', appLanguage)}</label>
                    <Select value={headerImageFit} onValueChange={setHeaderImageFit}>
                      <SelectTrigger className="h-10 text-[14px] bg-white text-gray-700 border-gray-200">
                        <SelectValue placeholder={t('selectFit', appLanguage)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">{t('coverFit', appLanguage)}</SelectItem>
                        <SelectItem value="contain">{t('containFit', appLanguage)}</SelectItem>
                        <SelectItem value="fill">{t('fillFit', appLanguage)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] print:bg-white pb-20 lg:pb-0">
      <header className="bg-white border-b px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-500 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('create_question_paper', appLanguage)}</h1>
            <div className="text-sm text-gray-500">Home &gt; E-Question Builder &gt; Create Question</div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
            <Select value={appLanguage} onValueChange={(v: AppLanguage) => setAppLanguage(v)}>
              <SelectTrigger className="h-9 w-[130px] border-gray-200 bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Languages className="w-4 h-4 text-blue-600" />
                  <span>{appLanguage === 'bn' ? 'বাংলা' : appLanguage === 'en' ? 'English' : 'हिंदी'}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-sm flex items-center h-9 px-4 text-sm font-medium"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" /> {t('printSavePdf', appLanguage)}
            </Button>
          </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 max-w-[1400px] mx-auto w-full p-2 sm:p-4 gap-6 relative print:p-0 print:m-0 print:static">

        {/* LEFT SIDEBAR - SETTINGS */}
        <aside className="hidden lg:block w-full lg:w-72 bg-white rounded-lg shadow-sm border border-gray-200 h-fit max-h-[calc(100vh-120px)] overflow-y-auto lg:sticky lg:top-24 print:hidden shrink-0">
          {renderSidebarSettings()}
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
              body {
                counter-reset: preview-page;
              }
              .preview-page-container {
                counter-increment: preview-page;
              }
              .page-number-display::after {
                content: "পৃষ্ঠা " counter(preview-page, bengali);
              }
              .print-page-number-display {
                display: none !important;
              }
              @page {
                size: ${paperSize === 'A4' ? 'A4' : paperSize === 'Letter' ? 'letter' : 'legal'} ${orientation.toLowerCase()};
                margin: ${margins.top || '0'}in ${margins.right || '0'}in ${margins.bottom || '0.5'}in ${margins.left || '0'}in;
                ${showPageNumber ? `
                @bottom-right {
                  content: "পৃষ্ঠা " counter(page, bengali);
                  font-size: 12px;
                  font-weight: bold;
                }
                ` : ''}
                @bottom-left {
                  content: "${footerText}";
                  font-size: 12px;
                  font-weight: bold;
                  color: rgba(31, 41, 55, 0.7);
                }
              }
            }
          `}} />
          <div id="printable-paper" className="flex flex-col gap-8 print:gap-0 print:block">
            {/* Fixed Print Footer (Repeats on every printed page) */}
            <div
              className="hidden print:flex fixed bottom-0 left-0 right-0 w-full justify-between items-center text-[12px] font-bold text-gray-800 opacity-70 bg-white pt-3 border-t border-gray-300 z-50"
            >
              <div>সৌজন্যে: {footerText || 'দেশ এক্সাম একাডেমী'}</div>
              {showPageNumber && <div className="print-page-number-display"></div>}
            </div>

            {/* Page 1: Main Paper */}
            <div
              className="preview-page-container relative flex flex-col mx-auto bg-white shadow-xl print:shadow-none transition-all duration-300"
              style={{
                fontFamily: fontFamily === 'solaimanlipi' ? '"SolaimanLipi", sans-serif' :
                  fontFamily === 'kalpurush' ? '"Kalpurush", sans-serif' :
                    fontFamily === 'nikosh' ? '"Nikosh", sans-serif' :
                      fontFamily === 'siyamrupali' ? '"Siyam Rupali", sans-serif' :
                        fontFamily === 'sutonnymj' ? '"SutonnyMJ", sans-serif' :
                          fontFamily === 'timesnewroman' ? '"Times New Roman", serif' :
                            fontFamily === 'arial' ? 'Arial, sans-serif' : 'inherit'
              }}
            >
              <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300">

                {loading ? (
                  <div className="flex justify-center items-center h-64 print:hidden">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    {/* Watermark */}
                    {brandingEnabled && (
                      <div
                        className="absolute print:fixed print:inset-0 inset-0 pointer-events-none overflow-hidden z-0"
                        style={{
                          opacity: watermarkOpacity / 100
                        }}
                      >
                        {watermarkRepeat ? (
                          <div className="w-full h-full flex flex-wrap items-center justify-evenly content-evenly py-10 px-8">
                            {Array.from({ length: watermarkRepeatCount }).map((_, i) => (
                              <div key={i} className="-rotate-45 transform-gpu flex items-center justify-center p-4">
                                {watermarkImage ? (
                                  <img src={watermarkImage} alt="Watermark" style={{ width: `${watermarkSize}px`, height: 'auto' }} className="select-none" />
                                ) : (
                                  <span className="select-none text-gray-400 whitespace-nowrap" style={{ fontSize: `${watermarkSize}px`, fontFamily: getWatermarkFontFamily() }}>
                                    {watermarkText || 'দেশ এক্সাম একাডেমী'}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {watermarkImage ? (
                              <img src={watermarkImage} alt="Watermark" style={{ width: `${watermarkSize}px`, height: 'auto' }} className="select-none" />
                            ) : (
                              <span className="-rotate-45 select-none text-gray-400 whitespace-nowrap" style={{ fontSize: `${watermarkSize}px`, fontFamily: getWatermarkFontFamily() }}>
                                {watermarkText || 'দেশ এক্সাম একাডেমী'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="relative z-10 flex-1 flex flex-col">
                      {/* Header Image */}
                      {headerImageEnabled && headerImage && (
                        <div className="w-full mb-6">
                          <img
                            src={headerImage}
                            alt="Header Banner"
                            className="w-full h-32"
                            style={{ objectFit: headerImageFit as any }}
                          />
                        </div>
                      )}

                      {/* PAPER HEADER */}
                      <div className="relative mb-4">
                        {/* Left: QR Code */}
                        {qrCodeEnabled && (
                          <div className="absolute top-0 left-0 p-1.5 border border-black/10 bg-white shadow-sm print:shadow-none z-20">
                            <QRCodeSVG value={qrCodeValue || 'https://deshexam.com'} size={54} />
                          </div>
                        )}

                        {/* Left: Marks Box */}
                        {showMarksBox && (
                          <div className={`absolute left-0 flex border border-black ${qrCodeEnabled ? 'top-[75px]' : 'top-8'}`}>
                            <div {...getEditableProps("bg-black text-white text-[11px] px-2 py-1 flex items-center")}>{t('marks', appLanguage)}</div>
                            <div className="w-16"></div>
                          </div>
                        )}

                        {/* Right: Set & Subject Code */}
                        <div className="absolute top-6 right-0 text-right">
                          {showSetCode && (
                            <div className="border border-black flex items-center justify-center font-bold text-sm mb-1 inline-flex w-24">
                              <span {...getEditableProps("flex-1 text-center py-0.5")}>{t('set', appLanguage)}</span>
                              <span {...getEditableProps("border-l border-black flex-1 text-center py-0.5")}>{activeSetCode}</span>
                            </div>
                          )}
                          {showSubjectCode && (
                            <div className="flex items-center justify-end gap-2 text-[13px] font-medium text-gray-800">
                              <span {...getEditableProps()}>{t('subjectCode', appLanguage)}</span>
                              <div className="flex">
                                <span {...getEditableProps("border border-black w-5 h-6 flex items-center justify-center")}>০</span>
                                <span {...getEditableProps("border-y border-r border-black w-5 h-6 flex items-center justify-center")}>০</span>
                                <span {...getEditableProps("border-y border-r border-black w-5 h-6 flex items-center justify-center")}>০</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Center Info */}
                        <div className={`text-center ${!headerSettingsEnabled ? 'invisible select-none' : ''}`}>
                          {showTitle && <h1 {...getEditableProps("text-2xl font-bold text-gray-900 mb-1")}>{headerTitle}</h1>}
                          {showAddress && <p {...getEditableProps("text-[13px] text-gray-700 mb-1")}>{headerAddress}</p>}
                          {showClassName && <h2 {...getEditableProps("text-[15px] font-bold text-gray-800 mb-1")}>{headerClassName}</h2>}
                          {showSubjectName && <h3 {...getEditableProps("text-[14px] font-bold text-gray-800 mb-0.5")}>{headerSubjectName}</h3>}
                          {showChapterName && <h4 {...getEditableProps("text-[13px] text-gray-700")}>{headerChapterName}</h4>}
                        </div>
                      </div>

                      {format !== 'answer' && (
                        <>
                          {/* Rules */}
                          {showInstructions && (
                            <>
                              <div className="border-b border-black mb-2 flex justify-between text-[14px] font-bold text-gray-800 pb-1">
                                <span {...getEditableProps()}>{t('time', appLanguage)} {headerTime || localizeNumber(questions.length, appLanguage)} {t('minutes', appLanguage)}</span>
                                <span {...getEditableProps()}>{t('totalMarks', appLanguage)} {headerMarks || localizeNumber(questions.length, appLanguage)}</span>
                              </div>

                              <div className="text-center text-[12px] text-gray-800 mb-4 font-medium leading-relaxed px-4">
                                <p {...getEditableProps()}>{t('instruction1', appLanguage)}</p>
                                <p {...getEditableProps("mt-1 font-bold")}>{t('instruction2', appLanguage)}</p>
                              </div>
                            </>
                          )}

                          {/* Candidate Info */}
                          {showCandidateInfo && (
                            <div className="flex justify-between items-end mb-4 text-[14px] font-bold text-gray-800">
                              <div className="flex-1 flex">
                                <span className="whitespace-nowrap">{t('studentName', appLanguage)}</span>
                                <div className="border-b border-dashed border-gray-400 flex-1 ml-2 mr-6"></div>
                              </div>
                              <div className="w-[300px] flex">
                                <span className="whitespace-nowrap">{t('roll', appLanguage)}</span>
                                <div className="border-b border-dashed border-gray-400 flex-1 ml-2"></div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <hr className="border-t-[1.5px] border-gray-300 mb-6" />

                      {format === 'answer' && (
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-bold text-red-500">{t('answersBelow', appLanguage)}</h3>
                        </div>
                      )}

                      {/* QUESTIONS OR ANSWERS */}
                      {format === 'answer' && optionStyle === 'uttarmala' ? (
                        <div className="mt-4 mb-10 overflow-x-auto">
                          <span className="text-sm font-bold text-gray-800 block mb-2">{t('answerKeyHeading', appLanguage)}</span>
                          <table className="border-collapse border border-gray-300 text-center text-sm">
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 font-bold px-3 py-2 bg-gray-50">{t('tableQuestion', appLanguage)}</td>
                                {questions.filter(q => !q.questionText.startsWith('[[SECTION_HEADER]]')).map((q, idx) => (
                                  <td key={`q-${idx}`} className="border border-gray-300 px-3 py-2 font-bold">{localizeNumber(idx + 1, appLanguage)}.</td>
                                ))}
                              </tr>
                              <tr>
                                <td className="border border-gray-300 font-bold px-3 py-2 bg-gray-50">{t('tableAnswer', appLanguage)}</td>
                                {questions.filter(q => !q.questionText.startsWith('[[SECTION_HEADER]]')).map((q, idx) => {
                                  const optIdx = ['a', 'b', 'c', 'd'].indexOf((q.correctAnswer || 'a').toLowerCase());
                                  const marker = localizeOptionLabel(optIdx !== -1 ? optIdx : 0, optionLabelType, appLanguage);
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
                          className="text-justify mb-10"
                          style={{ columnCount: paperColumns, columnRule: showColumnDivider ? '1px solid #e5e7eb' : 'none', columnGap: `${colGap}px` }}
                        >
                          {questions.filter(q => !q.questionText.startsWith('[[SECTION_HEADER]]')).map((q, index) => {
                            const optIdx = ['a', 'b', 'c', 'd'].indexOf((q.correctAnswer || 'a').toLowerCase());
                            const marker = localizeOptionLabel(optIdx !== -1 ? optIdx : 0, optionLabelType, appLanguage);

                            return (
                              <div key={q.id} className="text-gray-900 leading-snug break-inside-avoid flex flex-col gap-1 font-bold" style={{ marginBottom: `${rowGap}px`, fontSize: `${fontSize}px` }}>
                                <div className="flex items-center gap-2">
                                  <span>{localizeNumber(index + 1, appLanguage)}.</span>
                                  {optionStyle === 'u' && <span>উঃ {marker}</span>}
                                  {optionStyle === 'ans' && <span>Ans: {marker}</span>}
                                  {(optionStyle === 'ka' || optionStyle === 'circle') && (
                                    <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-full bg-gray-800 text-white text-[12px] leading-none pb-[1px]">{marker}</span>
                                  )}
                                </div>
                                {showExplanations && q.explanation && (
                                  <div className="text-sm text-gray-600 font-normal mt-1 border-l-2 border-gray-300 pl-2">
                                    <span className="font-bold text-gray-700">ব্যাখ্যা:</span> <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className="text-justify"
                          style={{ columnCount: paperColumns, columnRule: showColumnDivider ? '1px solid #e5e7eb' : 'none', columnGap: `${colGap}px` }}
                        >
                          {questions.map((q, index) => {
                            const isSectionHeader = q.questionText.startsWith('[[SECTION_HEADER]]');
                            const sectionTitle = isSectionHeader ? q.questionText.replace('[[SECTION_HEADER]]', '') : '';
                            const actualQuestionIndex = questions.slice(0, index + 1).filter(q => !q.questionText.startsWith('[[SECTION_HEADER]]')).length - 1;

                            return (
                              <div
                                key={q.id}
                                className={`relative text-gray-900 leading-snug break-inside-avoid ${draggedIndex === index ? 'opacity-50' : ''}`}
                                style={{
                                  marginBottom: `${rowGap}px`,
                                  fontSize: `${fontSize}px`,
                                  ...((isSectionHeader || (q as any).breakBeforeColumn) ? { columnSpan: 'all', WebkitColumnSpan: 'all' } as any : {})
                                }}
                                draggable={editingMode}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, index)}
                              >
                                {editingMode && (
                                  <div className="absolute -left-8 top-0 flex flex-col gap-1 print:hidden opacity-50 hover:opacity-100 transition-opacity">
                                    <button className="cursor-grab hover:text-blue-500"><GripVertical className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteQuestion(index)} className="hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                )}

                                {isSectionHeader ? (
                                  <div className="font-bold text-center my-4 pb-1 border-b-2 border-gray-800 text-[110%] print:break-after-avoid">
                                    {sectionTitle}
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-start gap-1.5 mb-2">
                                      <span className="font-bold min-w-[18px]">{localizeNumber(actualQuestionIndex + 1, appLanguage)}.</span>
                                      <div className="flex-1 flex flex-col gap-1">
                                        {enableLatex && !editingMode ? (
                                          <div className="react-markdown-math-wrapper">
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                              {formatLatex(q.questionText)}
                                            </ReactMarkdown>
                                          </div>
                                        ) : (
                                          <div
                                            {...getEditableProps()}
                                            dangerouslySetInnerHTML={{ __html: q.questionText.replace(/\n/g, '<br/>') }}
                                          />
                                        )}
                                        {(showQuestionTags && q.tags && q.tags.length > 0) && (
                                          <div className="flex gap-1 flex-wrap mt-1">
                                            {q.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200">{t}</span>)}
                                          </div>
                                        )}
                                      </div>
                                      {showQuestionMarks && (
                                        <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap ml-2">[{localizeNumber(q.marks || 1, appLanguage)}]</span>
                                      )}
                                    </div>

                                    {/* Options */}
                                    {q.options && (
                                      <div
                                        className="grid gap-x-2 pl-6"
                                        style={{
                                          gridTemplateColumns: `repeat(${optionColumns}, minmax(0, 1fr))`,
                                          rowGap: `${questionOptionGap}px`
                                        }}
                                      >
                                        {['a', 'b', 'c', 'd'].map((optKey, idx) => {
                                          const optValue = (q.options as any)[optKey];
                                          if (!optValue) return null;

                                          const marker = localizeOptionLabel(idx, optionLabelType, appLanguage);
                                          const isCorrect = format === 'qa' && (q.correctAnswer || '').toLowerCase() === optKey;

                                          return (
                                            <div key={optKey} className="flex items-start gap-1.5">
                                              <span className="shrink-0 mt-[1px]">
                                                {optionShape === 'circle' ? (
                                                  <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border border-gray-600 text-[11px] leading-none pb-[1px] ${isCorrect ? 'bg-gray-800 text-white border-transparent' : ''}`}>{marker}</span>
                                                ) : optionShape === 'parens' ? (
                                                  <span className={isCorrect ? 'font-bold bg-gray-200 px-1 rounded' : ''}>({marker})</span>
                                                ) : optionShape === 'paren' ? (
                                                  <span className={isCorrect ? 'font-bold bg-gray-200 px-1 rounded' : ''}>{marker})</span>
                                                ) : (
                                                  <span className={isCorrect ? 'font-bold bg-gray-200 px-1 rounded' : ''}>{marker}.</span>
                                                )}
                                              </span>
                                              <span {...getEditableProps(isCorrect ? 'font-bold' : '')} style={{ fontSize: `${fontSize - 1}px` }}>
                                                {enableLatex && !editingMode ? (
                                                  <span className="react-markdown-math-wrapper inline-math">
                                                    <ReactMarkdown 
                                                      remarkPlugins={[remarkMath]} 
                                                      rehypePlugins={[rehypeKatex]}
                                                      components={{ p: ({node, ...props}) => <span {...props} /> }}
                                                    >
                                                      {formatLatex(optValue)}
                                                    </ReactMarkdown>
                                                  </span>
                                                ) : (
                                                  optValue
                                                )}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {editingMode && (
                        <div className="mt-8 flex gap-4 justify-center print:hidden border-t border-dashed border-gray-300 pt-6 flex-wrap">
                          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAddQuestionOpen(true)}>
                            <PlusCircle className="w-4 h-4 mr-2" /> {t('addCustomQuestion', appLanguage)}
                          </Button>
                          <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => setIsQuestionBankOpen(true)}>
                            <Database className="w-4 h-4 mr-2" /> {t('addFromBank', appLanguage)}
                          </Button>
                          <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => setIsSectionHeaderOpen(true)}>
                            <Layers className="w-4 h-4 mr-2" /> {t('addSectionHeader', appLanguage)}
                          </Button>
                        </div>
                      )}

                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Page 2: Answer Key Sheet */}
            {!loading && showAnswerKeySheet && (
              <div
                className="preview-page-container relative flex flex-col mx-auto bg-white shadow-xl print:shadow-none transition-all duration-300 print:break-before-page"
                style={{
                  fontFamily: fontFamily === 'solaimanlipi' ? '"SolaimanLipi", sans-serif' :
                    fontFamily === 'kalpurush' ? '"Kalpurush", sans-serif' :
                      fontFamily === 'nikosh' ? '"Nikosh", sans-serif' :
                        fontFamily === 'siyamrupali' ? '"Siyam Rupali", sans-serif' :
                          fontFamily === 'sutonnymj' ? '"SutonnyMJ", sans-serif' :
                            fontFamily === 'timesnewroman' ? '"Times New Roman", serif' :
                              fontFamily === 'arial' ? 'Arial, sans-serif' : 'inherit'
                }}
              >
                <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">
                  {/* Watermark for Answer Key */}
                  {brandingEnabled && (
                    <div
                      className="absolute print:fixed print:inset-0 inset-0 pointer-events-none overflow-hidden z-0"
                      style={{ opacity: watermarkOpacity / 100 }}
                    >
                      {watermarkRepeat ? (
                        <div className="w-full h-full flex flex-wrap items-center justify-evenly content-evenly py-10 px-8">
                          {Array.from({ length: watermarkRepeatCount }).map((_, i) => (
                            <div key={i} className="-rotate-45 transform-gpu flex items-center justify-center p-4">
                              {watermarkImage ? (
                                <img src={watermarkImage} alt="Watermark" style={{ width: `${watermarkSize}px`, height: 'auto' }} className="select-none" />
                              ) : (
                                <span className="select-none text-gray-400 whitespace-nowrap" style={{ fontSize: `${watermarkSize}px`, fontFamily: getWatermarkFontFamily() }}>
                                  {watermarkText || 'দেশ এক্সাম একাডেমী'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {watermarkImage ? (
                            <img src={watermarkImage} alt="Watermark" style={{ width: `${watermarkSize}px`, height: 'auto' }} className="select-none" />
                          ) : (
                            <span className="-rotate-45 select-none text-gray-400 whitespace-nowrap" style={{ fontSize: `${watermarkSize}px`, fontFamily: getWatermarkFontFamily() }}>
                              {watermarkText || 'দেশ এক্সাম একাডেমী'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative z-10 flex-1 flex flex-col">
                    {/* Duplicate Header Block */}
                    <div className="relative mb-4">
                      {/* Left: Marks Box */}
                      {showMarksBox && (
                        <div className="absolute top-8 left-0 flex border border-black">
                          <div className="bg-black text-white text-[11px] px-2 py-1 flex items-center">{t('marks', appLanguage)}</div>
                          <div className="w-16"></div>
                        </div>
                      )}

                      {/* Right: Set & Subject Code */}
                      <div className="absolute top-6 right-0 text-right">
                        {showSetCode && (
                          <div className="border border-black flex items-center justify-center font-bold text-sm mb-1 inline-flex w-24">
                            <span className="flex-1 text-center py-0.5">{t('set', appLanguage)}</span>
                            <span className="border-l border-black flex-1 text-center py-0.5">{activeSetCode}</span>
                          </div>
                        )}
                        {showSubjectCode && (
                          <div className="flex items-center justify-end gap-2 text-[13px] font-medium text-gray-800">
                            <span>{t('subjectCode', appLanguage)}</span>
                            <div className="flex">
                              <span className="border border-black w-5 h-6 flex items-center justify-center">০</span>
                              <span className="border-y border-r border-black w-5 h-6 flex items-center justify-center">০</span>
                              <span className="border-y border-r border-black w-5 h-6 flex items-center justify-center">০</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Center Info */}
                      <div className={`text-center ${!headerSettingsEnabled ? 'invisible select-none' : ''}`}>
                        {showTitle && <h1 className="text-2xl font-bold text-gray-900 mb-1">{headerTitle}</h1>}
                        {showAddress && <p className="text-[13px] text-gray-700 mb-1">{headerAddress}</p>}
                        {showClassName && <h2 className="text-[15px] font-bold text-gray-800 mb-1">{headerClassName}</h2>}
                        {showSubjectName && <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">{headerSubjectName}</h3>}
                        {showChapterName && <h4 className="text-[13px] text-gray-700">{headerChapterName}</h4>}
                      </div>
                    </div>

                    <hr className="border-t border-gray-200 my-6" />

                    <h2 className="text-[20px] font-bold text-center text-red-500 mb-10">
                      {t('answersBelow', appLanguage)}
                    </h2>

                    <div className="flex w-full gap-3 justify-center">
                      {Array.from({ length: answerKeyColumns }).map((_, colIndex) => {
                        const baseCount = Math.floor(questions.length / answerKeyColumns);
                        const remainder = questions.length % answerKeyColumns;
                        const colItemCount = baseCount + (colIndex < remainder ? 1 : 0);

                        let startIndex = 0;
                        for (let i = 0; i < colIndex; i++) {
                          startIndex += baseCount + (i < remainder ? 1 : 0);
                        }

                        const colItems = questions.slice(startIndex, startIndex + colItemCount).map((q, i) => ({ q, originalIndex: startIndex + i }));



                        return (
                          <div
                            key={colIndex}
                            className="flex-1 flex flex-col"
                          >
                            {/* Table Header */}
                            <div className="flex w-full border border-red-500 mb-1">
                              <div className="w-[30%] shrink-0 border-r border-red-500 flex items-center justify-center font-bold text-[13px] py-1 text-gray-900 bg-white">{t('tableQuestion', appLanguage)}</div>
                              <div className="flex-1 flex items-center justify-center font-bold text-[13px] py-1 text-gray-900 bg-white">{t('tableAnswer', appLanguage)}</div>
                            </div>

                            {/* Rows */}
                            <div className="flex flex-col gap-1">
                              {colItems.map(({ q, originalIndex }) => {
                                const correctOptIndex = ['a', 'b', 'c', 'd'].indexOf((q.correctAnswer || '').toLowerCase());

                                return (
                                  <div key={q.id} className="flex items-stretch break-inside-avoid border border-red-500">
                                    <div className="w-[30%] shrink-0 border-r border-red-500 flex justify-center items-center py-1.5 text-[14px] font-bold text-gray-800 bg-white">
                                      {localizeNumber(originalIndex + 1, appLanguage)}
                                    </div>
                                    <div className="flex-1 flex bg-white min-w-0">
                                      {[0, 1, 2, 3].map((optIdx) => {
                                        const isCorrect = optIdx === correctOptIndex;
                                        return (
                                          <div key={optIdx} className={`flex-1 flex justify-center items-center py-1 border-red-500 ${optIdx !== 3 ? 'border-r' : ''} ${optIdx % 2 === 0 ? 'bg-red-50' : 'bg-white'}`}>
                                            <div className={`relative flex items-center justify-center w-[18px] h-[18px] min-w-[18px] min-h-[18px] shrink-0 rounded-full border ${isCorrect ? 'border-[#1e293b] bg-[#1e293b]' : 'border-red-500 bg-white'}`}>
                                              <span className={`text-[10px] font-bold absolute select-none leading-none pt-px ${isCorrect ? 'text-white' : 'text-gray-800'}`}>
                                                {localizeOptionLabel(optIdx, optionLabelType, appLanguage)}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Page 3: OMR Sheet Attachment */}
            {!loading && showOMRSheetAttachment && (
              <div
                className="preview-page-container relative flex flex-col mx-auto bg-white shadow-xl print:shadow-none transition-all duration-300 print:break-before-page"
                style={{
                  fontFamily: fontFamily === 'solaimanlipi' ? '"SolaimanLipi", sans-serif' :
                    fontFamily === 'kalpurush' ? '"Kalpurush", sans-serif' :
                      fontFamily === 'nikosh' ? '"Nikosh", sans-serif' :
                        fontFamily === 'siyamrupali' ? '"Siyam Rupali", sans-serif' :
                          fontFamily === 'sutonnymj' ? '"SutonnyMJ", sans-serif' :
                            fontFamily === 'timesnewroman' ? '"Times New Roman", serif' :
                              fontFamily === 'arial' ? 'Arial, sans-serif' : 'inherit'
                }}
              >
                <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">
                  <div className="relative z-10 font-sans flex-1 flex flex-col">
                    <div className="border-2 border-gray-800 p-8 rounded-xl relative bg-white">
                      {/* OMR Header */}
                      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                        <div className="flex flex-col gap-5 w-2/3">
                          <h2 className="text-3xl font-black text-gray-800 tracking-wider">{t('omrTitle', appLanguage)}</h2>
                          <div className="flex items-center gap-4 text-sm font-bold mt-2">
                            <span className="w-32 text-gray-700">{t('omrStudentName', appLanguage)}</span>
                            <div className="flex-1 border-b-2 border-gray-400 border-dashed h-6"></div>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="w-32 text-gray-700">{t('omrRollNo', appLanguage)}</span>
                            <div className="flex-1 border-b-2 border-gray-400 border-dashed h-6"></div>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="w-32 text-gray-700">{t('omrClass', appLanguage)}</span>
                            <div className="flex-1 border-b-2 border-gray-400 border-dashed h-6"></div>
                            <span className="w-20 text-right text-gray-700">{t('omrSubject', appLanguage)}</span>
                            <div className="flex-1 border-b-2 border-gray-400 border-dashed h-6"></div>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="w-32 text-gray-700">{t('omrExamDate', appLanguage)}</span>
                            <div className="flex-1 border-b-2 border-gray-400 border-dashed h-6"></div>
                            <span className="w-20 text-right text-gray-700">{t('omrSetCode', appLanguage)}</span>
                            <div className="flex-1 border-b-2 border-gray-400 border-dashed h-6"></div>
                          </div>
                        </div>
                        <div className="w-1/3 flex justify-end">
                          <div className="border-2 border-gray-800 p-2 w-32 h-32 flex flex-col items-center justify-center rounded-lg text-center bg-gray-50">
                            <div className="text-xs font-bold text-gray-500 mb-1">{t('omrInvgSign', appLanguage)}</div>
                            <div className="w-full h-16 border-b border-gray-300 border-dashed"></div>
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="mb-10 border border-gray-300 p-4 rounded-lg bg-gray-50 shadow-sm">
                        <h3 className="font-bold text-[13px] mb-3 text-gray-800">{t('omrInstructionsTitle', appLanguage)}</h3>
                        <div className="flex items-center gap-8 text-[12px] font-medium text-gray-600">
                          <div className="flex items-center gap-3">
                            <span className="text-green-600 font-bold">{t('omrCorrect', appLanguage)}</span>
                            <div className="w-6 h-6 rounded-full bg-gray-800"></div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-red-500 font-bold">{t('omrWrong', appLanguage)}</span>
                            <div className="relative w-6 h-6 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <div className="w-7 h-0.5 bg-gray-800 rotate-45 absolute"></div>
                              <div className="w-7 h-0.5 bg-gray-800 -rotate-45 absolute"></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-800 absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          </div>
                          <div className="ml-auto flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                            <Edit className="w-4 h-4" />
                            <span>{t('omrPen', appLanguage)}</span>
                          </div>
                        </div>
                      </div>

                      {/* OMR Bubbles Grid */}
                      <div className="flex w-full gap-3 justify-center">
                        {Array.from({ length: 4 }).map((_, colIndex) => {
                          const baseCount = Math.floor(questions.length / 4);
                          const remainder = questions.length % 4;
                          const colItemCount = baseCount + (colIndex < remainder ? 1 : 0);

                          let startIndex = 0;
                          for (let i = 0; i < colIndex; i++) {
                            startIndex += baseCount + (i < remainder ? 1 : 0);
                          }

                          const colItems = questions.slice(startIndex, startIndex + colItemCount).map((q, i) => ({ q, originalIndex: startIndex + i }));



                          return (
                            <div
                              key={colIndex}
                              className="flex-1 flex flex-col"
                            >
                              {/* Table Header */}
                              <div className="flex w-full border border-red-500 mb-1">
                                <div className="w-[30%] shrink-0 border-r border-red-500 flex items-center justify-center font-bold text-[13px] py-1 text-gray-900 bg-white">{t('tableQuestion', appLanguage)}</div>
                                <div className="flex-1 flex items-center justify-center font-bold text-[13px] py-1 text-gray-900 bg-white">{t('tableAnswer', appLanguage)}</div>
                              </div>

                              {/* Rows */}
                              <div className="flex flex-col gap-1">
                                {colItems.map(({ q, originalIndex }, idx) => {
                                  return (
                                    <div key={q.id} className="flex items-stretch break-inside-avoid border border-red-500">
                                      <div className="w-[30%] shrink-0 border-r border-red-500 flex justify-center items-center py-1.5 text-[14px] font-bold text-gray-800 bg-white">
                                        {localizeNumber(originalIndex + 1, appLanguage)}
                                      </div>
                                      <div className="flex-1 flex bg-white min-w-0">
                                        {[0, 1, 2, 3].map((optIdx) => (
                                          <div key={optIdx} className={`flex-1 flex justify-center items-center py-1 border-red-500 ${optIdx !== 3 ? 'border-r' : ''} ${optIdx % 2 === 0 ? 'bg-red-50' : 'bg-white'}`}>
                                            <div className="relative flex items-center justify-center w-[18px] h-[18px] min-w-[18px] min-h-[18px] shrink-0 rounded-full border border-red-500 bg-white">
                                              <span className="text-[10px] font-bold text-gray-800 absolute select-none leading-none pt-px">{localizeOptionLabel(optIdx, optionLabelType, appLanguage)}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Logo */}
                    <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center text-[12px] font-bold text-gray-800 opacity-70 print:hidden">
                      সৌজন্যে: {footerText || 'দেশ এক্সাম একাডেমী'}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action button beneath paper (hidden in print) */}
          <div className="bg-gray-50 border-t border-gray-200 p-6 text-center print:hidden rounded-b-lg">
            <Button className="bg-[#c8e6c9] hover:bg-[#a5d6a7] text-green-800 border-transparent font-medium shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> {t('addCustomQuestion', appLanguage)}
            </Button>
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
                  <Input className="border-gray-200 shadow-none h-[42px]" type="number" step="0.1" value={margins.top} onChange={e => setMargins({ ...margins, top: e.target.value })} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Right</label>
                  <Input className="border-gray-200 shadow-none h-[42px]" type="number" step="0.1" value={margins.right} onChange={e => setMargins({ ...margins, right: e.target.value })} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Bottom</label>
                  <Input className="border-gray-200 shadow-none h-[42px]" type="number" step="0.1" value={margins.bottom} onChange={e => setMargins({ ...margins, bottom: e.target.value })} />
                </div>
                <div>
                  <label className="text-[13px] text-gray-800 block mb-1.5 font-medium">Left</label>
                  <Input className="border-gray-200 shadow-none h-[42px]" type="number" step="0.1" value={margins.left} onChange={e => setMargins({ ...margins, left: e.target.value })} />
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

      {/* Modals */}
      <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('addCustomQuestion', appLanguage)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2 mb-2 p-1 bg-gray-100 rounded-md w-fit">
              <button
                onClick={() => setAddQuestionMode('single')}
                className={`px-4 py-1.5 text-sm rounded ${addQuestionMode === 'single' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {t('singleQuestion', appLanguage)}
              </button>
              <button
                onClick={() => setAddQuestionMode('bulk')}
                className={`px-4 py-1.5 text-sm rounded ${addQuestionMode === 'bulk' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {t('bulkImport', appLanguage)}
              </button>
            </div>

            {addQuestionMode === 'single' ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('questionLabel', appLanguage)}</label>
                  <Input value={customQuestion.text} onChange={e => setCustomQuestion({ ...customQuestion, text: e.target.value })} placeholder={t('enterQuestion', appLanguage)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs mb-1 block">{t('optionA', appLanguage)}</label><Input value={customQuestion.optA} onChange={e => setCustomQuestion({ ...customQuestion, optA: e.target.value })} /></div>
                  <div><label className="text-xs mb-1 block">{t('optionB', appLanguage)}</label><Input value={customQuestion.optB} onChange={e => setCustomQuestion({ ...customQuestion, optB: e.target.value })} /></div>
                  <div><label className="text-xs mb-1 block">{t('optionC', appLanguage)}</label><Input value={customQuestion.optC} onChange={e => setCustomQuestion({ ...customQuestion, optC: e.target.value })} /></div>
                  <div><label className="text-xs mb-1 block">{t('optionD', appLanguage)}</label><Input value={customQuestion.optD} onChange={e => setCustomQuestion({ ...customQuestion, optD: e.target.value })} /></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('correctAnswerLabel', appLanguage)}</label>
                  <Select value={customQuestion.correctAnswer} onValueChange={v => setCustomQuestion({ ...customQuestion, correctAnswer: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">{t('a_ka', appLanguage)}</SelectItem>
                      <SelectItem value="b">{t('b_kha', appLanguage)}</SelectItem>
                      <SelectItem value="c">{t('c_ga', appLanguage)}</SelectItem>
                      <SelectItem value="d">{t('d_gha', appLanguage)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('pasteQuestions', appLanguage)}</label>
                <div className="text-[13px] text-gray-600 mb-3 bg-blue-50/50 p-3 rounded border border-blue-100 max-h-48 overflow-y-auto">
                  <span className="font-semibold text-blue-700">{t('textFormat', appLanguage)}</span> {t('textFormatTip', appLanguage)}
                  <br />
                  <span className="font-semibold text-blue-700 mt-2 block">{t('jsonFormat', appLanguage)}</span>
                  <pre className="mt-1 bg-white p-2 rounded text-[11px] font-mono text-gray-700 border border-gray-200">
                    {`[
  {
    "questionText": "ভারতের রাজধানী কী?",
    "options": { "a": "ঢাকা", "b": "নয়াদিল্লি", "c": "কলকাতা", "d": "মুম্বাই" },
    "correctAnswer": "b"
  }
]`}
                  </pre>
                </div>
                <textarea
                  value={bulkQuestionText}
                  onChange={e => setBulkQuestionText(e.target.value)}
                  placeholder={t('bulkPlaceholder', appLanguage).replace(/\\n/g, '\n')}
                  className="w-full h-64 p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono whitespace-pre-wrap"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <input
                type="checkbox"
                id="forceNewColumn"
                checked={forceNewColumn}
                onChange={e => setForceNewColumn(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="forceNewColumn" className="text-[13px] font-medium text-gray-700 cursor-pointer">
                {t('forceNewColumnLabel', appLanguage)}
              </label>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddQuestionOpen(false)}>{t('cancelBtn', appLanguage)}</Button>
            <Button onClick={handleAddCustomQuestionSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">{t('addBtn', appLanguage)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSectionHeaderOpen} onOpenChange={setIsSectionHeaderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addSectionHeader', appLanguage)}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('sectionNameLabel', appLanguage)}</label>
              <Input value={sectionHeaderText} onChange={e => setSectionHeaderText(e.target.value)} placeholder={t('sectionNamePlaceholder', appLanguage)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">{t('quickSelect', appLanguage)}</label>
              <div className="flex flex-wrap gap-2">
                {[t('mcqPreset', appLanguage), t('creativePreset', appLanguage), t('sectionA', appLanguage), t('sectionB', appLanguage), t('answerAnyFive', appLanguage), t('allQuestionsEqual', appLanguage)].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setSectionHeaderText(preset)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionHeaderOpen(false)}>{t('cancelBtn', appLanguage)}</Button>
            <Button onClick={handleAddSectionHeaderSubmit} className="bg-green-600 hover:bg-green-700 text-white">{t('addBtn', appLanguage)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Bank Modal */}
      

    </div>
  );
}
