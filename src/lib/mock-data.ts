
import { ChartConfig } from "@/components/ui/chart";

export type MockTest = {
  id: string;
  title: string;
  subject: string;
  questions: number;
  duration: number; // in minutes
  type: "free" | "premium" | "pro";
  image: string;
  imageHint: string;
};

export const mockTests: MockTest[] = [
  {
    id: "neet-physics-1",
    title: "NEET Full Syllabus Physics - 1",
    subject: "Physics",
    questions: 50,
    duration: 60,
    type: "pro",
    image: "https://picsum.photos/seed/physics/400/225",
    imageHint: "physics abstract",
  },
  {
    id: "jee-chem-3",
    title: "JEE Mains Organic Chemistry",
    subject: "Chemistry",
    questions: 30,
    duration: 45,
    type: "premium",
    image: "https://picsum.photos/seed/chemistry/400/225",
    imageHint: "chemistry lab",
  },
  {
    id: "cat-quant-2",
    title: "CAT Quantitative Aptitude",
    subject: "Mathematics",
    questions: 40,
    duration: 60,
    type: "free",
    image: "https://picsum.photos/seed/math/400/225",
    imageHint: "math formula",
  },
  {
    id: "neet-bio-5",
    title: "NEET Zoology Mock Test",
    subject: "Biology",
    questions: 90,
    duration: 90,
    type: "pro",
    image: "https://picsum.photos/seed/biology/400/225",
    imageHint: "biology dna",
  },
  {
    id: "jee-physics-2",
    title: "JEE Advanced Electrodynamics",
    subject: "Physics",
    questions: 25,
    duration: 60,
    type: "pro",
    image: "https://picsum.photos/seed/physics2/400/225",
    imageHint: "physics atoms",
  },
    {
    id: "upsc-history-1",
    title: "UPSC Prelims - Modern History",
    subject: "History",
    questions: 100,
    duration: 120,
    type: "premium",
    image: "https://picsum.photos/seed/history/400/225",
    imageHint: "history ancient",
  },
];

export const pricingData = {
    // Benefits use the real PLANS feature lists (src/lib/wb-board.ts) —
    // no invented counts. Basic/Plus/Pro are monthly plans.
    benefits: [
        { id: "b1", name: "অধ্যায়ভিত্তিক MCQ অনুশীলন", basic: true, plus: true, pro: true },
        { id: "b2", name: "আগের বছরের প্রশ্নপত্র", basic: true, plus: true, pro: true },
        { id: "b3", name: "বিনামূল্যের ডেমো টেস্ট", basic: true, plus: true, pro: true },
        { id: "b4", name: "মক টেস্ট ও সাজেশন", basic: false, plus: true, pro: true },
        { id: "b5", name: "অধ্যায়ভিত্তিক নোট", basic: false, plus: true, pro: true },
        { id: "b6", name: "ফলাফল বিশ্লেষণ", basic: false, plus: true, pro: true },
        { id: "b7", name: "ভিডিও ক্লাস", basic: false, plus: false, pro: true },
        { id: "b8", name: "লাইভ ক্লাস", basic: false, plus: false, pro: true },
        { id: "b9", name: "সব বিষয় ও সব ক্লাস", basic: false, plus: false, pro: true },
    ],
    plans: [
        { id: "basic", name: "Basic", validity: "1 মাস", originalPrice: 100, price: 50, discount: 50, bestseller: false },
        { id: "plus", name: "Plus", validity: "1 মাস", originalPrice: 250, price: 100, discount: 60, bestseller: true },
        { id: "pro", name: "Pro", validity: "1 মাস", originalPrice: 400, price: 200, discount: 50, bestseller: false },
    ]
}

