const fs = require('fs');

function fixPage() {
    let content = fs.readFileSync('src/app/faq/page.tsx', 'utf8');

    // Fix categories.length reference
    content = content.replace(
        "[{id: 'all', name: 'সকল FAQ'}, ...categoriesData].map((cat, index) => {",
        "[{id: 'all', name: 'সকল FAQ'}, ...categoriesData].map((cat, index, arr) => {"
    );
    content = content.replace(
        "index !== categories.length - 1 && \"border-b border-b-slate-100\"",
        "index !== arr.length - 1 && \"border-b border-b-slate-100\""
    );

    // Fix recentFaqs.length reference
    content = content.replace(
        "{recentFaqsList.map((faq, index) => (",
        "{recentFaqsList.map((faq, index, arr) => ("
    );
    content = content.replace(
        "index !== recentFaqs.length - 1 && \"border-b border-slate-100\"",
        "index !== arr.length - 1 && \"border-b border-slate-100\""
    );

    // Fix the old arrays left at the top just in case they cause ReferenceErrors
    content = content.replace(/const categories = \[[\s\S]*?\];/m, "");
    content = content.replace(/const recentFaqs = \[[\s\S]*?\];/m, "");
    content = content.replace(/const faqsList = \[[\s\S]*?\];/m, "");

    fs.writeFileSync('src/app/faq/page.tsx', content, 'utf8');
}

fixPage();
console.log("Fixed main faq page data beautifully");
