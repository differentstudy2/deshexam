const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldPattern = /\{pageBorderStyle === 'text' && \([\s\S]*?\}\)/;

const newPattern = `{pageBorderStyle === 'text' && (
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

content = content.replace(oldPattern, newPattern);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed text borders successfully!');
