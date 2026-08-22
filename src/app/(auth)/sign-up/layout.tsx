import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join me on DeshExam!",
  description: "Sign up for DeshExam and let's ace our competitive exams together. Start learning with AI-powered mock tests and get bonus XP!",
  openGraph: {
    title: "Join me on DeshExam!",
    description: "Sign up for DeshExam and let's ace our competitive exams together. Start learning with AI-powered mock tests and get bonus XP!",
    url: "https://deshexam.com/sign-up",
    siteName: "DeshExam",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join me on DeshExam!",
    description: "Sign up for DeshExam and let's ace our competitive exams together. Start learning with AI-powered mock tests and get bonus XP!",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
