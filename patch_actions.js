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

    // 4. Add Handlers (handleCopyLink, handlePrint, handleVote)
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
            
            // Optimistic update
            setFaq({ ...faq, ...updates });
            
            // Network update
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

    // 5. Wire up the Copy & Print buttons
    const oldCopyBtn = `<button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors">
                                        <Copy className="w-4 h-4" /> Copy Link
                                    </button>`;
    const newCopyBtn = `<button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors">
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} 
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </button>`;
    content = content.replace(oldCopyBtn, newCopyBtn);

    const oldPrintBtn = `<button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors">
                                        <Printer className="w-4 h-4" /> Print
                                    </button>`;
    const newPrintBtn = `<button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors">
                                        <Printer className="w-4 h-4" /> Print
                                    </button>`;
    content = content.replace(oldPrintBtn, newPrintBtn);

    // 6. Update the "Helpful Votes" display count in the Statistics widget
    const oldStats = `<div className="text-2xl font-bold text-emerald-500 mb-1">0</div>
                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Helpful Votes</div>`;
    const newStats = `<div className="text-2xl font-bold text-emerald-500 mb-1">{faq.helpfulVotes || 0}</div>
                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Helpful Votes</div>`;
    content = content.replace(oldStats, newStats);

    // 7. Wire up the Yes/No buttons
    const oldYesBtn = `<button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">
                                        <ThumbsUp className="w-4 h-4" /> Yes
                                    </button>`;
    const newYesBtn = `<button onClick={() => handleVote('yes')} disabled={hasVoted} className={cn("flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-colors", hasVoted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 text-white")}>
                                        <ThumbsUp className="w-4 h-4" /> Yes
                                    </button>`;
    content = content.replace(oldYesBtn, newYesBtn);

    const oldNoBtn = `<button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">
                                        <ThumbsDown className="w-4 h-4" /> No
                                    </button>`;
    const newNoBtn = `<button onClick={() => handleVote('no')} disabled={hasVoted} className={cn("flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-colors", hasVoted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white")}>
                                        <ThumbsDown className="w-4 h-4" /> No
                                    </button>`;
    content = content.replace(oldNoBtn, newNoBtn);

    const oldFeedbackText = `<p className="text-[12px] font-medium text-slate-400 leading-snug">
                                    Your feedback helps us improve
                                </p>`;
    const newFeedbackText = `<p className="text-[12px] font-medium text-slate-400 leading-snug">
                                    {hasVoted ? "Thank you for your feedback!" : "Your feedback helps us improve"}
                                </p>`;
    content = content.replace(oldFeedbackText, newFeedbackText);

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

addActions();
console.log("Actions and Firebase integrated");
