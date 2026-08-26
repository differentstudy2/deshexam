const fs = require('fs');

const subject = {
  id: "subject-geography-class-6-wb",
  title: "Geography",
  slug: "geography",
  type: "subject",
  track: "academic",
  parentId: "class-6-wb",
  orderIndex: 11, // Order for Geography
  status: "published",
  fullSlug: "wb-board/class-6/geography",
  boardSlug: "wb-board",
  classSlug: "class-6",
  subjectSlug: "geography",
  isIndexable: true,
  isHardcoded: true,
  ancestors: [
    {
      "id": "board-wb",
      "slug": "wb-board",
      "title": "WBBSE",
      "type": "board"
    },
    {
      "id": "class-6-wb",
      "slug": "class-6",
      "title": "Class 6",
      "type": "class"
    }
  ]
};

const textbook = {
  "id": "textbook-amader-prithibi",
  "title": "Amader Prithibi",
  "slug": "amader-prithibi",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-geography-class-6-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-6/geography/amader-prithibi",
  "boardSlug": "wb-board",
  "classSlug": "class-6",
  "subjectSlug": "geography",
  "textbookSlug": "amader-prithibi",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    {
      "id": "board-wb",
      "slug": "wb-board",
      "title": "WBBSE",
      "type": "board"
    },
    {
      "id": "class-6-wb",
      "slug": "class-6",
      "title": "Class 6",
      "type": "class"
    },
    {
      "id": "subject-geography-class-6-wb",
      "slug": "geography",
      "title": "Geography",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "আকাশ ভরা সূর্য তারা", slug: "akash-vhora-surjo-tara" },
  { prefix: "অধ্যায় ২", title: "পৃথিবী কী গোল", slug: "prithibi-ki-gol" },
  { prefix: "অধ্যায় ৩", title: "তুমি কোথায় আছো", slug: "tumi-kothay-acho" },
  { prefix: "অধ্যায় ৪", title: "পৃথিবীর আবর্তন", slug: "prithibir-aborton" },
  { prefix: "অধ্যায় ৫", title: "জল-স্থল-বাতাস", slug: "jol-sthol-batash" },
  { prefix: "অধ্যায় ৬", title: "বরফে ঢাকা মহাদেশ", slug: "borofe-dhaka-mohadesh" },
  { prefix: "অধ্যায় ৭", title: "আবহাওয়া ও জলবায়ু", slug: "abohawa-o-jolobayu" },
  { prefix: "অধ্যায় ৮", title: "বায়ুদূষণ", slug: "bayudushon" },
  { prefix: "অধ্যায় ৯", title: "শব্দদূষণ", slug: "shobdodushon" },
  { prefix: "অধ্যায় ১০", title: "আমাদের দেশ ভারত", slug: "amader-desh-bharot" },
  { prefix: "অধ্যায় ১১", title: "মানচিত্র", slug: "manchitro" }
];

const chapters = chaptersData.map((data, index) => {
  const fullTitle = data.prefix ? `${data.prefix}: ${data.title}` : data.title;
  
  return {
    id: `chapter-${data.slug}-${textbook.slug}-class-6`,
    title: fullTitle,
    slug: data.slug,
    type: "chapter",
    track: textbook.track,
    parentId: textbook.id,
    orderIndex: index + 1,
    status: "published",
    fullSlug: `${textbook.fullSlug}/${data.slug}`,
    boardSlug: textbook.boardSlug,
    classSlug: textbook.classSlug,
    subjectSlug: textbook.subjectSlug,
    textbookSlug: textbook.slug,
    chapterSlug: data.slug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: [
      ...textbook.ancestors,
      {
        id: `chapter-${data.slug}-${textbook.slug}-class-6`,
        slug: data.slug,
        title: fullTitle,
        type: "chapter"
      }
    ]
  };
});

// Update Subjects
const subjectsPath = './src/data/hardcoded/taxonomy/subjects.json';
const existingSubjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));
if (!existingSubjects.find(s => s.id === subject.id)) {
  existingSubjects.push(subject);
  fs.writeFileSync(subjectsPath, JSON.stringify(existingSubjects, null, 2));
  console.log('Added Subject: Geography (Class 6)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Amader Prithibi (Class 6)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
