const fs = require('fs');

const map = {
  'textbook-poribesh-o-biggan': {
    id: 'textbook-poribesh-o-bigyan-class-6-wb',
    slug: 'poribesh-o-bigyan',
    fullSlug: 'wb-board/class-6/science/poribesh-o-bigyan',
    title: 'Poribesh O Bigyan',
    subjectSlug: 'science',
    ancestor: {
      id: "textbook-poribesh-o-bigyan-class-6-wb",
      slug: "poribesh-o-bigyan",
      title: "Poribesh O Bigyan",
      type: "textbook"
    }
  },
  'textbook-oteet-o-oitijhya': {
    id: 'textbook-atit-o-aityaja-class-6-wb',
    slug: 'atit-o-aityaja',
    fullSlug: 'wb-board/class-6/history/atit-o-aityaja',
    title: 'Atit O Aityaja',
    subjectSlug: 'history',
    ancestor: {
      id: "textbook-atit-o-aityaja-class-6-wb",
      slug: "atit-o-aityaja",
      title: "Atit O Aityaja",
      type: "textbook"
    }
  },
  'textbook-amader-prithibi': {
    id: 'textbook-amader-prithibi-class-6-wb',
    slug: 'amader-prithibi',
    fullSlug: 'wb-board/class-6/geography/amader-prithibi',
    title: 'Amader Prithibi',
    subjectSlug: 'geography',
    ancestor: {
      id: "textbook-amader-prithibi-class-6-wb",
      slug: "amader-prithibi",
      title: "Amader Prithibi",
      type: "textbook"
    }
  },
  'textbook-gonitprobha': {
    id: 'textbook-ganit-prabha-class-6-wb',
    slug: 'ganit-prabha',
    fullSlug: 'wb-board/class-6/mathematics/ganit-prabha',
    title: 'Ganit Prabha',
    subjectSlug: 'mathematics',
    ancestor: {
      id: "textbook-ganit-prabha-class-6-wb",
      slug: "ganit-prabha",
      title: "Ganit Prabha",
      type: "textbook"
    }
  }
};

// Update chapters
const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
let chapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));

let updatedCount = 0;
chapters.forEach(c => {
  if (map[c.parentId]) {
    const target = map[c.parentId];
    
    // update parent
    c.parentId = target.id;
    c.textbookSlug = target.slug;
    
    // update full slug
    c.fullSlug = `${target.fullSlug}/${c.chapterSlug}`;
    
    // update ancestor
    const textbookAncestorIdx = c.ancestors.findIndex(a => a.type === 'textbook');
    if (textbookAncestorIdx !== -1) {
      c.ancestors[textbookAncestorIdx] = target.ancestor;
    }
    
    // Update the chapter ID to reflect the correct textbook slug as well
    const oldId = c.id;
    c.id = `chapter-${c.chapterSlug}-${target.slug}-class-6`;
    
    // Update the chapter ancestor ID
    const chapterAncestorIdx = c.ancestors.findIndex(a => a.type === 'chapter');
    if (chapterAncestorIdx !== -1) {
      c.ancestors[chapterAncestorIdx].id = c.id;
    }
    
    updatedCount++;
  }
});

fs.writeFileSync(chaptersPath, JSON.stringify(chapters, null, 2));
console.log(`Updated ${updatedCount} chapters to point to existing textbooks.`);

// Delete duplicate textbooks
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';
let textbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));
const duplicateIds = Object.keys(map);
textbooks = textbooks.filter(t => !duplicateIds.includes(t.id));
fs.writeFileSync(textbooksPath, JSON.stringify(textbooks, null, 2));
console.log(`Removed ${duplicateIds.length} duplicate textbooks.`);