export const faqData = [
    {
        question: "DeshExam-এর প্ল্যানগুলো কী?",
        answer: "তিনটি মাসিক প্ল্যান আছে — Basic ₹৫০/মাস, Plus ₹১০০/মাস ও Pro ₹২০০/মাস। সব প্ল্যান ক্লাস ৫–১২, WBBSE ও WBCHSE প্রস্তুতির জন্য।"
    },
    {
        question: "প্ল্যানের মেয়াদ কতদিন?",
        answer: "প্রতিটি প্ল্যান ১ মাসের জন্য। মেয়াদ শেষ হলে আবার কিনে নবায়ন করতে পারবেন।"
    },
    {
        question: "Basic, Plus ও Pro-এর মধ্যে পার্থক্য কী?",
        answer: "Basic-এ অধ্যায়ভিত্তিক MCQ, আগের বছরের প্রশ্নপত্র ও ফ্রি ডেমো টেস্ট আছে। Plus-এ তার সঙ্গে মক টেস্ট, সাজেশন, নোট ও ফলাফল বিশ্লেষণ যোগ হয়। Pro-এ সব সুবিধার সঙ্গে ভিডিও ক্লাস ও লাইভ ক্লাস আছে।"
    },
    {
        question: "পেমেন্ট কীভাবে করব?",
        answer: "UPI, কার্ড ও নেট ব্যাংকিংয়ে পেমেন্ট করা যায়। পেমেন্টের আগে প্ল্যান, দাম ও মেয়াদ দেখে নিশ্চিত হয়ে নিন।"
    },
    {
        question: "কুপন কোড কীভাবে ব্যবহার করব?",
        answer: "প্ল্যান বেছে নেওয়ার পর কুপন কোডের ঘরে কোড লিখে Apply চাপুন। বৈধ কোড হলে ছাড় মোট দাম থেকে বাদ যাবে।"
    },
    {
        question: "রিফান্ড কি পাওয়া যায়?",
        answer: "ডিজিটাল কনটেন্ট কেনার পর অ্যাক্সেস পেলে সাধারণত রিফান্ড হয় না। বিস্তারিত জানতে Refund Policy পাতাটি দেখুন।"
    },
    {
        question: "একটি প্ল্যান কি একাধিক ডিভাইসে ব্যবহার করা যায়?",
        answer: "হ্যাঁ, আপনার অ্যাকাউন্ট দিয়ে মোবাইল, ট্যাবলেট ও কম্পিউটারে লগইন করতে পারবেন।"
    },
    {
        question: "সাহায্য দরকার হলে কোথায় যোগাযোগ করব?",
        answer: "ইমেইল করুন support@deshexam.com-এ অথবা +91 62940 06590 নম্বরে যোগাযোগ করুন।"
    }
];


export const leaderboardData = [
    { rank: 1, name: "Aarav Sharma", score: 285, time: "45:12", avatar: "https://picsum.photos/seed/Aarav/40/40" },
    { rank: 2, name: "Saanvi Gupta", score: 281, time: "48:30", avatar: "https://picsum.photos/seed/Saanvi/40/40" },
    { rank: 3, name: "Vivaan Singh", score: 279, time: "44:55", avatar: "https://picsum.photos/seed/Vivaan/40/40" },
    { rank: 4, name: "Myra Reddy", score: 275, time: "50:02", avatar: "https://picsum.photos/seed/Myra/40/40" },
    { rank: 5, name: "Arjun Kumar", score: 272, time: "49:15", avatar: "https://picsum.photos/seed/Arjun/40/40" },
    { rank: 6, name: "Diya Patel", score: 268, time: "51:40", avatar: "https://picsum.photos/seed/Diya/40/40" },
    { rank: 7, name: "Ishaan Joshi", score: 265, time: "47:22", avatar: "https://picsum.photos/seed/Ishaan/40/40" },
    { rank: 8, name: "Ananya Rao", score: 263, time: "52:10", avatar: "https://picsum.photos/seed/Ananya/40/40" },
    { rank: 9, name: "Kabir Mehta", score: 260, time: "53:00", avatar: "https://picsum.photos/seed/Kabir/40/40" },
    { rank: 10, name: "Pari Verma", score: 258, time: "55:05", avatar: "https://picsum.photos/seed/Pari/40/40" },
];

