const text = `1. What is the capital of India?
A. Dhaka
B. New Delhi
C. Kolkata
D. Mumbai
Answer: B`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l);
const allBlocks = [];
let currentBlockLines = [];

lines.forEach(line => {
  if (/^\d+[\.\)]/.test(line) && currentBlockLines.length > 0) {
    allBlocks.push([...currentBlockLines]);
    currentBlockLines = [line];
  } else {
    currentBlockLines.push(line);
  }
});
if (currentBlockLines.length > 0) allBlocks.push(currentBlockLines);

let newQuestions = [];

allBlocks.forEach((lines, idx) => {
  if (lines.length > 0) {
    let qTextLines = [];
    let optA = '', optB = '', optC = '', optD = '';
    let correctAns = 'a';
    let qType = 'MCQ';

    const optionRegex = /^([a-dক-ঘ])[\.\)]\s*(.*)/i;
    const answerRegex = /^(?:answer|উত্তর|সঠিক উত্তর|ans|ans\.)[\s:-]*(.*)/i;
    const typeRegex = /^(?:type|টাইপ|question type)[\s:-]*(mcq|t\/f|fib|match|cq|desc|short question|broad question|short|broad|true\/false|fill in the blanks|matching)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const typeMatch = line.match(typeRegex);
      if (typeMatch) {
        const t = typeMatch[1].toLowerCase();
        if (t.includes('mcq')) qType = 'MCQ';
        else if (t.includes('t/f') || t.includes('true')) qType = 'T/F';
        else if (t.includes('fib') || t.includes('fill')) qType = 'FIB';
        else if (t.includes('match')) qType = 'Match';
        else if (t.includes('cq')) qType = 'CQ';
        else if (t.includes('desc')) qType = 'Desc';
        else if (t.includes('short')) qType = 'Short Question';
        else if (t.includes('broad')) qType = 'Broad Question';
        continue;
      }

      const ansMatch = line.match(answerRegex);
      if (ansMatch) {
        const val = ansMatch[1].trim();
        const char = val.toLowerCase();
        if (char === 'a' || char === 'ক') correctAns = 'a';
        else if (char === 'b' || char === 'খ') correctAns = 'b';
        else if (char === 'c' || char === 'গ') correctAns = 'c';
        else if (char === 'd' || char === 'ঘ') correctAns = 'd';
        else correctAns = val;
        continue;
      }

      const optMatch = line.match(optionRegex);
      if (optMatch) {
        const char = optMatch[1].toLowerCase();
        const val = optMatch[2];
        if (char === 'a' || char === 'ক') optA = val;
        else if (char === 'b' || char === 'খ') optB = val;
        else if (char === 'c' || char === 'গ') optC = val;
        else if (char === 'd' || char === 'ঘ') optD = val;
        continue;
      }

      if (!optA && !optB && !optC && !optD) {
        qTextLines.push(line);
      }
    }

    const qText = qTextLines.join('<br/>').replace(/^\d+[\.)]\s*/, '');

    newQuestions.push({
      questionText: qText,
      options: { a: optA, b: optB, c: optC, d: optD },
      correctAnswer: correctAns,
      questionType: qType,
    });
  }
});

console.log(JSON.stringify(newQuestions, null, 2));
