const fs = require('fs');

const subject = {
  id: "subject-mathematics-class-6-wb",
  title: "Mathematics",
  slug: "mathematics",
  type: "subject",
  track: "academic",
  parentId: "class-6-wb",
  orderIndex: 7, // Order for Math
  status: "published",
  fullSlug: "wb-board/class-6/mathematics",
  boardSlug: "wb-board",
  classSlug: "class-6",
  subjectSlug: "mathematics",
  isIndexable: true,
  isHardcoded: true,
  ancestors: [
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
    }
  ]
};

const textbook = {
  "id": "textbook-gonitprobha",
  "title": "Gonitprobha",
  "slug": "gonitprobha",
  "type": "textbook",
  "track": "academic",
  "parentId": "subject-mathematics-class-6-wb",
  "orderIndex": 1,
  "status": "published",
  "fullSlug": "wb-board/class-6/mathematics/gonitprobha",
  "boardSlug": "wb-board",
  "classSlug": "class-6",
  "subjectSlug": "mathematics",
  "textbookSlug": "gonitprobha",
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
      "id": "subject-mathematics-class-6-wb",
      "slug": "mathematics",
      "title": "Mathematics",
      "type": "subject"
    }
  ]
};

const chaptersData = [
  { prefix: "অধ্যায় ১", title: "পূর্বপাঠের পুনরালোচনা (Revision of Previous Lessons)", slug: "purbopather-punoralochona" },
  { prefix: "অধ্যায় ২", title: "সাত ও আট অঙ্কের সংখ্যার ধারণা (Concept of 7 and 8 Digit Numbers)", slug: "sat-o-at-ongker-songkhar-dharona" },
  { prefix: "অধ্যায় ৩", title: "সংখ্যা বিষয়ে যুক্তিসম্মত অনুমান (Reasonable Estimation of Numbers)", slug: "songkha-bishoye-juktisommoto-onuman" },
  { prefix: "অধ্যায় ৪", title: "একশত পর্যন্ত রোমান সংখ্যা (Roman Numerals up to 100)", slug: "ekshoto-porjonto-roman-songkha" },
  { prefix: "অধ্যায় ৫", title: "বীজগণিত চলরাশির ধারণা (Algebra: Concept of Variables)", slug: "bijgonit-cholorashir-dharona" },
  { prefix: "অধ্যায় ৬", title: "ভগ্নাংশকে পূর্ণসংখ্যা ও ভগ্নাংশ দিয়ে গুণ ও ভাগ (Multiplication and Division of Fractions)", slug: "bhognangshoke-purnosongkha-o-bhognangsho-diye-gun-o-bhag" },
  { prefix: "অধ্যায় ৭", title: "দশমিক ভগ্নাংশকে গুণ ও ভাগ (Multiplication and Division of Decimal Fractions)", slug: "doshomik-bhognangshoke-gun-o-bhag" },
  { prefix: "অধ্যায় ৮", title: "মেট্রিক পদ্ধতি (Metric System)", slug: "metric-poddhoti" },
  { prefix: "অধ্যায় ৯", title: "শতকরা (Percentage)", slug: "shotkora" },
  { prefix: "অধ্যায় ১০", title: "আবৃত্ত দশমিক সংখ্যা (Recurring Decimal Numbers)", slug: "abritto-doshomik-songkha" },
  { prefix: "অধ্যায় ১১", title: "সুষম ঘনবস্তু গঠন বিষয়ক ধারণা (Geometric Concepts of Regular Solids)", slug: "sushomo-ghonobostu-gothon-bishoyok-dharona" },
  { prefix: "অধ্যায় ১২", title: "তিনটি সংখ্যার গসাগু ও লসাগু (HCF and LCM of Three Numbers)", slug: "tinti-songkhar-gosagu-o-loshagu" },
  { prefix: "অধ্যায় ১৩", title: "তথ্য সাজানো ও বিচার (Arranging and Analyzing Data)", slug: "tothyo-sajano-o-bichar" },
  { prefix: "অধ্যায় ১৪", title: "রেখা, রেখাংশ, রশ্মি ও বিন্দু (Line, Line Segment, Ray, and Point)", slug: "rekha-rekhangsho-roshmi-o-bindu" },
  { prefix: "অধ্যায় ১৫", title: "ক্ষেত্রফল ও পরিসীমা নির্ণয় (Finding Area and Perimeter)", slug: "khetrofol-o-porisima-nirnoy" },
  { prefix: "অধ্যায় ১৬", title: "নিয়ন্ত্রিত সংখ্যা ও সংখ্যা রেখা (Directed Numbers and Number Line)", slug: "niyontrito-songkha-o-songkha-rekha" },
  { prefix: "অধ্যায় ১৭", title: "জ্যামিতিক ধারণা (জ্যামিতি বাক্স) (Geometrical Concepts - Geometry Box)", slug: "jyamitik-dharona-jyamiti-baksho" },
  { prefix: "অধ্যায় ১৮", title: "বর্গমূল (Square Root)", slug: "borgomul" },
  { prefix: "অধ্যায় ১৯", title: "সময়ের পরিমাপ (Measurement of Time)", slug: "shomoyer-porimap" },
  { prefix: "অধ্যায় ২০", title: "বৃত্ত বিষয়ক জ্যামিতিক ধারণা (Geometric Concepts of Circle)", slug: "britto-bishoyok-jyamitik-dharona" },
  { prefix: "অধ্যায় ২১", title: "অনুপাত ও সমানুপাতের ধারণা (Concepts of Ratio and Proportion)", slug: "onupat-o-somanupater-dharona" },
  { prefix: "অধ্যায় ২২", title: "বিভিন্ন জ্যামিতিক চিত্র অঙ্কন (Drawing Various Geometric Figures)", slug: "bibhinno-jyamitik-chitro-ongkon" },
  { prefix: "অধ্যায় ২৩", title: "প্রতিসাম্য (Symmetry)", slug: "protisamyo" },
  { prefix: "অধ্যায় ২৪", title: "নানা দিক থেকে ঘনবস্তু (Solid Objects from Different Views)", slug: "nana-dik-theke-ghonobostu" },
  { prefix: "অধ্যায় ২৫", title: "মজার অংক (Fun Math)", slug: "mojar-ongko" },
  { prefix: "অধ্যায় ২৬", title: "সুষম ঘনবস্তুর খোলা আকার (Open Shape / Nets of Regular Solids)", slug: "sushomo-ghonobostur-khola-akar" },
  { prefix: "অধ্যায় ২৭", title: "ভগ্নাংশ, দশমিক, শতকরা ও অনুপাত (Equivalence of Fractions, Decimals, Percentages & Ratios)", slug: "bhognangsho-doshomik-shotkora-o-onupat" }
];

