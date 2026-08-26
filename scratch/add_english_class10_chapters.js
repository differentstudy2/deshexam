const fs = require('fs');

const subject = {
  "id": "subject-english-class-10-wb",
  "title": "English",
  "slug": "english",
  "type": "subject",
  "track": "academic",
  "parentId": "class-10-wb",
  "orderIndex": 8,
  "status": "published",
  "fullSlug": "wb-board/class-10/english",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
  "subjectSlug": "english",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
    { "id": "class-10-wb", "slug": "class-10", "title": "Class 10", "type": "class" }
  ]
};

const textbook = {
  "id": "textbook-bliss-class-10-wb",
  "title": "Bliss",
  "slug": "bliss",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-english-class-10-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-10/english/bliss",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
  "subjectSlug": "english",
  "textbookSlug": "bliss",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    ...subject.ancestors,
    { "id": subject.id, "slug": subject.slug, "title": subject.title, "type": "subject" }
  ]
};

const rawData = [
  { title: "Father's Help", isLesson: true },
  { title: "Fable", isLesson: true },
  { title: "The Passing Away of Bapu", isLesson: true },
  { title: "My Own True Family", isLesson: true },
  { title: "Our Runaway Kite", isLesson: true },
  { title: "Sea Fever", isLesson: true },
  { title: "The Cat", isLesson: true },
  { title: "The Snail", isLesson: true },
  { title: "Reading Comprehension (Unseen)", isLesson: false },
  { title: "Teachers' Guidelines", isLesson: false }
];

const chapters = [];
let lessonIndex = 1;
let otherIndex = 1;

rawData.forEach((data) => {
  const isLesson = data.isLesson;
  
  const fullTitle = isLesson ? `Lesson ${lessonIndex}: ${data.title}` : data.title;
  const chapterSlug = isLesson ? `lesson-${lessonIndex}` : `other-${otherIndex}`;
  
  if (isLesson) lessonIndex++;
  else otherIndex++;
  
  const chapterId = `chapter-${chapterSlug}-${textbook.slug}-class-10`;

  const chapter = {
    id: chapterId,
    title: fullTitle,
    slug: chapterSlug,
    type: "chapter",
    track: textbook.track,
    parentId: textbook.id,
    orderIndex: chapters.length + 1,
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
  
  chapters.push(chapter);
});

// Update Subjects
const subjectsPath = './src/data/hardcoded/taxonomy/subjects.json';
const existingSubjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));
if (!existingSubjects.find(s => s.id === subject.id)) {
  existingSubjects.push(subject);
  fs.writeFileSync(subjectsPath, JSON.stringify(existingSubjects, null, 2));
  console.log('Added Subject: English (Class 10)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Bliss (Class 10)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
