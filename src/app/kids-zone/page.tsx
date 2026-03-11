
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToyBrick, Puzzle, BookHeart, Gamepad2, BookOpen, Languages, Book } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kids Zone - Fun Learning Activities | DeshExam',
  description: 'A fun and safe place for young learners to explore, play, and grow with interactive games and educational activities.',
  keywords: ['kids learning', 'educational games', 'learning for kids', 'kids zone', 'fun learning', 'online learning for children', 'kids activities'],
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
    <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
            backgroundImage: "url('https://deshexam.com/image/logo.png')",
        }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/90 to-amber-50/90 dark:from-yellow-900/80 dark:to-amber-900/90 backdrop-blur-sm" />
      <div className="relative z-10 container mx-auto px-4 py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
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
                src="https://images.unsplash.com/photo-1565350831386-8c52421af9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxraWRzJTIwbGVhcm5pbmd8ZW58MHx8fHwxNzY5MTIwNzIzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="A colorful drawing of kids playing with blocks and books"
                width={800}
                height={400}
                className="rounded-xl shadow-lg mx-auto"
                data-ai-hint="kids learning"
            />
        </div>
      </div>
    </div>
  );
}
