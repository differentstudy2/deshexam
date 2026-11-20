const fs = require('fs');

const subject = {
  "id": "subject-history-class-10-wb",
  "title": "History",
  "slug": "history",
  "type": "subject",
  "track": "academic",
  "parentId": "class-10-wb",
  "orderIndex": 14,
  "status": "published",
  "fullSlug": "wb-board/class-10/history",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
  "subjectSlug": "history",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
    { "id": "class-10-wb", "slug": "class-10", "title": "Class 10", "type": "class" }
  ]
};

const textbook = {
  "id": "textbook-itihas-o-paribesh-class-10-wb",
  "title": "Itihas o Paribesh",
  "slug": "itihas-o-paribesh",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-history-class-10-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-10/history/itihas-o-paribesh",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
  "subjectSlug": "history",
  "textbookSlug": "itihas-o-paribesh",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    ...subject.ancestors,
    { "id": subject.id, "slug": subject.slug, "title": subject.title, "type": "subject" }
  ]
};

const rawData = `
অধ্যায় ১: ইতিহাসের ধারণা
অধ্যায় ২: সংস্কার : বৈশিষ্ট্য ও মূল্যায়ন
অধ্যায় ৩: প্রতিরোধ ও বিদ্রোহ : বৈশিষ্ট্য ও বিশ্লেষণ
অধ্যায় ৪: সংঘবদ্ধতার গোড়ার কথা : বৈশিষ্ট্য ও বিশ্লেষণ
অধ্যায় ৫: বিকল্প চিন্তা ও উদ্যোগ (১৯ শতকের মধ্যভাগ থেকে ২০ শতকের প্রথম ভাগ)
অধ্যায় ৬: বিশ শতকের ভারতে কৃষক, শ্রমিক ও বামপন্থী আন্দোলন
অধ্যায় ৭: বিশ শতকের ভারতে নারী, ছাত্র ও প্রান্তিক জনগোষ্ঠীর আন্দোলন
অধ্যায় ৮: উত্তর-ঔপনিবেশিক ভারত : বিশ শতকের দ্বিতীয় পর্ব
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
  console.log('Added Subject: History (Class 10)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Itihas O Paribesh (Class 10)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
