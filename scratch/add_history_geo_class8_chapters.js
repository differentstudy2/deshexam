const fs = require('fs');

const historyRaw = `
১. ইতিহাসের ধারণা (Concept of History)
২. আঞ্চলিক শক্তির উত্থান (Rise of Regional Powers)
৩. ঔপনিবেশিক কর্তৃত্ব প্রতিষ্ঠা (Establishment of Colonial Authority)
৪. ঔপনিবেশিক অর্থনীতি ও দরিদ্রতা (Colonial Economy & Poverty)
৫. ঔপনিবেশিক শাসনের প্রতিক্রিয়া : সহযোগিতা ও বিদ্রোহ (Reaction to Colonial Rule : Cooperation & Revolt)
৬. জাতীয়তাবাদের প্রাথমিক বিকাশ (Early Development of Nationalism)
৭. ভারতের জাতীয় আন্দোলনের আদর্শ ও বিবর্তন (Ideals & Evolution of Indian National Movement)
৮. সাম্প্রদায়িকতা থেকে দেশভাগ (Communalism to Partition)
৯. ভারতীয় সংবিধান : গণতন্ত্রের কাঠামো ও জনগণের অধিকার (Indian Constitution : Structure of Democracy & Rights of People)
`;

const geoRaw = `
1
[🌍পৃথিবীর অন্দরমহলInterior of the Earth](...)
2
[🔄অস্থিত পৃথিবীRestless Earth](...)
3
[🪨শিলাRocks](...)
4
[💨চাপবলয় ও বায়ুপ্রবাহPressure Belts & Wind Flow](...)
5
[🌧️মেঘ-বৃষ্টিClouds & Rain](...)
6
[☀️জলবায়ু অঞ্চলClimate Zones](...)
7
[🏭মানুষের কার্যাবলি ও পরিবেশের অবনমনHuman Activities & Environmental Degradation](...)
8
[🌏ভারতের প্রতিবেশী দেশসমূহ ও তাদের সঙ্গে সম্পর্কIndia's Neighbouring Countries & Relations](...)
9
[🏔️উত্তর আমেরিকাNorth America](...)
10
[🗿দক্ষিণ আমেরিকাSouth America](...)
11
[🏝️ওশিয়ানিয়াOceania](...)
`;

// Define History Textbook
const historyTextbook = {
  "id": "textbook-atit-o-aityaja-class-8-wb",
  "title": "Atit O Aityaja",
  "slug": "atit-o-aityaja",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-history-class-8-wb",
  "fullSlug": "wb-board/class-8/history/atit-o-aityaja",
  "boardSlug": "wb-board",
  "classSlug": "class-8",
  "subjectSlug": "history",
  "ancestors": [
    { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
    { "id": "class-8-wb", "slug": "class-8", "title": "Class 8", "type": "class" },
    { "id": "subject-history-class-8-wb", "slug": "history", "title": "History", "type": "subject" }
  ]
};

// Define Geography Textbook
const geoTextbook = {
  "id": "textbook-amader-prithibi-class-8-wb",
  "title": "Amader Prithibi",
  "slug": "amader-prithibi",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-geography-class-8-wb",
  "fullSlug": "wb-board/class-8/geography/amader-prithibi",
  "boardSlug": "wb-board",
  "classSlug": "class-8",
  "subjectSlug": "geography",
  "ancestors": [
    { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
    { "id": "class-8-wb", "slug": "class-8", "title": "Class 8", "type": "class" },
    { "id": "subject-geography-class-8-wb", "slug": "geography", "title": "Geography", "type": "subject" }
  ]
};

const chapters = [];

// Process History
historyRaw.trim().split('\n').filter(Boolean).forEach((line, i) => {
  const titleMatch = line.match(/^[০-৯]+[\.|\s]+(.*)/);
  const title = titleMatch ? titleMatch[1] : line;
  const slug = `chapter-${i+1}`;
  const chapterId = `chapter-${slug}-${historyTextbook.slug}-class-8`;
  const fullTitle = `অধ্যায় ${i+1}: ${title}`;
  
  chapters.push({
    id: chapterId,
    title: fullTitle,
    slug: slug,
    type: "chapter",
    track: historyTextbook.track,
    parentId: historyTextbook.id,
    orderIndex: i + 1,
    status: "published",
    fullSlug: `${historyTextbook.fullSlug}/${slug}`,
    boardSlug: historyTextbook.boardSlug,
    classSlug: historyTextbook.classSlug,
    subjectSlug: historyTextbook.subjectSlug,
    textbookSlug: historyTextbook.slug,
    chapterSlug: slug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: [
      ...historyTextbook.ancestors,
      { id: historyTextbook.id, slug: historyTextbook.slug, title: historyTextbook.title, type: "textbook" },
      { id: chapterId, slug: slug, title: fullTitle, type: "chapter" }
    ]
  });
});

// Process Geography
// We'll map the names manually since the raw data has emojis and merged words.
const geoData = [
  "পৃথিবীর অন্দরমহল (Interior of the Earth)",
  "অস্থিত পৃথিবী (Restless Earth)",
  "শিলা (Rocks)",
  "চাপবলয় ও বায়ুপ্রবাহ (Pressure Belts & Wind Flow)",
  "মেঘ-বৃষ্টি (Clouds & Rain)",
  "জলবায়ু অঞ্চল (Climate Zones)",
  "মানুষের কার্যাবলি ও পরিবেশের অবনমন (Human Activities & Environmental Degradation)",
  "ভারতের প্রতিবেশী দেশসমূহ ও তাদের সঙ্গে সম্পর্ক (India's Neighbouring Countries & Relations)",
  "উত্তর আমেরিকা (North America)",
  "দক্ষিণ আমেরিকা (South America)",
  "ওশিয়ানিয়া (Oceania)"
];

geoData.forEach((title, i) => {
  const slug = `chapter-${i+1}`;
  const chapterId = `chapter-${slug}-${geoTextbook.slug}-class-8`;
  const fullTitle = `অধ্যায় ${i+1}: ${title}`;
  
  chapters.push({
    id: chapterId,
    title: fullTitle,
    slug: slug,
    type: "chapter",
    track: geoTextbook.track,
    parentId: geoTextbook.id,
    orderIndex: i + 1,
    status: "published",
    fullSlug: `${geoTextbook.fullSlug}/${slug}`,
    boardSlug: geoTextbook.boardSlug,
    classSlug: geoTextbook.classSlug,
    subjectSlug: geoTextbook.subjectSlug,
    textbookSlug: geoTextbook.slug,
    chapterSlug: slug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: [
      ...geoTextbook.ancestors,
      { id: geoTextbook.id, slug: geoTextbook.slug, title: geoTextbook.title, type: "textbook" },
      { id: chapterId, slug: slug, title: fullTitle, type: "chapter" }
    ]
  });
});

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters (History: 9, Geo: 11).`);
