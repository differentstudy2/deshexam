const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/features/faqs/components/faq-form.tsx',
  'src/app/[locale]/e-question-builder/create-question/AiQuestionGeneratorModal.tsx',
  'src/app/[locale]/admin/question-bank/questions/page.tsx',
  'src/app/[locale]/admin/institution/[id]/page.tsx',
  'src/components/admin/QuestionBankEditor.tsx',
  'src/components/assessment/MockTestReviews.tsx',
  'src/components/admin/TiptapEditor.tsx',
  'src/components/admin/TopicQuestionManager.tsx',
  'src/app/[locale]/admin/guide-content/topic/[id]/page.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if already updated
    if (content.includes('fetchWithAuth')) return;
    
    // Replace fetch( with fetchWithAuth(
    // We only replace fetch calls that are pointing to /api/ai or /api/admin
    content = content.replace(/fetch\(\s*(['"]\/api\/ai\/[^'"]+['"])/g, 'fetchWithAuth($1');
    content = content.replace(/fetch\(\s*(['"]\/api\/admin\/[^'"]+['"])/g, 'fetchWithAuth($1');
    
    // Add import statement at the top
    const importStatement = `import { fetchWithAuth } from '@/lib/fetch-with-auth';\n`;
    
    // Insert after the first import or at the very beginning
    const firstImportIndex = content.indexOf('import ');
    if (firstImportIndex !== -1) {
      content = content.slice(0, firstImportIndex) + importStatement + content.slice(firstImportIndex);
    } else {
      content = importStatement + content;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`Not found: ${filePath}`);
  }
});
