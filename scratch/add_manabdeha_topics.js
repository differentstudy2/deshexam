const fs = require('fs');
const path = require('path');

const topicsFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/topics.json');
const indexFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/index.ts');

const chapterId = 'chapter-manabdeha-amader-paribesh';

const ancestors = [
  { "id": "board-wb", "slug": "wb-board", "title": "WBBSE", "type": "board" },
  { "id": "class-5-wb", "slug": "class-5", "title": "Class 5", "type": "class" },
  { "id": "subject-evs-class-5-wb", "slug": "environmental-science", "title": "Environmental Science", "type": "subject" },
  { "id": "textbook-amader-paribesh", "slug": "amader-paribesh", "title": "Amader Paribesh", "type": "textbook" },
  { "id": "chapter-manabdeha-amader-paribesh", "slug": "manabdeha", "title": "মানবদেহ", "type": "chapter" }
];

const topicTitles = [
  "শরীরের বর্ম",
  "ত্বক কোথায় পাতলা, কোথায় পুরু",
  "ত্বকের উপর-নীচ",
  "কোঁকড়ানো আর কালো",
  "চুলের সাতকাহন",
  "শজারুর কাঁটা",
  "নখের নীচে রক্ত",
  "নরম নরম থাবার নীচে লুকানো তার নখ",
  "ছোটো-বড়ো হাড়ের কথা",
  "অস্থিসন্ধির হিসেবনিকেশ",
  "পেশি নিয়ে কিছু কথা",
  "স্টেথোস্কোপে শোনা",
  "বাতাসে ওড়ে জীবাণু",
  "জলের সঙ্গে জীবাণু",
  "কেমনভাবে স্টেথোস্কোপ এল?"
];

// Provide phonetic transliterated slugs for nicer URLs
const enSlugs = [
  "shorirer-bormo",
  "twok-kothay-patla-kothay-puru",
  "twoker-upor-nich",
  "kokrano-ar-kalo",
  "chuler-satkahon",
  "sojarur-kanta",
  "nokher-niche-rokto",
  "norom-norom-thabar-niche-lukano-tar-nokh",
  "choto-boro-harer-kotha",
  "osthisondhir-hisebnikesh",
  "peshi-niye-kichu-kotha",
  "stethoscope-shona",
  "batase-ore-jibanu",
  "joler-songe-jibanu",
  "kemonbhabe-stethoscope-elo"
];

let existingTopics = [];
if (fs.existsSync(topicsFile)) {
  try {
    existingTopics = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
  } catch (e) {}
}

const newTopics = topicTitles.map((title, i) => {
  const slug = enSlugs[i];
  return {
    id: `topic-${slug}-manabdeha`,
    title: title,
    slug: slug,
    type: "topic",
    track: "academic",
    parentId: chapterId,
    orderIndex: i + 1,
    status: "published",
    fullSlug: `wb-board/class-5/environmental-science/amader-paribesh/manabdeha/${slug}`,
    boardSlug: "wb-board",
    classSlug: "class-5",
    subjectSlug: "environmental-science",
    textbookSlug: "amader-paribesh",
    chapterSlug: "manabdeha",
    topicSlug: slug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: ancestors
  };
});

existingTopics.push(...newTopics);
fs.writeFileSync(topicsFile, JSON.stringify(existingTopics, null, 2));

// update index.ts
let indexTs = fs.readFileSync(indexFile, 'utf8');
indexTs = indexTs.replace(/\/\/ import topics from '.\/topics.json';/, "import topics from './topics.json';");
indexTs = indexTs.replace(/\/\/ \.\.\.\(topics as TaxonomyNode\[\]\),/, "...(topics as TaxonomyNode[]),");
fs.writeFileSync(indexFile, indexTs);

console.log("Topics added successfully!");
