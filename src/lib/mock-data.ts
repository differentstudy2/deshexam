
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
    benefits: [
        { id: "b1", name: "70,000+ Mock Test", pro: true, pass: true },
        { id: "b2", name: "Unlimited Pro Live Test", pro: true, pass: false },
        { id: "b3", name: "Unlimited Practice Pro Questions", pro: true, pass: false },
        { id: "b4", name: "17,000+ Previous Year Papers", pro: true, pass: false },
        { id: "b5", name: "Unlimited Re-Attempt mode for All Tests", pro: true, pass: false },
    ],
    plans: {
        pro: [
             { id: "pro_monthly", name: "Monthly Pass Pro", validity: "31 Days", originalPrice: 1199, price: 599, discount: null, bestseller: false },
             { id: "pro_yearly", name: "Yearly Pass Pro", validity: "365 Days", originalPrice: 1799, price: 649, discount: 64, bestseller: true },
             { id: "pro_18months", name: "18 Months Pass Pro", validity: "548 Days", originalPrice: 1999, price: 799, discount: 60, bestseller: false },
        ],
        pass: [
            { id: "pass_monthly", name: "Monthly Pass", validity: "31 Days", originalPrice: 599, price: 299, discount: 50, bestseller: false },
            { id: "pass_yearly", name: "Yearly Pass", validity: "365 Days", originalPrice: 999, price: 349, discount: 65, bestseller: true },
            { id: "pass_18months", name: "18 Months Pass", validity: "548 Days", originalPrice: 1299, price: 499, discount: 62, bestseller: false },
        ]
    }
}

export const faqData = [
    { 
        question: "What is DeshExam Pass Pro?", 
        answer: "DeshExam Pass Pro is a premium subscription that gives you access to a vast library of mock tests, previous year papers, and live tests to help you prepare for various competitive exams." 
    },
    { 
        question: "When will my Pass Pro expire? Will I be able to access the Test Series after my Pass Pro expires?", 
        answer: "Your Pass Pro subscription expires based on the validity period of the plan you choose (e.g., 31 days for Monthly plan). After expiry, you will lose access to the premium content. You can renew your subscription to continue." 
    },
    { 
        question: "Will all of my enrolled Test Series be available during the DeshExam Pass Pro validity period?", 
        answer: "Yes, all Test Series included in the Pass Pro plan will be available to you throughout your subscription's validity period. You can attempt them multiple times to improve your score." 
    },
    { 
        question: "How can I renew my DeshExam Pass Pro?", 
        answer: "You can renew your Pass Pro subscription directly from the pricing page. Simply select your desired plan and proceed to payment. Your new validity period will be added to your account." 
    },
    { 
        question: "I do not have online payment activated. Can I use any other mode for payment?", 
        answer: "We support a variety of payment methods, including credit/debit cards, net banking, and UPI. Please check the payment page for all available options. If you face any issues, our support team is ready to help." 
    },
    {
        question: "Can I use my DeshExam Pass Pro on multiple devices?",
        answer: "Yes, you can log into your account from multiple devices, including your laptop, tablet, or smartphone. However, simultaneous test attempts on multiple devices are not permitted for security reasons."
    },
    {
        question: "Is there any refund policy if I am not satisfied with the Pass?",
        answer: "Currently, we do not offer refunds once the Pass Pro is purchased and activated, as it grants immediate access to premium digital content. We highly recommend trying out our free mock tests before making a purchase."
    },
    {
        question: "Are the mock tests and previous year papers available in multiple languages?",
        answer: "Yes, a significant portion of our test library is available in both English and Bengali. You can choose your preferred language at the start of most tests."
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

    