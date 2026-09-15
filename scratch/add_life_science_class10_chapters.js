const fs = require('fs');

const subject = {
  "id": "subject-life-science-class-10-wb",
  "title": "Life Science",
  "slug": "life-science",
  "type": "subject",
  "track": "academic",
  "parentId": "class-10-wb",
  "orderIndex": 13,
  "status": "published",
  "fullSlug": "wb-board/class-10/life-science",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
  "subjectSlug": "life-science",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
    { "id": "class-10-wb", "slug": "class-10", "title": "Class 10", "type": "class" }
  ]
};

const textbook = {
  "id": "textbook-jibon-bigyan-o-paribesh-class-10-wb",
  "title": "Jibon Bigyan O Paribesh",
  "slug": "jibon-bigyan-o-paribesh",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-life-science-class-10-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-10/life-science/jibon-bigyan-o-paribesh",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
  "subjectSlug": "life-science",
  "textbookSlug": "jibon-bigyan-o-paribesh",
  "isIndexable": true,
  "isHardcoded": true,
  "ancestors": [
    ...subject.ancestors,
    { "id": subject.id, "slug": subject.slug, "title": subject.title, "type": "subject" }
  ]
};

const rawData = `
**অধ্যায় ১: জীবজগতে নিয়ন্ত্রণ ও সমন্বয়**
* **1.A** উদ্ভিদের সংবেদনশীলতা এবং সাড়াপ্রদান
* **1.B** উদ্ভিদের সাড়াপ্রদান এবং রাসায়নিক সমন্বয়- হরমোন
* **1.C** প্রাণীদের সাড়াপ্রদান এবং রাসায়নিক সমন্বয়-হরমোন
* **1.D** প্রাণীদের সাড়াপ্রদান ও ভৌত সমন্বয়-স্নায়ুতন্ত্র
* **1.E** প্রাণীদের সাড়াপ্রদানের একটি প্রকার হিসেবে গমন
**অধ্যায় ২: জীবনের প্রবাহমানতা**
* **2.A** কোশ বিভাজন এবং কোশচক্র
* **2.B** জনন
* **2.C** সপুষ্পক উদ্ভিদের যৌন জনন
* **2.D** বৃদ্ধি ও বিকাশ
**অধ্যায় ৩: বংশগতি এবং কয়েকটি সাধারণ জিনগত রোগ**
* **3.A** বংশগতি
* **3.B** কয়েকটি সাধারণ জিনগত রোগ
**অধ্যায় ৪: অভিব্যক্তি ও অভিযোজন**
* **4.A** অভিব্যক্তি
* **4.B** বেঁচে থাকার কৌশল : অভিযোজন
**অধ্যায় ৫: পরিবেশ, তার সম্পদ এবং তাদের সংরক্ষণ**
* **5.A** নাইট্রোজেন চক্র
* **5.B** পরিবেশ দূষণ
* **5.C** পরিবেশ এবং মানব জনসমষ্টি
* **5.D** জীববৈচিত্র্য এবং সংরক্ষণ
`;

const lines = rawData.trim().split('\n').map(l => l.trim()).filter(l => l);

const chapters = [];
const topics = [];

let currentChapterIndex = 0;
let currentTopicIndex = 0;
let currentChapter = null;

lines.forEach(line => {
  if (line.startsWith('**অধ্যায়')) { // It's a chapter
    currentChapterIndex++;
    currentTopicIndex = 0;
    
    const title = line.replace(/\*\*/g, '').trim();
    const slug = `chapter-${currentChapterIndex}`;
    
    const chapterId = `chapter-${slug}-${textbook.slug}-class-10`;
    
    currentChapter = {
      id: chapterId,
      title: title,
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
          title: title,
          type: "chapter"
        }
      ]
    };
    chapters.push(currentChapter);
  } else if (line.startsWith('*')) {
    // It's a topic
    if (!currentChapter) return;
    currentTopicIndex++;
    
    const title = line.replace(/^\*/, '').replace(/\*\*/g, '').trim();
    const slug = `topic-${currentTopicIndex}`;
    
    const topicId = `topic-${currentChapter.slug}-${slug}-${textbook.slug}-class-10`;
    
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
  console.log('Added Subject: Life Science (Class 10)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Jibon Bigyan O Paribesh (Class 10)');
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
