const fs = require('fs');

function patchSinglePage() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');

    if (!content.includes('getFaqBySlugOrId')) {
        content = content.replace("import { useParams } from 'next/navigation';", 
        `import { useParams, useRouter } from 'next/navigation';\nimport { useEffect, useState, use } from 'react';\nimport { getFaqBySlugOrId, getFaqs, getCategories } from '@/features/faqs/services/faq.api';\nimport { FAQ, FAQCategory } from '@/features/faqs/types/faq.types';\nimport { Loader2 } from 'lucide-react';\n`);
    }

    const newState = `
    const router = useRouter();
    // Unwrap params using React.use() to fix Next.js 15 warning
    const unwrappedParams = use(params as any) as { id: string };
    const id = unwrappedParams.id;

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
            newState
        );
    }

    content = content.replace(/ফন্ট ও লেআউট কা\.\.\./g, "{faq.question.substring(0, 20)}...");
    content = content.replace(/ফন্ট ও লেআউট কাস্টমাইজ করা যাবে\?/g, "{faq.question}");
    
    // Fix: use categoryId instead of category if needed, or find name
    content = content.replace(/"E-Question Builder"/g, "{(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}");
    content = content.replace(/{faq\.category}/g, "{(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}");
    
    // Fix: safe toDate() call
    content = content.replace("04 Aug, 2025", "{faq.createdAt ? (typeof (faq.createdAt as any).toDate === 'function' ? (faq.createdAt as any).toDate().toLocaleDateString() : new Date(faq.createdAt as any).toLocaleDateString()) : 'Recent'}");
    content = content.replace("6 মাস আগে", "{faq.updatedAt ? (typeof (faq.updatedAt as any).toDate === 'function' ? (faq.updatedAt as any).toDate().toLocaleDateString() : new Date(faq.updatedAt as any).toLocaleDateString()) : 'Recent'}");
    content = content.replace("382 বার", "{faq.views || 0} বার");

    content = content.replace(/categories\.map\(\(cat, index\)/g, "[{id: 'all', name: 'সকল FAQ'}, ...categoriesData].map((cat, index, arr)");
    // Fix: categories.length reference
    content = content.replace(/categories\.length/g, "arr.length");
    content = content.replace(/{cat\.icon}/g, '<Folder className="w-4 h-4" />');
    
    content = content.replace(/relatedFaqs\.map/g, "relatedFaqsList.map");
    content = content.replace(/{faq\.title}/g, "{faq.question}"); 
    content = content.replace(/{faq\.subtitle}/g, "{faq.answer}");
    content = content.replace(/{item\.question}/g, "{faq.question}");
    
    // Clean up old static arrays safely
    content = content.replace(/const categories = \[[\s\S]*?\];/m, "");
    content = content.replace(/const relatedFaqs = \[[\s\S]*?\];/m, "");

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

patchSinglePage();
console.log("Patched single page successfully");
