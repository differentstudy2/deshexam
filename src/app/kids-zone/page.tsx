
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToyBrick, Puzzle, BookHeart, Gamepad2, BookOpen } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kids Zone - Fun Learning Activities',
  description: 'A fun and safe place for young learners to explore, play, and grow with interactive games and educational activities.',
};


const kidsFeatures = [
  {
    icon: <Puzzle className="w-12 h-12 text-primary" />,
    title: "Fun Quizzes",
    description: "Test your knowledge with exciting quizzes on animals, space, and more!",
    link: "#",
  },
  {
    icon: <Gamepad2 className="w-12 h-12 text-purple-500" />,
    title: "Learning Games",
    description: "Play engaging games that make education an adventure.",
    link: "/kids-zone/learning-games",
  },
    {
    icon: <BookHeart className="w-12 h-12 text-blue-500" />,
    title: "Learning English",
    description: "Learn the English alphabet, words, and grammar in a fun way.",
    link: "/kids-zone/learning-english",
  },
  {
    icon: <BookOpen className="w-12 h-12 text-orange-500" />,
    title: "Learning Bengali",
    description: "Explore the Bengali language with interactive lessons and games.",
    link: "/kids-zone/learning-bengali",
  },
];

export default function KidsZonePage() {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-amber-600">
            Welcome to the Kids Zone!
          </h1>
          <p className="text-lg text-amber-700/80 mt-4 max-w-3xl mx-auto">
            A fun and safe place for young learners to explore, play, and grow.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {kidsFeatures.map((feature, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center">
              <CardHeader className="items-center">
                <div className="p-4 bg-white rounded-full mb-4 shadow-inner">
                    {feature.icon}
                </div>
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild>
                  <Link href={feature.link}>Let's Go!</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
         <div className="text-center mt-16">
            <Image
                src="https://picsum.photos/seed/kids-fun/800/400"
                alt="A colorful drawing of kids playing with blocks and books"
                width={800}
                height={400}
                className="rounded-xl shadow-lg mx-auto"
                data-ai-hint="kids playing drawing"
            />
        </div>
      </div>
    </div>
  );
}
