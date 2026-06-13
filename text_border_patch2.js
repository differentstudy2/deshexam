const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldBlock = `{pageBorderStyle === 'text' && (
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

const newBlock = `{pageBorderStyle === 'text' && (
              <div className="hidden print:block fixed top-0 bottom-0 left-0 right-0 pointer-events-none z-[100] overflow-hidden">
                {/* Top Border */}
                <div className="absolute top-0 left-0 right-0 h-[12px] whitespace-nowrap text-[9px] text-gray-500 font-mono tracking-[4px] leading-none select-none flex items-start">
                  {"---deshexam.com".repeat(150)}
                </div>
                {/* Bottom Border */}
                <div className="absolute bottom-0 left-0 right-0 h-[12px] whitespace-nowrap text-[9px] text-gray-500 font-mono tracking-[4px] leading-none select-none flex items-end">
                  {"---deshexam.com".repeat(150)}
                </div>
                {/* Left Border */}
                <div className="absolute bottom-0 left-0 w-[200vh] h-[12px] whitespace-nowrap text-[9px] text-gray-500 font-mono tracking-[4px] leading-none select-none origin-bottom-left -rotate-90 flex items-start">
                  {"---deshexam.com".repeat(150)}
                </div>
                {/* Right Border */}
                <div className="absolute top-0 right-0 w-[200vh] h-[12px] whitespace-nowrap text-[9px] text-gray-500 font-mono tracking-[4px] leading-none select-none origin-top-right -rotate-90 flex items-start flex-row-reverse">
                  {"---deshexam.com".repeat(150)}
                </div>
              </div>
            )}`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed text borders safely!');
} else {
    console.log('Error: Could not find old block. Using fallback regex replacement.');
    
    // Fallback using split just in case spaces are slightly different
    const parts = content.split("{pageBorderStyle === 'text' && (");
    if (parts.length > 1) {
        const afterStart = parts[1];
        const endStr = '</div>\n            )}';
        const endIndex = afterStart.indexOf(endStr);
        if (endIndex !== -1) {
             const rest = afterStart.substring(endIndex + endStr.length);
             const safeNewBlock = `
              <div className="hidden print:block fixed top-0 bottom-0 left-0 right-0 pointer-events-none z-[100] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[12px] whitespace-nowrap text-[9px] text-gray-500 font-mono tracking-[4px] leading-none select-none flex items-start">
                  {"---deshexam.com".repeat(150)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[12px] whitespace-nowrap text-[9px] text-gray-500 font-mono tracking-[4px] leading-none select-none flex items-end">
                  {"---deshexam.com".repeat(150)}
                </div>
                <div className="absolute bottom-0 left-0 w-[200vh] h-[12px] whitespace-nowrap text-[9px] text-gray-500 font-mono tracking-[4px] leading-none select-none origin-bottom-left -rotate-90 flex items-start">
                  {"---deshexam.com".repeat(150)}
                </div>
                <div className="absolute top-0 right-0 w-[200vh] h-[12px] whitespace-nowrap text-[9px] text-gray-500 font-mono tracking-[4px] leading-none select-none origin-top-right -rotate-90 flex items-start flex-row-reverse">
                  {"---deshexam.com".repeat(150)}
                </div>
              </div>
            )}`;
             
             content = parts[0] + "{pageBorderStyle === 'text' && (" + safeNewBlock + rest;
             fs.writeFileSync(filePath, content, 'utf8');
             console.log('Fixed text borders using fallback!');
        }
    }
}
