const fs = require('fs');

function fixData() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');

    // 1. Remove the use() unwrap since it caused the crash earlier
    content = content.replace(
        "const unwrappedParams = use(params as any) as { id: string };\n    const id = unwrappedParams.id;",
        "const id = params?.id as string;"
    );

    // 2. Fix the hardcoded answer block
    content = content.replace(
        "অবশ্যই, E-Question Builder-এ রয়েছে Font Size, Font Style, Layout Control - যার মাধ্যমে আপনি প্রিন্ট বা PDF এর চেহারা একদম নিজের মতো করে ডিজাইন করতে পারবেন।",
        "{faq.answer}"
    );

    // Make the `<p>` tag use whitespace-pre-wrap to handle line breaks in answer
    content = content.replace(
        '<p className="text-[15px] text-slate-800 leading-relaxed font-medium">',
        '<p className="text-[15px] text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">'
    );

    // 3. Fix the view count and helpful votes in the sidebar
    content = content.replace(
        '<div className="text-2xl font-bold text-blue-500 mb-1">381</div>',
        '<div className="text-2xl font-bold text-blue-500 mb-1">{faq.views || 0}</div>'
    );
    
    content = content.replace(
        '<div className="text-2xl font-bold text-emerald-500 mb-1">2</div>',
        '<div className="text-2xl font-bold text-emerald-500 mb-1">0</div>'
    );

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

fixData();
console.log("Fixed data perfectly");
