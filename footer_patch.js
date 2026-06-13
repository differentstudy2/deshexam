const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove @bottom-left and @bottom-right
const pageCssTarget = /\$\{showPageNumber \? `\s*@bottom-right \{\s*content: "পৃষ্ঠা " counter\(page, bengali\);\s*font-size: 12px;\s*font-weight: bold;\s*\}\s*` : ''\}\s*@bottom-left \{\s*content: "\$\{footerText\}";\s*font-size: 12px;\s*font-weight: bold;\s*color: rgba\(31, 41, 55, 0\.7\);\s*\}/g;

content = content.replace(pageCssTarget, '');


// 2. Fix .print-page-number-display CSS
const pageNumCssTarget = /\.print-page-number-display \{\s*display: none !important;\s*\}/g;
const newPageNumCss = `.print-page-number-display::after {
                content: "পৃষ্ঠা " counter(page, bengali);
              }`;

content = content.replace(pageNumCssTarget, newPageNumCss);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed footer printing successfully!');
