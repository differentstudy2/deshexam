
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Calculator, SpellCheck, Eye } from "lucide-react";
import Link from "next/link";

const games = [
  {
    title: "Number Recognition",
    description: "Learn to identify numbers with this fun recognition game.",
    icon: <Eye className="w-10 h-10 text-red-500" />,
    bgColor: "bg-red-100",
    link: "/kids-zone/learning-games/number-recognition",
  },
  {
    title: "Math Puzzles",
    description: "Solve fun math problems and become a numbers wizard!",
    icon: <Calculator className="w-10 h-10 text-blue-500" />,
    bgColor: "bg-blue-100",
    link: "/kids-zone/learning-games/math-puzzles",
  },
  {
    title: "Word Adventures",
    description: "Learn new words and improve your spelling with exciting word games.",
    icon: <SpellCheck className="w-10 h-10 text-green-500" />,
    bgColor: "bg-green-100",
    link: "#",
  },
  {
    title: "Logic Challenges",
    description: "Train your brain with tricky puzzles and logic-based challenges.",
    icon: <Brain className="w-10 h-10 text-orange-500" />,
    bgColor: "bg-orange-100",
    link: "#",
  },
];

export default function LearningGamesPage() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
          backgroundImage: "url('https://deshexam.com/image/logo.png')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-cyan-50/90 dark:from-blue-900/80 dark:to-cyan-900/90 backdrop-blur-sm" />
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
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            Learning Games
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            Get ready to play and learn! Choose a game to start your adventure.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {games.map((game, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center">
              <CardHeader className="items-center">
                <div className={`p-4 rounded-full mb-4 ${game.bgColor}`}>
                    {game.icon}
                </div>
                <CardTitle className="font-headline text-2xl">{game.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{game.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button asChild>
                  <Link href={game.link}>Play Now</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
