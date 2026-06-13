const fs = require('fs');
const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split(/\\r?\\n/);

// Re-read lines since array length changed
let content = lines.join('\\n');
lines = content.split('\\n');

let openings = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className="preview-page-padding') && lines[i].includes('<div')) {
    openings.push(i);
  }
}

console.log('Openings found at:', openings);

if (openings.length === 3) {
  // Replace Page 1 Open
  lines[openings[0]] = `<table className="w-full print:table border-collapse border-0 h-full">
                <thead className="hidden print:table-header-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.top || '0.5'}in\` }}></div></td></tr>
                </thead>
                <tfoot className="hidden print:table-footer-group">
                  <tr><td className="p-0 border-0 relative">
                    <div style={{ height: \`\${margins.bottom || '0.5'}in\` }}></div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center text-[12px] font-bold text-gray-800 opacity-70">
                      <div>সৌজন্যে: {footerText || 'দেশ এক্সাম একাডেমী'}</div>
                      {showPageNumber ? <div className="page-number-display"></div> : null}
                    </div>
                  </td></tr>
                </tfoot>
                <tbody className="print:table-row-group">
                  <tr>
                    <td className="p-0 border-0 align-top h-full">
                      <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">`;

  // Replace Page 2 Open
  lines[openings[1]] = `<table className="w-full print:table border-collapse border-0 h-full">
                <thead className="hidden print:table-header-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.top || '0.5'}in\` }}></div></td></tr>
                </thead>
                <tfoot className="hidden print:table-footer-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.bottom || '0.5'}in\` }}></div></td></tr>
                </tfoot>
                <tbody className="print:table-row-group">
                  <tr>
                    <td className="p-0 border-0 align-top h-full">
                      <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">`;

  // Replace Page 3 Open
  lines[openings[2]] = `<table className="w-full print:table border-collapse border-0 h-full">
                <thead className="hidden print:table-header-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.top || '0.5'}in\` }}></div></td></tr>
                </thead>
                <tfoot className="hidden print:table-footer-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.bottom || '0.5'}in\` }}></div></td></tr>
                </tfoot>
                <tbody className="print:table-row-group">
                  <tr>
                    <td className="p-0 border-0 align-top h-full">
                      <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">`;

  // Page 1 close
  let page2Start = lines.findIndex(l => l.includes('Page 2: Answer Key Sheet'));
  let page1CloseIdx = page2Start - 1;
  while (!lines[page1CloseIdx].includes('</div>')) page1CloseIdx--; // container
  page1CloseIdx--;
  while (!lines[page1CloseIdx].includes('</div>')) page1CloseIdx--; // padding
  lines[page1CloseIdx] = lines[page1CloseIdx].replace('</div>', '</div></td></tr></tbody></table>');

  // Page 2 close
  let page3Start = lines.findIndex(l => l.includes('Page 3: OMR Sheet Attachment'));
  let page2CloseIdx = page3Start - 1;
  while (!lines[page2CloseIdx].includes('</div>')) page2CloseIdx--; // container
  page2CloseIdx--;
  while (!lines[page2CloseIdx].includes('</div>')) page2CloseIdx--; // padding
  lines[page2CloseIdx] = lines[page2CloseIdx].replace('</div>', '</div></td></tr></tbody></table>');

  // Page 3 close
  let actionBtnStart = lines.findIndex(l => l.includes('Action button beneath paper'));
  let page3CloseIdx = actionBtnStart - 1;
  while (!lines[page3CloseIdx].includes('</div>')) page3CloseIdx--; // printable-paper
  page3CloseIdx--;
  while (!lines[page3CloseIdx].includes('</div>')) page3CloseIdx--; // container
  page3CloseIdx--;
  while (!lines[page3CloseIdx].includes('</div>')) page3CloseIdx--; // padding
  lines[page3CloseIdx] = lines[page3CloseIdx].replace('</div>', '</div></td></tr></tbody></table>');

  fs.writeFileSync(filePath, lines.join('\\n'), 'utf8');
  console.log('Successfully replaced all tags using AST-like line processor!');
} else {
  console.log('Failed to find exactly 3 openings!');
}
