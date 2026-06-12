export type AppLanguage = 'bn' | 'en' | 'hi';

type Translations = {
  [key in AppLanguage]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  bn: {
    // Builder UI
    filterSettings: 'ফিল্টার সেটিংস',
    saveTemplate: 'টেমপ্লেট সেভ',
    pageSetup: 'পেইজ সেটআপ',
    loadTemplate: 'টেমপ্লেট লোড',
    printSavePdf: 'প্রিন্ট / সেভ PDF',
    print: 'প্রিন্ট',

    // Paper Header
    marks: 'প্রাপ্ত নম্বর',
    set: 'সেট',
    subjectCode: 'বিষয় কোড :',
    time: 'সময়—',
    minutes: 'মিনিট',
    totalMarks: 'পূর্ণমান—',
    studentName: 'পরীক্ষার্থীর নামঃ',
    roll: 'রোলঃ',
    instruction1: 'দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসম্বলিত বৃত্ত সমূহ হতে সঠিক উত্তরের বৃত্তটি ⬤ বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট করো। প্রতিটি প্রশ্নের মান ১।',
    instruction2: 'প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবেনা।',
    answerKeyHeading: 'উত্তর মালা:',
    
    // Paper Footer & Transitions
    answersBelow: 'নিচে উত্তরপত্র',
    courtesy: 'সৌজন্যে:',
    
    // OMR Header
    omrTitle: 'OMR ANSWER SHEET',
    omrStudentName: 'STUDENT NAME',
    omrRollNo: 'ROLL NO',
    omrClass: 'CLASS',
    omrSubject: 'SUBJECT',
    omrExamDate: 'EXAM DATE',
    omrSetCode: 'SET CODE',
    omrInvgSign: 'INVG. SIGN',
    
    // OMR Instructions
    omrInstructionsTitle: 'INSTRUCTIONS FOR FILLING THE SHEET',
    omrCorrect: 'CORRECT:',
    omrWrong: 'WRONG:',
    omrPen: 'Use only Black/Blue Ball Point Pen',
    
    // Table Headers
    tableQuestion: 'প্রশ্ন',
    tableAnswer: 'উত্তর',
    
    // Watermark Default
    defaultWatermark: 'দেশ এক্সাম একাডেমী',
    defaultHeaderTitle: 'দেশ এক্সাম একাডেমী',
    defaultHeaderAddress: 'দ্বারিকামারী, পেটলা, দিনহাটা, কোচবিহার, পশ্চিমবঙ্গ, ৭৩৬১৩৫',
    defaultHeaderClass: 'অষ্টম শ্রেণি (মাধ্যমিক) - ২০২৬',
    defaultHeaderSubject: 'বিষয়: শারীরিক শিক্ষা ও স্বাস্থ্য',
    defaultHeaderChapter: 'অধ্যায়ের নাম'
  },
  en: {
    // Builder UI
    filterSettings: 'Filter Settings',
    saveTemplate: 'Save Template',
    pageSetup: 'Page Setup',
    loadTemplate: 'Load Template',
    printSavePdf: 'Print / Save PDF',
    print: 'Print',

    // Paper Header
    marks: 'Marks',
    set: 'Set',
    subjectCode: 'Sub. Code :',
    time: 'Time—',
    minutes: 'Mins',
    totalMarks: 'Total Marks—',
    studentName: 'Student Name:',
    roll: 'Roll:',
    instruction1: 'Note: Fully darken the circle ⬤ corresponding to the correct answer with a ballpoint pen on the provided OMR sheet. Each question carries 1 mark.',
    instruction2: 'Do not make any marks on the question paper.',
    answerKeyHeading: 'Answer Key:',
    
    // Paper Footer & Transitions
    answersBelow: 'Answers Below',
    courtesy: 'Courtesy:',
    
    // OMR Header
    omrTitle: 'OMR ANSWER SHEET',
    omrStudentName: 'STUDENT NAME',
    omrRollNo: 'ROLL NO',
    omrClass: 'CLASS',
    omrSubject: 'SUBJECT',
    omrExamDate: 'EXAM DATE',
    omrSetCode: 'SET CODE',
    omrInvgSign: 'INVG. SIGN',
    
    // OMR Instructions
    omrInstructionsTitle: 'INSTRUCTIONS FOR FILLING THE SHEET',
    omrCorrect: 'CORRECT:',
    omrWrong: 'WRONG:',
    omrPen: 'Use only Black/Blue Ball Point Pen',
    
    // Table Headers
    tableQuestion: 'Q.',
    tableAnswer: 'Ans',
    
    // Watermark Default
    defaultWatermark: 'DeshExam Academy',
    defaultHeaderTitle: 'DeshExam Academy',
    defaultHeaderAddress: 'Dwarikamari, Petla, Dinhata, Cooch Behar, WB, 736135',
    defaultHeaderClass: 'Class 8 (Secondary) - 2026',
    defaultHeaderSubject: 'Subject: Physical Education & Health',
    defaultHeaderChapter: 'Chapter Name'
  },
  hi: {
    // Builder UI
    filterSettings: 'फ़िल्टर सेटिंग्स',
    saveTemplate: 'टेम्पलेट सेव',
    pageSetup: 'पेज सेटअप',
    loadTemplate: 'टेम्पलेट लोड',
    printSavePdf: 'प्रिंट / सेव PDF',
    print: 'प्रिंट',

    // Paper Header
    marks: 'प्राप्तांक',
    set: 'सेट',
    subjectCode: 'विषय कोड :',
    time: 'समय—',
    minutes: 'मिनट',
    totalMarks: 'पूर्णांक—',
    studentName: 'छात्र का नाम:',
    roll: 'रोल:',
    instruction1: 'नोट: दिए गए OMR शीट पर सही उत्तर वाले गोले ⬤ को बॉलपॉइंट पेन से पूरी तरह भरें। प्रत्येक प्रश्न 1 अंक का है।',
    instruction2: 'प्रश्न पत्र पर कोई निशान न लगाएं।',
    answerKeyHeading: 'उत्तर कुंजी:',
    
    // Paper Footer & Transitions
    answersBelow: 'उत्तर नीचे हैं',
    courtesy: 'सौजन्य:',
    
    // OMR Header
    omrTitle: 'OMR ANSWER SHEET',
    omrStudentName: 'STUDENT NAME',
    omrRollNo: 'ROLL NO',
    omrClass: 'CLASS',
    omrSubject: 'SUBJECT',
    omrExamDate: 'EXAM DATE',
    omrSetCode: 'SET CODE',
    omrInvgSign: 'INVG. SIGN',
    
    // OMR Instructions
    omrInstructionsTitle: 'INSTRUCTIONS FOR FILLING THE SHEET',
    omrCorrect: 'CORRECT:',
    omrWrong: 'WRONG:',
    omrPen: 'Use only Black/Blue Ball Point Pen',
    
    // Table Headers
    tableQuestion: 'प्रश्न',
    tableAnswer: 'उत्तर',
    
    // Watermark Default
    defaultWatermark: 'देश एग्जाम अकादमी',
    defaultHeaderTitle: 'देश एग्जाम अकादमी',
    defaultHeaderAddress: 'द्वारिकामारी, पेटला, दिनहाटा, कूचबिहार, पश्चिम बंगाल, 736135',
    defaultHeaderClass: 'कक्षा 8 (माध्यमिक) - 2026',
    defaultHeaderSubject: 'विषय: शारीरिक शिक्षा और स्वास्थ्य',
    defaultHeaderChapter: 'अध्याय का नाम'
  }
};

export function t(key: string, lang: AppLanguage = 'bn'): string {
  return translations[lang][key] || translations['bn'][key] || key;
}

export function localizeNumber(num: number, lang: AppLanguage = 'bn'): string {
  if (lang === 'bn') {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
  }
  if (lang === 'hi') {
    const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(d => hindiDigits[parseInt(d)] || d).join('');
  }
  return num.toString();
}

export function localizeOptionLabel(idx: number, type: string, lang: AppLanguage = 'bn'): string {
  if (type === 'english') return ['a', 'b', 'c', 'd'][idx] || '';
  if (type === 'roman') return ['i', 'ii', 'iii', 'iv'][idx] || '';
  if (type === 'number') {
    if (lang === 'bn') return ['১', '২', '৩', '৪'][idx] || '';
    if (lang === 'hi') return ['१', '२', '३', '४'][idx] || '';
    return ['1', '2', '3', '4'][idx] || '';
  }
  
  // Default 'bangla' or fallback
  if (lang === 'en') return ['A', 'B', 'C', 'D'][idx] || '';
  if (lang === 'hi') return ['क', 'ख', 'ग', 'घ'][idx] || '';
  return ['ক', 'খ', 'গ', 'ঘ'][idx] || '';
}
