const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state
content = content.replace(
    "const [paperSize, setPaperSize] = useState('Letter');",
    "const [paperSize, setPaperSize] = useState('Letter');\n  const [showPageBorder, setShowPageBorder] = useState(false);"
);

// 2. Save state
content = content.replace(
    "watermarkOpacity, paperSize, orientation, margins",
    "watermarkOpacity, paperSize, orientation, margins, showPageBorder"
);

// 3. Load state
content = content.replace(
    "if (s.margins) setMargins(s.margins);",
    "if (s.margins) setMargins(s.margins);\n        if (s.showPageBorder !== undefined) setShowPageBorder(s.showPageBorder);"
);

// 4. Add to UI
content = content.replace(
    '<h3 className="font-bold text-[#1c2b4f] mb-3 text-[15px]">Margins (inches)</h3>',
    `<div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#1c2b4f] text-[15px]">Margins (inches)</h3>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="showPageBorder" checked={showPageBorder} onChange={(e) => setShowPageBorder(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <label htmlFor="showPageBorder" className="text-[13px] text-gray-700 cursor-pointer">Page Border</label>
                </div>
              </div>`
);

// 5. Add border DOM element
const borderHtml = `          <div id="printable-paper" style={{ zoom: zoom } as React.CSSProperties} className="flex flex-col gap-8 print:gap-0 print:block relative">
            {showPageBorder && <div className="hidden print:block fixed top-0 bottom-0 left-0 right-0 border-[1.5px] border-gray-800 pointer-events-none z-50"></div>}`;

content = content.replace(
    /<div id="printable-paper" style=\{\{ zoom: zoom \}\s*as\s*React\.CSSProperties\} className="flex flex-col gap-8 print:gap-0 print:block">/,
    borderHtml
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added page border functionality successfully!');
