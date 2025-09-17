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

export const pricingPlans = [
    {
        name: "Free",
        price: "₹0",
        description: "Get started with our basic features.",
        features: [
            "Access to all free quizzes",
            "1 Free Mock Test",
            "Limited Practice Questions",
            "Community Support",
        ],
        cta: "Sign Up for Free",
        type: "free" as const,
    },
    {
        name: "Premium",
        price: "₹499",
        billing: "one-time",
        description: "Unlock premium tests and features.",
        features: [
            "Everything in Free, plus:",
            "Access to all Premium Mock Tests",
            "Download Test Reports (PDF)",
            "Detailed Performance Analysis",
            "Email Support",
        ],
        cta: "Go Premium",
        type: "premium" as const,
    },
    {
        name: "Pro",
        price: "₹999",
        billing: "/ month",
        description: "Get the full DeshExam experience.",
        features: [
            "Everything in Premium, plus:",
            "Access to all Pro Mock Tests",
            "AI Learning Path Generator",
            "Solved Textbook Assistant",
            "Create Custom Tests",
            "Priority Support",
        ],
        cta: "Start Pro Trial",
        type: "pro" as const,
        isPopular: true,
    },
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
