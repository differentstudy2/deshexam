const fs = require('fs');

const subject = {
  "id": "subject-history-class-9-wb",
  "title": "History",
  "slug": "history",
  "type": "subject",
  "track": "academic",
  "parentId": "class-9-wb",
  "orderIndex": 14,
  "status": "published",
  "fullSlug": "wb-board/class-9/history",
  "boardSlug": "wb-board",
  "classSlug": "class-9",
  "subjectSlug": "history",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
    { "id": "class-9-wb", "slug": "class-9", "title": "Class 9", "type": "class" }
  ]
};

const textbook = {
  "id": "textbook-itihas-o-poribesh-class-9-wb",
  "title": "Itihas O Poribesh",
  "slug": "itihas-o-poribesh",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-history-class-9-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-9/history/itihas-o-poribesh",
  "boardSlug": "wb-board",
  "classSlug": "class-9",
  "subjectSlug": "history",
  "textbookSlug": "itihas-o-poribesh",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    ...subject.ancestors,
    { "id": subject.id, "slug": subject.slug, "title": subject.title, "type": "subject" }
  ]
};

const rawData = `
অধ্যায় ০: প্রাক্কথন: ইউরোপ ও আধুনিক যুগ
অধ্যায় ১: ফরাসি বিপ্লবের কয়েকটি দিক
অধ্যায় ২: বিপ্লবী আদর্শ, নেপোলিয়নীয় সাম্রাজ্য ও জাতীয়তাবাদ
অধ্যায় ৩: ঊনবিংশ শতকের ইউরোপ: রাজতান্ত্রিক ও জাতীয়তাবাদী ভাবধারার সংঘাত
অধ্যায় ৪: শিল্পবিপ্লব, উপনিবেশবাদ ও সাম্রাজ্যবাদ
অধ্যায় ৫: বিশ শতকে ইউরোপ
অধ্যায় ৬: দ্বিতীয় বিশ্বযুদ্ধ ও তারপর
অধ্যায় ৭: জাতিসংঘ এবং সম্মিলিত জাতিপুঞ্জ
`;

const lines = rawData.trim().split('\n').map(l => l.trim()).filter(l => l);

const chapters = [];

lines.forEach((line, index) => {
  const chapterSlug = `chapter-${index}`; // 0 to 7
  const chapterId = `chapter-${chapterSlug}-${textbook.slug}-class-9`;
  
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
  console.log('Added Subject: History (Class 9)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Itihas O Poribesh (Class 9)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
