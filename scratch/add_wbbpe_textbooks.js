const fs = require('fs');
const path = require('path');

const subjectsFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/subjects.json');
const textbooksFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/textbooks.json');

const subjects = JSON.parse(fs.readFileSync(subjectsFile, 'utf8'));
const textbooks = JSON.parse(fs.readFileSync(textbooksFile, 'utf8'));

const board = { id: 'board-wbbpe', slug: 'wbbpe-board', title: 'WBBPE', type: 'board' };

const classData = {
    1: { id: 'class-1-wbbpe', slug: 'class-1', title: 'Class 1' },
    2: { id: 'class-2-wbbpe', slug: 'class-2', title: 'Class 2' },
    3: { id: 'class-3-wbbpe', slug: 'class-3', title: 'Class 3' },
    4: { id: 'class-4-wbbpe', slug: 'class-4', title: 'Class 4' },
};

const textbooksToAdd = [
    // Class I
    { cls: 1, title: "AMAR BOI", subSlug: "bengali-language", subTitle: "Bengali Language" },
    { cls: 1, title: "HEALTH & PHYSICAL EDUCATION", subSlug: "health-physical-education", subTitle: "Health & Physical Education" },
    { cls: 1, title: "SAHAJ PATH PRATHAM BHAG", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
    
    // Class II
    { cls: 2, title: "AMAR BOI", subSlug: "bengali-language", subTitle: "Bengali Language" },
    { cls: 2, title: "HEALTH & PHYSICAL EDUCATION", subSlug: "health-physical-education", subTitle: "Health & Physical Education" },
    { cls: 2, title: "SAHAJ PATH DWITIYO BHAG", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
    
    // Class III
    { cls: 3, title: "AMADER PARIBESH", subSlug: "environmental-science", subTitle: "Environmental Science" },
    { cls: 3, title: "AMAR GANIT", subSlug: "mathematics", subTitle: "Mathematics" },
    { cls: 3, title: "HEALTH & PHYSICAL EDUCATION", subSlug: "health-physical-education", subTitle: "Health & Physical Education" },
    { cls: 3, title: "PATABAHAR", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
    
    // Class IV
    { cls: 4, title: "AMADER PARIBESH", subSlug: "environmental-science", subTitle: "Environmental Science" },
    { cls: 4, title: "AMAR GANIT", subSlug: "mathematics", subTitle: "Mathematics" },
    { cls: 4, title: "BHASHA PATH", subSlug: "bengali-grammar", subTitle: "Bengali Grammar" },
    { cls: 4, title: "HEALTH & PHYSICAL EDUCATION", subSlug: "health-physical-education", subTitle: "Health & Physical Education" },
    { cls: 4, title: "PATABAHAR", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
];

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Keep track of added subjects to avoid duplicates
const addedSubjects = new Set(subjects.map(s => s.id));
let orderIndexSubject = Math.max(...subjects.map(s => s.orderIndex || 0)) + 1;
let orderIndexTextbook = Math.max(...textbooks.map(s => s.orderIndex || 0)) + 1;

textbooksToAdd.forEach(tb => {
    const clsInfo = classData[tb.cls];
    const subjectId = `subject-${tb.subSlug}-class-${tb.cls}-wbbpe`;
    
    // 1. Ensure Subject exists
    if (!addedSubjects.has(subjectId)) {
        subjects.push({
            id: subjectId,
            title: tb.subTitle,
            slug: tb.subSlug,
            type: 'subject',
            track: 'academic',
            parentId: clsInfo.id,
            orderIndex: orderIndexSubject++,
            status: 'published',
            fullSlug: `${board.slug}/${clsInfo.slug}/${tb.subSlug}`,
            boardSlug: board.slug,
            classSlug: clsInfo.slug,
            subjectSlug: tb.subSlug,
            isIndexable: true,
            isHardcoded: true,
            ancestors: [
                { id: board.id, slug: board.slug, title: board.title, type: 'board' },
                { id: clsInfo.id, slug: clsInfo.slug, title: clsInfo.title, type: 'class' }
            ]
        });
        addedSubjects.add(subjectId);
    }
    
    // 2. Add Textbook
    const tbSlug = slugify(tb.title);
    const tbId = `textbook-${tbSlug}-class-${tb.cls}-wbbpe`;
    
    // check if exists
    if (!textbooks.find(t => t.id === tbId)) {
        textbooks.push({
            id: tbId,
            title: tb.title,
            slug: tbSlug,
            type: 'textbook',
            track: 'academic',
            parentId: subjectId,
            orderIndex: orderIndexTextbook++,
            status: 'published',
            fullSlug: `${board.slug}/${clsInfo.slug}/${tb.subSlug}/${tbSlug}`,
            boardSlug: board.slug,
            classSlug: clsInfo.slug,
            subjectSlug: tb.subSlug,
            textbookSlug: tbSlug,
            isIndexable: true,
            isHardcoded: true,
            ancestors: [
                { id: board.id, slug: board.slug, title: board.title, type: 'board' },
                { id: clsInfo.id, slug: clsInfo.slug, title: clsInfo.title, type: 'class' },
                { id: subjectId, slug: tb.subSlug, title: tb.subTitle, type: 'subject' }
            ]
        });
    }
});

// Convert UPPERCASE to Title Case
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      if (txt.toUpperCase() === "AND") return "and";
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

textbooks.forEach(tb => {
    if(tb.title === tb.title.toUpperCase()) {
        tb.title = toTitleCase(tb.title);
    }
});

fs.writeFileSync(subjectsFile, JSON.stringify(subjects, null, 2), 'utf8');
fs.writeFileSync(textbooksFile, JSON.stringify(textbooks, null, 2), 'utf8');
console.log("Done adding WBBPE subjects and textbooks.");
