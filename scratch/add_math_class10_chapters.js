const fs = require('fs');

const textbook = {
  "id": "textbook-ganit-prakash-class-10-wb",
  "title": "Ganit Prakash",
  "slug": "ganit-prakash",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-mathematics-class-10-wb",
  "orderIndex": 30,
  "status": "published",
  "fullSlug": "wb-board/class-10/mathematics/ganit-prakash",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
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
      "id": "class-10-wb",
      "slug": "class-10",
      "title": "Class 10",
      "type": "class"
    },
    {
      "id": "subject-mathematics-class-10-wb",
      "slug": "mathematics",
      "title": "Mathematics",
      "type": "subject"
    }
  ]
};

const rawData = `
**অধ্যায় ১: একচলবিশিষ্ট দ্বিঘাত সমীকরণ**
* কষে দেখি - অনুশীলনী 1.1
* কষে দেখি - অনুশীলনী 1.2
* কষে দেখি - অনুশীলনী 1.3
* কষে দেখি - অনুশীলনী 1.4
* কষে দেখি - অনুশীলনী 1.5
**অধ্যায় ২: সরল সুদকষা**
* কষে দেখি - অনুশীলনী 2
**অধ্যায় ৩: বৃত্ত সম্পর্কিত উপপাদ্য**
* কষে দেখি - অনুশীলনী 3.1
* কষে দেখি - অনুশীলনী 3.2
**অধ্যায় ৪: আয়তঘন**
* কষে দেখি - অনুশীলনী 4
**অধ্যায় ৫: অনুপাত ও সমানুপাত**
* কষে দেখি - অনুশীলনী 5.1
* কষে দেখি - অনুশীলনী 5.2
* কষে দেখি - অনুশীলনী 5.3
**অধ্যায় ৬: চক্রবৃদ্ধি সুদ ও সমহার বৃদ্ধি বা হ্রাস**
* কষে দেখি - অনুশীলনী 6.1
* কষে দেখি - অনুশীলনী 6.2
**অধ্যায় ৭: বৃত্তস্থ কোণ সম্পর্কিত উপপাদ্য**
* কষে দেখি - অনুশীলনী 7.1
* কষে দেখি - অনুশীলনী 7.2
* কষে দেখি - অনুশীলনী 7.3
* নিজে করি - অনুশীলনী 7.1
* নিজে করি - অনুশীলনী 7.2
**অধ্যায় ৮: লম্ব বৃত্তাকার চোঙ**
* কষে দেখি - অনুশীলনী 8
**অধ্যায় ৯: দ্বিঘাত করণী**
* কষে দেখি - অনুশীলনী 9.1
* কষে দেখি - অনুশীলনী 9.2
* কষে দেখি - অনুশীলনী 9.3
**অধ্যায় ১০: বৃত্তস্থ চতুর্ভুজ সংক্রান্ত উপপাদ্য**
* কষে দেখি - অনুশীলনী 10
**অধ্যায় ১১: সম্পাদ্য: ত্রিভুজের পরিবৃত্ত ও অন্তর্বৃত্ত অঙ্কন**
* কষে দেখি - অনুশীলনী 11.1
* কষে দেখি - অনুশীলনী 11.2
* নিজে করি - অনুশীলনী 11
**অধ্যায় ১২: গোলক**
* কষে দেখি - অনুশীলনী 12
**অধ্যায় ১৩: ভেদ**
* কষে দেখি - অনুশীলনী 13
**অধ্যায় ১৪: অংশীদারি কারবার**
* কষে দেখি - অনুশীলনী 14
**অধ্যায় ১৫: বৃত্তের স্পর্শক সংক্রান্ত উপপাদ্য**
* কষে দেখি - অনুশীলনী 15.1
* কষে দেখি - অনুশীলনী 15.2
* নিজে করি - অনুশীলনী 15.1
* নিজে করি - অনুশীলনী 15.2
**অধ্যায় ১৬: লম্ব বৃত্তাকার শঙ্কু**
* কষে দেখি - অনুশীলনী 16
**অধ্যায় ১৭: সম্পাদ্য: বৃত্তের স্পর্শক অঙ্কন**
* কষে দেখি - অনুশীলনী 17
**অধ্যায় ১৮: সদৃশতা**
* কষে দেখি - অনুশীলনী 18.1
* কষে দেখি - অনুশীলনী 18.2
* كষে দেখি - অনুশীলনী 18.3
* কষে দেখি - অনুশীলনী 18.4
**অধ্যায় ১৯: বিভিন্ন ঘনবস্তু সংক্রান্ত বাস্তব সমস্যা**
* কষে দেখি - অনুশীলনী 19
**অধ্যায় ২০: ত্রিকোণমিতি: কোণ পরিমাপের ধারণা**
* কষে দেখি - অনুশীলনী 20
**অধ্যায় ২১: সম্পাদ্য: মধ্যসমানুপাতী নির্ণয়**
* কষে দেখি - অনুশীলনী 21
**অধ্যায় ২২: পিথাগোরাসের উপপাদ্য**
* কষে দেখি - অনুশীলনী 22
**অধ্যায় ২৩: ত্রিকোণমিতিক অনুপাত এবং ত্রিকোণমিতিক অভেদাবলি**
* কষে দেখি - অনুশীলনী 23.1
* কষে দেখি - অনুশীলনী 23.2
* কষে দেখি - অনুশীলনী 23.3
**অধ্যায় ২৪: পূরক কোণের ত্রিকোণমিতিক অনুপাত**
* কষে দেখি - অনুশীলনী 24
**অধ্যায় ২৫: ত্রিকোণমিতিক অনুপাতের প্রয়োগ: উচ্চতা ও দূরত্ব**
* কষে দেখি - অনুশীলনী 25
**অধ্যায় ২৬: রাশিবিজ্ঞান: গড়, মধ্যমা, ওজাইভ, সংখ্যাগুরুমান**
* কষে দেখি - অনুশীলনী 26.1
* কষে দেখি - অনুশীলনী 26.2
* কষে দেখি - অনুশীলনী 26.3
* কষে দেখি - অনুশীলনী 26.4
`;

const lines = rawData.trim().split('\n').map(l => l.trim()).filter(l => l);

const chapters = [];
const topics = [];

let currentChapterIndex = 0;
let currentTopicIndex = 0;
let currentChapter = null;

lines.forEach(line => {
  if (line.startsWith('**')) { // It's a chapter
    currentChapterIndex++;
    currentTopicIndex = 0;
    
    // Removing the ** and creating the title
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
    
    const title = line.replace(/^\*/, '').trim();
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


// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Ganit Prakash (Class 10)');
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
