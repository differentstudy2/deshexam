import type { Metadata } from "next";
import { DemoTest } from "@/components/wb/demo-test";
import { SectionHeader } from "@/components/wb/ui";

export const metadata: Metadata = {
  title: "ফ্রি ডেমো টেস্ট — DeshExam",
  description: "৫টি নমুনা প্রশ্নের ফ্রি ডেমো টেস্ট — লগইন ছাড়াই দিন, সঙ্গে সঙ্গে ফলাফল পান।",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      <SectionHeader
        eyebrow="ফ্রি ডেমো টেস্ট"
        title="আগে চেষ্টা করে দেখুন, তারপর সিদ্ধান্ত নিন"
        subtitle="৫টি নমুনা প্রশ্ন — কোনো লগইন লাগবে না, ফলাফল সঙ্গে সঙ্গে।"
      />
      <DemoTest />
    </div>
  );
}
