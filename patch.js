const fs = require('fs');

function patchPage() {
    let content = fs.readFileSync('src/app/faq/page.tsx', 'utf8');

    // add imports
    if (!content.includes('getFaqs')) {
        const imports = `import { useEffect, useState } from 'react';
import { getFaqs, getCategories } from '@/features/faqs/services/faq.api';
import { FAQ, FAQCategory } from '@/features/faqs/types/faq.types';
import { Loader2 } from 'lucide-react';
`;
        content = content.replace("import { useState } from 'react';", imports);
    }

    const newState = `    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [categoriesData, setCategoriesData] = useState<FAQCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedFaqs = await getFaqs();
                const fetchedCategories = await getCategories();
                setFaqs(fetchedFaqs);
                setCategoriesData(fetchedCategories);
            } catch (e) {
                console.error("Failed to load", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.categoryId === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const recentFaqsList = [...faqs].sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return bTime - aTime;
    }).slice(0, 5);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" /></div>;
    }
`;
    
    // Inject state without destroying the other states
    if (!content.includes('setFaqs')) {
        content = content.replace(
            "const { toast } = useToast();", 
            "const { toast } = useToast();\n" + newState
        );
        content = content.replace("const [expandedFaq, setExpandedFaq] = useState<number | null>(null);", "const [expandedFaq, setExpandedFaq] = useState<string | null>(null);");
    }

    // Replace usages of the static arrays with our dynamic ones
    // We keep the static arrays at the top to not break anything if they are used elsewhere, but we don't map over them.
    content = content.replace(/categories\.map/g, "[{id: 'all', name: 'সকল FAQ'}, ...categoriesData].map");
    content = content.replace(/{cat\.icon}/g, '<Folder className="w-4 h-4" />');
    
    content = content.replace(/recentFaqs\.map/g, "recentFaqsList.map");
    content = content.replace(/{faq\.title}/g, "{faq.question}");
    content = content.replace(/{faq\.subtitle}/g, "{faq.answer}");
    
    content = content.replace(/faqsList\.map/g, "filteredFaqs.map");
    content = content.replace(/{faq\.text}/g, "{faq.question}");
    content = content.replace(/{faq\.category}/g, "{(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}");
    content = content.replace(/`\/faq\/\$\{faq\.id\}`/g, "`/faq/${faq.seo?.slug || faq.id}`");

    fs.writeFileSync('src/app/faq/page.tsx', content, 'utf8');
}

function patchSinglePage() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');

    if (!content.includes('getFaqBySlugOrId')) {
        content = content.replace("import { useParams } from 'next/navigation';", 
        `import { useParams, useRouter } from 'next/navigation';\nimport { useEffect, useState } from 'react';\nimport { getFaqBySlugOrId, getFaqs, getCategories } from '@/features/faqs/services/faq.api';\nimport { FAQ, FAQCategory } from '@/features/faqs/types/faq.types';\nimport { Loader2 } from 'lucide-react';\n`);
    }

    const newState = `
    const router = useRouter();
    const [faq, setFaq] = useState<FAQ | null>(null);
    const [categoriesData, setCategoriesData] = useState<FAQCategory[]>([]);
    const [relatedFaqsList, setRelatedFaqsList] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            try {
                const fetchedFaq = await getFaqBySlugOrId(id as string);
                if (!fetchedFaq) {
                    router.push('/faq');
                    return;
                }
                setFaq(fetchedFaq);
                
                const fetchedCategories = await getCategories();
                setCategoriesData(fetchedCategories);

                const allFaqs = await getFaqs();
                setRelatedFaqsList(allFaqs.filter(f => f.categoryId === fetchedFaq.categoryId && f.id !== fetchedFaq.id).slice(0, 4));
            } catch (err) {
                router.push('/faq');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, router]);

    if (loading || !faq) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" /></div>;
    }
`;
    if (!content.includes('setFaq')) {
        content = content.replace(
            "const id = params.id;", 
            "const id = params.id;\n" + newState
        );
    }

    content = content.replace(/ফন্ট ও লেআউট কা\.\.\./g, "{faq.question.substring(0, 20)}...");
    content = content.replace(/ফন্ট ও লেআউট কাস্টমাইজ করা যাবে\?/g, "{faq.question}");
    content = content.replace(/"E-Question Builder"/g, "{(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}");
    
    content = content.replace("04 Aug, 2025", "{faq.createdAt?.toDate ? faq.createdAt.toDate().toLocaleDateString() : 'Recent'}");
    content = content.replace("6 মাস আগে", "{faq.updatedAt?.toDate ? faq.updatedAt.toDate().toLocaleDateString() : 'Recent'}");
    content = content.replace("382 বার", "{faq.views || 0} বার");

    content = content.replace(/categories\.map/g, "[{id: 'all', name: 'সকল FAQ'}, ...categoriesData].map");
    content = content.replace(/{cat\.icon}/g, '<Folder className="w-4 h-4" />');
    
    content = content.replace(/relatedFaqs\.map/g, "relatedFaqsList.map");
    content = content.replace(/{faq\.title}/g, "{item.question}"); // wait, map arg is faq or item?
    content = content.replace(/{faq\.subtitle}/g, "{faq.answer}");
    
    // Oh wait, in relatedFaqs.map it uses (faq, index) so I must use {faq.question}
    content = content.replace(/{item\.question}/g, "{faq.question}");

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

patchPage();
patchSinglePage();
console.log("Patched successfully");
