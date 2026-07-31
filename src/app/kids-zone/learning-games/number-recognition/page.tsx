
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, BookHeart, Ear, Hand, Palmtree } from "lucide-react";
import Link from "next/link";

const stages = [
    {
    title: "Learn Numbers",
    description: "Start by learning what the numbers look and sound like.",
    icon: <BookHeart className="w-10 h-10 text-blue-500" />,
    bgColor: "bg-blue-100",
    link: "/kids-zone/learning-games/number-recognition/learn-numbers",
  },
  {
    title: "Recognize Numbers",
    description: "Look at the number and find the matching one.",
    icon: <Eye className="w-10 h-10 text-red-500" />,
    bgColor: "bg-red-100",
    link: "/kids-zone/learning-games/number-recognition/numbers-0-9",
  },
  {
    title: "Listen & Find",
    description: "Listen to the number and find the correct one.",
    icon: <Ear className="w-10 h-10 text-green-500" />,
    bgColor: "bg-green-100",
    link: "#",
    comingSoon: true,
  },
    {
    title: "How Many?",
    description: "Count the objects and choose the right number.",
    icon: <Palmtree className="w-10 h-10 text-yellow-500" />,
    bgColor: "bg-yellow-100",
    link: "#",
    comingSoon: true,
  },
  {
    title: "Number Tracing",
    description: "Practice writing the numbers with your finger.",
    icon: <Hand className="w-10 h-10 text-purple-500" />,
    bgColor: "bg-purple-100",
    link: "#",
    comingSoon: true,
  },
];

export default function NumberRecognitionMenuPage() {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Games
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-red-600">
            Number Recognition
          </h1>
          <p className="text-lg text-red-700/80 mt-4 max-w-2xl mx-auto">
            Choose a stage to start learning and recognizing numbers!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {stages.map((stage, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center relative">
               {stage.comingSoon && (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
              <CardHeader className="items-center">
                <div className={`p-4 rounded-full mb-4 ${stage.bgColor}`}>
                    {stage.icon}
                </div>
                <CardTitle className="font-headline text-2xl">{stage.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{stage.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button asChild disabled={stage.comingSoon}>
                  <Link href={stage.link}>Start</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
