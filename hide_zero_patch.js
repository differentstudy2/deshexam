const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const pageNumCssTarget = /\.print-page-number-display::after \{\s*content: "পৃষ্ঠা " counter\(page, bengali\);\s*\}/g;
const newPageNumCss = `.print-page-number-display { display: none !important; }`;

content = content.replace(pageNumCssTarget, newPageNumCss);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Hidden page 0 successfully!');