const chapters = chaptersData.map((data, index) => {
  const fullTitle = data.prefix ? `${data.prefix}: ${data.title}` : data.title;
  
  return {
    id: `chapter-${data.slug}-${textbook.slug}-class-6`,
    title: fullTitle,
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

// Update Subjects
const subjectsPath = './src/data/hardcoded/taxonomy/subjects.json';
const existingSubjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));
if (!existingSubjects.find(s => s.id === subject.id)) {
  existingSubjects.push(subject);
  fs.writeFileSync(subjectsPath, JSON.stringify(existingSubjects, null, 2));
  console.log('Added Subject: Mathematics (Class 6)');
}

// Update Textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
const existingTextbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
if (!existingTextbooks.find(t => t.id === textbook.id)) {
  existingTextbooks.push(textbook);
  fs.writeFileSync(textbooksPath, JSON.stringify(existingTextbooks, null, 2));
  console.log('Added Textbook: Gonitprobha (Class 6)');
}

// Update Chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const existingChapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const newChapters = chapters.filter(c => !existingChapters.find(ec => ec.id === c.id));
existingChapters.push(...newChapters);
fs.writeFileSync(chaptersPath, JSON.stringify(existingChapters, null, 2));
console.log(`Added ${newChapters.length} chapters.`);
