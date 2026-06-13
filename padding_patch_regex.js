const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\.preview-page-padding\s*\{\s*padding:\s*0\s*!important;\s*\/\*\s*Let\s*@page\s*handle\s*print\s*margins\s*\*\/\s*\}/g;

const newCss = `.preview-page-padding {
                padding: \${pageBorderStyle !== 'none' ? '0.35in' : '0'} !important; /* Add padding inside the border if a border is active */
              }`;

if (content.match(regex)) {
    content = content.replace(regex, newCss);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully fixed padding with regex!');
} else {
    console.log('Failed to match regex!');
}
