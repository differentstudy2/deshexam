const fs = require('fs');
const path = require('path');

const NEW_QUESTIONS = [
  // -------------------------
  // T/F (True/False) - 5 Questions
  // -------------------------
  {
    questionType: "T/F",
    questionText: "চামড়ার আরেক নাম ত্বক।",
    correctAnswer: "True",
    explanation: "ত্বক এবং চামড়া একই অঙ্গের দুটি ভিন্ন নাম।"
  },
  {
    questionType: "T/F",
    questionText: "হাড় আমাদের শরীরকে বাইরের আঘাত থেকে রক্ষা করে।",
    correctAnswer: "False",
    explanation: "ত্বক বা চামড়া বাইরের আঘাত থেকে রক্ষা করে, হাড় নয়।"
  },
  {
    questionType: "T/F",
    questionText: "ত্বকের নিচে শিরা ও ধমনী জালের মতো ছড়িয়ে থাকে।",
    correctAnswer: "True",
    explanation: "ত্বকের ঠিক নিচেই অসংখ্য রক্তনালী (শিরা ও ধমনী) এবং স্নায়ু থাকে।"
  },
  {
    questionType: "T/F",
    questionText: "কচ্ছপের শরীরের বাইরে কোনো শক্ত খোলস থাকে না।",
    correctAnswer: "False",
    explanation: "কচ্ছপ এবং শামুকের শরীরের বাইরে আত্মরক্ষার জন্য শক্ত খোলস থাকে।"
  },
  {
    questionType: "T/F",
    questionText: "চামড়া শরীরের মাংসপেশিগুলোকে ঢেকে রাখে।",
    correctAnswer: "True",
    explanation: "চামড়া হলো শরীরের বর্ম, যা ভিতরের মাংসপেশি ও অন্যান্য অঙ্গকে ঢেকে রাখে।"
  },

  // -------------------------
  // FIB (Fill in the blanks) - 5 Questions
  // -------------------------
  {
    questionType: "FIB",
    questionText: "আমাদের শরীরের বর্ম হলো _________।",
    correctAnswer: "চামড়া"
  },
  {
    questionType: "FIB",
    questionText: "চামড়ার নিচে জালের মতো ছড়িয়ে থাকে অসংখ্য _________।",
    correctAnswer: "রক্তনালী"
  },
  {
    questionType: "FIB",
    questionText: "শামুক ও কচ্ছপের শরীরের বাইরের দিকে শক্ত _________ থাকে।",
    correctAnswer: "খোলস"
  },
  {
    questionType: "FIB",
    questionText: "আগেকার দিনে যুদ্ধে আত্মরক্ষার জন্য মানুষ _________ ব্যবহার করত।",
    correctAnswer: "বর্ম"
  },
  {
    questionType: "FIB",
    questionText: "ত্বকের নিচে থাকে _________ ও স্নায়ু।",
    correctAnswer: "শিরা"
  },

  // -------------------------
  // Match (Matching) - 5 Questions (represented as single matching tasks, but we can do one big match or multiple small ones. Let's do 5 separate matching questions)
  // -------------------------
  {
    questionType: "Match",
    questionText: "নিচের অংশগুলোর সাথে সঠিক কাজ বা প্রাণীর মিল করো:",
    matchingPairs: [
      { left: "শরীরের বর্ম", right: "চামড়া" },
      { left: "শক্ত খোলস", right: "কচ্ছপ" },
      { left: "রক্তনালী", right: "ত্বকের নিচে থাকে" }
    ],
    correctAnswer: "1-চামড়া, 2-কচ্ছপ, 3-ত্বকের নিচে থাকে"
  },
  {
    questionType: "Match",
    questionText: "শব্দগুলোর সাথে সঠিক অর্থ মেলাও:",
    matchingPairs: [
      { left: "বর্ম", right: "যুদ্ধে আত্মরক্ষার পোশাক" },
      { left: "ত্বক", right: "চামড়া" },
      { left: "স্নায়ু", right: "শরীরের বার্তা বাহক" }
    ],
    correctAnswer: "1-যুদ্ধে আত্মরক্ষার পোশাক, 2-চামড়া, 3-শরীরের বার্তা বাহক"
  },
  {
    questionType: "Match",
    questionText: "প্রাণী ও তাদের আত্মরক্ষার উপায়ের মিল করো:",
    matchingPairs: [
      { left: "শামুক", right: "শক্ত খোলস" },
      { left: "বাঘ", right: "নখ ও দাঁত" },
      { left: "মানুষ", right: "চামড়া বা ত্বক" }
    ],
    correctAnswer: "1-শক্ত খোলস, 2-নখ ও দাঁত, 3-চামড়া বা ত্বক"
  },
  {
    questionType: "Match",
    questionText: "শরীরের অংশ ও অবস্থানের মিল করো:",
    matchingPairs: [
      { left: "চামড়া", right: "শরীরের সবচেয়ে বাইরে" },
      { left: "মাংসপেশি", right: "চামড়ার নিচে" },
      { left: "হাড়", right: "মাংসপেশির নিচে" }
    ],
    correctAnswer: "1-শরীরের সবচেয়ে বাইরে, 2-চামড়ার নিচে, 3-মাংসপেশির নিচে"
  },
  {
    questionType: "Match",
    questionText: "বৈশিষ্ট্য ও অজের মিল করো:",
    matchingPairs: [
      { left: "কাটা বা আঘাত থেকে বাঁচায়", right: "ত্বক বা বর্ম" },
      { left: "রক্ত চলাচলে সাহায্য করে", right: "ধমনী ও শিরা" },
      { left: "অনুভূতি জাগায়", right: "স্নায়ু" }
    ],
    correctAnswer: "1-ত্বক বা বর্ম, 2-ধমনী ও শিরা, 3-স্নায়ু"
  },

  // -------------------------
  // CQ (Creative / Descriptive) - 5 Questions
  // -------------------------
  {
    questionType: "CQ",
    questionText: "চামড়াকে শরীরের বর্ম বলা হয় কেন?",
    detailedExplanation: "যুদ্ধে আত্মরক্ষার জন্য মানুষ যেমন বর্ম পরে, তেমনি চামড়াও আমাদের শরীরকে বাইরের আঘাত, রোদের তাপ, ধুলোবালি এবং রোগজীবাণুর আক্রমণ থেকে রক্ষা করে। চামড়া শরীরের ভিতরের মাংসপেশি, রক্তনালী এবং অন্যান্য অঙ্গকে ঢেকে রাখে। এ কারণেই চামড়াকে শরীরের বর্ম বলা হয়।"
  },
  {
    questionType: "CQ",
    questionText: "ত্বকের নিচে কী কী থাকে তা আলোচনা করো।",
    detailedExplanation: "আমাদের ত্বকের ঠিক নিচেই জালের মতো ছড়িয়ে থাকে অসংখ্য রক্তনালী (শিরা ও ধমনী) এবং স্নায়ু। এগুলো ছাড়াও ত্বকের নিচে মাংসপেশি এবং তার নিচে হাড় থাকে। রক্তনালীর মাধ্যমে সারা শরীরে রক্ত চলাচল করে এবং স্নায়ুর সাহায্যে আমরা ব্যথা বা স্পর্শের অনুভূতি বুঝতে পারি।"
  },
  {
    questionType: "CQ",
    questionText: "শামুক ও কচ্ছপের শরীরের বাইরের আবরণ কেমন হয় এবং কেন?",
    detailedExplanation: "শামুক ও কচ্ছপের শরীরের বাইরের দিকে একটি শক্ত আবরণ বা খোলস থাকে। এরা খুব ধীরগতির প্রাণী হওয়ায় শত্রুর আক্রমণ থেকে দ্রুত পালিয়ে বাঁচতে পারে না। তাই আত্মরক্ষার জন্য প্রকৃতি এদের শরীরে এই শক্ত খোলস দিয়েছে, যার ভেতরে বিপদের সময় এরা গুটিয়ে লুকিয়ে পড়তে পারে।"
  },
  {
    questionType: "CQ",
    questionText: "আগেকার দিনে মানুষ কেন গন্ডারের চামড়া দিয়ে বর্ম তৈরি করত?",
    detailedExplanation: "গন্ডারের চামড়া অত্যন্ত পুরু ও শক্ত হয়। আগেকার দিনে মানুষ যখন যুদ্ধ করত, তখন তলোয়ার বা বল্লমের আঘাত থেকে শরীরকে বাঁচাতে এমন কিছুর প্রয়োজন ছিল যা সহজে কাটা যায় না। গন্ডারের শক্ত চামড়া সহজেই অস্ত্র ঠেকাতে পারত, তাই এটি দিয়ে বর্ম বা ঢাল তৈরি করা হতো।"
  },
  {
    questionType: "CQ",
    questionText: "আমাদের শরীরের চামড়া না থাকলে কী কী অসুবিধা হতো?",
    detailedExplanation: "শরীরে চামড়া না থাকলে ভিতরের মাংসপেশি, শিরা, ধমনী সবকিছু বাইরের পরিবেশে উন্মুক্ত থাকত। ফলে সামান্য আঘাতেই আমাদের অনেক ক্ষতি হতো। ধুলোবালি ও রোগজীবাণু সহজেই শরীরে প্রবেশ করে মারাত্মক ইনফেকশন তৈরি করত। এছাড়া রোদ ও তাপে শরীরের ভেতরের অঙ্গগুলোর ক্ষতি হতো।"
  }
];

