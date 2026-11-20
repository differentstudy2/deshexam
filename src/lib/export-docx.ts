import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, SectionType } from 'docx';
import { saveAs } from 'file-saver';
import { QuestionBankEntry } from './question-bank-types';
import { localizeNumber } from './i18n';

interface ExportSettings {
  headerTitle: string;
  headerAddress: string;
  headerClassName: string;
  headerSubjectName: string;
  headerTime: string;
  headerMarks: string;
  activeSetCode: string;
  paperColumns: number;
  optionColumns: number;
  optionLabelType: string;
  showInstructions?: boolean;
}

const stripHtml = (html: string) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const getOptionLabel = (index: number, optionLabelType: string) => {
  const bnLabels = ['ক', 'খ', 'গ', 'ঘ'];
  const enLabels = ['A', 'B', 'C', 'D'];
  const romanLabels = ['i', 'ii', 'iii', 'iv'];
  const numLabels = ['1', '2', '3', '4'];
  
  if (optionLabelType === 'bangla') return bnLabels[index];
  if (optionLabelType === 'english') return enLabels[index];
  if (optionLabelType === 'roman') return romanLabels[index];
  if (optionLabelType === 'number') return numLabels[index];
  return bnLabels[index];
};

export const generateQuestionPaperDocx = async (questions: QuestionBankEntry[], settings: ExportSettings, paperName: string) => {
  const headerChildren = [];
  const questionChildren = [];

  // 1. Header Section
  if (settings.headerTitle) {
    headerChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: settings.headerTitle, bold: true, size: 36 })],
      spacing: { after: 120 }
    }));
  }
  
  if (settings.headerAddress) {
    headerChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: settings.headerAddress, size: 24 })],
      spacing: { after: 120 }
    }));
  }

  if (settings.headerClassName) {
    headerChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: settings.headerClassName, bold: true, size: 28 })],
      spacing: { after: 120 }
    }));
  }

  if (settings.headerSubjectName) {
    headerChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: settings.headerSubjectName, bold: true, size: 28 })],
      spacing: { after: 240 }
    }));
  }

  // Time, Marks, and Set Code Row using a Table
  const metaRowCells = [];
  if (settings.headerTime) {
    metaRowCells.push(new TableCell({
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [new Paragraph({ text: `সময়: ${settings.headerTime}`, alignment: AlignmentType.LEFT })],
    }));
  }
  if (settings.activeSetCode) {
    metaRowCells.push(new TableCell({
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [new Paragraph({ text: `সেট: ${settings.activeSetCode}`, alignment: AlignmentType.CENTER })],
    }));
  }
  if (settings.headerMarks) {
    metaRowCells.push(new TableCell({
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [new Paragraph({ text: `পূর্ণমান: ${settings.headerMarks}`, alignment: AlignmentType.RIGHT })],
    }));
  }

  if (metaRowCells.length > 0) {
    headerChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [new TableRow({ children: metaRowCells })],
    }));
    headerChildren.push(new Paragraph({ spacing: { before: 240 } })); // Space after table
  }

  if (settings.showInstructions) {
    headerChildren.push(new Paragraph({
      children: [new TextRun({ text: '[বিশেষ দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসংবলিত বৃত্তসমূহ হতে সঠিক উত্তরের বৃত্তটি বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট কর। প্রতিটি প্রশ্নের মান ১।]', italics: true, size: 20 })],
      spacing: { after: 240 }
    }));
  }

  // 2. Questions
  let questionNumber = 1;

  questions.forEach((q) => {
    if (q.questionText?.includes('[[SECTION_HEADER')) {
      const match = q.questionText.match(/\[\[SECTION_HEADER\|cols:(\d+)\]\](.*)/);
      const text = match ? match[2] : q.questionText.replace(/\[\[.*?\]\]/, '');
      questionChildren.push(new Paragraph({
        children: [new TextRun({ text: stripHtml(text), bold: true, size: 24 })],
        spacing: { before: 240, after: 120 }
      }));
      return;
    }

    const qText = stripHtml(q.questionText || '');
    const num = localizeNumber(questionNumber, 'bn');
    
    questionChildren.push(new Paragraph({
      children: [
        new TextRun({ text: `${num}. `, bold: true }),
        new TextRun({ text: qText })
      ],
      spacing: { before: 120, after: 60 }
    }));

    // Options
    if (q.options) {
      const optA = stripHtml(q.options.a || '');
      const optB = stripHtml(q.options.b || '');
      const optC = stripHtml(q.options.c || '');
      const optD = stripHtml(q.options.d || '');

      const opts = [
        { label: getOptionLabel(0, settings.optionLabelType), text: optA },
        { label: getOptionLabel(1, settings.optionLabelType), text: optB },
        { label: getOptionLabel(2, settings.optionLabelType), text: optC },
        { label: getOptionLabel(3, settings.optionLabelType), text: optD },
      ].filter(o => o.text);

      if (opts.length > 0) {
        if (settings.optionColumns === 1) {
          opts.forEach(opt => {
            questionChildren.push(new Paragraph({
              children: [new TextRun({ text: `(${opt.label}) ${opt.text}` })],
              spacing: { before: 0, after: 60 }
            }));
          });
        } else if (settings.optionColumns === 2) {
          const rows = [];
          for (let i = 0; i < opts.length; i += 2) {
            const cells = [];
            cells.push(new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({ text: `(${opts[i].label}) ${opts[i].text}` })],
              width: { size: 50, type: WidthType.PERCENTAGE }
            }));
            if (opts[i + 1]) {
              cells.push(new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({ text: `(${opts[i + 1].label}) ${opts[i + 1].text}` })],
                width: { size: 50, type: WidthType.PERCENTAGE }
              }));
            } else {
              cells.push(new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({ text: '' })],
                width: { size: 50, type: WidthType.PERCENTAGE }
              }));
            }
            rows.push(new TableRow({ children: cells }));
          }
          questionChildren.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
            },
            rows: rows,
          }));
        } else {
          // 4 columns
          const cells = opts.map(opt => new TableCell({
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [new Paragraph({ text: `(${opt.label}) ${opt.text}` })],
            width: { size: 25, type: WidthType.PERCENTAGE }
          }));
          while (cells.length < 4) {
             cells.push(new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({ text: '' })],
                width: { size: 25, type: WidthType.PERCENTAGE }
              }));
          }
          questionChildren.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
            },
            rows: [new TableRow({ children: cells })],
          }));
        }
      }
    }
    questionNumber++;
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Nirmala UI", // Built-in Windows font for Bengali
            size: 24, // 12pt
          },
        },
      },
    },
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
        },
        children: headerChildren,
      },
      {
        properties: {
          type: SectionType.CONTINUOUS,
          column: {
            space: 720,
            count: settings.paperColumns || 1,
          },
        },
        children: questionChildren,
      }
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${paperName || 'Question_Paper'}.docx`);
};
