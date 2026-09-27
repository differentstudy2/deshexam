const fs = require('fs');

const textbook = {
  "id": "textbook-ganit-prabha-class-8-wb",
  "title": "Ganit Prabha",
  "slug": "ganit-prabha",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-mathematics-class-8-wb",
  "orderIndex": 21,
  "status": "published",
  "fullSlug": "wb-board/class-8/mathematics/ganit-prabha",
  "boardSlug": "wb-board",
  "classSlug": "class-8",
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
      "id": "class-8-wb",
      "slug": "class-8",
      "title": "Class 8",
      "type": "class"
    },
    {
      "id": "subject-mathematics-class-8-wb",
      "slug": "mathematics",
      "title": "Mathematics",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "পূর্বপাঠের পুনরালোচনা", slug: "purbopather-punoralochona" },
  { prefix: "অধ্যায় ২", title: "পাই চিত্র", slug: "pai-chitro" },
  { prefix: "অধ্যায় ৩", title: "মূলদ সংখ্যার ধারণা", slug: "mulodo-sonkhyar-dharona" },
  { prefix: "অধ্যায় ৪", title: "বহুপদী সংখ্যামালার গুণ ও ভাগ", slug: "bohupodi-sonkhamalar-gun-o-bhag" },
  { prefix: "অধ্যায় ৫", title: "ঘনফল নির্ণয়", slug: "ghonophol-nirnoy" },
  { prefix: "অধ্যায় ৬", title: "পূরক কোণ, সম্পূরক কোণ ও সন্নিহিত কোণ", slug: "purok-kon-sompurok-kon-o-sonnihito-kon" },
  { prefix: "অধ্যায় ৭", title: "বিপ্রতীপ কোণের ধারণা", slug: "biprotip-koner-dharona" },
  { prefix: "অধ্যায় ৮", title: "সমান্তরাল সরলরেখা ও ছেদকের ধর্ম", slug: "somantoral-sorolrekha-o-chedoker-dhormo" },
  { prefix: "অধ্যায় ৯", title: "ত্রিভুজের দুটি বাহু ও তাদের বিপরীত কোণের সম্পর্ক", slug: "tribhujer-duti-bahu-o-tader-biporit-koner-somporko" },
  { prefix: "অধ্যায় ১০", title: "ত্রৈরাশিক", slug: "troirashik" },
  { prefix: "অধ্যায় ১১", title: "শতকরা", slug: "shotkora" },
  { prefix: "অধ্যায় ১২", title: "মিশ্রণ", slug: "misron" },
  { prefix: "অধ্যায় ১৩", title: "বীজগাণিতিক সংখ্যামালার উৎপাদকে বিশ্লেষণ", slug: "bijganitik-sonkhamalar-utpadoke-bishleshon" },
  { prefix: "অধ্যায় ১৪", title: "বীজগাণিতিক সংখ্যামালার গ.সা.গু ও ল.সা.গু. (গরিষ্ঠ সাধারণ গুণনীয়ক ও লঘিষ্ঠ সাধারণ গুণিতক)", slug: "bijganitik-sonkhamalar-gosagu-o-losagu" },
  { prefix: "অধ্যায় ১৫", title: "বীজগাণিতিক সংখ্যামালার সরলীকরণ", slug: "bijganitik-sonkhamalar-sorolikoron" },
  { prefix: "অধ্যায় ১৬", title: "ত্রিভুজের কোণ ও বাহুর মধ্যে সম্পর্কের যাচাই", slug: "tribhujer-kon-o-bahur-modhye-somporker-jachai" },
  { prefix: "অধ্যায় ১৭", title: "সময় ও কার্য", slug: "somoy-o-karjo" },
  { prefix: "অধ্যায় ১৮", title: "লেখচিত্র", slug: "lekh-chitro" },
  { prefix: "অধ্যায় ১৯", title: "সমীকরণ গঠন ও সমাধান", slug: "somikoron-gothon-o-somadhan" },
  { prefix: "অধ্যায় ২০", title: "জ্যামিতিক প্রমাণ", slug: "jyamitik-proman" },
  { prefix: "অধ্যায় ২১", title: "ত্রিভুজ অঙ্কন", slug: "tribhuj-ongkon" },
  { prefix: "অধ্যায় ২২", title: "সমান্তরাল সরলরেখা অঙ্কন", slug: "somantoral-sorolrekha-ongkon" },
  { prefix: "অধ্যায় ২৩", title: "প্রদত্ত সরলরেখাংশকে সমান তিনটি, পাঁচটি ভাগে বিভক্ত করা", slug: "prodott-sorolrekhangshoke-soman-tin-pach-bhage-bibhokto-kora" }
];

const generatedChapters = [];

chaptersData.forEach((data, index) => {
  const fullTitle = `${data.prefix}: ${data.title}`;
  const chapterSlug = data.slug;
  const chapterId = `chapter-${chapterSlug}-${textbook.slug}-class-8`;

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
console.log(`Added ${newChapters.length} chapters for Class 8 Ganit Prabha.`);
