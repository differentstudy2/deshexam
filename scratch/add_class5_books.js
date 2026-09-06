const fs = require('fs');
const path = require('path');

const subjectsFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/subjects.json');
const textbooksFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/textbooks.json');
const indexFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/index.ts');

let subjects = JSON.parse(fs.readFileSync(subjectsFile, 'utf8'));

const boardClassAncestors = [
  {
    "id": "board-wb",
    "slug": "wb-board",
    "title": "West Bengal Board Secondary Education",
    "type": "board"
  },
  {
    "id": "class-5-wb",
    "slug": "class-5",
    "title": "Class 5",
    "type": "class"
  }
];

const newSubjects = [
  { id: 'subject-evs-class-5-wb', title: 'Environmental Science', slug: 'environmental-science' },
  { id: 'subject-math-class-5-wb', title: 'Mathematics', slug: 'mathematics' },
  { id: 'subject-bengali-lang-class-5-wb', title: 'Bengali Language', slug: 'bengali-language' },
  { id: 'subject-health-class-5-wb', title: 'Health & Physical Education', slug: 'health-physical-education' },
  { id: 'subject-bengali-lit-class-5-wb', title: 'Bengali Literature', slug: 'bengali-literature' }
];

const newTextbooks = [
  { id: 'textbook-amader-paribesh', title: 'Amader Paribesh', slug: 'amader-paribesh', subjectId: 'subject-evs-class-5-wb', subjectSlug: 'environmental-science', subjectTitle: 'Environmental Science' },
  { id: 'textbook-amar-ganit', title: 'Amar Ganit', slug: 'amar-ganit', subjectId: 'subject-math-class-5-wb', subjectSlug: 'mathematics', subjectTitle: 'Mathematics' },
  { id: 'textbook-bhasha-path', title: 'Bhasha Path', slug: 'bhasha-path', subjectId: 'subject-bengali-lang-class-5-wb', subjectSlug: 'bengali-language', subjectTitle: 'Bengali Language' },
  { id: 'textbook-health', title: 'Health & Physical Education', slug: 'health-physical-education-book', subjectId: 'subject-health-class-5-wb', subjectSlug: 'health-physical-education', subjectTitle: 'Health & Physical Education' },
  { id: 'textbook-patabahar', title: 'Patabahar', slug: 'patabahar', subjectId: 'subject-bengali-lit-class-5-wb', subjectSlug: 'bengali-literature', subjectTitle: 'Bengali Literature' }
];

let orderIndex = subjects.length ? Math.max(...subjects.map(s => s.orderIndex || 0)) + 1 : 1;

newSubjects.forEach((sub, i) => {
  subjects.push({
    id: sub.id,
    title: sub.title,
    slug: sub.slug,
    type: 'subject',
    track: 'academic',
    parentId: 'class-5-wb',
    orderIndex: orderIndex + i,
    status: 'published',
    fullSlug: `wb-board/class-5/${sub.slug}`,
    boardSlug: 'wb-board',
    classSlug: 'class-5',
    subjectSlug: sub.slug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: boardClassAncestors
  });
});

let textbooks = [];
if (fs.existsSync(textbooksFile)) {
  try {
    textbooks = JSON.parse(fs.readFileSync(textbooksFile, 'utf8'));
  } catch (e) {}
}

newTextbooks.forEach((tb, i) => {
  textbooks.push({
    id: tb.id,
    title: tb.title,
    slug: tb.slug,
    type: 'textbook',
    track: 'academic',
    parentId: tb.subjectId,
    orderIndex: i + 1,
    status: 'published',
    fullSlug: `wb-board/class-5/${tb.subjectSlug}/${tb.slug}`,
    boardSlug: 'wb-board',
    classSlug: 'class-5',
    subjectSlug: tb.subjectSlug,
    textbookSlug: tb.slug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: [
      ...boardClassAncestors,
      {
        id: tb.subjectId,
        slug: tb.subjectSlug,
        title: tb.subjectTitle,
        type: 'subject'
      }
    ]
  });
});

fs.writeFileSync(subjectsFile, JSON.stringify(subjects, null, 2));
fs.writeFileSync(textbooksFile, JSON.stringify(textbooks, null, 2));

// Update index.ts to uncomment textbooks
let indexTs = fs.readFileSync(indexFile, 'utf8');
indexTs = indexTs.replace(/\/\/ import textbooks from '.\/textbooks.json';/, "import textbooks from './textbooks.json';");
indexTs = indexTs.replace(/\/\/ \.\.\.\(textbooks as TaxonomyNode\[\]\),/, "...(textbooks as TaxonomyNode[]),");
fs.writeFileSync(indexFile, indexTs);

console.log('Added class 5 textbooks successfully!');
