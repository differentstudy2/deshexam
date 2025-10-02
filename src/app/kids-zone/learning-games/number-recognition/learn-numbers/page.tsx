
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const numberRanges = [
  {
    title: "Numbers 0-10",
    description: "Learn the first ten numbers.",
    link: "#",
  },
  {
    title: "Numbers 11-20",
    description: "Continue your learning journey.",
    link: "#",
  },
  {
    title: "Numbers 21-50",
    description: "Challenge yourself with bigger numbers.",
    link: "#",
  },
  {
    title: "Numbers 51-100",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
