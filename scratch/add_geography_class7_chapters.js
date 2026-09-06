const fs = require('fs');

const textbook = {
  "id": "textbook-amader-prithibi-class-7-wb",
  "title": "Amader Prithibi",
  "slug": "amader-prithibi",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-geography-class-7-wb",
  "orderIndex": 13,
  "status": "published",
  "fullSlug": "wb-board/class-7/geography/amader-prithibi",
  "boardSlug": "wb-board",
  "classSlug": "class-7",
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
      "id": "class-7-wb",
      "slug": "class-7",
      "title": "Class 7",
      "type": "class"
    },
    {
      "id": "subject-geography-class-7-wb",
      "slug": "geography",
      "title": "Geography",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "পৃথিবীর পরিক্রমণ", slug: "prithibir-porikromon" },
  { prefix: "অধ্যায় ২", title: "ভূপৃষ্ঠে কোনো স্থানের অবস্থান নির্ণয়", slug: "vuprishthe-kono-sthaner-obosthan-nirnoy" },
  { prefix: "অধ্যায় ৩", title: "বায়ুচাপ", slug: "bayuchap" },
  { prefix: "অধ্যায় ৪", title: "ভূমিরূপ", slug: "vumirop" },
  { prefix: "অধ্যায় ৫", title: "নদী", slug: "nodi" },
  { prefix: "অধ্যায় ৬", title: "শিলা ও মাটি", slug: "shila-o-mati" },
  { prefix: "অধ্যায় ৭", title: "জলদূষণ", slug: "joldushon" },
  { prefix: "অধ্যায় ۸", title: "মাটি দূষণ", slug: "mati-dushon" },
  { prefix: "অধ্যায় ৯", title: "এশিয়া মহাদেশ", slug: "eshia-mohadesh" },
  { prefix: "অধ্যায় ১০", title: "আফ্রিকা মহাদেশ", slug: "aphrika-mohadesh" },
  { prefix: "অধ্যায় ১১", title: "ইউরোপ মহাদেশ", slug: "ieurop-mohadesh" }
];

const generatedChapters = [];

chaptersData.forEach((data, index) => {
  const fullTitle = `${data.prefix}: ${data.title}`;
  const chapterSlug = data.slug;
  const chapterId = `chapter-${chapterSlug}-${textbook.slug}-class-7`;

  const chapter = {
    id: chapterId,
    title: fullTitle,
    slug: chapterSlug,
    type: "chapter",
    track: textbook.track,
    parentId: textbook.id,
    orderIndex: index + 1,
    status: "published",
    fullSlug: `${textbook.fullSlug}/${chapterSlug}`,
    boardSlug: textbook.boardSlug,
    classSlug: textbook.classSlug,
    subjectSlug: textbook.subjectSlug,
    textbookSlug: textbook.slug,
    chapterSlug: chapterSlug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: [
      ...textbook.ancestors,
      {
        id: textbook.id,
        slug: textbook.slug,
        title: textbook.title,
        type: "textbook"
      },
      {
        id: chapterId,
        slug: chapterSlug,
        title: fullTitle,
        type: "chapter"
      }
    ]
  };
  
  generatedChapters.push(chapter);
});

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = generatedChapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters for Class 7 Amader Prithibi.`);
