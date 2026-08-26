const fs = require('fs');

const subject = {
  "id": "subject-english-class-9-wb",
  "title": "English",
  "slug": "english",
  "type": "subject",
  "track": "academic",
  "parentId": "class-9-wb",
  "orderIndex": 8,
  "status": "published",
  "fullSlug": "wb-board/class-9/english",
  "boardSlug": "wb-board",
  "classSlug": "class-9",
  "subjectSlug": "english",
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
      "id": "class-9-wb",
      "slug": "class-9",
      "title": "Class 9",
      "type": "class"
    }
  ]
};

const textbook = {
  "id": "textbook-bliss-class-9-wb",
  "title": "Bliss",
  "slug": "bliss",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-english-class-9-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-9/english/bliss",
  "boardSlug": "wb-board",
  "classSlug": "class-9",
  "subjectSlug": "english",
  "textbookSlug": "bliss",
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
      "id": "class-9-wb",
      "slug": "class-9",
      "title": "Class 9",
      "type": "class"
    },
    {
      "id": "subject-english-class-9-wb",
      "slug": "english",
      "title": "English",
      "type": "subject"
    }
  ]
};

const rawData = [
  { prefix: "Lesson 1", title: "Tales of Bhola Grandpa" },
  { prefix: "Lesson 2", title: "All about a Dog" },
  { prefix: "Lesson 3", title: "Autumn" },
  { prefix: "Lesson 4", title: "A Day in the Zoo" },
  { prefix: "Lesson 5", title: "All Summer in a Day" },
  { prefix: "Lesson 6", title: "Mild the Mist Upon the Hill" },
  { prefix: "Lesson 7", title: "Tom Loses a Tooth" },
  { prefix: "Lesson 8", title: "His First Flight" },
  { prefix: "Lesson 9", title: "The North Ship" },
  { prefix: "Lesson 10", title: "The Price of Bananas" },
  { prefix: "Lesson 11", title: "A Shipwrecked Sailor" },
  { prefix: "Lesson 12", title: "Hunting Snake" },
  { prefix: "Other", title: "Reading Comprehension (Unseen)" },
  { prefix: "Other", title: "Teachers' Guidelines" }
];

const chapters = [];

rawData.forEach((data, index) => {
  const isLesson = data.prefix.startsWith("Lesson");
  const fullTitle = isLesson ? `${data.prefix}: ${data.title}` : data.title;
  const chapterSlug = isLesson ? `lesson-${data.prefix.split(' ')[1]}` : `other-${index+1}`;
  const chapterId = `chapter-${chapterSlug}-${textbook.slug}-class-9`;

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
  
  chapters.push(chapter);
});

// Update Subjects
const subjectsPath = './src/data/hardcoded/taxonomy/subjects.json';
const existingSubjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));
if (!existingSubjects.find(s => s.id === subject.id)) {
  existingSubjects.push(subject);
  fs.writeFileSync(subjectsPath, JSON.stringify(existingSubjects, null, 2));
  console.log('Added Subject: English (Class 9)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Bliss (Class 9)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
