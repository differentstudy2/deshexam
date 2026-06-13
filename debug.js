const fs = require('fs');
const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split(/\\r?\\n/);
console.log('Original lines length:', lines.length);

let openings = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className="preview-page-padding') && lines[i].includes('<div')) {
    openings.push(i);
  }
}
console.log('Openings originally at:', openings);