function generateSlug(text) {
  let cleanText = text.replace(/(<([^>]+)>)/gi, "");
  // keep bengali letters, numbers and english letters
  cleanText = cleanText.replace(/[^\u0980-\u09FFa-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return cleanText.substring(0, 50) || "q";
}

const baseProps = {
  boardId: "board-wb",
  classId: "class-5-wb",
  subjectId: "subject-evs-class-5-wb",
  textbookId: "textbook-amader-paribesh",
  chapterId: "chapter-manabdeha-amader-paribesh",
  topicId: "topic-shorirer-bormo-manabdeha",
  status: "published",
  difficulty: "medium",
  marks: 1,
  tags: ["মানবেদহ", "বর্ম"]
};

const questionsFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/questions.json');
let questions = [];

if (fs.existsSync(questionsFile)) {
  questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
}

let addedCount = 0;

NEW_QUESTIONS.forEach((q, i) => {
  const timestamp = Date.now().toString() + i;
  const slugText = generateSlug(q.questionText);
  
  if (q.questionType === "CQ") q.marks = 5; // Usually CQs have more marks
  if (q.questionType === "Match") q.marks = 3; 

  const newQ = {
    id: `q-${slugText}-${timestamp}`,
    slug: `${slugText}-${timestamp}`,
    createdAt: new Date().toISOString(),
    ...baseProps,
    ...q
  };
  
  questions.push(newQ);
  addedCount++;
});

// Reorder keys
const reorderedQuestions = questions.map(q => {
  const { id, slug, createdAt, boardId, classId, subjectId, textbookId, chapterId, topicId, questionType, questionText, ...rest } = q;
  const newQ = {};
  if (id) newQ.id = id;
  if (slug) newQ.slug = slug;
  if (createdAt) newQ.createdAt = createdAt;
  if (boardId) newQ.boardId = boardId;
  if (classId) newQ.classId = classId;
  if (subjectId) newQ.subjectId = subjectId;
  if (textbookId) newQ.textbookId = textbookId;
  if (chapterId) newQ.chapterId = chapterId;
  if (topicId) newQ.topicId = topicId;
  if (questionType) newQ.questionType = questionType;
  if (questionText) newQ.questionText = questionText;
  
  return { ...newQ, ...rest };
});

fs.writeFileSync(questionsFile, JSON.stringify(reorderedQuestions, null, 2), 'utf8');
console.log(`Added ${addedCount} new questions of various types.`);
