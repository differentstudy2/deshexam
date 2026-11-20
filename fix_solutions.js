const fs = require('fs');
let data = JSON.parse(fs.readFileSync('./src/data/hardcoded/taxonomy/solutions.json', 'utf8'));

const colors = ['indigo', 'emerald', 'violet', 'rose', 'amber', 'teal', 'sky'];
let modifiedCount = 0;

data.forEach(item => {
  if (['sol-ekla-patabahar-class-5', 'sol-akasher-dui-bondhu-patabahar-class-5', 'sol-bombagarer-raja-patabahar-class-5'].includes(item.id)) {
    let html = item.content;
    colors.forEach(c => {
      let oldOuter = new RegExp(`class=['\"]rounded-xl bg-white/70 dark:bg-slate-900/50 border border-${c}-100/80 dark:border-${c}-900/50 overflow-hidden['\"]`, 'g');
      html = html.replace(oldOuter, `class='rounded-xl overflow-hidden'`);

      let oldAnsBox = new RegExp(`class=['\"]px-2 py-2 bg-${c}-50 dark:bg-${c}-950/50 border-t border-${c}-100 dark:border-${c}-900/40 flex items-start gap-2['\"]`, 'g');
      html = html.replace(oldAnsBox, `class='px-3 py-2 flex items-start gap-2 border-x border-b border-${c}-100 dark:border-${c}-900/40 bg-white/60 dark:bg-slate-900/40'`);

      let oldAnsText = new RegExp(`class=['\"]text-base leading-6 font-semibold text-${c}-900 dark:text-${c}-200['\"]`, 'g');
      html = html.replace(oldAnsText, `class='text-base leading-6 text-slate-700 dark:text-slate-300'`);
      
      let oldAnsText2 = new RegExp(`class=['\"]text-base leading-6 font-semibold text-${c}-900 dark:text-${c}-200 space-y-1 w-full['\"]`, 'g');
      html = html.replace(oldAnsText2, `class='text-base leading-6 text-slate-700 dark:text-slate-300 space-y-1 w-full'`);

      let oldAnsText3 = new RegExp(`class=['\"]text-base leading-6 font-semibold text-${c}-900 dark:text-${c}-200 flex flex-col gap-2 w-full['\"]`, 'g');
      html = html.replace(oldAnsText3, `class='text-base leading-6 text-slate-700 dark:text-slate-300 flex flex-col gap-2 w-full'`);

      let oldBold = new RegExp(`class=['\"]text-${c}-600 dark:text-${c}-400 font-bold['\"]`, 'g');
      html = html.replace(oldBold, `class='font-bold text-slate-900 dark:text-slate-100'`);
    });
    
    colors.forEach(c => {
      let subQRegex = new RegExp(`<div class=['\"]p-2 flex items-start gap-2['\"]>(\\s*<span class=['\"]shrink-0 inline-flex items-center justify-center w-10 h-6 rounded-lg bg-gradient-to-br from-${c}-400 to-${c}-600)`, 'g');
      html = html.replace(subQRegex, `<div class='p-2 flex items-start gap-2 bg-${c}-50/80 dark:bg-${c}-950/40 border border-${c}-100 dark:border-${c}-900/50'>$1`);
    });

    item.content = html;
    modifiedCount++;
  }
});

fs.writeFileSync('./src/data/hardcoded/taxonomy/solutions.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Modified', modifiedCount, 'items.');
