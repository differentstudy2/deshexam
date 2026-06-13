const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the footer JSX syntax
content = content.replace(
  "<div>সৌজন্যে: ${footerText || 'দেশ এক্সাম একাডেমী'}</div>\\n                      ${showPageNumber ? '<div class=\"page-number-display\"></div>' : ''}",
  "<div>সৌজন্যে: {footerText || 'দেশ এক্সাম একাডেমী'}</div>\\n                      {showPageNumber ? <div className=\"page-number-display\"></div> : null}"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed JSX syntax!');
