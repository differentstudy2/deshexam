const fs = require('fs');
let code = fs.readFileSync('f:/developer/deshexam/src/app/[locale]/quiz/[slug]/page.tsx', 'utf8');

code = code.replace(/'quizzes'/g, "'practiceSets'");
code = code.replace(/QuizLandingPage/g, 'PracticeLandingPage');
code = code.replace(/Quiz Not Found/g, 'Practice Set Not Found');
code = code.replace(/\| Quiz \|/g, '| Practice Set |');
code = code.replace(/the \$\{test\.title\} quiz/g, 'the ${test.title} practice set');
code = code.replace(/deshexam quizzes/g, 'deshexam practice sets');
code = code.replace(/\/quiz\//g, '/practice/');
code = code.replace(/>Quiz</g, '>Practice Set<');
code = code.replace(/>Quizzes</g, '>Practice Sets<');
code = code.replace(/> Quiz /g, '> Practice Set ');
code = code.replace(/About this quiz/gi, 'About this practice set');
code = code.replace(/Start Quiz/g, 'Start Practice');
code = code.replace(/Start Practice Set/g, 'Start Practice');
code = code.replace(/quiz for /g, 'practice set for ');
code = code.replace(/Quiz \| /g, 'Practice Set | ');

fs.writeFileSync('f:/developer/deshexam/src/app/[locale]/practice/[slug]/page.tsx', code);
console.log('Success!');
