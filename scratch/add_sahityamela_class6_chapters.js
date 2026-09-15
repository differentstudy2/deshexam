const fs = require('fs');

const textbook = {
  "id": "textbook-sahityamela-class-6-wb",
  "title": "Sahityamela",
  "slug": "sahityamela",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-bengali-literature-class-6-wb",
  "orderIndex": 12,
  "status": "published",
  "fullSlug": "wb-board/class-6/bengali-literature/sahityamela",
  "boardSlug": "wb-board",
  "classSlug": "class-6",
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
      "id": "class-6-wb",
      "slug": "class-6",
      "title": "Class 6",
      "type": "class"
    },
    {
      "id": "subject-bengali-literature-class-6-wb",
      "slug": "bengali-literature",
      "title": "Bengali Literature",
      "type": "subject"
    },
    {
      "id": "textbook-sahityamela-class-6-wb",
      "slug": "sahityamela",
      "title": "Sahityamela",
      "type": "textbook"
    }
  ]
};

const chaptersData = [
  { prefix: "পাঠ ১", title: "ভরদুপুরে", author: "নীরেন্দ্রনাথ চক্রবর্তী", slug: "vordupure" },
  { prefix: "পাঠ ২", title: "সেনাপতি শংকর", author: "শ্যামল গঙ্গোপাধ্যায়", slug: "senapati-shankar" },
  { prefix: "পাঠ ৩", title: "পাইন দাঁড়িয়ে আকাশে নয়ন তুলি", author: "হাইনরিখ হাইনে", slug: "pine-dariye-akashe-nayan-tuli" },
  { prefix: "পাঠ ৩.১", title: "আকাশভরা সূর্য-তারা (গান)", author: "রবীন্দ্রনাথ ঠাকুর", slug: "akashbhara-surjo-tara" },
  { prefix: "পাঠ ৪", title: "মন-ভালো-করা", author: "শক্তি চট্টোপাধ্যায়", slug: "mon-valo-kora" },
  { prefix: "পাঠ ৫", title: "পশু-পাখির ভাষা", author: "সুবিনয় রায়চৌধুরী", slug: "poshu-pakhir-bhasha" },
  { prefix: "পাঠ ৬", title: "ঘাস ফড়িং", author: "অরুণ মিত্র", slug: "ghash-foring" },
  { prefix: "পাঠ ৭", title: "কুমোরে-পোকার বাসাবাড়ি", author: "গোপালচন্দ্র ভট্টাচার্য", slug: "kumore-pokar-bashabari" },
  { prefix: "পাঠ ৮", title: "চিঠি", author: "জসীমউদ্দীন", slug: "chithi" },
  { prefix: "পাঠ ৯", title: "মরশুমের দিনে", author: "সুভাষ মুখোপাধ্যায়", slug: "morshumer-dine" },
  { prefix: "পাঠ ১০", title: "হাট", author: "যতীন্দ্রনাথ সেনগুপ্ত", slug: "hat" },
  { prefix: "পাঠ ১১", title: "মাটির ঘরে দেয়ালচিত্র", author: "তপন কর", slug: "matir-ghore-deyalchitro" },
  { prefix: "পাঠ ১১.১", title: "ঝুমুর (গান)", author: "দুর্যোধন দাস", slug: "jhumur" },
  { prefix: "পাঠ ১২", title: "পিঁপড়ে", author: "অমিয় চক্রবর্তী", slug: "pipre" },
  { prefix: "পাঠ ১৩", title: "ফাঁকি", author: "রাজকিশোর পট্টনায়ক", slug: "faki" },
  { prefix: "পাঠ ১৩.১", title: "উজ্জ্বল এক ঝাঁক পায়রা (গান)", author: "বিমলচন্দ্র ঘোষ", slug: "ujjwal-ek-jhak-payra" },
  { prefix: "পাঠ ১৪", title: "চিত্রগ্রীব", author: "ধনগোপাল মুখোপাধ্যায়", slug: "chitrogrib" },
  { prefix: "পাঠ ১৫", title: "আশীর্বাদ", author: "দক্ষিণারঞ্জন মিত্র মজুমদার", slug: "ashirbad" },
  { prefix: "পাঠ ১৬", title: "এক ভূতুড়ে কাণ্ড", author: "শিবরাম চক্রবর্তী", slug: "ek-bhuture-kando" },
  { prefix: "পাঠ ১৭", title: "বাঘ", author: "নবনীতা দেবসেন", slug: "bagh" },
  { prefix: "পাঠ ১৮", title: "বঙ্গ আমার জননী আমার", author: "দ্বিজেন্দ্রলাল রায়", slug: "bongo-amar-jononi-amar" },
  { prefix: "পাঠ ১৯", title: "শহিদ যতীন্দ্রনাথ", author: "আশিসকুমার মুখোপাধ্যায়", slug: "shahid-jatindranath" },
  { prefix: "পাঠ ১৯.১", title: "চল রে চল সবে (গান)", author: "জ্যোতিরিন্দ্রনাথ ঠাকুর", slug: "chol-re-chol-sobe" },
  { prefix: "পাঠ ২০", title: "মোরা দুই সহোদর ভাই", author: "কাজী নজরুল ইসলাম", slug: "mora-dui-sohodor-bhai" },
  { prefix: "পাঠ ২১", title: "ধরাতল", author: "রবীন্দ্রনাথ ঠাকুর", slug: "dhoratol" },
  { prefix: "পাঠ ২২", title: "হাবুর বিপদ", author: "অজয় রায়", slug: "habur-bipod" },
  { prefix: "পাঠ ২৩", title: "কিশোর বিজ্ঞানী", author: "অন্নদাশঙ্কর রায়", slug: "kishor-biggani" },
  { prefix: "পাঠ ২৪", title: "ননীদা নট আউট", author: "মতি নন্দী", slug: "nonida-not-out" }
];

const chapters = chaptersData.map((data, index) => {
  const fullTitle = data.prefix ? `${data.prefix}: ${data.title}` : data.title;
  return {
    id: `chapter-${data.slug}-${textbook.slug}-class-6`,
    title: fullTitle,
    author: data.author,
    slug: data.slug,
    type: "chapter",
    track: textbook.track,
    parentId: textbook.id,
    orderIndex: index + 1,
    status: "published",
    fullSlug: `${textbook.fullSlug}/${data.slug}`,
    boardSlug: textbook.boardSlug,
    classSlug: textbook.classSlug,
    subjectSlug: textbook.subjectSlug,
    textbookSlug: textbook.slug,
    chapterSlug: data.slug,
    isIndexable: true,
    isHardcoded: true,
    ancestors: [
      ...textbook.ancestors,
      {
        id: `chapter-${data.slug}-${textbook.slug}-class-6`,
        slug: data.slug,
        title: fullTitle,
        type: "chapter"
      }
    ]
  };
});

const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));

const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);

fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters for Sahityamela Class 6.`);
