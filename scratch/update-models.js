const fs = require('fs');
const path = require('path');
const dir = 'f:/developer/deshexam/src/ai/flows';
const files = fs.readdirSync(dir);
files.forEach(f => {
  if(f.endsWith('.ts')) {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    if(content.includes('ai.definePrompt({') && !content.includes('model:')) {
      content = content.replace(/(ai\.definePrompt\(\{\s*name:\s*['"][^'"]+['"],)/g, "$1\n  model: 'googleai/gemini-2.5-flash',");
      fs.writeFileSync(p, content);
      console.log('Updated ' + f);
    }
  }
});
