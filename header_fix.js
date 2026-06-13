const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the useState values with empty strings using Regex to avoid UTF-8 mismatch
content = content.replace(/const \[headerTitle, setHeaderTitle\] = useState\([^)]+\);/g, "const [headerTitle, setHeaderTitle] = useState('');");
content = content.replace(/const \[headerAddress, setHeaderAddress\] = useState\([^)]+\);/g, "const [headerAddress, setHeaderAddress] = useState('');");
content = content.replace(/const \[headerClassName, setHeaderClassName\] = useState\([^)]+\);/g, "const [headerClassName, setHeaderClassName] = useState('');");
content = content.replace(/const \[headerSubjectName, setHeaderSubjectName\] = useState\([^)]+\);/g, "const [headerSubjectName, setHeaderSubjectName] = useState('');");
content = content.replace(/const \[headerChapterName, setHeaderChapterName\] = useState\([^)]+\);/g, "const [headerChapterName, setHeaderChapterName] = useState('');");

// 2. Remove the auto-translate useEffect
const autoTransRegex = /\/\/ Auto-translate default header texts based on language[\s\S]*?\}, \[appLanguage, headerTitle, headerAddress, headerClassName, headerSubjectName, headerChapterName\]\);/m;
content = content.replace(autoTransRegex, "// Auto-translate default header texts removed to allow empty fields.");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched the bug successfully!');
