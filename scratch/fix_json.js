const fs = require('fs');
const lines = fs.readFileSync('./src/data/hardcoded/taxonomy/topics.json', 'utf8').split('\n');
const target = lines.slice(155, 197).join('\n');
const replacement = '    "content": ' + JSON.stringify(target.replace('    "content": "', '').replace(/"$/, ''));
const newLines = [...lines.slice(0, 155), replacement, ...lines.slice(197)];
fs.writeFileSync('./src/data/hardcoded/taxonomy/topics.json', newLines.join('\n'));
console.log('Fixed');
