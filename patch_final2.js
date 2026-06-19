const fs = require('fs');

function patchFinal() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');

    // 1. Translations
    const translations = {
        'প্রশ্ন করুন': 'FAQ',
        'হোম': 'Home',
        'পিছনে': 'Back',
        'লেখক:': 'Author:',
        'প্রকাশিত:': 'Published:',
        'আপডেট:': 'Updated:',
        'দেখা হয়েছে: {faq.views || 0} বার': 'Views: {faq.views || 0}',
        'ওয়েব প্ল্যাটফর্ম': 'Information',
        'সংশ্লিষ্ট FAQ': 'Related FAQs',
        'ক্যাটাগরি': 'Categories',
        'সকল FAQ': 'All FAQs',
        'পরিসংখ্যান': 'Statistics',
        'ভিউ': 'Views',
        'সহায়ক ভোট': 'Helpful Votes',
        'এই FAQ টি কি সহায়ক?': 'Was this FAQ helpful?',
        'আপনার মতামত আমাদের উন্নতিতে সাহায্য করবে': '{hasVoted ? "Thank you for your feedback!" : "Your feedback helps us improve"}',
        'আরও সাহায্য প্রয়োজন?': 'Need More Help?',
        'এই FAQ আপনার সমস্যার সমাধান করতে পারেনি? আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।': 'Did this FAQ not solve your issue? Contact our support team.',
        'সাপোর্ট যোগাযোগ': 'Contact Support',
        'নতুন প্রশ্ন জিজ্ঞাসা': 'Ask a New Question',
        'ট্যাগস': 'Tags'
    };

    for (const [bn, en] of Object.entries(translations)) {
        content = content.split(bn).join(en);
    }

    // 2. Add Component State & Imports using robust Regex
    if (!content.includes('Check')) {
        content = content.replace(/Search,\s*Folder/, "Search, Check, Folder");
    }
    if (!content.includes('updateFaq')) {
        content = content.replace(/getCategories(,\s*getTags)?\s*} from '@\/features\/faqs\/services\/faq\.api';/, "getCategories, getTags, updateFaq } from '@/features/faqs/services/faq.api';");
    }
    if (!content.includes('const [copied, setCopied]')) {
        content = content.replace(/const \[loading,\s*setLoading\]\s*=\s*useState\(true\);/, "const [loading, setLoading] = useState(true);\n    const [copied, setCopied] = useState(false);\n    const [hasVoted, setHasVoted] = useState(false);");
    }

    // 3. Add Handlers using Regex
    const handlers = `
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleVote = async (type: 'yes' | 'no') => {
        if (!faq || hasVoted) return;
        setHasVoted(true);
        
        try {
            const currentHelpful = faq.helpfulVotes || 0;
            const currentUnhelpful = faq.unhelpfulVotes || 0;
            
            const updates = {
                helpfulVotes: type === 'yes' ? currentHelpful + 1 : currentHelpful,
                unhelpfulVotes: type === 'no' ? currentUnhelpful + 1 : currentUnhelpful
            };
            
            setFaq({ ...faq, ...updates });
            await updateFaq(faq.id, updates);
        } catch (error) {
            console.error("Failed to vote:", error);
        }
    };
`;
    if (!content.includes('handleCopyLink')) {
        // Find the return statement of the component
        content = content.replace(/\s*return\s*\(\s*<div\s+className="min-h-screen/m, "\n" + handlers + "\n    return (\n        <div className=\"min-h-screen");
    }

    // 4. Wire Copy & Print Buttons (Regex to catch regardless of Bengali/English text)
    content = content.replace(
        /<button className="inline-flex items-center gap-1\.5 px-4 py-2\.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors">\s*<Copy className="w-4 h-4" \/>.*?\s*<\/button>/s,
        `<button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors">\n                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy Link'}\n                                    </button>`
    );

    content = content.replace(
        /<button className="inline-flex items-center gap-1\.5 px-4 py-2\.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors">\s*<Printer className="w-4 h-4" \/>.*?\s*<\/button>/s,
        `<button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors">\n                                        <Printer className="w-4 h-4" /> Print\n                                    </button>`
    );

    // 5. Update Statistics
    content = content.replace(
        /<div className="text-2xl font-bold text-emerald-500 mb-1">0<\/div>\s*<div className="text-\[12px\] font-bold text-slate-400 uppercase tracking-wide">Helpful Votes<\/div>/s,
        `<div className="text-2xl font-bold text-emerald-500 mb-1">{faq.helpfulVotes || 0}</div>\n                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Helpful Votes</div>`
    );

    // 6. Wire Yes/No Buttons
    content = content.replace(
        /<button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">\s*<ThumbsUp className="w-4 h-4" \/>.*?\s*<\/button>/s,
        `<button onClick={() => handleVote('yes')} disabled={hasVoted} className={cn("flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-colors", hasVoted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 text-white")}>\n                                        <ThumbsUp className="w-4 h-4" /> Yes\n                                    </button>`
    );

    content = content.replace(
        /<button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">\s*<ThumbsDown className="w-4 h-4" \/>.*?\s*<\/button>/s,
        `<button onClick={() => handleVote('no')} disabled={hasVoted} className={cn("flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-colors", hasVoted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white")}>\n                                        <ThumbsDown className="w-4 h-4" /> No\n                                    </button>`
    );

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

patchFinal();
console.log("FINAL PATCH 2 COMPLETED");