export const dashboardStats = [
    { title: "Tests Taken", value: "14", change: "+2 this week" },
    { title: "Average Score", value: "78%", change: "+3% this week" },
    { title: "Time Spent", value: "8h 32m", change: "+45m this week" },
    { title: "Rank", value: "#2,415", change: "Top 15%" },
];


export const chartData = [
  { month: "January", score: 65 },
  { month: "February", score: 68 },
  { month: "March", score: 72 },
  { month: "April", score: 71 },
  { month: "May", score: 75 },
  { month: "June", score: 82 },
];

export const chartConfig = {
  score: {
    label: "Score (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const mockBooks = [
  {
    title: "অষ্টম শ্রেণির সাহিত্য কণিকা পূর্ণাঙ্গ এমসিকিউ প্রশ্নব্যাংক ও সমাধান (PDF)",
    slug: "class-8-sahitya-kanika-mcq",
    authorName: "DeshExam",
    authorBusinessName: "DeshExam",
    price: 25,
    originalPrice: 100,
    discount: 75,
    rating: 4.5,
    reviewCount: 2,
    sales: 10,
    downloads: 27,
    publishedDate: "2025-11-24",
    coverImage: "https://picsum.photos/seed/book1/400/600",
    bookType: "Soft Copy",
    language: "Bangla",
    classCategory: "1 - 12 Class",
    subject: "Bangla",
    tags: ["MCQ", "Class 8", "Sahitya Kanika"],
    description: "This is a complete MCQ question bank and solution guide for Class 8 Sahitya Kanika.",
    specifications: {
      "Title": "অষ্টম শ্রেণির সাহিত্য কণিকা পূর্ণাঙ্গ এমসিকিউ প্রশ্নব্যাংক ও সমাধান (PDF)",
      "Language": "Bangla",
    },
    features: ["Complete MCQ", "Detailed Solutions", "PDF Download"]
  },
  {
    title: "ভেক্টর",
    slug: "vector",
    authorName: "NC Sarkar",
    authorBusinessName: "DeshExam",
    price: 10,
    originalPrice: 10,
    discount: 0,
    rating: 4.5,
    reviewCount: 2,
    sales: 1,
    downloads: 5,
    publishedDate: "2025-10-10",
    coverImage: "https://picsum.photos/seed/book2/400/600",
    bookType: "Hard Copy",
    language: "Bangla",
    classCategory: "1 - 12 Class",
    subject: "Physics",
    tags: ["Physics", "Vector"],
    description: "A comprehensive guide on Vector physics for students.",
  },
  {
    title: "নবম-দশম শ্রেণির তথ্য ও যোগাযোগ প্রযুক্তি বোর্ড প্রশ্ন ও সমাধান",
    slug: "class-9-10-ict-board-questions",
    authorName: "DeshExam",
    authorBusinessName: "DeshExam",
    price: 24,
    originalPrice: 50,
    discount: 52,
    rating: 5.0,
    reviewCount: 2,
    sales: 6,
    downloads: 15,
    publishedDate: "2025-08-15",
    coverImage: "https://picsum.photos/seed/book3/400/600",
    bookType: "Soft Copy",
    language: "Bangla",
    classCategory: "1 - 12 Class",
    subject: "ICT",
    tags: ["ICT", "Board Questions"],
    description: "ICT Board Questions and Solutions for Class 9 and 10.",
  },
  {
    title: "উচ্চ মাধ্যমিক কৃষিশিক্ষা সকল বোর্ড এমসিকিউ",
    slug: "hsc-agriculture-mcq",
    authorName: "DeshExam",
    authorBusinessName: "DeshExam",
    price: 30,
    originalPrice: 75,
    discount: 60,
    rating: 5.0,
    reviewCount: 2,
    sales: 9,
    downloads: 20,
    publishedDate: "2025-07-20",
    coverImage: "https://picsum.photos/seed/book4/400/600",
    bookType: "Soft Copy",
    language: "Bangla",
    classCategory: "1 - 12 Class",
    subject: "Agriculture",
    tags: ["HSC", "Agriculture", "MCQ"],
    description: "HSC Agriculture MCQ question bank for all boards.",
  }
];

    