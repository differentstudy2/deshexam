const fs = require('fs');

function patchRelated() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');

    const oldBlock = `<div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors cursor-pointer flex flex-col h-full">
                                        <h3 className="font-bold text-slate-800 text-[14px] leading-snug mb-2">
                                            {faq.question}
                                        </h3>
                                        <p className="text-[12px] text-slate-500 leading-relaxed mb-4 flex-1">
                                            {faq.answer}
                                        </p>
                                        <div className="mt-auto">
                                            <span className="inline-block border border-slate-200 bg-white text-slate-600 px-3 py-1 rounded text-[11px] font-bold">
                                                {(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}
                                            </span>
                                        </div>
                                    </div>`;

    const newBlock = `<Link href={\`/faq/\${faq.seo?.slug || faq.id}\`} key={faq.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col h-full">
                                        <h3 className="font-bold text-slate-800 text-[14px] leading-snug mb-2">
                                            {faq.question}
                                        </h3>
                                        <p className="text-[12px] text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-2">
                                            {faq.answer}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="inline-block border border-slate-200 bg-white text-slate-600 px-3 py-1 rounded text-[11px] font-bold">
                                                {(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[12px] font-medium">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>{faq.views || 0}</span>
                                            </div>
                                        </div>
                                    </Link>`;

    if (content.includes('className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors cursor-pointer flex flex-col h-full"')) {
        content = content.replace(oldBlock, newBlock);
    } else {
        console.log("Could not find exact block, attempting regex fallback...");
        // Fallback regex to capture the old block structure in case indentation differs
        content = content.replace(
            /<div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors cursor-pointer flex flex-col h-full">.*?<h3.*?{faq\.question}.*?<\/h3>.*?<p.*?{faq\.answer}.*?<\/p>.*?<div className="mt-auto">.*?<span.*?<\/span>.*?<\/div>\s*<\/div>/s,
            newBlock
        );
    }

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

patchRelated();
console.log("RELATED FAQS PATCH COMPLETED");
