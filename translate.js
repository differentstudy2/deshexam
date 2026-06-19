const fs = require('fs');

function translate() {
    let content = fs.readFileSync('src/app/faq/[id]/page.tsx', 'utf8');

    const translations = {
        'প্রশ্ন করুন': 'FAQ',
        'হোম': 'Home',
        'পিছনে': 'Back',
        'লেখক:': 'Author:',
        'প্রকাশিত:': 'Published:',
        'আপডেট:': 'Updated:',
        'দেখা হয়েছে: {faq.views || 0} বার': 'Views: {faq.views || 0}',
        'ওয়েব প্ল্যাটফর্ম': 'Information',
        'লিংক কপি': 'Copy Link',
        'প্রিন্ট করুন': 'Print',
        'সংশ্লিষ্ট FAQ': 'Related FAQs',
        'ক্যাটাগরি': 'Categories',
        'সকল FAQ': 'All FAQs',
        'পরিসংখ্যান': 'Statistics',
        'ভিউ': 'Views',
        'সহায়ক ভোট': 'Helpful Votes',
        'এই FAQ টি কি সহায়ক?': 'Was this FAQ helpful?',
        'হ্যাঁ': 'Yes',
        'না': 'No',
        'আপনার মতামত আমাদের উন্নতিতে সাহায্য করবে': 'Your feedback helps us improve',
        'আরও সাহায্য প্রয়োজন?': 'Need More Help?',
        'এই FAQ আপনার সমস্যার সমাধান করতে পারেনি? আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।': 'Did this FAQ not solve your issue? Contact our support team.',
        'সাপোর্ট যোগাযোগ': 'Contact Support',
        'নতুন প্রশ্ন জিজ্ঞাসা': 'Ask a New Question',
        'ট্যাগস': 'Tags'
    };

    for (const [bn, en] of Object.entries(translations)) {
        // Use global replace for exact matches
        content = content.split(bn).join(en);
    }

    fs.writeFileSync('src/app/faq/[id]/page.tsx', content, 'utf8');
}

translate();
console.log("Translated faq/[id]/page.tsx to English");
