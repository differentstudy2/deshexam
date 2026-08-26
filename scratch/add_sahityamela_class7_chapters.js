const fs = require('fs');

const textbook = {
  "id": "textbook-sahityamela-class-7-wb",
  "title": "Sahityamela",
  "slug": "sahityamela",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-bengali-literature-class-7-wb",
  "orderIndex": 19,
  "status": "published",
  "fullSlug": "wb-board/class-7/bengali-literature/sahityamela",
  "boardSlug": "wb-board",
  "classSlug": "class-7",
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
      "id": "class-7-wb",
      "slug": "class-7",
      "title": "Class 7",
      "type": "class"
    },
    {
      "id": "subject-bengali-literature-class-7-wb",
      "slug": "bengali-literature",
      "title": "Bengali Literature",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "পাঠ ১", title: "ছন্দে শুধু কান রাখো", slug: "chonde-shudhu-kan-rakho" },
  { prefix: "পাঠ ২", title: "পাগলা গণেশ", slug: "pagla-gonesh" },
  { prefix: "পাঠ ৩", title: "বঙ্গভূমির প্রতি", slug: "bongobhumir-proti" },
  { prefix: "পাঠ ৪", title: "একুশের কবিতা", slug: "ekusher-kobita" },
  { prefix: "পাঠ ৫", title: "আত্মকথা", slug: "attokotha" },
  { prefix: "পাঠ ৬", title: "আঁকা, লেখা", slug: "aka-lekha" },
  { prefix: "পাঠ ৭", title: "খোকনের প্রথম ছবি", slug: "khokoner-prothom-chobi" },
  { prefix: "পাঠ ৮", title: "কুতুব মিনারের কথা", slug: "kutub-minarer-kotha" },
  { prefix: "পাঠ ৯", title: "কার দৌড় কদ্দূর?", slug: "kar-dour-koddur" },
  { prefix: "পাঠ ১০", title: "নোটবই", slug: "noteboi" },
  { prefix: "পাঠ ১১", title: "মেঘচোর", slug: "meghchor" },
  { prefix: "পাঠ ১২", title: "স্মৃতিচিহ্ন", slug: "smritichinho" },
  { prefix: "পাঠ ১৩", title: "চিরদিনের", slug: "chirodiner" },
  { prefix: "পাঠ ১৪", title: "কী করে বুঝব", slug: "ki-kore-bujhbo" },
  { prefix: "পাঠ ১৫", title: "ভারাদত্ত", slug: "bharadotto" },
  { prefix: "পাঠ ১৬", title: "স্বাধীনতা সংগ্রামে নারী", slug: "shadhinota-shongrame-nari" },
  { prefix: "পাঠ ১৭", title: "ভারততীর্থ", slug: "bharottirtho" },
  { prefix: "পাঠ ১৮", title: "দেবতাত্মা হিমালয়", slug: "debotatma-himaloy" },
  { prefix: "পাঠ ১৯", title: "গাধার কান", slug: "gadhar-kan" },
  { prefix: "পাঠ ২০", title: "পটলবাবু ফিল্মস্টার", slug: "potolbabu-filmstar" },
  { prefix: "পাঠ ২১", title: "রাস্তার আনন্দ", slug: "rastar-anondo" },
  { prefix: "পাঠ ২২", title: "চিন্তাশীল", slug: "chintashil" }
];

const generatedChapters = [];

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
});

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = generatedChapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters for Class 7 Sahityamela.`);
