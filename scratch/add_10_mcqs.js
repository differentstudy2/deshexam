const fs = require('fs');
const path = require('path');

const questionsFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/questions.json');
let questions = [];

if (fs.existsSync(questionsFile)) {
  questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
}

function generateSlug(text) {
  let cleanText = text.replace(/(<([^>]+)>)/gi, "");
  cleanText = cleanText.replace(/[?।.,!]/g, '');
  cleanText = cleanText.trim().replace(/\s+/g, '-');
  return cleanText.substring(0, 50);
}

const baseTaxonomy = {
  boardId: "board-wb",
  classId: "class-5-wb",
  subjectId: "subject-evs-class-5-wb",
  textbookId: "textbook-amader-paribesh",
  chapterId: "chapter-manabdeha-amader-paribesh",
  topicId: "topic-shorirer-bormo-manabdeha",
  questionType: "mcq",
  marks: 1,
  difficulty: "medium",
  status: "published",
  tags: ["মানবেদহ", "বর্ম"]
};

const newQuestions = [
  {
    questionText: "ত্বকের নিচে প্রধানত কী কী থাকে?",
    options: {
      a: "শুধুমাত্র হাড়",
      b: "রক্তনালী ও স্নায়ু",
      c: "শুধু রক্ত",
      d: "ফুসফুস"
    },
    optionExplanations: {
      a: "হাড় মাংসপেশির নিচে থাকে।",
      b: "সঠিক! ত্বকের নিচে শিরা, ধমনী (রক্তনালী) ও স্নায়ু ছড়িয়ে থাকে।",
      c: "শুধু রক্ত থাকে না, রক্তনালীর ভেতর দিয়ে রক্ত চলাচল করে।",
      d: "ফুসফুস বুকের খাঁচার ভেতর থাকে।"
    },
    correctAnswer: "b",
    explanation: "ত্বক বা চামড়া আমাদের শরীরের উপর একটি আস্তরণ তৈরি করে। এর ঠিক নিচেই অসংখ্য রক্তনালী ও স্নায়ু জালের মতো ছড়িয়ে থাকে।"
  },
  {
    questionText: "নিচের কোন প্রাণীর গা-ভর্তি শক্ত খোলস থাকে?",
    options: {
      a: "বাঘ",
      b: "শামুক ও কচ্ছপ",
      c: "হাতি",
      d: "সজারু"
    },
    optionExplanations: {
      a: "বাঘের গায়ে লোম থাকে।",
      b: "সঠিক উত্তর! শামুক এবং কচ্ছপের শরীরের বাইরের দিকে আত্মরক্ষার জন্য শক্ত খোলস থাকে।",
      c: "হাতির চামড়া মোটা হয় কিন্তু খোলস থাকে না।",
      d: "সজারুর গায়ে কাঁটা থাকে।"
    },
    correctAnswer: "b",
    explanation: "শামুক, ঝিনুক এবং কচ্ছপের মতো প্রাণীদের নরম শরীরকে রক্ষা করার জন্য তাদের পিঠে শক্ত খোলস বা আবরণ থাকে।"
  },
  {
    questionText: "সজারুর আত্মরক্ষার প্রধান উপায় কী?",
    options: {
      a: "শক্ত খোলস",
      b: "মোটা চামড়া",
      c: "কাঁটা",
      d: "বিষ"
    },
    optionExplanations: {
      a: "শক্ত খোলস কচ্ছপের থাকে।",
      b: "গন্ডারের চামড়া মোটা হয়।",
      c: "সঠিক! সজারুর গায়ের লোমগুলোই কাঁটার মতো হয়ে থাকে, যা তাকে শত্রুর হাত থেকে বাঁচায়।",
      d: "সজারুর বিষ নেই।"
    },
    correctAnswer: "c",
    explanation: "সজারুর শরীরের লোমগুলো রূপান্তরিত হয়ে শক্ত কাঁটায় পরিণত হয়েছে। বিপদ বুঝলে এরা এই কাঁটাগুলো খাড়া করে আত্মরক্ষা করে।"
  },
  {
    questionText: "আগেকার দিনে কোন প্রাণীর চামড়া দিয়ে যুদ্ধের ঢাল তৈরি হতো?",
    options: {
      a: "হাতি",
      b: "বাঘ",
      c: "কুমির",
      d: "গন্ডার"
    },
    optionExplanations: {
      a: "হাতির চামড়া দিয়ে ঢাল তৈরি হতো না।",
      b: "বাঘের চামড়া নরম হয়।",
      c: "কুমিরের চামড়া শক্ত হলেও তা দিয়ে ঢাল হতো না।",
      d: "সঠিক উত্তর! গন্ডারের চামড়া অত্যন্ত পুরু ও শক্ত হওয়ায় তা দিয়ে যুদ্ধের ঢাল বানানো হতো।"
    },
    correctAnswer: "d",
    explanation: "গন্ডারের চামড়া খুবই মোটা এবং শক্ত হয়। তাই প্রাচীনকালে সৈনিকরা আত্মরক্ষার জন্য গন্ডারের চামড়া দিয়ে ঢাল তৈরি করত।"
  },
  {
    questionText: "ঘামের মাধ্যমে আমাদের শরীর থেকে কী বেরিয়ে যায়?",
    options: {
      a: "প্রয়োজনীয় ভিটামিন",
      b: "দূষিত পদার্থ বা বর্জ্য",
      c: "রক্ত",
      d: "অক্সিজেন"
    },
    optionExplanations: {
      a: "ঘামের সাথে ভিটামিন বের হয় না।",
      b: "সঠিক! ঘামের মাধ্যমে শরীরের অতিরিক্ত জল এবং দূষিত পদার্থ (যেমন নুন ও বর্জ্য) বেরিয়ে যায়।",
      c: "রক্ত ঘামের মাধ্যমে বের হয় না।",
      d: "অক্সিজেন ফুসফুস দিয়ে গ্রহণ করা হয়।"
    },
    correctAnswer: "b",
    explanation: "আমাদের চামড়ায় ছোট ছোট ছিদ্র থাকে, যাদের ঘর্মগ্রন্থি বলে। এই ছিদ্র দিয়ে ঘামের মাধ্যমে শরীরের ভেতরের দূষিত বর্জ্য পদার্থ বাইরে বেরিয়ে গিয়ে শরীরকে সুস্থ রাখে।"
  },
  {
    questionText: "খুব বেশি ঘাম হলে শরীরে কীসের অভাব দেখা দিতে পারে?",
    options: {
      a: "জল ও নুনের",
      b: "প্রোটিনের",
      c: "ক্যালসিয়ামের",
      d: "চর্বির"
    },
    optionExplanations: {
      a: "সঠিক! ঘামের সাথে জল এবং নুন বেরিয়ে যায় বলে বেশি ঘামলে শরীরে এগুলোর ঘাটতি দেখা দেয়।",
      b: "ঘামের সাথে প্রোটিন বের হয় না।",
      c: "ক্যালসিয়াম মূলত হাড়ে থাকে।",
      d: "চর্বি ঘামের সাথে কমে না।"
    },
    correctAnswer: "a",
    explanation: "গরমকালে বা অনেক পরিশ্রম করলে আমাদের খুব ঘাম হয়। ঘামের সাথে প্রচুর পরিমাণে জল এবং খনিজ লবণ (নুন) শরীর থেকে বেরিয়ে যায়। তাই বেশি ঘামলে একটু নুন-চিনি মেশানো জল বা ওআরএস খাওয়া উচিত।"
  },
  {
    questionText: "রোদে থাকলে আমাদের ত্বকে কোন ভিটামিন তৈরি হয়?",
    options: {
      a: "ভিটামিন এ",
      b: "ভিটামিন বি",
      c: "ভিটামিন সি",
      d: "ভিটামিন ডি"
    },
    optionExplanations: {
      a: "ভিটামিন এ গাজর, পেঁপে ইত্যাদিতে থাকে।",
      b: "ভিটামিন বি বিভিন্ন শাকসবজিতে পাওয়া যায়।",
      c: "ভিটামিন সি টক জাতীয় ফলে থাকে।",
      d: "সঠিক উত্তর! সূর্যের আলো ত্বকে পড়লে আমাদের শরীরে ভিটামিন ডি সংশ্লেষিত হয়।"
    },
    correctAnswer: "d",
    explanation: "আমাদের ত্বক সূর্যের অতিবেগুনি রশ্মির সাহায্যে শরীরে ভিটামিন ডি তৈরি করতে পারে, যা আমাদের হাড় এবং দাঁত মজবুত করতে সাহায্য করে।"
  },
  {
    questionText: "নিচের কোন উক্তিটি চামড়া বা ত্বকের কাজ সম্পর্কে সঠিক নয়?",
    options: {
      a: "ত্বক শরীরকে বাইরের আঘাত থেকে বাঁচায়",
      b: "ত্বক জীবাণুর হাত থেকে শরীরকে রক্ষা করে",
      c: "ত্বক খাবার হজম করতে সাহায্য করে",
      d: "ত্বকের মাধ্যমে শরীর থেকে বর্জ্য বেরিয়ে যায়"
    },
    optionExplanations: {
      a: "এটি ত্বকের কাজ।",
      b: "এটিও ত্বকের কাজ।",
      c: "সঠিক! ত্বক খাবার হজম করতে সাহায্য করে না। এটি পাকস্থলী ও অন্ত্রের কাজ।",
      d: "এটি ত্বকের কাজ (ঘামের মাধ্যমে)।"
    },
    correctAnswer: "c",
    explanation: "খাবার হজম করা পরিপাকতন্ত্রের কাজ। চামড়া বা ত্বক শরীরের সুরক্ষাকবচ হিসেবে কাজ করে এবং বর্জ্য নিষ্কাশনে সাহায্য করে, কিন্তু পরিপাকে এর কোনো ভূমিকা নেই।"
  },
  {
    questionText: "আমাদের শরীরের সবচেয়ে বড় অঙ্গ কোনটি?",
    options: {
      a: "যকৃৎ (Liver)",
      b: "হৃৎপিণ্ড",
      c: "মস্তিষ্ক",
      d: "ত্বক বা চামড়া"
    },
    optionExplanations: {
      a: "যকৃৎ শরীরের ভেতরের সবচেয়ে বড় গ্রন্থি, কিন্তু সামগ্রিক অঙ্গ নয়।",
      b: "হৃৎপিণ্ড একটি পেশিবহুল অঙ্গ যা রক্ত পাম্প করে।",
      c: "মস্তিষ্ক স্নায়ুতন্ত্রের প্রধান অংশ।",
      d: "সঠিক উত্তর! ত্বক হলো মানবদেহের সবচেয়ে বড় অঙ্গ, যা পুরো শরীরকে ঢেকে রাখে।"
    },
    correctAnswer: "d",
    explanation: "মানবদেহের সবচেয়ে বড় অঙ্গ (Organ) হলো ত্বক। এটি মাথা থেকে পা পর্যন্ত পুরো শরীরকে বাইরের পরিবেশ থেকে একটি আবরণ দিয়ে ঢেকে রেখেছে।"
  },
  {
    questionText: "কোথাও কেটে গেলে বা ছড়ে গেলে প্রথমে কোন স্তরের ক্ষতি হয়?",
    options: {
      a: "মাংসপেশি",
      b: "হাড়",
      c: "ত্বক বা চামড়া",
      d: "স্নায়ু"
    },
    optionExplanations: {
      a: "মাংসপেশি ত্বকের নিচে থাকে।",
      b: "হাড় অনেক গভীরে থাকে।",
      c: "সঠিক! ত্বক সবার উপরে থাকায় প্রথমে এর ক্ষতি হয়।",
      d: "স্নায়ুও ত্বকের নিচে থাকে।"
    },
    correctAnswer: "c",
    explanation: "ত্বক শরীরের সবচেয়ে বাইরের স্তর। তাই কোথাও ধাক্কা লাগলে, কেটে গেলে বা পুড়ে গেলে সবার প্রথমে ত্বকই আঘাতপ্রাপ্ত হয়।"
  }
];

newQuestions.forEach((q, index) => {
  const baseSlug = generateSlug(q.questionText);
  const timestamp = (Date.now() + index).toString().slice(-6);
  const newQ = {
    ...baseTaxonomy,
    ...q,
    id: `q-${baseSlug}-${timestamp}`,
    slug: `${baseSlug}-${timestamp}`,
    createdAt: new Date().toISOString()
  };
  
  // check if already exists by questionText (avoid duplicates if run multiple times)
  const existingIndex = questions.findIndex(ex => ex.questionText === newQ.questionText);
  if (existingIndex === -1) {
    questions.push(newQ);
  }
});

fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2), 'utf8');
console.log(`Added ${newQuestions.length} new questions to ${questionsFile}`);
