
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "DeshExam | Ace Your Competitive Exams",
    template: "%s | DeshExam",
  },
  description: "The ultimate platform for mock tests, quizzes, and AI-powered personalized learning paths for NEET, JEE, UPSC, and more. Boost your exam preparation with DeshExam.",
  keywords: ["mock tests", "online quiz", "exam preparation", "NEET", "JEE", "UPSC", "competitive exams", "AI learning"],
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE_HERE',
  },
  openGraph: {
    type: "website",
    url: "https://deshexam.com/",
    title: "DeshExam | Ace Your Competitive Exams",
    description: "The ultimate platform for mock tests, quizzes, and AI-powered personalized learning paths for NEET, JEE, UPSC, and more. Boost your exam preparation with DeshExam.",
    images: [{
      url: "/image/logo.png",
    }],
  },
  twitter: {
    card: "summary_large_image",
    url: "https://deshexam.com/",
    title: "DeshExam | Ace Your Competitive Exams",
    description: "The ultimate platform for mock tests, quizzes, and AI-powered personalized learning paths for NEET, JEE, UPSC, and more. Boost your exam preparation with DeshExam.",
    images: ["/image/logo.png"],
  },
};
