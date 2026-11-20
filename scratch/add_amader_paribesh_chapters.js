const fs = require('fs');
const path = require('path');

const chaptersFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/chapters.json');
const indexFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/index.ts');

const textbookId = 'textbook-amader-paribesh';

const ancestors = [
  { "id": "board-wb", "slug": "wb-board", "title": "West Bengal Board Secondary Education", "type": "board" },
  { "id": "class-5-wb", "slug": "class-5", "title": "Class 5", "type": "class" },
  { "id": "subject-evs-class-5-wb", "slug": "environmental-science", "title": "Environmental Science", "type": "subject" },
  { "id": "textbook-amader-paribesh", "slug": "amader-paribesh", "title": "Amader Paribesh", "type": "textbook" }
];

const chapterTitles = [
  "মানবদেহ",
  "ভৌত পরিবেশ (মাটি, জল, জীববৈচিত্র্য)",
  "পশ্চিমবঙ্গের সাধারণ পরিচিতি",
  "পরিবেশ ও সম্পদ",
  "পরিবেশ ও উৎপাদন (কৃষি ও মৎস্য উৎপাদন)",
  "পরিবেশ ও বনভূমি",
  "পরিবেশ, খনিজ ও শক্তি সম্পদ",
  "পরিবেশ ও পরিবহণ",
  "জনবসতি ও পরিবেশ",
  "পরিবেশ ও আকাশ",
  "মানবাধিকার ও মূল্যবোধ",
  "আমার পাতা",
  "পাঠ্যসূচি ও নমুনা প্রশ্ন",
  "শিখন পরামর্শ"
];

const enSlugs = [
  "manabdeha",
  "bhouto-paribesh",
  "poschimbonger-sadharon-porichiti",
  "paribesh-o-sompod",
  "paribesh-o-utpadon",
  "paribesh-o-bonobhumi",
  "paribesh-khonij-o-shokti-sompod",
  "paribesh-o-poribohon",
  "jonoboshoti-o-paribesh",
  "paribesh-o-akash",
  "manobadhikar-o-mulyobodh",
  "amar-pata",
  "pathyosuchi-o-nomuna-proshno",
  "shikhon-poramorsho"
];

let existingChapters = [];
if (fs.existsSync(chaptersFile)) {
  try {
    existingChapters = JSON.parse(fs.readFileSync(chaptersFile, 'utf8'));
  } catch (e) {}
}

const newChapters = chapterTitles.map((title, i) => {
  const slug = enSlugs[i];
  return {
    id: `chapter-${slug}-amader-paribesh`,
    title: title,
    slug: slug,
    type: "chapter",
    track: "academic",
    parentId: textbookId,
    orderIndex: i + 1,
    status: "published",
    fullSlug: `wb-board/class-5/environmental-science/amader-paribesh/${slug}`,
    boardSlug: "wb-board",
    classSlug: "class-5",
    subjectSlug: "environmental-science",
    textbookSlug: "amader-paribesh",
    chapterSlug: slug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: ancestors
  };
});

existingChapters.push(...newChapters);
fs.writeFileSync(chaptersFile, JSON.stringify(existingChapters, null, 2));

// update index.ts
let indexTs = fs.readFileSync(indexFile, 'utf8');
indexTs = indexTs.replace(/\/\/ import chapters from '.\/chapters.json';/, "import chapters from './chapters.json';");
indexTs = indexTs.replace(/\/\/ \.\.\.\(chapters as TaxonomyNode\[\]\),/, "...(chapters as TaxonomyNode[]),");
fs.writeFileSync(indexFile, indexTs);

console.log("Chapters added successfully!");
