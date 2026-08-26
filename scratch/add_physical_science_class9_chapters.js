const fs = require('fs');

const subject = {
  "id": "subject-physical-science-class-9-wb",
  "title": "Physical Science",
  "slug": "physical-science",
  "type": "subject",
  "track": "academic",
  "parentId": "class-9-wb",
  "orderIndex": 12,
  "status": "published",
  "fullSlug": "wb-board/class-9/physical-science",
  "boardSlug": "wb-board",
  "classSlug": "class-9",
  "subjectSlug": "physical-science",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
    { "id": "class-9-wb", "slug": "class-9", "title": "Class 9", "type": "class" }
  ]
};

const textbook = {
  "id": "textbook-physical-science-class-9-wb",
  "title": "Physical Science",
  "slug": "physical-science",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-physical-science-class-9-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-9/physical-science/physical-science",
  "boardSlug": "wb-board",
  "classSlug": "class-9",
  "subjectSlug": "physical-science",
  "textbookSlug": "physical-science",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    ...subject.ancestors,
    { "id": subject.id, "slug": subject.slug, "title": subject.title, "type": "subject" }
  ]
};

const rawData = `
১. পরিমাপ (Measurement)
২. বল ও গতি (Force and Motion)
৩. পদার্থ : গঠন ও ধর্ম (Matter: Structure and Properties)
৪. পদার্থ: পরমাণুর গঠন ও ভৌত-রাসায়নিক ধর্ম (Atomic Structure & Chemical Properties)
- ৪.১ পরমাণুর গঠন
- ৪.২ মোলের ধারণা
- ৪.৩ দ্রবণ
- ৪.৪ অ্যাসিড, ক্ষার ও লবণ
- ৪.৫ মিশ্রণের উপাদানের পৃথক্করণ
- ৪.৬ জল
৫. শক্তির ক্রিয়া: কার্য, ক্ষমতা ও শক্তি (Work, Power and Energy)
৬. তাপ (Heat)
৭. শব্দ (Sound)
`;

const lines = rawData.trim().split('\n').map(l => l.trim()).filter(l => l);

const chapters = [];
const topics = [];

let currentChapterIndex = 0;
let currentTopicIndex = 0;
let currentChapter = null;

lines.forEach(line => {
  if (line.match(/^[০-৯]+[\.|\s]/)) { // It's a chapter
    currentChapterIndex++;
    currentTopicIndex = 0;
    
    const match = line.match(/^[০-৯]+[\.|\s]+(.*)/);
    const title = match ? match[1] : line;
    const slug = `chapter-${currentChapterIndex}`;
    
    const chapterId = `chapter-${slug}-${textbook.slug}-class-9`;
    const fullTitle = `অধ্যায় ${currentChapterIndex}: ${title}`;
    
    currentChapter = {
      id: chapterId,
      title: fullTitle,
      slug: slug,
      type: "chapter",
      track: textbook.track,
      parentId: textbook.id,
      orderIndex: currentChapterIndex,
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
          id: chapterId,
          slug: slug,
          title: fullTitle,
          type: "chapter"
        }
      ]
    };
    chapters.push(currentChapter);
  } else if (line.startsWith('-')) {
    // It's a topic
    if (!currentChapter) return;
    currentTopicIndex++;
    
    const title = line.replace(/^-/, '').trim();
    const slug = `topic-${currentTopicIndex}`;
    
    const topicId = `topic-${currentChapter.slug}-${slug}-${textbook.slug}-class-9`;
    
    const topic = {
      id: topicId,
      title: title,
      slug: slug,
      type: "topic",
      track: textbook.track,
      parentId: currentChapter.id,
      orderIndex: currentTopicIndex,
      status: "published",
      fullSlug: `${currentChapter.fullSlug}/${slug}`,
      boardSlug: textbook.boardSlug,
      classSlug: textbook.classSlug,
      subjectSlug: textbook.subjectSlug,
      textbookSlug: textbook.slug,
      chapterSlug: currentChapter.slug,
      topicSlug: slug,
      isIndexable: true,
      isHardcoded: true,
      ancestors: [
        ...currentChapter.ancestors,
        {
          id: topicId,
          slug: slug,
          title: title,
          type: "topic"
        }
      ]
    };
    topics.push(topic);
  }
});

// Update Subjects
const subjectsPath = './src/data/hardcoded/taxonomy/subjects.json';
const existingSubjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));
if (!existingSubjects.find(s => s.id === subject.id)) {
  existingSubjects.push(subject);
  fs.writeFileSync(subjectsPath, JSON.stringify(existingSubjects, null, 2));
  console.log('Added Subject: Physical Science (Class 9)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Physical Science (Class 9)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);

// Update Topics
const topicsPath = './src/data/hardcoded/taxonomy/topics.json';
const existingTopics = fs.existsSync(topicsPath) ? JSON.parse(fs.readFileSync(topicsPath, 'utf8')) : [];
const newTopics = topics.filter(t => !existingTopics.find(et => et.id === t.id));
existingTopics.push(...newTopics);
fs.writeFileSync(topicsPath, JSON.stringify(existingTopics, null, 2));
console.log(`Added ${newTopics.length} topics.`);
