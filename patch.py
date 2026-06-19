import re

def patch_page():
    with open('src/app/faq/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # remove static data
    content = re.sub(r'const categories = \[.*?\];', '', content, flags=re.DOTALL)
    content = re.sub(r'const recentFaqs = \[.*?\];', '', content, flags=re.DOTALL)
    content = re.sub(r'const faqsList = \[.*?\];', '', content, flags=re.DOTALL)

    # add imports
    if 'getFaqs' not in content:
        imports = "import { useEffect, useState } from 'react';\nimport { getFaqs, getCategories } from '@/features/faqs/services/faq.api';\nimport { FAQ, FAQCategory } from '@/features/faqs/types/faq.types';\nimport { Loader2 } from 'lucide-react';\n"
        content = content.replace("import { useState } from 'react';", imports)

    new_state = """    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [categories, setCategories] = useState<FAQCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const fetchedFaqs = await getFaqs();
            const fetchedCategories = await getCategories();
            setFaqs(fetchedFaqs);
            setCategories(fetchedCategories);
            setLoading(false);
        };
        loadData();
    }, []);

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.categoryId === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const recentFaqsList = [...faqs].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).slice(0, 5);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" /></div>;
    }
"""
    if 'setFaqs' not in content:
        content = re.sub(r'export default function FAQPage\(\) \{\n', 'export default function FAQPage() {\n' + new_state, content)

    # UI replacements
    content = content.replace("categories.map((cat, index)", "[{id: 'all', name: 'সকল FAQ'}, ...categories].map((cat, index)")
    content = content.replace("{cat.icon}", '<Folder className="w-4 h-4" />')
    
    content = content.replace("recentFaqs.map", "recentFaqsList.map")
    content = content.replace("{faq.title}", "{faq.question}")
    content = content.replace("{faq.subtitle}", "{faq.answer}")
    
    content = content.replace("faqsList.map", "filteredFaqs.map")
    content = content.replace("{faq.text}", "{faq.question}")
    content = content.replace("{faq.category}", "{(categories.find(c => c.id === faq.categoryId)?.name || 'General')}")
    content = content.replace("`/faq/${faq.id}`", "`/faq/${faq.seo?.slug || faq.id}`")

    with open('src/app/faq/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)


def patch_single_page():
    with open('src/app/faq/[id]/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # remove static data
    content = re.sub(r'const categories = \[.*?\];', '', content, flags=re.DOTALL)
    content = re.sub(r'const relatedFaqs = \[.*?\];', '', content, flags=re.DOTALL)

    # add imports
    if 'getFaqBySlugOrId' not in content:
        content = content.replace("import { useParams } from 'next/navigation';", 
        "import { useParams, useRouter } from 'next/navigation';\nimport { useEffect, useState } from 'react';\nimport { getFaqBySlugOrId, getFaqs, getCategories } from '@/features/faqs/services/faq.api';\nimport { FAQ, FAQCategory } from '@/features/faqs/types/faq.types';\nimport { Loader2 } from 'lucide-react';\n")

    new_state = """
    const router = useRouter();
    const [faq, setFaq] = useState<FAQ | null>(null);
    const [categories, setCategories] = useState<FAQCategory[]>([]);
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
                setCategories(fetchedCategories);

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
"""
    if 'setFaq' not in content:
        content = re.sub(r'export default function SingleFAQPage\(\) \{\n.*?const id = params.id;\n', 
        'export default function SingleFAQPage() {\n    const params = useParams();\n    const id = params.id;\n' + new_state, content, flags=re.DOTALL)

    # UI Replacements
    content = content.replace("ফন্ট ও লেআউট কা...", "{faq.question.substring(0, 20)}...")
    content = content.replace("ফন্ট ও লেআউট কাস্টমাইজ করা যাবে?", "{faq.question}")
    content = content.replace("E-Question Builder", "{(categories.find(c => c.id === faq.categoryId)?.name || 'General')}")
    
    # date replacements
    content = content.replace("04 Aug, 2025", "{faq.createdAt.toDate().toLocaleDateString()}")
    content = content.replace("6 মাস আগে", "{faq.updatedAt.toDate().toLocaleDateString()}")
    content = content.replace("382 বার", "{faq.views} বার")

    content = content.replace("categories.map((cat, index)", "[{id: 'all', name: 'সকল FAQ'}, ...categories].map((cat, index)")
    content = content.replace("{cat.icon}", '<Folder className="w-4 h-4" />')
    
    content = content.replace("relatedFaqs.map", "relatedFaqsList.map")
    content = content.replace("{faq.title}", "{item.question}") # wait we need to see what var is used inside relatedFaqs.map
    # we need to do regex replacement carefully
    
    with open('src/app/faq/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

patch_page()
patch_single_page()
print("Done")
