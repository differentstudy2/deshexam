const fs = require('fs');

const subject = {
  id: "subject-history-class-6-wb",
  title: "History",
  slug: "history",
  type: "subject",
  track: "academic",
  parentId: "class-6-wb",
  orderIndex: 10, // Order for History
  status: "published",
  fullSlug: "wb-board/class-6/history",
  boardSlug: "wb-board",
  classSlug: "class-6",
  subjectSlug: "history",
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
  "id": "textbook-oteet-o-oitijhya",
  "title": "Oteet O Oitijhya",
  "slug": "oteet-o-oitijhya",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-history-class-6-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-6/history/oteet-o-oitijhya",
  "boardSlug": "wb-board",
  "classSlug": "class-6",
  "subjectSlug": "history",
  "textbookSlug": "oteet-o-oitijhya",
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
      "id": "subject-history-class-6-wb",
      "slug": "history",
      "title": "History",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "ইতিহাসের ধারণা", slug: "itihaser-dharona" },
  { prefix: "অধ্যায় ২", title: "ভারতীয় উপমহাদেশে আদিম মানুষ : যাযাবর জীবন থেকে স্থায়ী বসতি স্থাপন", slug: "bharotiyo-upomohodeshe-adim-manush" },
  { prefix: "অধ্যায় ৩", title: "ভারতীয় উপমহাদেশের প্রাচীন ইতিহাসের ধারা : প্রথম পর্যায় : আনুমানিক খ্রিস্টপূর্ব ৭০০০-১৫০০ অব্দ", slug: "bharotiyo-upomohodesher-prachin-itihaser-dhara-1" },
  { prefix: "অধ্যায় ৪", title: "ভারতীয় উপমহাদেশের প্রাচীন ইতিহাসের ধারা : দ্বিতীয় পর্যায় : আনুমানিক খ্রিস্টপূর্ব ১৫০০-৬০০ অব্দ", slug: "bharotiyo-upomohodesher-prachin-itihaser-dhara-2" },
  { prefix: "অধ্যায় ৫", title: "খ্রিস্টপূর্ব ষষ্ঠ শতকের ভারতীয় উপমহাদেশ : রাষ্ট্রব্যবস্থা এবং ধর্মের বিবর্তন - উত্তর ভারত", slug: "khristopurbo-shoshtho-shotoker-bharotiyo-upomohodesh" },
  { prefix: "অধ্যায় ৬", title: "সাম্রাজ্য বিস্তার ও শাসন : আনুমানিক খ্রিস্টপূর্ব ষষ্ঠ শতক থেকে খ্রিস্টীয় সপ্তম শতকের প্রথম ভাগ", slug: "samrajyo-bistar-o-shashon" },
  { prefix: "অধ্যায় ৭", title: "অর্থনীতি ও জীবনযাত্রা : আনুমানিক খ্রিস্টপূর্ব ষষ্ঠ শতক থেকে খ্রিস্টীয় সপ্তম শতকের প্রথম ভাগ", slug: "orthoniti-o-jibonjatra" },
  { prefix: "অধ্যায় ৮", title: "প্রাচীন ভারতীয় উপমহাদেশের সংস্কৃতিচর্চার নানাদিক : শিক্ষা, সাহিত্য, বিজ্ঞান ও শিল্প", slug: "prachin-bharotiyo-upomohodesher-songskritichorchar-nanadik" },
  { prefix: "অধ্যায় ৯", title: "ভারত ও সমকালীন বহির্বিশ্ব : খ্রিস্টীয় সপ্তম শতকের প্রথম ভাগ পর্যন্ত", slug: "bharot-o-somokalin-bohirbishwo" }
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
  console.log('Added Subject: History (Class 6)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Oteet O Oitijhya (Class 6)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
