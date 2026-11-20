const fs = require('fs');

const textbook = {
  "id": "textbook-ganit-prabha-class-7-wb",
  "title": "Ganit Prabha",
  "slug": "ganit-prabha",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-mathematics-class-7-wb",
  "orderIndex": 16,
  "status": "published",
  "fullSlug": "wb-board/class-7/mathematics/ganit-prabha",
  "boardSlug": "wb-board",
  "classSlug": "class-7",
  "subjectSlug": "mathematics",
  "textbookSlug": "ganit-prabha",
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
      "id": "subject-mathematics-class-7-wb",
      "slug": "mathematics",
      "title": "Mathematics",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "পূর্বপাঠের পুনরালোচনা", slug: "purbopather-punoralochona" },
  { prefix: "অধ্যায় ২", title: "অনুপাত", slug: "onupat" },
  { prefix: "অধ্যায় ৩", title: "সমানুপাত", slug: "somanupat" },
  { prefix: "অধ্যায় ৪", title: "পূর্ণসংখ্যার যোগ, বিয়োগ, গুণ ও ভাগ", slug: "purnosonkhyar-jog-biyog-gun-o-bhag" },
  { prefix: "অধ্যায় ৫", title: "সূচকের ধারণা", slug: "suchoker-dharona" },
  { prefix: "অধ্যায় ৬", title: "বীজগাণিতিক পক্রিয়া", slug: "bijganitik-prokriya" },
  { prefix: "অধ্যায় ৭", title: "কম্পাসের সাহায্যে নির্দিষ্ট কোণ অঙ্কন", slug: "kompaser-sahajje-nirdishto-kon-ongkon" },
  { prefix: "অধ্যায় ৮", title: "ত্রিভুজ অঙ্কন", slug: "tribhuj-ongkon" },
  { prefix: "অধ্যায় ৯", title: "সর্বসমতার ধারণা", slug: "sorbosomotar-dharona" },
  { prefix: "অধ্যায় ১০", title: "আসন্নমান", slug: "asonnoman" },
  { prefix: "অধ্যায় ১১", title: "ভগ্নাংশের বর্গমূল", slug: "vognangsher-borgomul" },
  { prefix: "অধ্যায় ১২", title: "বীজগাণিতিক সূত্রাবলি", slug: "bijganitik-sutraboli" },
  { prefix: "অধ্যায় ১৩", title: "সমান্তরাল সরলরেখা ও ছেদকের ধারণা", slug: "somantoral-sorolrekha-o-chedoker-dharona" },
  { prefix: "অধ্যায় ১৪", title: "ত্রিভুজের ধর্ম", slug: "tribhujer-dhormo" },
  { prefix: "অধ্যায় ১৫", title: "সময় ও দূরত্ব", slug: "somoy-o-durotto" },
  { prefix: "অধ্যায় ১৬", title: "দ্বি-স্তম্ভ লেখ", slug: "dwi-stombho-lekh" },
  { prefix: "অধ্যায় ১৭", title: "আয়তক্ষেত্র ও বর্গক্ষেত্রের ক্ষেত্রফল", slug: "ayotokkhetro-o-borgokkhetrer-khetrophol" },
  { prefix: "অধ্যায় ১৮", title: "প্রতিসাম্য", slug: "protisammyo" },
  { prefix: "অধ্যায় ১৯", title: "উৎপাদকে বিশ্লেষণ", slug: "utpadoke-bisleshon" },
  { prefix: "অধ্যায় ২০", title: "চতুর্ভুজের শ্রেণিবিভাগ", slug: "choturbhujer-srenibibhag" },
  { prefix: "অধ্যায় ২১", title: "চতুর্ভুজ অঙ্কন", slug: "choturbhuj-ongkon" },
  { prefix: "অধ্যায় ২২", title: "সমীকরণ গঠন ও সমাধান", slug: "somikoron-gothon-o-somadhan" }
];

const generatedChapters = [];

chaptersData.forEach((data, index) => {
  const fullTitle = `${data.prefix}: ${data.title}`;
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
});

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = generatedChapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters for Class 7 Ganit Prabha.`);
