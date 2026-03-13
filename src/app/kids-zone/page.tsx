
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToyBrick, Puzzle, BookHeart, Gamepad2, BookOpen, Languages, Book } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kids Zone | Fun Learning Games & Educational Activities | DeshExam',
  description: 'Welcome to the DeshExam Kids Zone! A safe and exciting world of interactive games, fun quizzes, and engaging activities designed to make learning languages and math an adventure for children.',
  keywords: ['kids learning', 'educational games for kids', 'fun learning', 'kids zone', 'online learning for children', 'math games for kids', 'language learning for kids', 'interactive activities for kids'],
};


const kidsFeatures = [
  {
    icon: <Puzzle className="w-12 h-12 text-primary" />,
    title: "Fun Quizzes",
    description: "Test your knowledge with exciting quizzes on animals, space, and more!",
    link: "/kids-zone/fun-quizzes",
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
  {
    icon: <Languages className="w-12 h-12 text-pink-500" />,
    title: "Learning Hindi",
    description: "Discover the Hindi language with interactive lessons and games.",
    link: "/kids-zone/learning-hindi",
  },
   {
    icon: <BookOpen className="w-12 h-12 text-teal-500" />,
    title: "Learning Arabic",
    description: "Discover the Arabic language with fun lessons and games.",
    link: "/kids-zone/learning-arabic",
  },
  {
    icon: <Book className="w-12 h-12 text-rose-500" />,
    title: "Learning Urdu",
    description: "Explore the elegant script and sounds of the Urdu language.",
    link: "/kids-zone/learning-urdu",
  },
];

export default function KidsZonePage() {
    const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DeshExam",
    "url": "https://deshexam.com",
    "logo": "https://deshexam.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-123-456-7890",
      "contactType": "Customer Service"
    }
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DeshExam",
    "url": "https://deshexam.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://deshexam.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="bg-secondary/30">
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        
        <section className="relative w-full py-20 md:py-28 lg:py-36 bg-amber-100 dark:bg-amber-900/20">
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://picsum.photos/seed/kids-zone-hero/1920/1080"
                    alt="A playful and colorful abstract background for kids"
                    fill
                    className="object-cover opacity-20"
                    data-ai-hint="kids playful abstract"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-amber-100/50 via-amber-100/20 to-transparent dark:from-amber-900/50 dark:via-amber-900/20" />
            </div>
             <div className="container mx-auto px-4 relative z-10 text-center">
               <div className="inline-block bg-white/30 dark:bg-black/30 backdrop-blur-sm p-4 rounded-full mb-4 border">
                 <ToyBrick className="w-12 h-12 text-amber-500" />
               </div>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-amber-800 dark:text-amber-200 drop-shadow-lg">
                Welcome to the Kids Zone!
              </h1>
              <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto text-amber-700 dark:text-amber-300 drop-shadow-md">
                A safe and exciting world of interactive games, fun quizzes, and engaging activities designed to make learning languages and math an unforgettable adventure for children.
              </p>
            </div>
        </section>

        <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {kidsFeatures.map((feature, index) => (
                <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center bg-card">
                <CardHeader className="items-center">
                    <div className="p-4 bg-secondary rounded-full mb-4">
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
        </div>
    </div>
  );
}
