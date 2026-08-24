const fs = require('fs');
const path = require('path');

const chaptersFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/chapters.json');
let chapters = JSON.parse(fs.readFileSync(chaptersFile, 'utf8'));

for (let chapter of chapters) {
  if (chapter.id === 'chapter-manabdeha-amader-paribesh') {
    if (chapter.summary) {
      chapter.content = chapter.summary;
      delete chapter.summary;
    }
    break;
  }
}

fs.writeFileSync(chaptersFile, JSON.stringify(chapters, null, 2), 'utf8');
console.log("Changed summary to content successfully!");
