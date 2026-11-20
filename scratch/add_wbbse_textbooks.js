const fs = require('fs');
const path = require('path');

const subjectsFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/subjects.json');
const textbooksFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/textbooks.json');

const subjects = JSON.parse(fs.readFileSync(subjectsFile, 'utf8'));
const textbooks = JSON.parse(fs.readFileSync(textbooksFile, 'utf8'));

const board = { id: 'board-wb', slug: 'wb-board', title: 'WBBSE', type: 'board' };

const classData = {
    6: { id: 'class-6-wb', slug: 'class-6', title: 'Class 6' },
    7: { id: 'class-7-wb', slug: 'class-7', title: 'Class 7' },
    8: { id: 'class-8-wb', slug: 'class-8', title: 'Class 8' },
    9: { id: 'class-9-wb', slug: 'class-9', title: 'Class 9' },
    10: { id: 'class-10-wb', slug: 'class-10', title: 'Class 10' },
};

const textbooksToAdd = [
    // Class VI
    { cls: 6, title: "AMADER PRITHIBI", subSlug: "geography", subTitle: "Geography" },
    { cls: 6, title: "ATIT O AITYAJA", subSlug: "history", subTitle: "History" },
    { cls: 6, title: "BHASA CHARCHA", subSlug: "bengali-grammar", subTitle: "Bengali Grammar" },
    { cls: 6, title: "GANIT PRABHA", subSlug: "mathematics", subTitle: "Mathematics" },
    { cls: 6, title: "HA JA BA RA LA", subSlug: "rapid-reader", subTitle: "Rapid Reader" },
    { cls: 6, title: "PORIBESH O BIGYAN", subSlug: "science", subTitle: "Science" },
    { cls: 6, title: "SAHITYAMELA", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
    
    // Class VII
    { cls: 7, title: "AMADER PRITHIBI", subSlug: "geography", subTitle: "Geography" },
    { cls: 7, title: "ATIT O AITYAJA", subSlug: "history", subTitle: "History" },
    { cls: 7, title: "BHASA CHARCHA", subSlug: "bengali-grammar", subTitle: "Bengali Grammar" },
    { cls: 7, title: "GANIT PRABHA", subSlug: "mathematics", subTitle: "Mathematics" },
    { cls: 7, title: "MAKU", subSlug: "rapid-reader", subTitle: "Rapid Reader" },
    { cls: 7, title: "PORIBESH O BIGYAN", subSlug: "science", subTitle: "Science" },
    { cls: 7, title: "SAHITYAMELA", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
    
    // Class VIII
    { cls: 8, title: "AMADER PRITHIBI", subSlug: "geography", subTitle: "Geography" },
    { cls: 8, title: "ATIT O AITYAJA", subSlug: "history", subTitle: "History" },
    { cls: 8, title: "BHASA CHARCHA", subSlug: "bengali-grammar", subTitle: "Bengali Grammar" },
    { cls: 8, title: "GANIT PRABHA", subSlug: "mathematics", subTitle: "Mathematics" },
    { cls: 8, title: "PATHER PANCHALI RAPID", subSlug: "rapid-reader", subTitle: "Rapid Reader" },
    { cls: 8, title: "PORIBESH O BIGYAN", subSlug: "science", subTitle: "Science" },
    { cls: 8, title: "SAHITYAMELA", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
    
    // Class IX
    { cls: 9, title: "GANIT PRAKASH", subSlug: "mathematics", subTitle: "Mathematics" },
    { cls: 9, title: "PROFESSOR SHANKUR DAIRY", subSlug: "rapid-reader", subTitle: "Rapid Reader" },
    { cls: 9, title: "SAHITYA SANCHAYAN", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
    
    // Class X
    { cls: 10, title: "GANIT PRAKASH", subSlug: "mathematics", subTitle: "Mathematics" },
    { cls: 10, title: "KONI RAPID READER", subSlug: "rapid-reader", subTitle: "Rapid Reader" },
    { cls: 10, title: "SAHITYA SANCHAYAN", subSlug: "bengali-literature", subTitle: "Bengali Literature" },
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
    const subjectId = `subject-${tb.subSlug}-class-${tb.cls}-wb`;
    
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
    const tbId = `textbook-${tbSlug}-class-${tb.cls}-wb`;
    
    // check if exists
    if (!textbooks.find(t => t.id === tbId)) {
        textbooks.push({
            id: tbId,
            title: tb.title, // Title Case maybe? Wait, user provided uppercase, let's title case it
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
console.log("Done adding WBBSE subjects and textbooks.");
