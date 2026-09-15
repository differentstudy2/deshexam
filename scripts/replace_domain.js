const fs = require('fs');
const path = require('path');

const targetUrl = "https://deshexam.com";
const replacementLiteral = "${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}";

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace inside template literals: `https://deshexam.com...` -> `${process.env...}...`
    const templateRegex = new RegExp('`' + targetUrl, 'g');
    content = content.replace(templateRegex, '`' + replacementLiteral);

    // 2. Replace single quotes: 'https://deshexam.com...' -> `${process.env...}...`
    const singleQuoteRegex = new RegExp("'" + targetUrl + "(.*?)'", 'g');
    content = content.replace(singleQuoteRegex, '`' + replacementLiteral + "$1`");

    // 3. Replace double quotes: "https://deshexam.com..." -> `${process.env...}...`
    const doubleQuoteRegex = new RegExp('"' + targetUrl + '(.*?)"', 'g');
    content = content.replace(doubleQuoteRegex, '`' + replacementLiteral + "$1`");
    
    // 4. Handle JSX attributes that were string literals: href="https://deshexam.com..."
    // If it was href="https://deshexam.com/foo", the previous step turns it into href=`${...}/foo`
    // which is invalid JSX (needs curly braces).
    // Let's fix JSX attributes: attr=`...` -> attr={`...`}
    const jsxAttrRegex = /([a-zA-Z0-9_-]+)=`(\$\{process\.env\.NEXT_PUBLIC_SITE_URL \|\| 'http:\/\/localhost:3000'\}[^`]*)`/g;
    content = content.replace(jsxAttrRegex, '$1={`$2`}');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

walkDir(path.join(__dirname, '../src'), processFile);
console.log("Done.");
