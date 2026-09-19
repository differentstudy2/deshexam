const fs = require('fs');
const path = require('path');

// 1. এখানে আপনার চ্যাপ্টারের ID দিন (যেখানে কনটেন্ট যোগ করতে চান)
const TARGET_CHAPTER_ID = 'chapter-bhouto-paribesh-amader-paribesh';

// 2. এখানে আপনার মার্কডাউন কনটেন্টটি পেস্ট করুন (ব্যাকটিক ` ` এর ভেতরে)
const NEW_CONTENT = `**ভৌত পরিবেশ**

এখানে আপনার চ্যাপ্টারের মূল টেক্সট বা মার্কডাউন লিখতে পারেন। 
ব্যাকটিক (backtick) ব্যবহার করার ফলে নতুন লাইন বা কোটেশন নিয়ে কোনো চিন্তা করতে হবে না।

* পয়েন্ট ১
* পয়েন্ট ২
`;

// ফাইলগুলোর পাথ
const chaptersFile = path.join(__dirname, '../src/data/hardcoded/taxonomy/chapters.json');

// JSON ফাইল রিড করা
let chapters = JSON.parse(fs.readFileSync(chaptersFile, 'utf8'));
let updated = false;

// নির্দিষ্ট চ্যাপ্টার খুঁজে কনটেন্ট আপডেট করা
for (let chapter of chapters) {
  if (chapter.id === TARGET_CHAPTER_ID) {
    chapter.content = NEW_CONTENT;
    updated = true;
    break;
  }
}

// আপডেট হওয়া ডেটা আবার ফাইলে সেভ করা
if (updated) {
  fs.writeFileSync(chaptersFile, JSON.stringify(chapters, null, 2), 'utf8');
  console.log(`Success: Content added to ${TARGET_CHAPTER_ID}`);
} else {
  console.log(`Error: Chapter with ID '${TARGET_CHAPTER_ID}' not found!`);
}
