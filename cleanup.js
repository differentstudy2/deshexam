const fs = require('fs');

function cleanSinglePage() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');
    
    // We will find the index of "const categories = [" and the index of "export default function SingleFAQPage() {"
    // and replace everything in between with a single newline.
    
    const startIdx = content.indexOf('const categories = [');
    const endIdx = content.indexOf('export default function SingleFAQPage() {');
    
    if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + content.substring(endIdx);
        fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
        console.log('Cleaned single page');
    } else {
        console.log('Could not find boundaries in single page');
    }
}

function cleanMainPage() {
    let content = fs.readFileSync('src/app/faq/page.tsx', 'utf8');
    
    const startIdx = content.indexOf('const categories = [');
    const endIdx = content.indexOf('export default function FAQPage() {');
    
    if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + content.substring(endIdx);
        fs.writeFileSync('src/app/faq/page.tsx', content, 'utf8');
        console.log('Cleaned main page');
    } else {
        console.log('Could not find boundaries in main page');
    }
}

cleanSinglePage();
cleanMainPage();
