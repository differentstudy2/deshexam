
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Shapes, Eye } from "lucide-react";
import Link from "next/link";

const puzzles = [
  {
    title: "Addition Adventure",
    description: "Add numbers together to solve the puzzle!",
    icon: <Plus className="w-10 h-10 text-green-500" />,
    bgColor: "bg-green-100",
    link: "/kids-zone/learning-games/math-puzzles/addition-adventure",
  },
  {
    title: "Subtraction Submarine",
    description: "Take away numbers to find the answer deep in the sea.",
    icon: <Minus className="w-10 h-10 text-red-500" />,
    bgColor: "bg-red-100",
    link: "/kids-zone/learning-games/math-puzzles/subtraction-submarine",
  },
  {
    title: "Shape Sorter",
    description: "Match the shapes to their correct places.",
    icon: <Shapes className="w-10 h-10 text-purple-500" />,
    bgColor: "bg-purple-100",
    link: "#",
  },
];

export default function MathPuzzlesPage() {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 min-h-screen">
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
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-green-600">
            Math Puzzles
          </h1>
          <p className="text-lg text-green-700/80 mt-4 max-w-2xl mx-auto">
            Let's have fun with numbers! Choose a puzzle to begin.
          </p>
        </header>

        <Card className="mb-8 bg-blue-50 border-blue-200 text-center">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Eye className="w-8 h-8 text-blue-500"/>
                    <p className="font-medium text-blue-800">New to numbers? Try our Number Recognition game first!</p>
                    <Button asChild>
                        <Link href="/kids-zone/learning-games/number-recognition">Start Here</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {puzzles.map((puzzle, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center">
              <CardHeader className="items-center">
                <div className={`p-4 rounded-full mb-4 ${puzzle.bgColor}`}>
                    {puzzle.icon}
                </div>
                <CardTitle className="font-headline text-2xl">{puzzle.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{puzzle.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button asChild>
                  <Link href={puzzle.link}>Play</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
