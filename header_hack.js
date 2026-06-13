const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update @page CSS
const pageCssRegex = /@page\s*\{\s*size:[^}]+;\s*margin:[^;]+;\s*(?:\$\{[^}]+\}\s*)?(?:@bottom-[^}]+\}\s*)*\}/;
const newPageCss = `@page {
                size: \${paperSize === 'A4' ? 'A4' : paperSize === 'Letter' ? 'letter' : 'legal'} \${orientation.toLowerCase()};
                margin: 0 0 0.3in 0 !important;
                
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
content = content.replace(pageCssRegex, newPageCss);

// 2. Add padding to preview-page-container in print
const printMediaRegex = /@media print\s*\{/;
content = content.replace(printMediaRegex, `@media print {
              .preview-page-container {
                padding-left: \${margins.left || '0.5'}in !important;
                padding-right: \${margins.right || '0.5'}in !important;
              }`);

// 3. Update the table wrappers for Main Paper, Answer Key, OMR
const paddingDivRegex = /<div className="preview-page-padding relative flex-1 flex flex-col transition-all duration-300(?: h-full)?">/g;

content = content.replace(paddingDivRegex, `<table className="w-full print:table border-collapse border-0 h-full">
                <thead className="hidden print:table-header-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`\${margins.top || '0.5'}in\` }}></div></td></tr>
                </thead>
                <tfoot className="hidden print:table-footer-group">
                  <tr><td className="p-0 border-0"><div style={{ height: \`calc(\${margins.bottom || '0.5'}in - 0.3in)\` }}></div></td></tr>
                </tfoot>
                <tbody className="print:table-row-group">
                  <tr>
                    <td className="p-0 border-0 align-top h-full">
                      $&`);

// Close the table
// Find where the padding div closes. It closes right before the end of the container.
// It's followed by `</div>` and then `</div>` or `)}`. We can just replace the closing `</div>` of the preview-page-padding.
// Actually, it's safer to just replace `</div>\n            </div>\n\n            {/* Page 2`
content = content.replace(/<\/div>\s*<\/div>\s*\{\/\* Page 2/g, `</div></td></tr></tbody></table></div>\n\n            {/* Page 2`);
content = content.replace(/<\/div>\s*<\/div>\s*\{\/\* Page 3/g, `</div></td></tr></tbody></table></div>\n\n            {/* Page 3`);
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)/g, `</div></td></tr></tbody></table></div></div>\n                        </div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            )}`); // Need a better way to close it for Page 3.

// Actually, simpler way: Let's use regex to find `<div className="preview-page-padding...` and replace its closing div.
// Since that's hard, let's write a targeted function to inject table structure.
