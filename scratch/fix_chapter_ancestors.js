const fs = require('fs');

const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const textbooksPath = './src/data/hardcoded/taxonomy/textbooks.json';

const chapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const textbooks = JSON.parse(fs.readFileSync(textbooksPath, 'utf8'));

let updatedCount = 0;

chapters.forEach(c => {
  const hasTextbookAncestor = c.ancestors && c.ancestors.some(a => a.type === 'textbook');
  
  if (!hasTextbookAncestor) {
    const parentTextbook = textbooks.find(t => t.id === c.parentId);
    if (parentTextbook) {
      const textbookAncestor = {
        id: parentTextbook.id,
        slug: parentTextbook.slug,
        title: parentTextbook.title,
        type: 'textbook'
      };
      
      // Find the index of the chapter itself (it should be the last one, but let's be safe)
      const chapterAncestorIdx = c.ancestors.findIndex(a => a.type === 'chapter');
      
      if (chapterAncestorIdx !== -1) {
        // Insert textbook before chapter
        c.ancestors.splice(chapterAncestorIdx, 0, textbookAncestor);
      } else {
        // If chapter itself is not in ancestors (shouldn't happen, but just in case), append it
        c.ancestors.push(textbookAncestor);
      }
      updatedCount++;
    }
  }
});

fs.writeFileSync(chaptersPath, JSON.stringify(chapters, null, 2));
console.log(`Fixed ${updatedCount} chapters by adding missing textbook ancestor.`);
