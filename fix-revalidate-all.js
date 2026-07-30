const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/[locale]/admin/assessment-center/[type]/[slug]/answer-sheet/page.tsx',
  'src/app/[locale]/mock-tests/[slug]/take/page.tsx',
  'src/app/[locale]/mock-tests/[slug]/page.tsx',
  'src/app/[locale]/practice/[slug]/take/page.tsx',
  'src/app/[locale]/practice/[slug]/page.tsx',
  'src/app/[locale]/quiz/[slug]/take/page.tsx',
  'src/app/[locale]/quiz/[slug]/page.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace any CACHE_SETTINGS variable with 3600
    content = content.replace(/export\s+const\s+revalidate\s*=\s*CACHE_SETTINGS\.[A-Z_]+\s*;/g, 'export const revalidate = 3600;');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
  }
});
