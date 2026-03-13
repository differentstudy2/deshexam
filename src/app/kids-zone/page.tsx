
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    image: "https://picsum.photos/seed/fun-quizzes/400/300",
    imageHint: "quiz fun kids"
  },
  {
    icon: <Gamepad2 className="w-12 h-12 text-purple-500" />,
    title: "Learning Games",
    description: "Play engaging games that make education an adventure.",
    link: "/kids-zone/learning-games",
    image: "https://picsum.photos/seed/learning-games/400/300",
    imageHint: "learning games"
  },
    {
    icon: <BookHeart className="w-12 h-12 text-blue-500" />,
    title: "Learning English",
    description: "Learn the English alphabet, words, and grammar in a fun way.",
    link: "/kids-zone/learning-english",
    image: "https://picsum.photos/seed/learning-english/400/300",
    imageHint: "english alphabet"
  },
  {
    icon: <BookOpen className="w-12 h-12 text-orange-500" />,
    title: "Learning Bengali",
    description: "Explore the Bengali language with interactive lessons and games.",
    link: "/kids-zone/learning-bengali",
    image: "https://picsum.photos/seed/learning-bengali/400/300",
    imageHint: "bengali language"
  },
  {
    icon: <Languages className="w-12 h-12 text-pink-500" />,
    title: "Learning Hindi",
    description: "Discover the Hindi language with interactive lessons and games.",
    link: "/kids-zone/learning-hindi",
    image: "https://picsum.photos/seed/learning-hindi/400/300",
    imageHint: "hindi language"
  },
   {
    icon: <BookOpen className="w-12 h-12 text-teal-500" />,
    title: "Learning Arabic",
    description: "Discover the Arabic language with fun lessons and games.",
    link: "/kids-zone/learning-arabic",
    image: "https://picsum.photos/seed/learning-arabic/400/300",
    imageHint: "arabic language"
  },
  {
    icon: <Book className="w-12 h-12 text-rose-500" />,
    title: "Learning Urdu",
    description: "Explore the elegant script and sounds of the Urdu language.",
    link: "/kids-zone/learning-urdu",
    image: "https://picsum.photos/seed/learning-urdu/400/300",
    imageHint: "urdu script"
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
        
        <section className="relative w-full py-20 md:py-28 lg:py-36" style={{ background: 'linear-gradient(to right, #71B280, #134E5E)' }}>
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://picsum.photos/seed/kids-zone-hero/1920/1080"
                    alt="A playful and colorful abstract background for kids"
                    fill
                    className="object-cover opacity-10"
                    data-ai-hint="kids playful abstract"
                />
            </div>
             <div className="container mx-auto px-4 relative z-10 text-center">
               <div className="inline-block bg-white/20 dark:bg-black/30 backdrop-blur-sm p-4 rounded-full mb-4 border border-white/20">
                 <ToyBrick className="w-12 h-12 text-white" />
               </div>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 animate-gradient-text drop-shadow-lg">
                Welcome to the Kids Zone!
              </h1>
              <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto text-white/90 drop-shadow-md">
                A safe and exciting world of interactive games, fun quizzes, and engaging activities designed to make learning languages and math an unforgettable adventure for children.
              </p>
            </div>
        </section>

        <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {kidsFeatures.map((feature, index) => (
                <Card key={index} className="overflow-hidden flex flex-col group transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                    <CardHeader className="p-0 relative h-48">
                        <Image
                            src={feature.image}
                            alt={feature.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            data-ai-hint={feature.imageHint}
                        />
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug group-hover:text-primary transition-colors">
                            {feature.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {feature.description}
                        </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 mt-auto">
                        <Button asChild className="w-full">
                        <Link href={feature.link}>Let's Go!</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            </div>
        </div>
    </div>
  );
}
