const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Force @page margin to 0
const pageCssRegex = /@page\s*\{\s*size:[^}]+;\s*margin:[^;]+;\s*(?:\$\{[^}]+\}\s*)?(?:@bottom-[^}]+\}\s*)*\}/;
const newPageCss = `@page {
                size: \${paperSize === 'A4' ? 'A4' : paperSize === 'Letter' ? 'letter' : 'legal'} \${orientation.toLowerCase()};
                margin: 0 !important; /* Force 0 margin to permanently hide browser headers */
              }`;
content = content.replace(pageCssRegex, newPageCss);

// 2. Add padding to preview-page-container
const printMediaRegex = /@media print\s*\{/;
content = content.replace(printMediaRegex, `@media print {
              .preview-page-container {
                padding-left: \${margins.left || '0.5'}in !important;
                padding-right: \${margins.right || '0.5'}in !important;
              }`);

// 3. Page 1: Main Paper Table wrapper
const page1OpenStr = `<div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300">`;
const page1OpenReplace = `<table className="w-full print:table border-collapse border-0 h-full">
                <thead className="hidden print:table-header-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.top || '0.5'}in\` }}></div></td></tr>
                </thead>
                <tfoot className="hidden print:table-footer-group">
                  <tr><td className="p-0 border-0 relative">
                    <div style={{ height: \`\${margins.bottom || '0.5'}in\` }}></div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center text-[12px] font-bold text-gray-800 opacity-70">
                      <div>সৌজন্যে: \${footerText || 'দেশ এক্সাম একাডেমী'}</div>
                      \${showPageNumber ? '<div class="page-number-display"></div>' : ''}
                    </div>
                  </td></tr>
                </tfoot>
                <tbody className="print:table-row-group">
                  <tr>
                    <td className="p-0 border-0 align-top h-full">
                      <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">`;
content = content.replace(page1OpenStr, page1OpenReplace);

const page1CloseStr = `                    {/* Footer Logo */}
                    <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center text-[12px] font-bold text-gray-800 opacity-70 print:hidden">
                      সৌজন্যে: {footerText || 'দেশ এক্সাম একাডেমী'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 2: Answer Key Sheet */}`;
const page1CloseReplace = `                    {/* Footer Logo */}
                    <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center text-[12px] font-bold text-gray-800 opacity-70 print:hidden">
                      সৌজন্যে: {footerText || 'দেশ এক্সাম একাডেমী'}
                    </div>
                  </div>
                </td></tr></tbody></table>
                </div>
              </div>
            )}

            {/* Page 2: Answer Key Sheet */}`;
content = content.replace(page1CloseStr, page1CloseReplace);


// 4. Page 2: Answer Key
const page2OpenStr = `<div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">
                  {/* Watermark for Answer Key */}`;
const page2OpenReplace = `<table className="w-full print:table border-collapse border-0 h-full">
                <thead className="hidden print:table-header-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.top || '0.5'}in\` }}></div></td></tr>
                </thead>
                <tfoot className="hidden print:table-footer-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.bottom || '0.5'}in\` }}></div></td></tr>
                </tfoot>
                <tbody className="print:table-row-group">
                  <tr>
                    <td className="p-0 border-0 align-top h-full">
                      <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">
                  {/* Watermark for Answer Key */}`;
content = content.replace(page2OpenStr, page2OpenReplace);

const page2CloseStr = `                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Page 3: OMR Sheet Attachment */}`;
const page2CloseReplace = `                    </div>

                  </div>
                </td></tr></tbody></table>
                </div>
              </div>
            )}

            {/* Page 3: OMR Sheet Attachment */}`;
content = content.replace(page2CloseStr, page2CloseReplace);

// 5. Page 3: OMR Sheet
const page3OpenStr = `<div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">
                  {/* Watermark for OMR */}`;
const page3OpenReplace = `<table className="w-full print:table border-collapse border-0 h-full">
                <thead className="hidden print:table-header-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.top || '0.5'}in\` }}></div></td></tr>
                </thead>
                <tfoot className="hidden print:table-footer-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.bottom || '0.5'}in\` }}></div></td></tr>
                </tfoot>
                <tbody className="print:table-row-group">
                  <tr>
                    <td className="p-0 border-0 align-top h-full">
                      <div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300 h-full">
                  {/* Watermark for OMR */}`;
content = content.replace(page3OpenStr, page3OpenReplace);

const page3CloseStr = `                    {/* Footer Logo */}
                    <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center text-[12px] font-bold text-gray-800 opacity-70 print:hidden">
                      সৌজন্যে: {footerText || 'দেশ এক্সাম একাডেমী'}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>`;
const page3CloseReplace = `                    {/* Footer Logo */}
                    <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center text-[12px] font-bold text-gray-800 opacity-70 print:hidden">
                      সৌজন্যে: {footerText || 'দেশ এক্সাম একাডেমী'}
                    </div>
                  </div>
                </td></tr></tbody></table>
                </div>
              </div>
            )}

          </div>`;
content = content.replace(page3CloseStr, page3CloseReplace);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Force removed browser headers successfully without syntax errors!');
