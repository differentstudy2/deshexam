const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("  const [pageBorderStyle, setPageBorderStyle] = useState('none');\n  const [pageBorderStyle, setPageBorderStyle] = useState('none');", "  const [pageBorderStyle, setPageBorderStyle] = useState('none');");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed duplicate declaration');
