const fs = require('fs');

const textbook = {
  id: "textbook-amar-ganit",
  title: "Amar Ganit",
  slug: "amar-ganit",
  type: "textbook",
  track: "academic",
  parentId: "subject-math-class-5-wb",
  fullSlug: "wb-board/class-5/mathematics/amar-ganit",
  boardSlug: "wb-board",
  classSlug: "class-5",
  subjectSlug: "mathematics",
  textbookSlug: "amar-ganit",
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
      "id": "class-5-wb",
      "slug": "class-5",
      "title": "Class 5",
      "type": "class"
    },
    {
      "id": "subject-math-class-5-wb",
      "slug": "mathematics",
      "title": "Mathematics",
      "type": "subject"
    },
    {
      "id": "textbook-amar-ganit",
      "slug": "amar-ganit",
      "title": "Amar Ganit",
      "type": "textbook"
    }
  ]
};

const chaptersText = `আগের পড়া মনে করি (Revision of Previous Lessons)
সহজে গ্রামের জনসংখ্যা গুনি (Easily Count Village Population)
কার্ড দিয়ে সহজে হিসাব করি (Easy Calculations with Cards)
সবথেকে বেশি কতজনের মধ্যে সমান ভাগ করতে পারি (Distributing Equally Among Maximum People)
মিষ্টিমুখ হোক (Let's Have Sweets)
সহজে বড়ো সংখ্যার হিসাব করি (Easy Calculation of Large Numbers)
একটা গোটা (অখণ্ড) জিনিসকে সমান ভাগে ভাগ করে নিই (Dividing a Whole Thing into Equal Parts)
চৌবাচ্চায় কত জল আছে দেখি (Let's See How Much Water is in the Tank)
আজ স্কুলবাড়ির জানালায় সবুজ রং দিই (Let's Paint the School Windows Green)
দেশলাই কাঠির খেলা খেলি (Playing with Matchsticks)
ধাপে ধাপে হিসাব করি (Step by Step Calculation)
ইচ্ছামতো বিভিন্ন অংশে রং দিই (Coloring Different Parts as We Wish)
কাকার সাথে হিসাব করি (Calculating with Uncle)
এমন কিছু আঁকি যা খুব কম জায়গা নেবে (Drawing Something that Takes Very Little Space)
সময়ের সঙ্গে ঘড়ির কাঁটার অবস্থান দেখি (Observing the Position of Clock Hands with Time)
ছবি দিয়ে তথ্য বিচার করি (Analyzing Data Using Pictures)
ঘনবস্তু দেখি (Looking at Solid Objects)
ঐকিক শব্দের অর্থ খুঁজি (Finding the Meaning of Unitary Method)
তিনটি কাঠি নিয়ে খেলি (Playing with Three Sticks)
গোলাকার পথে কিছু খুঁজি (Finding Something in a Circular Path)
অঙ্কের মজা (Fun with Numbers)`;

function generateSlug(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const chapters = chaptersText.split('\n').filter(l => l.trim().length > 0).map((line, index) => {
  const match = line.match(/(.+?)\s*\((.+)\)/);
  const bengaliTitle = match ? match[1].trim() : line.trim();
  const englishTitle = match ? match[2].trim() : line.trim();
  const slug = generateSlug(englishTitle);

  return {
    id: `chapter-${slug}-${textbook.slug}`,
    title: bengaliTitle,
    slug: slug,
    type: "chapter",
    track: textbook.track,
    parentId: textbook.id,
    orderIndex: index + 1,
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
        id: `chapter-${slug}-${textbook.slug}`,
        slug: slug,
        title: bengaliTitle,
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
