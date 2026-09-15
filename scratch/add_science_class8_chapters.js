const fs = require('fs');

const rawData = `
১. ভৌত পরিবেশ
- বল ও চাপ
- স্পর্শ ছাড়া ক্রিয়াশীল বল
- তাপ
- আলো
২. মৌল, যৌগ ও রাসায়নিক বিক্রিয়া
- পদার্থের প্রকৃতি
- পদার্থের গঠন
- রাসায়নিক বিক্রিয়া
- তড়িতের রাসায়নিক প্রভাব
৩. কয়েকটি গ্যাসের পরিচিতি
৪. কার্বন ও কার্বনঘটিত যৌগ
৫. প্রাকৃতিক ঘটনা ও তার বিশ্লেষণ
৬. দেহের গঠন
৭. অণুজীবের জগৎ
৮. মানুষের খাদ্য ও খাদ্য উৎপাদন
৯. অন্তঃক্ষরা তন্ত্র ও বয়ঃসন্ধি
১০. পরিবেশের সংকট ও সংরক্ষণ
১১. আমাদের চারপাশের পরিবেশ ও উদ্ভিদজগৎ
`;

const textbook = {
  "id": "textbook-poribesh-o-bigyan-class-8-wb",
  "title": "Poribesh O Bigyan",
  "slug": "poribesh-o-bigyan",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-science-class-8-wb",
  "orderIndex": 25,
  "status": "published",
  "fullSlug": "wb-board/class-8/science/poribesh-o-bigyan",
  "boardSlug": "wb-board",
  "classSlug": "class-8",
  "subjectSlug": "science",
  "textbookSlug": "poribesh-o-bigyan",
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
      "id": "subject-science-class-8-wb",
      "slug": "science",
      "title": "Science",
      "type": "subject"
    }
  ]
};

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
    
    // "১. ভৌত পরিবেশ"
    const match = line.match(/^[০-৯]+[\.|\s]+(.*)/);
    const title = match ? match[1] : line;
    const slug = `chapter-${currentChapterIndex}`;
    
    const chapterId = `chapter-${slug}-${textbook.slug}-class-8`;
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
    
    const topicId = `topic-${currentChapter.slug}-${slug}-${textbook.slug}-class-8`;
    
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
