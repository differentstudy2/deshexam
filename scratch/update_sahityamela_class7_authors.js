const fs = require('fs');

const authorsData = {
  "chapter-chonde-shudhu-kan-rakho-sahityamela-class-7": "অজিত দত্ত",
  "chapter-pagla-gonesh-sahityamela-class-7": "শীর্ষেন্দু মুখোপাধ্যায়",
  "chapter-bongobhumir-proti-sahityamela-class-7": "মাইকেল মধুসূদন দত্ত",
  "chapter-ekusher-kobita-sahityamela-class-7": "আশরাফ সিদ্দিকী ও সুব্রত চক্রবর্তী",
  "chapter-attokotha-sahityamela-class-7": "রামকিঙ্কর বেইজ",
  "chapter-aka-lekha-sahityamela-class-7": "মৃদুল দাশগুপ্ত",
  "chapter-khokoner-prothom-chobi-sahityamela-class-7": "বনফুল",
  "chapter-kutub-minarer-kotha-sahityamela-class-7": "সৈয়দ মুজতবা আলী",
  "chapter-kar-dour-koddur-sahityamela-class-7": "শিবতোষ মুখোপাধ্যায়",
  "chapter-noteboi-sahityamela-class-7": "সুকুমার রায়",
  "chapter-meghchor-sahityamela-class-7": "সুনীল গঙ্গোপাধ্যায়",
  "chapter-smritichinho-sahityamela-class-7": "কামিনী রায়",
  "chapter-chirodiner-sahityamela-class-7": "সুকান্ত ভট্টাচার্য",
  "chapter-ki-kore-bujhbo-sahityamela-class-7": "আশাপূর্ণা দেবী",
  "chapter-bharadotto-sahityamela-class-7": "মুকুন্দরাম চক্রবর্তী",
  "chapter-shadhinota-shongrame-nari-sahityamela-class-7": "কল্যাণী দত্ত",
  "chapter-bharottirtho-sahityamela-class-7": "রবীন্দ্রনাথ ঠাকুর",
  "chapter-debotatma-himaloy-sahityamela-class-7": "প্রবোধকুমার সান্যাল",
  "chapter-gadhar-kan-sahityamela-class-7": "যোগীন্দ্রনাথ সরকার",
  "chapter-potolbabu-filmstar-sahityamela-class-7": "সত্যজিৎ রায়",
  "chapter-rastar-anondo-sahityamela-class-7": "সুধীরচন্দ্র সরকার",
  "chapter-chintashil-sahityamela-class-7": "রবীন্দ্রনাথ ঠাকুর"
};

const chaptersPath = './src/data/hardcoded/taxonomy/chapters.json';
const chapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));

let updatedCount = 0;

chapters.forEach(c => {
  if (authorsData[c.id]) {
    c.author = authorsData[c.id];
    updatedCount++;
  }
});

fs.writeFileSync(chaptersPath, JSON.stringify(chapters, null, 2));
console.log(`Updated ${updatedCount} chapters with authors.`);
