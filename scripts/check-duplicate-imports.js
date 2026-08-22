const fs = require('fs');
const path = require('path');

function findDuplicateImports(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null; // file not found
  }

  const lines = content.split('\n');
  const importMap = {};

  lines.forEach((line, idx) => {
    const match = line.match(/^import\s+.+?\s+from\s+['"](.+?)['"]/);
    if (!match) return;
    const source = match[1];
    if (!importMap[source]) importMap[source] = [];
    importMap[source].push({ line: idx + 1, text: line.trim() });
  });

  const duplicates = [];
  for (const [source, entries] of Object.entries(importMap)) {
    if (entries.length > 1) {
      duplicates.push({ source, entries });
    }
  }
  return duplicates;
}

// Recursively collect all .ts/.tsx files
function collectFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(entry.name)) {
        collectFiles(full, results);
      }
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const srcDir = path.join(process.cwd(), 'src');
const files = collectFiles(srcDir);

let totalDups = 0;

for (const f of files) {
  const dups = findDuplicateImports(f);
  if (dups && dups.length > 0) {
    totalDups += dups.length;
    const rel = path.relative(__dirname, f);
    console.log('\n=== ' + rel + ' ===');
    dups.forEach(d => {
      console.log('  [DUPLICATE] from: "' + d.source + '"');
      d.entries.forEach(e => console.log('    Line ' + e.line + ': ' + e.text));
    });
  }
}

if (totalDups === 0) {
  console.log('No duplicate imports found across all files.');
} else {
  console.log('\nTotal duplicate import groups: ' + totalDups);
}
