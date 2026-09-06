const fs = require('fs');

const subject = {
  id: "subject-english-class-5-wb",
  title: "English",
  slug: "english",
  type: "subject",
  track: "academic",
  parentId: "class-5-wb",
  orderIndex: 8,
  status: "published",
  fullSlug: "wb-board/class-5/english",
  boardSlug: "wb-board",
  classSlug: "class-5",
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
      "id": "class-5-wb",
      "slug": "class-5",
      "title": "Class 5",
      "type": "class"
    }
  ]
};

const textbook = {
  "id": "textbook-butterfly",
  "title": "Butterfly",
  "slug": "butterfly",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-english-class-5-wb",
  "orderIndex": 4,
  "status": "published",
  "fullSlug": "wb-board/class-5/english/butterfly",
  "boardSlug": "wb-board",
  "classSlug": "class-5",
  "subjectSlug": "english",
  "textbookSlug": "butterfly",
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
      "id": "class-5-wb",
      "slug": "class-5",
      "title": "Class 5",
      "type": "class"
    },
    {
      "id": "subject-english-class-5-wb",
      "slug": "english",
      "title": "English",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "", title: "Revision Lesson" },
  { prefix: "Lesson 1", title: "India : Superpower in Cricket" },
  { prefix: "Lesson 2", title: "A Feat on Feet" },
  { prefix: "Lesson 3", title: "Phulmani's India" },
  { prefix: "Lesson 4", title: "Memory in Marble" },
  { prefix: "Lesson 5", title: "My School Days" },
  { prefix: "Lesson 6", title: "The Clever Monkey" },
  { prefix: "Lesson 7", title: "The Rebel Poet" },
  { prefix: "Lesson 8", title: "Buildings to Remember" },
  { prefix: "Lesson 9", title: "Bird's Eye" },
  { prefix: "Lesson 10", title: "A Great Social Reformer" },
  { prefix: "Lesson 11", title: "The Finishing Point" },
  { prefix: "Lesson 12", title: "Beyond Barriers" }
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
    id: `chapter-${slug}-${textbook.slug}`,
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
        id: `chapter-${slug}-${textbook.slug}`,
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
  console.log('Added Subject: English');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Butterfly');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
