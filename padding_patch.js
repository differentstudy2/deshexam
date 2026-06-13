const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldCss = `              .preview-page-padding {
                padding: 0 !important; /* Let @page handle print margins */
              }`;

const newCss = `              .preview-page-padding {
                padding: \${pageBorderStyle !== 'none' ? '0.25in' : '0'} !important; /* Add padding inside the border if a border is active */
              }`;

content = content.replace(oldCss, newCss);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed padding for borders!');
