const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetCss = /@bottom-left \{\s*content: "সৌজন্যে: \$\{footerText \|\| 'দেশ এক্সাম একাডেমী'\\}";\s*font-size: 12px;\s*font-weight: bold;\s*color: rgba\(31, 41, 55, 0\.7\);\s*\}/;

const newCss = `@bottom-right {
                  content: "পৃষ্ঠা " counter(page, bengali);
                  font-size: 12px;
                  font-weight: bold;
                  color: rgba(31, 41, 55, 0.7);
                  border-top: 1px solid #d1d5db;
                  padding-top: 8px;
                }
                \` : ''}
                @bottom-left {
                  content: "সৌজন্যে: \${footerText || 'দেশ এক্সাম একাডেমী'}";
                  font-size: 12px;
                  font-weight: bold;
                  color: rgba(31, 41, 55, 0.7);
                  border-top: 1px solid #d1d5db;
                  padding-top: 8px;
                }
                @bottom-center {
                  content: "";
                  border-top: 1px solid #d1d5db;
                  padding-top: 8px;
                }`;

// We need to replace the old @bottom-right and @bottom-left carefully
const fullCssTarget = /\$\{showPageNumber \? `\s*@bottom-right \{\s*content: "পৃষ্ঠা " counter\(page, bengali\);\s*font-size: 12px;\s*font-weight: bold;\s*color: rgba\(31, 41, 55, 0\.7\);\s*\}\s*` : ''\}\s*@bottom-left \{\s*content: "সৌজন্যে: \$\{footerText \|\| 'দেশ এক্সাম একাডেমী'\\}";\s*font-size: 12px;\s*font-weight: bold;\s*color: rgba\(31, 41, 55, 0\.7\);\s*\}/;

content = content.replace(fullCssTarget, `\${showPageNumber ? \`
                @bottom-right {
                  content: "পৃষ্ঠা " counter(page, bengali);
                  font-size: 12px;
                  font-weight: bold;
                  color: rgba(31, 41, 55, 0.7);
                  border-top: 1px solid #d1d5db;
                  padding-top: 12px;
                }
                @bottom-center {
                  content: "";
                  border-top: 1px solid #d1d5db;
                  padding-top: 12px;
                }
                \` : \`
                @bottom-center {
                  content: "";
                  border-top: 1px solid #d1d5db;
                  padding-top: 12px;
                }
                \`}
                @bottom-left {
                  content: "সৌজন্যে: \${footerText || 'দেশ এক্সাম একাডেমী'}";
                  font-size: 12px;
                  font-weight: bold;
                  color: rgba(31, 41, 55, 0.7);
                  border-top: 1px solid #d1d5db;
                  padding-top: 12px;
                }`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added borders and padding successfully!');
