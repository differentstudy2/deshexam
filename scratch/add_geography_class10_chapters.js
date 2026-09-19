const fs = require('fs');

const subject = {
  "id": "subject-geography-class-10-wb",
  "title": "Geography",
  "slug": "geography",
  "type": "subject",
  "track": "academic",
  "parentId": "class-10-wb",
  "orderIndex": 15,
  "status": "published",
  "fullSlug": "wb-board/class-10/geography",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
  "subjectSlug": "geography",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
    { "id": "class-10-wb", "slug": "class-10", "title": "Class 10", "type": "class" }
  ]
};

const textbook = {
  "id": "textbook-bhugol-o-paribesh-class-10-wb",
  "title": "Bhugol o Paribesh",
  "slug": "bhugol-o-paribesh",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-geography-class-10-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-10/geography/bhugol-o-paribesh",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
  "subjectSlug": "geography",
  "textbookSlug": "bhugol-o-paribesh",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    ...subject.ancestors,
    { "id": subject.id, "slug": subject.slug, "title": subject.title, "type": "subject" }
  ]
};

const rawData = `
অধ্যায় ১: বহির্জাত প্রক্রিয়া ও তাদের দ্বারা সৃষ্ট ভূমিরূপ
অধ্যায় ২: বায়ুমণ্ডল
অধ্যায় ৩: বারিমন্ডল
অধ্যায় ৪: বর্জ্য ব্যবস্থাপনা
অধ্যায় ৫: ভারত (প্রাকৃতিক পরিবেশ)
অধ্যায় ৬: ভারত (অর্থনৈতিক পরিবেশ)
অধ্যায় ৭: উপগ্রহ চিত্র ও ভূ-বৈচিত্র্যসূচক মানচিত্র
`;

const lines = rawData.trim().split('\n').map(l => l.trim()).filter(l => l);

const chapters = [];

lines.forEach((line, index) => {
  const chapterSlug = `chapter-${index + 1}`;
  const chapterId = `chapter-${chapterSlug}-${textbook.slug}-class-10`;
  
  const chapter = {
    id: chapterId,
    title: line,
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
        title: line,
        type: "chapter"
      }
    ]
  };
  chapters.push(chapter);
});

// Update Subjects
const subjectsPath = './src/data/hardcoded/taxonomy/subjects.json';
const existingSubjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));
if (!existingSubjects.find(s => s.id === subject.id)) {
  existingSubjects.push(subject);
  fs.writeFileSync(subjectsPath, JSON.stringify(existingSubjects, null, 2));
  console.log('Added Subject: Geography (Class 10)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Bhugol o Paribesh (Class 10)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
