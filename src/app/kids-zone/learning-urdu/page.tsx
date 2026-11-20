
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book, SpellCheck, Mic, Combine, PenTool, BookOpenCheck } from "lucide-react";
import Link from "next/link";

const urduActivities = [
  {
    title: "حروف تہجی (Alphabet)",
    description: "Learn the Urdu alphabet with sounds and examples.",
    icon: <Book className="w-10 h-10 text-rose-500" />,
    bgColor: "bg-rose-100",
    link: "/kids-zone/learning-urdu/alphabet",
    comingSoon: false,
  },
  {
    title: "الفاظ (Vocabulary)",
    description: "Build your Urdu vocabulary with fun word games.",
    icon: <SpellCheck className="w-10 h-10 text-red-500" />,
    bgColor: "bg-red-100",
    link: "#",
    comingSoon: true,
  },
  {
    title: "پڑھائی (Reading)",
    description: "Practice reading Urdu with short stories and passages.",
    icon: <BookOpenCheck className="w-10 h-10 text-fuchsia-500" />,
    bgColor: "bg-fuchsia-100",
    link: "#",
    comingSoon: true,
  },
  {
    title: "کہانی سنو (Story Time)",
    description: "Listen to beautiful Urdu stories and improve your listening skills.",
    icon: <Mic className="w-10 h-10 text-purple-500" />,
    bgColor: "bg-purple-100",
    link: "#",
    comingSoon: true,
  },
];

export default function LearningUrduPage() {
  return (
    <div className="bg-rose-50 dark:bg-rose-900/20 min-h-screen">
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
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-rose-600">
            Learning Urdu
          </h1>
          <p className="text-lg text-rose-700/80 mt-4 max-w-2xl mx-auto">
            Discover the beauty of the Urdu language with these fun activities.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {urduActivities.map((activity, index) => (
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
