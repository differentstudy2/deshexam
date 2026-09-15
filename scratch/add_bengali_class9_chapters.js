const fs = require('fs');

const rawData = `
প্রথম পাঠ
কলিঙ্গদেশে ঝড়-বৃষ্টি - মুকুন্দ চক্রবর্তী
ইলিয়াস - লিও তলস্তয়
ধীবর-বৃত্তান্ত - কালিদাস
সাত ভাই চম্পা - বিষ্ণু দে

দ্বিতীয় পাঠ
দাম - নারায়ণ গঙ্গোপাধ্যায়
নব নব সৃষ্টি - সৈয়দ মুজতবা আলী
নূতন জীবন - হিরন্ময়ী দেবী
এই জীবন - সুনীল গঙ্গোপাধ্যায়
ঝোড়ো সাধু - মহাস্বেতা দেবী

তৃতীয় পাঠ
পথে প্রবাসে - অন্নদাশঙ্কর রায়
হিমালয় দর্শন - বেগম রোকেয়া
ঘর - অমিয় চক্রবর্তী
নোঙর - অজিত দত্ত

চতুর্থ পাঠ
পালামৌ - সঞ্জীবচন্দ্র চট্টোপাধ্যায়
আকাশে সাতটি তারা - জীবনানন্দ দাশ
বর্ষা - প্রমথ চৌধুরী
খেয়া - রবীন্দ্রনাথ ঠাকুর
আবহমান - নীরেন্দ্রনাথ চক্রবর্তী

পঞ্চম পাঠ
উসোস - বিভূতিভূষণ মুখোপাধ্যায়
চিঠি - স্বামী বিবেকানন্দ
ভাঙার গান - কাজী নজরুল ইসলাম
আমরা - সত্যেন্দ্রনাথ দত্ত

ষষ্ঠ পাঠ
নিরুদ্দেশ - প্রেমেন্দ্র মিত্র
রাধারানী - বঙ্কিমচন্দ্র চট্টোপাধ্যায়
ব্যথার বাঁশি - জসীমউদ্দীন
জন্মভূমি আজ - বীরেন্দ্র চট্টোপাধ্যায়
এই তার পরিচয় - কবিতা সিংহ
ছুটি - রবীন্দ্রনাথ ঠাকুর
চন্দ্রনাথ - তারাশঙ্কর বন্দ্যোপাধ্যায়

অন্যান্য অংশ
লেখক পরিচিতি
শিখন পরামর্শ
`;

const textbook = {
  "id": "textbook-sahitya-sanchayan-class-9-wb",
  "title": "Sahitya Sanchayan",
  "slug": "sahitya-sanchayan",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-bengali-literature-class-9-wb",
  "orderIndex": 29,
  "status": "published",
  "fullSlug": "wb-board/class-9/bengali-literature/sahitya-sanchayan",
  "boardSlug": "wb-board",
  "classSlug": "class-9",
  "subjectSlug": "bengali-literature",
  "textbookSlug": "sahitya-sanchayan",
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
      "id": "subject-bengali-literature-class-9-wb",
      "slug": "bengali-literature",
      "title": "Bengali Literature",
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
  if (line.includes("পাঠ") || line.includes("অংশ")) { // It's a chapter
    currentChapterIndex++;
    currentTopicIndex = 0;
    
    const title = line;
    const slug = `path-${currentChapterIndex}`;
    
    const chapterId = `chapter-${slug}-${textbook.slug}-class-9`;
    
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
  } else {
    // It's a topic
    if (!currentChapter) return;
    currentTopicIndex++;
    
    const parts = line.split('-');
    const title = parts[0].trim();
    const author = parts.length > 1 ? parts[1].trim() : undefined;
    
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
      author: author,
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
