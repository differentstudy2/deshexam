const fs = require('fs');
const path = require('path');

const classesFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/classes.json');
let classes = JSON.parse(fs.readFileSync(classesFile, 'utf8'));

// Helper to get a sortable value for a class title
const getClassValue = (title) => {
  const t = title.toLowerCase();
  if (t.includes('kg 1') || t.includes('kg-1')) return -2;
  if (t.includes('kg 2') || t.includes('kg-2')) return -1;
  const numMatch = t.match(/\d+/);
  if (numMatch) return parseInt(numMatch[0], 10);
  return 999;
};

// Sort by boardId (parentId) then by class value
classes.sort((a, b) => {
  if (a.parentId < b.parentId) return -1;
  if (a.parentId > b.parentId) return 1;
  
  const valA = getClassValue(a.title);
  const valB = getClassValue(b.title);
  return valA - valB;
});

// Update orderIndex
let currentBoard = null;
let currentOrder = 1;

for (const cls of classes) {
  if (cls.parentId !== currentBoard) {
    currentBoard = cls.parentId;
    currentOrder = 1;
  }
  cls.orderIndex = currentOrder++;
}

fs.writeFileSync(classesFile, JSON.stringify(classes, null, 2), 'utf8');
console.log('Classes reordered successfully!');
