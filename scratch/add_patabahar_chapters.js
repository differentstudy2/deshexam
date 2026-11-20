const fs = require('fs');

const textbook = {
  "id": "textbook-patabahar",
  "title": "Patabahar",
  "slug": "patabahar",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-bengali-lit-class-5-wb",
  "fullSlug": "wb-board/class-5/bengali-literature/patabahar",
  "boardSlug": "wb-board",
  "classSlug": "class-5",
  "subjectSlug": "bengali-literature",
  "textbookSlug": "patabahar",
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
      "id": "class-5-wb",
      "slug": "class-5",
      "title": "Class 5",
      "type": "class"
    },
    {
      "id": "subject-bengali-lit-class-5-wb",
      "slug": "bengali-literature",
      "title": "Bengali Literature",
      "type": "subject"
    },
    {
      "id": "textbook-patabahar",
      "slug": "patabahar",
      "title": "Patabahar",
      "type": "textbook"
    }
  ]
};

const chaptersData = [
  { title: "গল্পবুড়ো", author: "সুনির্মল বসু", slug: "golpoburo" },
  { title: "বুনো হাঁস", author: "লীলা মজুমদার", slug: "buno-hans" },
  { title: "দারোগাবাবু এবং হাবু", author: "ভবানীপ্রসাদ মজুমদার", slug: "darogababu-ebong-habu" },
  { title: "এতোয়া মুন্ডার কাহিনী", author: "মহাশ্বেতা দেবী", slug: "etoa-mundar-kahini" },
  { title: "পাখির কাছে, ফুলের কাছে", author: "আল মাহমুদ", slug: "pakhir-kache-fuler-kache" },
  { title: "ওরে গৃহবাসী (গান)", author: "রবীন্দ্রনাথ ঠাকুর", slug: "ore-grihobasi" },
  { title: "বিমলার অভিমান", author: "নবকৃষ্ণ ভট্টাচার্য", slug: "bimolar-obhiman" },
  { title: "ছেলেবেলা", author: "রবীন্দ্রনাথ ঠাকুর", slug: "chelebela" },
  { title: "মাঠ মানে ছুট", author: "কার্তিক ঘোষ", slug: "math-mane-chut" },
  { title: "পাহাড়িয়া বর্ষার সুরে", author: "প্রচলিত / লোককথা", slug: "paharia-borshar-sure" },
  { title: "লিমেরিক", author: "এডওয়ার্ড লিয়ার (তরজমা: সত্যজিৎ রায়)", slug: "limerick" },
  { title: "ঝড়", author: "মৈত্রেয়ী দেবী", slug: "jhor" },
  { title: "মধু আনতে বাঘের মুখে", author: "শিবশঙ্কর মিত্র", slug: "modhu-ante-bagher-mukhe" },
  { title: "মায়াতরু", author: "অশোকবিজয় রাহা", slug: "mayataru" },
  { title: "ফণীমনসা ও বনের পরি", author: "বীরু চট্টোপাধ্যায়", slug: "phonimonsha-o-boner-pori" },
  { title: "বৃষ্টি পড়ে টাপুর টুপুর", author: "রবীন্দ্রনাথ ঠাকুর", slug: "brishti-pore-tapur-tapur" },
  { title: "বোকা কুমিরের কথা", author: "উপেন্দ্রকিশোর রায়চৌধুরী", slug: "boka-kumirer-kotha" },
  { title: "চল চল চল (গান)", author: "কাজী নজরুল ইসলাম", slug: "chol-chol-chol" },
  { title: "মাস্টারদা", author: "অশোককুমার মুখোপাধ্যায়", slug: "masterda" },
  { title: "মুক্তির মন্দির সোপানতলে (গান)", author: "মোহিনী চৌধুরী", slug: "muktir-mondir-sopanotole" },
  { title: "মিষ্টি", author: "প্রেমেন্দ্র মিত্র", slug: "mishti" },
  { title: "তালনবমী", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়", slug: "talonobomi" },
  { title: "শরৎ তোমার (গান)", author: "রবীন্দ্রনাথ ঠাকুর", slug: "shorot-tomar" },
  { title: "একলা", author: "শঙ্খ ঘোষ", slug: "ekla" },
  { title: "আকাশের দুই বন্ধু", author: "শৈলেন ঘোষ", slug: "akasher-dui-bondhu" },
  { title: "বোম্বাগড়ের রাজা", author: "সুকুমার রায়", slug: "bombagorer-raja" }
];

const chapters = chaptersData.map((data, index) => {
  return {
    id: `chapter-${data.slug}-${textbook.slug}`,
    title: data.title,
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
        id: `chapter-${data.slug}-${textbook.slug}`,
        slug: data.slug,
        title: data.title,
        type: "chapter"
      }
    ]
  };
});

const filePath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);

fs.writeFileSync(filePath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
