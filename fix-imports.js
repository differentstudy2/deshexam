const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@/app/')) {
    const newContent = content.replace(/@\/app\//g, '@/app/[locale]/');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed', file);
  }
}
console.log('Done!');
