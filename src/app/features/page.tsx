
import {
  BrainCircuit,
  ClipboardCheck,
  FileText,
  Rocket,
  Star,
  Trophy,
  Video,
  MessagesSquare,
  Sparkles,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currentFeatures = [
  {
    icon: <ClipboardCheck className="w-10 h-10 text-primary" />,
    title: "Mock Tests",
    description: "Distraction-free interface with timer and instant scoring to simulate the real exam experience.",
    link: "/mock-tests",
  },
  {
    icon: <BrainCircuit className="w-10 h-10 text-primary" />,
    title: "AI Learning Path",
    description: "Get personalized study plans and recommendations based on your mock test performance.",
    link: "/learning-path",
  },
  {
    icon: <FileText className="w-10 h-10 text-primary" />,
    title: "Solved Textbooks",
    description: "Upload a page from your textbook and get AI-powered summaries, explanations, and solved answers.",
    link: "/textbook-solver",
  },
  {
    icon: <Trophy className="w-10 h-10 text-primary" />,
    title: "Leaderboards",
    description: "Compete with peers, climb the ranks, and see where you stand with our dynamic leaderboards.",
    link: "/leaderboard",
  },
   {
    icon: <Rocket className="w-10 h-10 text-primary" />,
    title: "Quizzes",
    description: "Test your knowledge with fun and challenging quizzes on a wide variety of subjects.",
    link: "/quizzes",
  },
  {
    icon: <Star className="w-10 h-10 text-primary" />,
    title: "Learn Articles",
    description: "Expand your knowledge with our curated collection of in-depth articles and tutorials.",
    link: "/learn",
  },
];

const upcomingFeatures = [
  {
    icon: <Video className="w-10 h-10 text-muted-foreground" />,
    title: "Live Classes",
    description: "Interactive live sessions with expert educators to clear your doubts in real-time.",
  },
  {
    icon: <MessagesSquare className="w-10 h-10 text-muted-foreground" />,
    title: "Doubt Solving",
    description: "Get instant solutions to your academic doubts, 24/7, from our AI and community.",
  },
  {
    icon: <Sparkles className="w-10 h-10 text-muted-foreground" />,
    title: "Advanced AI Analytics",
    description: "Deeper insights into your performance, including question-level analysis and time management feedback.",
  },
];


export default function FeaturesPage() {
  return (
    <div className="bg-secondary/30">
      <div className="container py-12 md:py-16">
        <header className="text-center mb-16">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Powerful Features, Unbeatable Results
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Our platform is packed with cutting-edge tools designed to help you excel in your exams and beyond. Explore what makes DeshExam the ultimate learning companion.
          </p>
        </header>

        <section id="current-features">
             <h2 className="font-headline text-3xl font-bold tracking-tighter text-center mb-10">
              Available Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentFeatures.map((feature) => (
                <Link href={feature.link} key={feature.title} className="block group">
                    <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/50">
                        <CardHeader className="flex flex-col items-center text-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                {feature.icon}
                            </div>
                            <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground px-6 pb-8">
                            <p>{feature.description}</p>
                        </CardContent>
                    </Card>
                </Link>
                ))}
            </div>
        </section>

        <section id="upcoming-features" className="mt-24">
           <h2 className="font-headline text-3xl font-bold tracking-tighter text-center mb-10">
              Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingFeatures.map((feature) => (
                    <Card key={feature.title} className="h-full bg-card/50 border-dashed relative overflow-hidden">
                         <div className="absolute top-2 right-2 text-xs font-semibold text-muted-foreground/70 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            In Development
                        </div>
                        <CardHeader className="flex flex-col items-center text-center">
                            <div className="p-4 bg-muted rounded-full mb-4">
                                {feature.icon}
                            </div>
                            <CardTitle className="font-headline text-xl text-muted-foreground/80">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground/70 px-6 pb-8">
                            <p>{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
