const fs = require('fs');

function addFeatures() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');

    // 1. Add getTags import
    if (!content.includes('getTags')) {
        content = content.replace(
            "import { getFaqBySlugOrId, getFaqs, getCategories }",
            "import { getFaqBySlugOrId, getFaqs, getCategories, getTags }"
        );
        content = content.replace(
            "import { FAQ, FAQCategory }",
            "import { FAQ, FAQCategory, FAQTag }"
        );
    }

    // 2. Add state for tagsData
    if (!content.includes('setTagsData')) {
        content = content.replace(
            "const [categoriesData, setCategoriesData] = useState<FAQCategory[]>([]);",
            "const [categoriesData, setCategoriesData] = useState<FAQCategory[]>([]);\n    const [tagsData, setTagsData] = useState<FAQTag[]>([]);"
        );
    }

    // 3. Fetch tags
    if (!content.includes('fetchedTags = await getTags()')) {
        content = content.replace(
            "const fetchedCategories = await getCategories();\n                setCategoriesData(fetchedCategories);",
            "const fetchedCategories = await getCategories();\n                setCategoriesData(fetchedCategories);\n                const fetchedTags = await getTags();\n                setTagsData(fetchedTags);"
        );
    }

    // 4. Update Related FAQs cards
    // The current related FAQs render starts exactly like this:
    const oldRelatedBlock = `                                {relatedFaqsList.map((faq, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors cursor-pointer flex flex-col h-full">
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
                                    </div>
                                ))}`;
    
    const newRelatedBlock = `                                {relatedFaqsList.map((faq, idx) => (
                                    <Link href={\`/faq/\${faq.seo?.slug || faq.id}\`} key={idx} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors cursor-pointer flex flex-col h-full group">
                                        <h3 className="font-bold text-slate-800 text-[14px] leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                                            {faq.question}
                                        </h3>
                                        <p className="text-[12px] text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
                                            {faq.answer}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="inline-block border border-slate-200 bg-slate-50 text-slate-600 px-3 py-1 rounded text-[11px] font-bold">
                                                {(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[12px] font-medium">
                                                <Eye className="w-3.5 h-3.5" />
                                                {faq.views || 0}
                                            </div>
                                        </div>
                                    </Link>
                                ))}`;
    
    // Replace exactly the string block
    content = content.replace(oldRelatedBlock, newRelatedBlock);

    // 5. Add Tags Widget in Sidebar
    // Insert after Categories Widget
    const categoriesWidgetEnd = `                                })}
                            </div>
                        </div>`;
    
    const tagsWidget = `                        {/* Tags Widget */}
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <div className="bg-slate-900 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <Globe className="w-4 h-4" /> ট্যাগস
                            </div>
                            <div className="p-4 flex flex-wrap gap-2">
                                {tagsData.map((tag) => (
                                    <Link 
                                        key={tag.id}
                                        href={\`/faq?tag=\${tag.id}\`}
                                        className="inline-block px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[12px] font-medium rounded transition-colors"
                                    >
                                        {tag.name}
                                    </Link>
                                ))}
                            </div>
                        </div>`;

    if (!content.includes('Tags Widget')) {
        content = content.replace(categoriesWidgetEnd, categoriesWidgetEnd + '\n\n' + tagsWidget);
    }

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

addFeatures();
console.log("Added features cleanly");
