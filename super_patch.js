const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove old fixed div footer
const fixedFooterRegex = /\{\/\* Fixed Print Footer \(Repeats on every printed page\) \*\/\}\s*<div\s*className="hidden print:flex fixed left-0 right-0 justify-between items-center text-\[12px\] font-bold text-gray-800 opacity-70 bg-white pt-3 border-t border-gray-300 z-50"\s*style=\{\{ bottom: `\$\{margins\.bottom \|\| '0\.5'\}in` \}\}\s*>\s*<div>সৌজন্যে: \{footerText \|\| 'দেশ এক্সাম একাডেমী'\}<\/div>\s*\{showPageNumber && <div className="print-page-number-display"><\/div>\}\s*<\/div>/;
content = content.replace(fixedFooterRegex, '');

// 2. Fix @page CSS margins and borders
const pageCssTarget = /@page \{\s*size: \$\{paperSize === 'A4' \? 'A4' : paperSize === 'Letter' \? 'letter' : 'legal'\} \$\{orientation\.toLowerCase\(\)\};\s*margin: \$\{margins\.top \|\| '0'\}in \$\{margins\.right \|\| '0'\}in \$\{margins\.bottom \|\| '0\.5'\}in \$\{margins\.left \|\| '0'\}in;\s*(?:\$\{showPageNumber \? `\s*@bottom-right \{\s*content: "পৃষ্ঠা " counter\(page, bengali\);\s*font-size: 12px;\s*font-weight: bold;\s*\}\s*` : ''\}\s*@bottom-left \{\s*content: "\$\{footerText\}";\s*font-size: 12px;\s*font-weight: bold;\s*color: rgba\(31, 41, 55, 0\.7\);\s*\})?\s*\}/;

const newPageCss = `@page {
                size: \${paperSize === 'A4' ? 'A4' : paperSize === 'Letter' ? 'letter' : 'legal'} \${orientation.toLowerCase()};
                margin: \${margins.top || '0'}in \${margins.right || '0'}in \${margins.bottom || '0.5'}in \${margins.left || '0'}in;
                
                \${showPageNumber ? \`
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
                }
              }`;

content = content.replace(pageCssTarget, newPageCss);


// 3. Add pageBorderStyle state, and update default margins to 0.5
content = content.replace(
    "const [paperSize, setPaperSize] = useState('Letter');",
    "const [paperSize, setPaperSize] = useState('Letter');\n  const [pageBorderStyle, setPageBorderStyle] = useState('none');"
);
content = content.replace(
    "const [margins, setMargins] = useState({ top: '0.2', right: '0.2', bottom: '0.2', left: '0.2' });",
    "const [margins, setMargins] = useState({ top: '0.5', right: '0.5', bottom: '0.5', left: '0.5' });"
);

// 4. Save & Load state
content = content.replace(
    "watermarkOpacity, paperSize, orientation, margins",
    "watermarkOpacity, paperSize, orientation, margins, pageBorderStyle"
);
content = content.replace(
    "if (s.margins) setMargins(s.margins);",
    "if (s.margins) setMargins(s.margins);\n        if (s.pageBorderStyle) setPageBorderStyle(s.pageBorderStyle);"
);

// 5. Add Select UI to Page Setup
const oldMarginsUi = '<h3 className="font-bold text-[#1c2b4f] mb-3 text-[15px]">Margins (inches)</h3>';
const newMarginsUi = `<div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#1c2b4f] text-[15px]">Margins (inches)</h3>
                <div className="flex items-center gap-2">
                  <label className="text-[13px] text-gray-700 font-medium">Border Style:</label>
                  <Select value={pageBorderStyle} onValueChange={setPageBorderStyle}>
                    <SelectTrigger className="border-gray-200 shadow-none h-8 text-[12px] w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="solid">Solid Line</SelectItem>
                      <SelectItem value="text">--deshexam.com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>`;
content = content.replace(oldMarginsUi, newMarginsUi);


// 6. Add Border DOM rendering
const oldPaperDom = '<div id="printable-paper" style={{ zoom: zoom } as React.CSSProperties} className="flex flex-col gap-8 print:gap-0 print:block">';
const newPaperDom = `<div id="printable-paper" style={{ zoom: zoom } as React.CSSProperties} className="flex flex-col gap-8 print:gap-0 print:block relative">
            {pageBorderStyle === 'solid' && (
              <div className="hidden print:block fixed top-0 bottom-0 left-0 right-0 border-[1.5px] border-gray-800 pointer-events-none z-50"></div>
            )}
            {pageBorderStyle === 'text' && (
              <div className="hidden print:block fixed top-0 bottom-0 left-0 right-0 pointer-events-none z-50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[8px] overflow-hidden whitespace-nowrap text-[8px] text-gray-600 font-mono tracking-[4px] leading-none select-none">
                  {"---deshexam.com".repeat(150)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[8px] overflow-hidden whitespace-nowrap text-[8px] text-gray-600 font-mono tracking-[4px] leading-none select-none">
                  {"---deshexam.com".repeat(150)}
                </div>
                <div className="absolute top-0 bottom-0 left-0 w-[8px] overflow-hidden whitespace-nowrap text-[8px] text-gray-600 font-mono tracking-[4px] leading-none select-none" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  {"---deshexam.com".repeat(150)}
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-[8px] overflow-hidden whitespace-nowrap text-[8px] text-gray-600 font-mono tracking-[4px] leading-none select-none" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  {"---deshexam.com".repeat(150)}
                </div>
              </div>
            )}`;
content = content.replace(oldPaperDom, newPaperDom);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Super patch applied successfully!');
