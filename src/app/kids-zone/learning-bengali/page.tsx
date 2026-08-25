
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book, SpellCheck, Mic, Combine, PenTool, BookOpenCheck } from "lucide-react";
import Link from "next/link";

const bengaliActivities = [
  {
    title: "বর্ণমালা পরিচিতি (Alphabet)",
    description: "Learn the Bengali alphabet with sounds and examples.",
    icon: <Book className="w-10 h-10 text-orange-500" />,
    bgColor: "bg-orange-100",
    link: "/kids-zone/learning-bengali/alphabet",
    comingSoon: false,
  },
  {
    title: "মাত্রা (Matra)",
    description: "Learn how vowels combine with consonants.",
    icon: <Combine className="w-10 h-10 text-blue-500" />,
    bgColor: "bg-blue-100",
    link: "/kids-zone/learning-bengali/matra",
    comingSoon: false,
  },
  {
    title: "শব্দ ভান্ডার (Vocabulary)",
    description: "Build your Bengali vocabulary with fun word games.",
    icon: <SpellCheck className="w-10 h-10 text-teal-500" />,
    bgColor: "bg-teal-100",
    link: "#",
    comingSoon: true,
  },
  {
    title: "বানান কৌশল (Spelling)",
    description: "Master Bengali spelling with interactive exercises.",
    icon: <PenTool className="w-10 h-10 text-indigo-500" />,
    bgColor: "bg-indigo-100",
    link: "/kids-zone/learning-bengali/spelling",
    comingSoon: false,
  },
  {
    title: "পড়ার অভ্যাস (Reading)",
    description: "Practice reading Bengali with short stories and passages.",
    icon: <BookOpenCheck className="w-10 h-10 text-lime-500" />,
    bgColor: "bg-lime-100",
    link: "/kids-zone/learning-bengali/reading",
    comingSoon: false,
  },
  {
    title: "গল্প শোনা (Story Time)",
    description: "Listen to beautiful Bengali stories and improve your listening skills.",
    icon: <Mic className="w-10 h-10 text-pink-500" />,
    bgColor: "bg-pink-100",
    link: "#",
    comingSoon: true,
  },
];

export default function LearningBengaliPage() {
  return (
    <div className="relative min-h-screen bg-background">
        <div 
            className="absolute inset-0 z-0"
            style={{
                backgroundImage: "url(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/image/logo.png`)",
                backgroundSize: '150px',
                backgroundRepeat: 'repeat',
                opacity: 0.05,
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/90 to-amber-50/90 dark:from-orange-900/80 dark:to-amber-900/90 backdrop-blur-sm" />
        <div className="relative z-10 container mx-auto px-4 py-12">
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
                Learning Bengali
            </h1>
            <p className="text-lg text-orange-700/80 mt-4 max-w-2xl mx-auto">
                Discover the beauty of the Bengali language with these fun activities.
            </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bengaliActivities.map((activity, index) => (
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
