const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/hardcoded/taxonomy/questions.json');
let questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const reorderedQuestions = questions.map(q => {
  const { id, slug, createdAt, ...rest } = q;
  const newQ = {};
  
  if (id) newQ.id = id;
  if (slug) newQ.slug = slug;
  if (createdAt) newQ.createdAt = createdAt;
  
  return { ...newQ, ...rest };
});

fs.writeFileSync(filePath, JSON.stringify(reorderedQuestions, null, 2), 'utf8');
console.log('Successfully reordered keys in questions.json');
