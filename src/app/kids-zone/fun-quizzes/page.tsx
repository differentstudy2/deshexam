
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PawPrint, Rocket, Bone } from "lucide-react";
import Link from "next/link";

const quizCategories = [
  {
    title: "Amazing Animals",
    description: "How much do you know about the animal kingdom?",
    icon: <PawPrint className="w-10 h-10 text-orange-500" />,
    bgColor: "bg-orange-100",
    link: "/kids-zone/fun-quizzes/amazing-animals",
    comingSoon: false,
  },
  {
    title: "Space Adventure",
    description: "Explore planets, stars, and galaxies in this cosmic quiz.",
    icon: <Rocket className="w-10 h-10 text-indigo-500" />,
    bgColor: "bg-indigo-100",
    link: "#",
    comingSoon: true,
  },
  {
    title: "Dinosaur Discovery",
    description: "Travel back in time and test your dino knowledge.",
    icon: <Bone className="w-10 h-10 text-yellow-800" />,
    bgColor: "bg-yellow-200",
    link: "#",
    comingSoon: true,
  },
];

export default function FunQuizzesPage() {
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 min-h-screen">
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
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-orange-600">
            Fun Quizzes
          </h1>
          <p className="text-lg text-orange-700/80 mt-4 max-w-2xl mx-auto">
            Choose a topic and test your knowledge with these fun quizzes!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quizCategories.map((category, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center relative">
               {category.comingSoon && (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
              <CardHeader className="items-center">
                <div className={`p-4 rounded-full mb-4 ${category.bgColor}`}>
                    {category.icon}
                </div>
                <CardTitle className="font-headline text-2xl">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{category.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button asChild disabled={category.comingSoon}>
                  <Link href={category.link}>Start Quiz</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
