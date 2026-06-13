const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the fixed div footer
const fixedFooterRegex = /\{\/\* Fixed Print Footer \(Repeats on every printed page\) \*\/\}\s*<div\s*className="hidden print:flex fixed left-0 right-0 justify-between items-center text-\[12px\] font-bold text-gray-800 opacity-70 bg-white pt-3 border-t border-gray-300 z-50"\s*style=\{\{ bottom: `\$\{margins\.bottom \|\| '0\.5'\}in` \}\}\s*>\s*<div>সৌজন্যে: \{footerText \|\| 'দেশ এক্সাম একাডেমী'\}<\/div>\s*\{showPageNumber && <div className="print-page-number-display"><\/div>\}\s*<\/div>/;
content = content.replace(fixedFooterRegex, '');

// 2. Add @bottom-left and @bottom-right back to the @page CSS
const pageCssTarget = /@page \{\s*size: \$\{paperSize === 'A4' \? 'A4' : paperSize === 'Letter' \? 'letter' : 'legal'\} \$\{orientation\.toLowerCase\(\)\};\s*margin: \$\{margins\.top \|\| '0'\}in \$\{margins\.right \|\| '0'\}in \$\{margins\.bottom \|\| '0\.5'\}in \$\{margins\.left \|\| '0'\}in;\s*\}/;

const newPageCss = `@page {
                size: \${paperSize === 'A4' ? 'A4' : paperSize === 'Letter' ? 'letter' : 'legal'} \${orientation.toLowerCase()};
                margin: \${margins.top || '0'}in \${margins.right || '0'}in \${margins.bottom || '0.5'}in \${margins.left || '0'}in;
                
                \${showPageNumber ? \`
                @bottom-right {
                  content: "পৃষ্ঠা " counter(page, bengali);
                  font-size: 12px;
                  font-weight: bold;
                  color: rgba(31, 41, 55, 0.7);
                }
                \` : ''}
                @bottom-left {
                  content: "সৌজন্যে: \${footerText || 'দেশ এক্সাম একাডেমী'}";
                  font-size: 12px;
                  font-weight: bold;
                  color: rgba(31, 41, 55, 0.7);
                }
              }`;

content = content.replace(pageCssTarget, newPageCss);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Restored native page margins successfully!');
