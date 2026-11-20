
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book, SpellCheck, Mic, Combine, PenTool, BookOpenCheck } from "lucide-react";
import Link from "next/link";

const arabicActivities = [
  {
    title: "Alphabet (الحروف الهجائية)",
    description: "Learn the Arabic alphabet with sounds and examples.",
    icon: <Book className="w-10 h-10 text-teal-500" />,
    bgColor: "bg-teal-100",
    link: "/kids-zone/learning-arabic/alphabet",
    comingSoon: false,
  },
  {
    title: "Vocabulary (مفردات)",
    description: "Build your Arabic vocabulary with fun word games.",
    icon: <SpellCheck className="w-10 h-10 text-cyan-500" />,
    bgColor: "bg-cyan-100",
    link: "#",
    comingSoon: true,
  },
  {
    title: "Reading (قراءة)",
    description: "Practice reading Arabic with short stories and passages.",
    icon: <BookOpenCheck className="w-10 h-10 text-emerald-500" />,
    bgColor: "bg-emerald-100",
    link: "#",
    comingSoon: true,
  },
  {
    title: "Story Time (وقت القصة)",
    description: "Listen to beautiful Arabic stories and improve your listening skills.",
    icon: <Mic className="w-10 h-10 text-sky-500" />,
    bgColor: "bg-sky-100",
    link: "#",
    comingSoon: true,
  },
];

export default function LearningArabicPage() {
  return (
    <div className="bg-teal-50 dark:bg-teal-900/20 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Kids Zone
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-teal-600">
            Learning Arabic
          </h1>
          <p className="text-lg text-teal-700/80 mt-4 max-w-2xl mx-auto">
            Discover the beauty of the Arabic language with these fun activities.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {arabicActivities.map((activity, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center relative">
               {activity.comingSoon && (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
              <CardHeader className="items-center">
                <div className={`p-4 rounded-full mb-4 ${activity.bgColor}`}>
                    {activity.icon}
                </div>
                <CardTitle className="font-headline text-2xl">{activity.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{activity.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button asChild disabled={activity.comingSoon}>
                  <Link href={activity.link}>Start Learning</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
