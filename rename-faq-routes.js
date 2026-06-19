const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  const replacements = [
    { from: `href="/faq"`, to: `href="/faqs"` },
    { from: `href="/faq/`, to: `href="/faqs/` },
    { from: `href={\`/faq/`, to: `href={\`/faqs/` },
    { from: `push('/faq')`, to: `push('/faqs')` },
    { from: `push("/faq")`, to: `push("/faqs")` },
    { from: `deshexam.com/faq/`, to: `deshexam.com/faqs/` },
    { from: `'/faq'`, to: `'/faqs'` },
    { from: `"/faq?category="`, to: `"/faqs?category="` },
    { from: `'/faq',`, to: `'/faqs',` }
  ];

  replacements.forEach(r => {
    if (content.includes(r.from)) {
      content = content.split(r.from).join(r.to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
