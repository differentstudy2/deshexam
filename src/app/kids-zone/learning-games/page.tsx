
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Calculator, SpellCheck } from "lucide-react";
import Link from "next/link";

const games = [
  {
    title: "Math Puzzles",
    description: "Solve fun math problems and become a numbers wizard!",
    icon: <Calculator className="w-10 h-10 text-blue-500" />,
    bgColor: "bg-blue-100",
  },
  {
    title: "Word Adventures",
    description: "Learn new words and improve your spelling with exciting word games.",
    icon: <SpellCheck className="w-10 h-10 text-green-500" />,
    bgColor: "bg-green-100",
  },
  {
    title: "Logic Challenges",
    description: "Train your brain with tricky puzzles and logic-based challenges.",
    icon: <Brain className="w-10 h-10 text-orange-500" />,
    bgColor: "bg-orange-100",
  },
];

export default function LearningGamesPage() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 min-h-screen">
      <div className="container mx-auto px-4 py-12">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <Button>Play Now</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
