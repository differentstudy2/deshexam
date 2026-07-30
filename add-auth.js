const fs = require('fs');
const path = require('path');

const directories = [
  'src/app/api/ai/generate',
  'src/app/api/ai/generate-explanation',
  'src/app/api/ai/generate-mcq',
  'src/app/api/ai/generate-from-file',
  'src/app/api/ai/generate-faq',
  'src/app/api/ai/generate-reviews',
  'src/app/api/ai/fill-details',
  'src/app/api/ai/summarize-reviews',
  'src/app/api/ai/generate-seo',
  'src/app/api/admin/translate'
];

directories.forEach(dir => {
  const filePath = path.join(__dirname, dir, 'route.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes('verifyAuthToken')) return;
    
    const importStatement = `import { verifyAuthToken } from '@/lib/firebase/auth-server';\n`;
    content = importStatement + content;
    
    const regex = /export\s+async\s+function\s+POST\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*[a-zA-Z0-9_]+\s*\)\s*\{\s*try\s*\{/g;
    
    content = content.replace(regex, (match, paramName) => {
      return `${match}
    const decodedToken = await verifyAuthToken(${paramName} as any);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
`;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`Not found: ${filePath}`);
  }
});
