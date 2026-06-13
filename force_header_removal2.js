const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\/\* Fixed Print Footer \(Repeats on every printed page\) \*\/\}\s*<div\s*className="hidden print:flex fixed left-0 right-0 justify-between items-center text-\[12px\] font-bold text-gray-800 opacity-70 bg-white pt-3 border-t border-gray-300 z-50"\s*style=\{\{ bottom: `\$\{margins\.bottom \|\| '0\.5'\}in` \}\}\s*>\s*<div>[\s\S]*?<\/div>\s*\{showPageNumber && <div className="print-page-number-display"><\/div>\}\s*<\/div>/m;

content = content.replace(regex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed the fixed footer!');
