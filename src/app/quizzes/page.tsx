import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, HelpCircle } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { getAllTests } from "@/lib/firebase/firestore";
import { MockTestFilters } from "@/components/mock-test-filters";

export default async function QuizzesPage() {
  const quizzes = await getAllTests("Quiz");
  const subjects = Array.from(new Set(quizzes.map((test) => test.subject)));

  return (
    <div className="container py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Quizzes</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Test your knowledge with our fun and challenging quizzes on various subjects.
        </p>
      </header>

      <MockTestFilters subjects={subjects} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="p-0 relative">
              <Image
                src={`https://picsum.photos/seed/${quiz.id}/400/225`}
                alt={quiz.title}
                width={400}
                height={225}
                className="w-full h-auto object-cover"
                data-ai-hint={`${quiz.subject} abstract`}
              />
              <div className="absolute top-2 right-2">
                <ContentBadge type={quiz.access as "free" | "premium" | "pro"} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <p className="text-sm font-medium text-primary">{quiz.subject}</p>
              <CardTitle className="font-headline text-lg mt-1 mb-2 leading-tight">{quiz.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>{quiz.questions.length} Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.duration} min</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={`/mock-tests/${quiz.id}`}>Start Quiz</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
