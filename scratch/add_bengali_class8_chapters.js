const fs = require('fs');

const rawData = `
১. প্রথম পাঠ
বোঝাপড়া — রবীন্দ্রনাথ ঠাকুর
অদ্ভুত আতিথেয়তা — ঈশ্বরচন্দ্র বিদ্যাসাগর
প্রাণ ভরিয়ে — রবীন্দ্রনাথ ঠাকুর
চন্দ্রগুপ্ত — দ্বিজেন্দ্রলাল রায়
২. দ্বিতীয় পাঠ
বনভোজনের ব্যাপার — নারায়ণ গঙ্গোপাধ্যায়
সবুজ জামা — বীরেন্দ্র চট্টোপাধ্যায়
চিঠি — মাইকেল মধুসূদন দত্ত
মিলিয়ে পড়ো : নিখিল বঙ্গ কবিতা সংঘ — নলিনী দাশ
মিলিয়ে পড়ো : আলাপ — পূর্ণেন্দু পত্রী
৩. তৃতীয় পাঠ
পরবাসী — বিষ্ণু দে
পথচলতি — সুনীতিকুমার চট্টোপাধ্যায়
একটি চড়ুই পাখি — তারাপদ রায়
৪. চতুর্থ পাঠ
দাঁড়াও — শক্তি চট্টোপাধ্যায়
পল্লীসমাজ — শরৎচন্দ্র চট্টোপাধ্যায়
ছন্নছাড়া — অচিন্ত্যকুমার সেনগুপ্ত
গাঁয়ের বধু — সলিল চৌধুরী
৫. পঞ্চম পাঠ
গাছের কথা — জগদীশচন্দ্র বসু
হাওয়ার গান — বুদ্ধদেব বসু
কী করে বুঝব — আশাপূর্ণা দেবী
৬. ষষ্ঠ পাঠ
পাড়াগাঁর দু-প্রহর ভালোবাসি — জীবনানন্দ দাশ
নাটোরের কথা — অবনীন্দ্রনাথ ঠাকুর
গড়াই নদীর তীরে — জসীমউদ্দীন
আষাঢ়ের কোন ভেজা পথে — বিজয় সরকার
মিলিয়ে পড়ো : স্বাদেশিকতা — রবীন্দ্রনাথ ঠাকুর
৭. সপ্তম পাঠ
জেলখানার চিঠি — সুভাষচন্দ্র বসু
স্বাধীনতা — ল্যাংস্টন হিউজ
আদাব — সমরেশ বসু
ভয় কি মরণে — মুকুন্দদাস
শিকল-পরার গান — কাজী নজরুল ইসলাম
৮. অষ্টম পাঠ
হরিচরণ বন্দ্যোপাধ্যায় — হীরেন্দ্রনাথ দত্ত
ঘুরে দাঁড়াও — প্রণবেন্দু দাশগুপ্ত
সুভা — রবীন্দ্রনাথ ঠাকুর
মিলিয়ে পড়ো : ভালোবাসা কি বৃথা যায়? — শিবনাথ শাস্ত্রী
৯. নবম পাঠ
পরাজয় — শান্তিপ্রিয় বন্দ্যোপাধ্যায়
মাসিপিসি — জয় গোস্বামী
টিকিটের অ্যালবাম — সুন্দর রামস্বামী
লোকটা জানলই না — সুভাষ মুখোপাধ্যায়
`;

const textbook = {
  "id": "textbook-sahityamela-class-8-wb",
  "title": "Sahityamela",
  "slug": "sahityamela",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-bengali-literature-class-8-wb",
  "orderIndex": 18,
  "status": "published",
  "fullSlug": "wb-board/class-8/bengali-literature/sahityamela",
  "boardSlug": "wb-board",
  "classSlug": "class-8",
  "subjectSlug": "bengali-literature",
  "textbookSlug": "sahityamela",
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
      "id": "subject-bengali-literature-class-8-wb",
      "slug": "bengali-literature",
      "title": "Bengali Literature",
      "type": "subject"
    }
  ]
};

function generateSlug(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || Math.random().toString(36).substring(7);
}

const lines = rawData.trim().split('\n').map(l => l.trim()).filter(l => l);

const chapters = [];
const topics = [];

let currentChapterIndex = 0;
let currentTopicIndex = 0;
let currentChapter = null;

lines.forEach(line => {
  if (line.match(/^[০-৯]+[\.|\s]/) || line.includes(" পাঠ")) { // It's a chapter
    currentChapterIndex++;
    currentTopicIndex = 0;
    
    // Convert numbers to bangla optionally, but here we just take the title
    const match = line.match(/^[০-৯]+[\.|\s]+(.*)/);
    const title = match ? match[1] : line;
    const slug = `path-${currentChapterIndex}`;
    
    const chapterId = `chapter-${slug}-${textbook.slug}-class-8`;
    const fullTitle = line;
    
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
  } else {
    // It's a topic
    if (!currentChapter) return;
    currentTopicIndex++;
    
    const parts = line.split('—');
    const title = parts[0].trim();
    const author = parts.length > 1 ? parts[1].trim() : undefined;
    
    // Since bengali text becomes empty slug using the naive regex, we use a custom approach or transliterate
    // For simplicity, we just use chapter-topic-index
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
