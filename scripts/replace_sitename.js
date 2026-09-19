const fs = require('fs');
const path = require('path');

const targetName = "DeshExam";
const replacementVar = "process.env.NEXT_PUBLIC_SITE_NAME || 'DeshExam'";

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

    // 1. Replace exact string literals
    content = content.replace(/'DeshExam'/g, '`${' + replacementVar + '}`');
    content = content.replace(/"DeshExam"/g, '`${' + replacementVar + '}`');

    // 2. Replace DeshExam inside larger string literals (single/double quotes)
    // Avoid import statements and JSON-like keys (e.g. "DeshExam": ...)
    const stringLiteralRegex = /(['"])((?:(?!\1)[^\\]|\\.)*?)DeshExam((?:(?!\1)[^\\]|\\.)*?)\1/g;
    content = content.replace(stringLiteralRegex, (match, quote, prefix, suffix) => {
        // Exclude import statements
        if (prefix.includes('import') || prefix.includes('require')) return match;
        // Exclude keys like "DeshExam":
        if (suffix.trim().startsWith(':')) return match;
        
        return '`' + prefix + '${' + replacementVar + '}' + suffix + '`';
    });

    // 3. Fix JSX attributes that were converted to template literals without braces
    // e.g. title=`${process.env...}` -> title={`...`}
    const jsxAttrRegex = /([a-zA-Z0-9_-]+)=`([^`]*)`/g;
    content = content.replace(jsxAttrRegex, '$1={`$2`}');

    // 4. Replace DeshExam inside JSX text (between > and <)
    // Matches text between > and < containing DeshExam
    const jsxTextRegex = />([^<]*?)DeshExam([^<]*?)</g;
    content = content.replace(jsxTextRegex, (match, prefix, suffix) => {
        return '>' + prefix + '{' + replacementVar + '}' + suffix + '<';
    });
    
    // Because the jsxTextRegex above might only match one occurrence per text node,
    // we run it a second time just in case there are multiple "DeshExam" in the same text node.
    content = content.replace(jsxTextRegex, (match, prefix, suffix) => {
        return '>' + prefix + '{' + replacementVar + '}' + suffix + '<';
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

walkDir(path.join(__dirname, '../src'), processFile);
console.log("Done.");
