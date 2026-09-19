const fs = require('fs');
const path = require('path');

// ==========================================
// ১. এখানে আপনার প্রশ্নের বিস্তারিত তথ্য দিন
// ==========================================

const NEW_QUESTION = {
  // এটি কোন টপিকের প্রশ্ন? (Taxonomy IDs)
  boardId: "board-wb",
  classId: "class-5-wb",
  subjectId: "subject-evs-class-5-wb",
  textbookId: "textbook-amader-paribesh",
  chapterId: "chapter-manabdeha-amader-paribesh",
  topicId: "topic-shorirer-bormo-manabdeha",
  
  // প্রশ্নের ধরন (Question Type)
  // 'mcq' (Multiple Choice), 'descriptive' বা 'CQ' (Creative Question/Written), 
  // 'T/F' (True/False), 'FIB' (Fill in the blanks), 'Match' (Matching)
  questionType: "mcq",
  
  // প্রশ্নটি এখানে লিখুন
  questionText: "আমাদের শরীরের বর্ম কাকে বলা হয়?",
  
  // যদি MCQ হয়, তাহলে অপশনগুলো দিন
  options: {
    a: "চুল",
    b: "ত্বক বা চামড়া",
    c: "নখ",
    d: "হাড়"
  },
  
  // অপশনগুলোর ব্যাখ্যা (প্রতিটি অপশনের জন্য আলাদা ব্যাখ্যা দেওয়া যাবে)
  optionExplanations: {
    a: "চুল ত্বককে রক্ষা করে না, বরং ত্বকের উপরে থাকে।",
    b: "সঠিক উত্তর! চামড়াকে আমাদের শরীরের বর্ম বলা হয়।",
    c: "নখ আঙুলের ডগাকে রক্ষা করে, পুরো শরীরকে নয়।",
    d: "হাড় শরীরের কাঠামো তৈরি করে, কিন্তু বাইরের বর্ম নয়।"
  },
  
  // সঠিক উত্তরের অপশন ID (a/b/c/d)
  correctAnswer: "b",
  
  // উত্তরের ব্যাখ্যা (ঐচ্ছিক)
  explanation: "ত্বক বা চামড়া আমাদের শরীরের বর্ম হিসেবে কাজ করে, যা শরীরকে বাইরের আঘাত থেকে রক্ষা করে।",
  
  // অন্যান্য ডিটেইলস
  marks: 1,
  difficulty: "easy",
  status: "published",
  tags: ["মানবেদহ", "বর্ম"],
  createdAt: new Date().toISOString()
};

// ==========================================
// নিচের অংশে কিছু পরিবর্তন করার দরকার নেই
// ==========================================

// প্রশ্ন থেকে অটোমেটিক আইডি এবং স্লাগ তৈরি করা হচ্ছে
function generateSlug(text) {
  let cleanText = text.replace(/(<([^>]+)>)/gi, ""); // Remove HTML tags
  cleanText = cleanText.replace(/[?।.,!]/g, ''); // Remove punctuations
  cleanText = cleanText.trim().replace(/\s+/g, '-'); // Replace spaces with hyphens
  return cleanText.substring(0, 50);
}

const baseSlug = generateSlug(NEW_QUESTION.questionText);
const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp

const finalQuestion = {
  id: `q-${baseSlug}-${timestamp}`,
  slug: `${baseSlug}-${timestamp}`,
  createdAt: new Date().toISOString(),
  ...NEW_QUESTION
};

const questionsFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/questions.json');
let questions = [];

if (fs.existsSync(questionsFile)) {
  questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
}

// চেক করা হচ্ছে আগে থেকে এই ID-র কোনো প্রশ্ন আছে কিনা
const index = questions.findIndex(q => q.id === finalQuestion.id);

if (index !== -1) {
  // থাকলে আপডেট করা হবে
  questions[index] = { ...questions[index], ...finalQuestion };
  console.log(`Updated existing question: ${finalQuestion.id}`);
} else {
  // না থাকলে নতুন অ্যাড করা হবে
  questions.push(finalQuestion);
  console.log(`Added new question: ${finalQuestion.id}`);
}

fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('Done!');
