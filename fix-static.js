const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/api/debug/route.ts',
  'src/app/api/dump/route.ts',
  'src/app/api/fix-faq-categories/route.ts',
  'src/app/api/repair-reviews/route.ts',
  'src/app/api/seed-guide/route.ts'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if already modified
    if (content.includes("export const dynamic = 'force-dynamic';") || content.includes('export const dynamic="force-dynamic"')) return;
    
    // We look for "export async function GET"
    const regex = /export\s+async\s+function\s+GET\s*\(/g;
    
    content = content.replace(regex, (match) => {
      return `export const dynamic = 'force-dynamic';\n\n${match}`;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`Not found: ${filePath}`);
  }
});
