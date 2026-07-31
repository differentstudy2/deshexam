
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book, SpellCheck, Mic } from "lucide-react";
import Link from "next/link";

const englishActivities = [
  {
    title: "Alphabet Fun",
    description: "Learn the ABCs with sounds and pictures.",
    icon: <Book className="w-10 h-10 text-blue-500" />,
    bgColor: "bg-blue-100",
    link: "/kids-zone/learning-english/alphabet",
    comingSoon: false,
  },
  {
    title: "Word Builder",
    description: "Learn new words and practice spelling.",
    icon: <SpellCheck className="w-10 h-10 text-green-500" />,
    bgColor: "bg-green-100",
    link: "#",
    comingSoon: true,
  },
  {
    title: "Read Aloud",
    description: "Listen to stories and practice your pronunciation.",
    icon: <Mic className="w-10 h-10 text-purple-500" />,
    bgColor: "bg-purple-100",
    link: "#",
    comingSoon: true,
  },
];

export default function LearningEnglishPage() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 min-h-screen">
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
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            Learning English
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            Start your English learning adventure with these fun activities.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {englishActivities.map((activity, index) => (
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
