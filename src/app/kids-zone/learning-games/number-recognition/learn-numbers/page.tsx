
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, BookHeart } from "lucide-react";
import Link from "next/link";

const numberRanges = [
  {
    title: "Numbers 0-10",
    description: "Learn the first ten numbers.",
    link: "/kids-zone/learning-games/number-recognition/learn-numbers/0-10",
  },
  {
    title: "Numbers 11-20",
    description: "Continue your learning journey.",
    link: "/kids-zone/learning-games/number-recognition/learn-numbers/11-20",
  },
  {
    title: "Numbers 21-30",
    description: "Explore the twenties.",
    link: "#",
  },
  {
    title: "Numbers 31-40",
    description: "Learn the thirties.",
    link: "#",
  },
    {
    title: "Numbers 41-50",
    description: "Discover the forties.",
    link: "#",
  },
    {
    title: "Numbers 51-60",
    description: "Get to know the fifties.",
    link: "#",
  },
    {
    title: "Numbers 61-70",
    description: "Learn the sixties.",
    link: "#",
  },
    {
    title: "Numbers 71-80",
    description: "Explore the seventies.",
    link: "#",
  },
    {
    title: "Numbers 81-90",
    description: "Challenge yourself with the eighties.",
    link: "#",
  },
    {
    title: "Numbers 91-100",
    description: "Master all the numbers up to one hundred.",
    link: "#",
  },
];

export default function LearnNumbersPage() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games/number-recognition">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Number Recognition
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            Learn Numbers
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            Click on a range to see and hear the numbers.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {numberRanges.map((range, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-slate-700">{range.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{range.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button asChild>
                  <Link href={range.link}>Learn</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
