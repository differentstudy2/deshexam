
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const stories = [
  {
    title: "শেয়ালের চালাকি",
    description: "এক চালাক শেয়ালের গল্প যে তার বুদ্ধির জোরে বিপদ থেকে রক্ষা পায়।",
    image: "https://picsum.photos/seed/fox/400/300",
    imageHint: "fox illustration",
    link: "/kids-zone/learning-bengali/reading/sheyaler-chalaki"
  },
  {
    title: "কচ্ছপ ও খরগোশ",
    description: "ধীর ও স্থির কচ্ছপের কাছে অহংকারী খরগোশের হারের গল্প।",
    image: "https://picsum.photos/seed/tortoise/400/300",
    imageHint: "tortoise hare",
    link: "/kids-zone/learning-bengali/reading/kocchop-o-khorgosh"
  },
  {
    title: "তৃষ্ণার্ত কাক",
    description: "এক তৃষ্ণার্ত কাকের বুদ্ধির গল্প যে কলসির জল উপরে তুলে আনে।",
    image: "https://picsum.photos/seed/crow/400/300",
    imageHint: "crow water",
    link: "/kids-zone/learning-bengali/reading/trishnarto-kak"
  },
  {
    title: "সিংহ এবং ইঁদুর",
    description: "ছোট প্রাণীরও যে বড় উপকার করার ক্ষমতা থাকে, সেই গল্প।",
    image: "https://picsum.photos/seed/lion-mouse/400/300",
    imageHint: "lion mouse",
    link: "/kids-zone/learning-bengali/reading/lion-and-mouse"
  },
  {
    title: "দুই বন্ধু ও ভাল্লুক",
    description: "বিপদের সময় কে আসল বন্ধু তা চেনার গল্প।",
    image: "https://picsum.photos/seed/friends-bear/400/300",
    imageHint: "friends bear forest",
    link: "/kids-zone/learning-bengali/reading/two-friends-and-bear"
  },
];

export default function BengaliReadingPage() {
  return (
    <div className="bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-bengali">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Bengali
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-lime-600">
            পড়ার অভ্যাস (Reading)
          </h1>
          <p className="text-lg text-lime-700/80 mt-4 max-w-2xl mx-auto">
            Practice reading Bengali with short stories and passages.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, index) => (
                <Card key={index} className="overflow-hidden flex flex-col group transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                    <CardHeader className="p-0 relative h-48">
                        <Image
                            src={story.image}
                            alt={story.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            data-ai-hint={story.imageHint}
                        />
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <CardTitle className="font-headline text-xl text-slate-800">{story.title}</CardTitle>
                        <CardDescription className="mt-2 text-slate-600">{story.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Button asChild className="w-full">
                            <Link href={story.link}>Read Story</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
