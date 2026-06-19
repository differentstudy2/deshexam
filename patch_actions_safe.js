const fs = require('fs');

function addActions() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');

    // 1. Add Check icon import
    if (!content.includes('Check,')) {
        content = content.replace("import { \n    Search, ", "import { \n    Search, Check, ");
    }
    
    // 2. Add updateFaq to API imports
    if (!content.includes('updateFaq')) {
        content = content.replace(
            "import { getFaqBySlugOrId, getFaqs, getCategories, getTags }",
            "import { getFaqBySlugOrId, getFaqs, getCategories, getTags, updateFaq }"
        );
    }

    // 3. Add Component State
    if (!content.includes('const [copied, setCopied]')) {
        content = content.replace(
            "const [loading, setLoading] = useState(true);",
            "const [loading, setLoading] = useState(true);\n    const [copied, setCopied] = useState(false);\n    const [hasVoted, setHasVoted] = useState(false);"
        );
    }

    // 4. Add Handlers
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
        content = content.replace(
            "return (\n        <div className=\"min-h-screen",
            handlers + "\n    return (\n        <div className=\"min-h-screen"
        );
    }

    // 5. Wire up Copy and Print
    content = content.replace(
        '<button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors">\n                                        <Copy className="w-4 h-4" /> Copy Link\n                                    </button>',
        '<button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors">\n                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? \'Copied!\' : \'Copy Link\'}\n                                    </button>'
    );
    content = content.replace(
        '<button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors">\n                                        <Printer className="w-4 h-4" /> Print\n                                    </button>',
        '<button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors">\n                                        <Printer className="w-4 h-4" /> Print\n                                    </button>'
    );

    // 6. Update the "Helpful Votes" display count
    content = content.replace(
        '<div className="text-2xl font-bold text-emerald-500 mb-1">0</div>\n                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Helpful Votes</div>',
        '<div className="text-2xl font-bold text-emerald-500 mb-1">{faq.helpfulVotes || 0}</div>\n                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Helpful Votes</div>'
    );

    // 7. Wire up Yes/No buttons
    content = content.replace(
        '<button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">\n                                        <ThumbsUp className="w-4 h-4" /> Yes\n                                    </button>',
        '<button onClick={() => handleVote(\'yes\')} disabled={hasVoted} className={cn("flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-colors", hasVoted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 text-white")}>\n                                        <ThumbsUp className="w-4 h-4" /> Yes\n                                    </button>'
    );
    content = content.replace(
        '<button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">\n                                        <ThumbsDown className="w-4 h-4" /> No\n                                    </button>',
        '<button onClick={() => handleVote(\'no\')} disabled={hasVoted} className={cn("flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-colors", hasVoted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white")}>\n                                        <ThumbsDown className="w-4 h-4" /> No\n                                    </button>'
    );
    content = content.replace(
        '<p className="text-[12px] font-medium text-slate-400 leading-snug">\n                                    Your feedback helps us improve\n                                </p>',
        '<p className="text-[12px] font-medium text-slate-400 leading-snug">\n                                    {hasVoted ? "Thank you for your feedback!" : "Your feedback helps us improve"}\n                                </p>'
    );

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

addActions();
console.log("Safely applied actions");
