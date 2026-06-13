const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Set enableLatex to true
content = content.replace(
  'const [enableLatex, setEnableLatex] = useState(false);',
  'const [enableLatex, setEnableLatex] = useState(true);'
);

// Set qrCodeEnabled to true
content = content.replace(
  'const [qrCodeEnabled, setQrCodeEnabled] = useState(false);',
  'const [qrCodeEnabled, setQrCodeEnabled] = useState(true);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Defaults updated successfully!');
