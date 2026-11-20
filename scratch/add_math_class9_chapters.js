const fs = require('fs');

const rawData = `
১. বাস্তব সংখ্যা
- কষে দেখি - অনুশীলনী 1.1
- কষে দেখি - অনুশীলনী 1.2
- কষে দেখি - অনুশীলনী 1.3
২. সূচকের নিয়মাবলি
- কষে দেখি - অনুশীলনী 2
৩. লেখচিত্র
- কষে দেখি - অনুশীলনী 3.1
- কষে দেখি - অনুশীলনী 3.2
৪. স্থানাঙ্ক জ্যামিতি : দূরত্ব নির্ণয়
- কষে দেখি - অনুশীলনী 4
- নিজে করি - অনুশীলনী 4
৫. রৈখিক সহ সমীকরণ (দুই চল বিশিষ্ট)
- কষে দেখি - অনুশীলনী 5.1
- কষে দেখি - অনুশীলনী 5.2
- কষে দেখি - অনুশীলনী 5.3
- কষে দেখি - অনুশীলনী 5.4
- কষে দেখি - অনুশীলনী 5.5
- কষে দেখি - অনুশীলনী 5.6
- কষে দেখি - অনুশীলনী 5.7
৬. সামান্তরিকের ধর্ম
- কষে দেখি - অনুশীলনী 6
- নিজে করি - অনুশীলনী 6.1
- নিজে করি - অনুশীলনী 6.2
৭. বহুপদী সংখ্যামালা
- কষে দেখি - অনুশীলনী 7.1
- কষে দেখি - অনুশীলনী 7.2
- কষে দেখি - অনুশীলনী 7.3
- কষে দেখি - অনুশীলনী 7.4
- নিজে করি - অনুশীলনী 7.1
৮. উৎপাদকে বিশ্লেষণ
- কষে দেখি - অনুশীলনী 8.1
- কষে দেখি - অনুশীলনী 8.2
- কষে দেখি - অনুশীলনী 8.3
- কষে দেখি - অনুশীলনী 8.4
- কষে দেখি - অনুশীলনী 8.5
৯. ভেদক ও মধ্যবিন্দু সংক্রান্ত উপপাদ্য
- কষে দেখি - অনুশীলনী 9
১০. লাভ ও ক্ষতি
- কষে দেখি - অনুশীলনী 10.1
- কষে দেখি - অনুশীলনী 10.2
১১. রাশিবিজ্ঞান
- কষে দেখি - অনুশীলনী 11.1
- কষে দেখি - অনুশীলনী 11.2
- নিজে করি - অনুশীলনী 11.1
১২. ক্ষেত্রফল সংক্রান্ত উপপাদ্য
- কষে দেখি - অনুশীলনী 12
- নিজে করি - অনুশীলনী 12.1
১৩. সম্পাদ্য : ত্রিভুজের সমান ক্ষেত্রফল বিশিষ্ট সামান্তরিক অঙ্কন
- কষে দেখি - অনুশীলনী 13
১৪. সম্পাদ্য : চতুর্ভুজের সমান ক্ষেত্রফল বিশিষ্ট ত্রিভুজ অঙ্কন
- কষে দেখি - অনুশীলনী 14
১৫. ত্রিভুজ ও চতুর্ভুজের পরিসীমা ও ক্ষেত্রফল
- কষে দেখি - অনুশীলনী 15.1
- কষে দেখি - অনুশীলনী 15.2
- কষে দেখি - অনুশীলনী 15.3
- নিজে করি - অনুশীলনী 15.1
- নিজে করি - অনুশীলনী 15.2
- নিজে করি - অনুশীলনী 15.3
১৬. বৃত্তের পরিধি
- কষে দেখি - অনুশীলনী 16
১৭. সমবিন্দু সংক্রান্ত উপপাদ্য
- কষে দেখি - অনুশীলনী 17
- নিজে করি - অনুশীলনী 17.1
- নিজে করি - অনুশীলনী 17.2
১৮. বৃত্তের ক্ষেত্রফল
- কষে দেখি - অনুশীলনী 18
১৯. স্থানাঙ্ক জ্যামিতি: সরলরেখাংশের অন্তর্বিভক্ত ও বহিঃর্বিভক্ত
- কষে দেখি - অনুশীলনী 19
২০. স্থানাঙ্ক জ্যামিতি: ত্রিভুজাকৃতি ক্ষেত্রের ক্ষেত্রফল
- কষে দেখি - অনুশীলনী 20
২১. লগারিদম
- কষে দেখি - অনুশীলনী 21
`;

const textbook = {
  "id": "textbook-ganit-prakash-class-9-wb",
  "title": "Ganit Prakash",
  "slug": "ganit-prakash",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-mathematics-class-9-wb",
  "orderIndex": 27,
  "status": "published",
  "fullSlug": "wb-board/class-9/mathematics/ganit-prakash",
  "boardSlug": "wb-board",
  "classSlug": "class-9",
  "subjectSlug": "mathematics",
  "textbookSlug": "ganit-prakash",
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
      "id": "subject-mathematics-class-9-wb",
      "slug": "mathematics",
      "title": "Mathematics",
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
