const fs = require('fs');

const textbook = {
  "id": "textbook-atit-o-aityaja-class-7-wb",
  "title": "Atit O Aityaja",
  "slug": "atit-o-aityaja",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-history-class-7-wb",
  "orderIndex": 14,
  "status": "published",
  "fullSlug": "wb-board/class-7/history/atit-o-aityaja",
  "boardSlug": "wb-board",
  "classSlug": "class-7",
  "subjectSlug": "history",
  "textbookSlug": "atit-o-aityaja",
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
      "id": "subject-history-class-7-wb",
      "slug": "history",
      "title": "History",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "ইতিহাসের ধারণা", slug: "itihaser-dharona" },
  { prefix: "অধ্যায় ২", title: "ভারতের রাজনৈতিক ইতিহাসের কয়েকটি ধারা : খ্রিস্টীয় সপ্তম থেকে দ্বাদশ শতক", slug: "bharoter-rajnoitik-itihaser-koyekti-dhara" },
  { prefix: "অধ্যায় ৩", title: "ভারতের সমাজ, অর্থনীতি ও সংস্কৃতির কয়েকটি ধারা : খ্রিস্টীয় সপ্তম থেকে দ্বাদশ শতক", slug: "bharoter-somaj-orthoniti-o-songskritir-koyekti-dhara" },
  { prefix: "অধ্যায় ৪", title: "দিল্লি সুলতানি : তুর্কি-আফগান শাসন", slug: "dilli-sultani-turki-afgan-shason" },
  { prefix: "অধ্যায় ৫", title: "মুঘল সাম্রাজ্য", slug: "mughal-samrajyo" },
  { prefix: "অধ্যায় ৬", title: "নগর, বণিক ও বাণিজ্য", slug: "nogor-bonik-o-banijyo" },
  { prefix: "অধ্যায় ৭", title: "জীবনযাত্রা ও সংস্কৃতি : সুলতানি ও মুঘল যুগ", slug: "jibonjatra-o-songskriti-sultani-o-mughal-jug" },
  { prefix: "অধ্যায় ৮", title: "মুঘল সাম্রাজ্যের সংকট", slug: "mughal-samrajyer-songkot" },
  { prefix: "অধ্যায় ৯", title: "আজকের ভারত : সরকার, গণতন্ত্র ও স্বায়ত্তশাসন", slug: "ajker-bharot-sorkar-gonotontro-o-sayottoshason" }
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
console.log(`Added ${newChapters.length} chapters for Class 7 Atit O Aityaja.`);
