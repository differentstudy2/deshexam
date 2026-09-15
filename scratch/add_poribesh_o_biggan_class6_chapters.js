const fs = require('fs');

const subject = {
  id: "subject-science-class-6-wb",
  title: "Science",
  slug: "science",
  type: "subject",
  track: "academic",
  parentId: "class-6-wb",
  orderIndex: 9, // Order for Science
  status: "published",
  fullSlug: "wb-board/class-6/science",
  boardSlug: "wb-board",
  classSlug: "class-6",
  subjectSlug: "science",
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
  "id": "textbook-poribesh-o-biggan",
  "title": "Poribesh O Biggan",
  "slug": "poribesh-o-biggan",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-science-class-6-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-6/science/poribesh-o-biggan",
  "boardSlug": "wb-board",
  "classSlug": "class-6",
  "subjectSlug": "science",
  "textbookSlug": "poribesh-o-biggan",
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
      "id": "subject-science-class-6-wb",
      "slug": "science",
      "title": "Science",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "পরিবেশ ও জীবজগতের পারস্পরিক নির্ভরতা", slug: "poribesh-o-jibjogoter-parosporik-nirvorota" },
  { prefix: "অধ্যায় ২", title: "আমাদের চারপাশের ঘটনাসমূহ", slug: "amader-charpasher-ghotonasomuho" },
  { prefix: "অধ্যায় ৩", title: "মৌলিক, যৌগিক ও মিশ্র পদার্থ", slug: "moulik-jougik-o-mishro-podartho" },
  { prefix: "অধ্যায় ৪", title: "শিলা ও খনিজ পদার্থ", slug: "shila-o-khonij-podartho" },
  { prefix: "অধ্যায় ৫", title: "মাপজোক বা পরিমাপ", slug: "mapjok-ba-porimap" },
  { prefix: "অধ্যায় ৬", title: "বল ও শক্তি : প্রাথমিক ধারণা", slug: "bol-o-shokti-prathomik-dharona" },
  { prefix: "অধ্যায় ৭", title: "তরল ও গ্যাসীয় পদার্থের স্থিতি ও গতি", slug: "torol-o-gyasiyo-podarther-sthiti-o-goti" },
  { prefix: "অধ্যায় ৮", title: "মানুষের শরীর", slug: "manusher-shorir" },
  { prefix: "অধ্যায় ৯", title: "সাধারণ যন্ত্রসমূহ", slug: "sadharon-jontrosomuho" },
  { prefix: "অধ্যায় ১০", title: "জীববৈচিত্র্য ও তার শ্রেণীবিন্যাস", slug: "jiboboichitro-o-tar-srenibinyas" },
  { prefix: "অধ্যায় ১১", title: "কতগুলি বিশেষ প্রাণীর বাসস্থান ও আচার-আচরণ", slug: "kotoguli-bisesh-pranir-bashosthan-o-achar-achoron" },
  { prefix: "অধ্যায় ১২", title: "বর্জ্য পদার্থ", slug: "borjo-podartho" }
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
  console.log('Added Subject: Science (Class 6)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Poribesh O Biggan (Class 6)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
