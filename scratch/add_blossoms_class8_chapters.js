const fs = require('fs');

const subject = {
  id: "subject-english-class-8-wb",
  title: "English",
  slug: "english",
  type: "subject",
  track: "academic",
  parentId: "class-8-wb",
  orderIndex: 8, // Standard for English based on previous scripts
  status: "published",
  fullSlug: "wb-board/class-8/english",
  boardSlug: "wb-board",
  classSlug: "class-8",
  subjectSlug: "english",
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
      "id": "class-8-wb",
      "slug": "class-8",
      "title": "Class 8",
      "type": "class"
    }
  ]
};

const textbook = {
  "id": "textbook-blossoms-class-8-wb",
  "title": "Blossoms",
  "slug": "blossoms",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-english-class-8-wb",
  "orderIndex": 4,
  "status": "published",
  "fullSlug": "wb-board/class-8/english/blossoms",
  "boardSlug": "wb-board",
  "classSlug": "class-8",
  "subjectSlug": "english",
  "textbookSlug": "blossoms",
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
      "id": "class-8-wb",
      "slug": "class-8",
      "title": "Class 8",
      "type": "class"
    },
    {
      "id": "subject-english-class-8-wb",
      "slug": "english",
      "title": "English",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "", title: "Revision Lesson" },
  { prefix: "Lesson 1", title: "The Wind Cap" },
  { prefix: "Lesson 2", title: "Clouds" },
  { prefix: "Lesson 3", title: "An April Day" },
  { prefix: "Lesson 4", title: "The Great Escape" },
  { prefix: "Lesson 5", title: "Princess September" },
  { prefix: "Lesson 6", title: "The Sea" },
  { prefix: "Lesson 7", title: "A King's Tale" },
  { prefix: "Lesson 8", title: "The Happy Prince" },
  { prefix: "Lesson 9", title: "Summer Friends" },
  { prefix: "Lesson 10", title: "Tales of Childhood" },
  { prefix: "Lesson 11", title: "Midnight Express" },
  { prefix: "Lesson 12", title: "Someone" },
  { prefix: "Lesson 13", title: "The Man who planted Trees" },
  { prefix: "", title: "Teachers' Guidelines" }
];

function generateSlug(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const chapters = chaptersData.map((data, index) => {
  const fullTitle = data.prefix ? `${data.prefix}: ${data.title}` : data.title;
  const slug = generateSlug(fullTitle);

  return {
    id: `chapter-${slug}-${textbook.slug}-class-8`,
    title: fullTitle,
    slug: slug,
    type: "chapter",
    track: textbook.track,
    parentId: textbook.id,
    orderIndex: index + 1,
    status: "published",
    fullSlug: `${textbook.fullSlug}/${slug}`,
    boardSlug: textbook.boardSlug,
    classSlug: textbook.classSlug,
    subjectSlug: textbook.subjectSlug,
    textbookSlug: textbook.slug,
    chapterSlug: slug,
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
        id: `chapter-${slug}-${textbook.slug}-class-8`,
        slug: slug,
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
  console.log('Added Subject: English (Class 8)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Blossoms (Class 8)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
