const fs = require('fs');

const textbook = {
  "id": "textbook-sahitya-sanchayan-class-10-wb",
  "title": "Sahitya Sanchayan",
  "slug": "sahitya-sanchayan",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-bengali-literature-class-10-wb",
  "orderIndex": 32,
  "status": "published",
  "fullSlug": "wb-board/class-10/bengali-literature/sahitya-sanchayan",
  "boardSlug": "wb-board",
  "classSlug": "class-10",
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
      "id": "class-10-wb",
      "slug": "class-10",
      "title": "Class 10",
      "type": "class"
    },
    {
      "id": "subject-bengali-literature-class-10-wb",
      "slug": "bengali-literature",
      "title": "Bengali Literature",
      "type": "subject"
    }
  ]
};

const rawData = `
গল্প (Stories)
জ্ঞানচক্ষু – আশাপূর্ণা দেবী
বহুরূপী – সুবোধ ঘোষ
পথের দাবী – শরৎচন্দ্র চট্টোপাধ্যায়
অদল বদল – পান্নালাল প্যাটেল
নদীর বিদ্রোহ – মানিক বন্দ্যোপাধ্যায়
কবিতা (Poems)
অসুখী একজন – পাবলো নেরুদা
আয় আরো বেঁধে বেঁধে থাকি – শঙ্খ ঘোষ
আফ্রিকা – রবীন্দ্রনাথ ঠাকুর
অভিষেক – মাইকেল মধুসূদন দত্ত
প্রলয়োল্লাস – কাজী নজরুল ইসলাম
সিন্ধুতীরে – সৈয়দ আলাওল
অস্ত্রের বিরুদ্ধে গান – জয় গোস্বামী
প্রবন্ধ ও নাটক (Essays & Drama)
প্রবন্ধ: হারিয়ে যাওয়া কালি কলম – শ্রীপান্থ
প্রবন্ধ: বাংলা ভাষায় বিজ্ঞান – রাজশেখর বসু
নাটক: সিরাজদ্দৌলা – শচীন্দ্রনাথ সেনগুপ্ত
`;

const lines = rawData.trim().split('\n').map(l => l.trim()).filter(l => l);

const chapters = [];
const topics = [];

let currentChapterIndex = 0;
let currentTopicIndex = 0;
let currentChapter = null;

lines.forEach(line => {
  if (line.includes("(") && line.includes(")")) { // It's a chapter like "গল্প (Stories)"
    currentChapterIndex++;
    currentTopicIndex = 0;
    
    const title = line;
    const slug = `part-${currentChapterIndex}`;
    
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
  } else {
    // It's a topic
    if (!currentChapter) return;
    currentTopicIndex++;
    
    const parts = line.split('–'); // Uses an en-dash
    let title = parts[0].trim();
    let author = parts.length > 1 ? parts[1].trim() : undefined;
    
    // In "প্রবন্ধ: হারিয়ে যাওয়া কালি কলম", we want to just keep it as title, or split by ": "
    // Keeping it as is is fine.
    
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
