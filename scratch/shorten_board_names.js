const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/data/hardcoded/taxonomy');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const boardNameMap = {
  "board-wb": "WBBSE",
  "board-wbchse": "WBCHSE",
  "board-wbbme": "WBBME",
  "board-wbbpe": "WBBPE"
};

for (const file of files) {
  const filePath = path.join(dir, file);
  let data = fs.readFileSync(filePath, 'utf8');
  let json = JSON.parse(data);

  let modified = false;

  for (const item of json) {
    if (item.type === 'board' && boardNameMap[item.id]) {
      if (item.title !== boardNameMap[item.id]) {
        item.title = boardNameMap[item.id];
        modified = true;
      }
    }
    
    if (item.ancestors) {
      for (const anc of item.ancestors) {
        if (anc.type === 'board' && boardNameMap[anc.id]) {
          if (anc.title !== boardNameMap[anc.id]) {
            anc.title = boardNameMap[anc.id];
            modified = true;
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  }
}

console.log("Board names shortened successfully!");
