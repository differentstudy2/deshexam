const fs = require('fs');

const textbook = {
  "id": "textbook-poribesh-o-bigyan-class-7-wb",
  "title": "Poribesh O Bigyan",
  "slug": "poribesh-o-bigyan",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-science-class-7-wb",
  "orderIndex": 18,
  "status": "published",
  "fullSlug": "wb-board/class-7/science/poribesh-o-bigyan",
  "boardSlug": "wb-board",
  "classSlug": "class-7",
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
      "id": "class-7-wb",
      "slug": "class-7",
      "title": "Class 7",
      "type": "class"
    },
    {
      "id": "subject-science-class-7-wb",
      "slug": "science",
      "title": "Science",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "ভৌত পরিবেশ", slug: "bhouto-poribesh", topics: [
      { prefix: "", title: "তাপ", slug: "tap" },
      { prefix: "", title: "আলো", slug: "alo" },
      { prefix: "", title: "চুম্বক", slug: "chumbok" },
      { prefix: "", title: "তড়িৎ", slug: "torit" },
      { prefix: "", title: "পরিবেশবান্ধব শক্তি", slug: "poribeshbandhob-shokti" }
  ]},
  { prefix: "অধ্যায় ২", title: "সময় ও গতি", slug: "shomoy-o-goti" },
  { prefix: "অধ্যায় ৩", title: "পরমাণু, অনু ও রাসায়নিক বিক্রিয়া", slug: "poromanu-onu-o-rashayonik-bikriya" },
  { prefix: "অধ্যায় ৪", title: "পরিবেশ গঠনে পদার্থের ভূমিকা", slug: "poribesh-gothone-podarther-bhumika" },
  { prefix: "অধ্যায় ৫", title: "মানুষের খাদ্য", slug: "manusher-khaddo" },
  { prefix: "অধ্যায় ৬", title: "পরিবেশের সজীব উপাদানের গঠনগত বৈচিত্র ও কার্যগত প্রক্রিয়া", slug: "poribesher-sojib-upadaner-gothongoto-boichitro" },
  { prefix: "অধ্যায় ৭", title: "পরিবেশের সংকট, উদ্ভিদ ও পরিবেশের সংরক্ষণ", slug: "poribesher-shongkot-udbhid-o-shongrokkhon" },
  { prefix: "অধ্যায় ৮", title: "পরিবেশ ও জনস্বাস্থ্য", slug: "poribesh-o-jonoshastho" },
  { prefix: "", title: "পাঠ্যসূচি ও নমুনা প্রশ্ন", slug: "pathyoshuchi-o-nomuna-proshno" },
  { prefix: "", title: "শিখন পরামর্শ", slug: "shikhon-poramorsho" }
];

const generatedChapters = [];
const generatedTopics = [];

chaptersData.forEach((data, index) => {
  const fullTitle = data.prefix ? `${data.prefix}: ${data.title}` : data.title;
  const chapterSlug = data.slug;
  const chapterId = `chapter-${chapterSlug}-${textbook.slug}-class-7`;

  const chapter = {
    id: chapterId,
    title: fullTitle,
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
        title: fullTitle,
        type: "chapter"
      }
    ]
  };
  
  generatedChapters.push(chapter);

  if (data.topics && data.topics.length > 0) {
    data.topics.forEach((tData, tIndex) => {
      const topicFullTitle = tData.prefix ? `${tData.prefix}: ${tData.title}` : tData.title;
      const topicSlug = tData.slug;
      const topicId = `topic-${topicSlug}-${chapterSlug}-class-7`;

      const topic = {
        id: topicId,
        title: topicFullTitle,
        slug: topicSlug,
        type: "topic",
        track: textbook.track,
        parentId: chapterId,
        orderIndex: tIndex + 1,
        status: "published",
        fullSlug: `${chapter.fullSlug}/${topicSlug}`,
        boardSlug: textbook.boardSlug,
        classSlug: textbook.classSlug,
        subjectSlug: textbook.subjectSlug,
        textbookSlug: textbook.slug,
        chapterSlug: chapterSlug,
        topicSlug: topicSlug,
        isIndexable: true,
        isHardcoded: true,
        ancestors: [
          ...chapter.ancestors,
          {
            id: topicId,
            slug: topicSlug,
            title: topicFullTitle,
            type: "topic"
          }
        ]
      };
      generatedTopics.push(topic);
    });
  }
});

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = generatedChapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);

// Update Topics
const topicsPath = './src/data/hardcoded/taxonomy/topics.json';
let existingTopics = [];
if (fs.existsSync(topicsPath)) {
    existingTopics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
}
const newTopics = generatedTopics.filter(t => !existingTopics.find(et => et.id === t.id));
existingTopics.push(...newTopics);
fs.writeFileSync(topicsPath, JSON.stringify(existingTopics, null, 2));
console.log(`Added ${newTopics.length} topics.`);
