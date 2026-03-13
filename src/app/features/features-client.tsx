'use client';

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
  ToyBrick,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";

const currentFeatures = [
  {
    icon: <ClipboardCheck className="w-10 h-10 text-primary" />,
    title: "Mock Tests",
    description: "Experience real exam conditions with our full-length mock tests, complete with timers and instant scoring to simulate the pressure and format of your actual exam.",
    link: "/mock-tests",
    image: "https://picsum.photos/seed/mock-tests-feature/400/300",
    imageHint: "exam paper timer"
  },
  {
    icon: <BrainCircuit className="w-10 h-10 text-primary" />,
    title: "AI Learning Path",
    description: "Transform your weaknesses into strengths. Our AI analyzes your mock test performance to create a personalized study plan, recommending resources to help you improve efficiently.",
    link: "/learning-path",
    image: "https://picsum.photos/seed/ai-path-feature/400/300",
    imageHint: "ai circuit brain"
  },
  {
    icon: <FileText className="w-10 h-10 text-primary" />,
    title: "Solved Textbooks",
    description: "Stuck on a problem? Upload a photo of a textbook page, and our AI will provide summaries, explain complex concepts, and offer step-by-step solutions.",
    link: "/textbook-solver",
    image: "https://picsum.photos/seed/textbook-feature/400/300",
    imageHint: "textbook open"
  },
  {
    icon: <Trophy className="w-10 h-10 text-primary" />,
    title: "Leaderboards",
    description: "See how you stack up against other aspirants nationwide. Our dynamic leaderboards track scores and ranks, motivating you to achieve your best performance.",
    link: "/leaderboard",
    image: "https://picsum.photos/seed/leaderboard-feature/400/300",
    imageHint: "trophy leaderboard"
  },
   {
    icon: <Rocket className="w-10 h-10 text-primary" />,
    title: "Quizzes",
    description: "Sharpen your knowledge with our extensive library of quizzes covering a wide range of subjects. Perfect for quick revisions and making learning engaging.",
    link: "/quizzes",
    image: "https://picsum.photos/seed/quizzes-feature/400/300",
    imageHint: "quiz questions"
  },
  {
    icon: <Star className="w-10 h-10 text-primary" />,
    title: "Learn Articles",
    description: "Dive deep into complex subjects with our curated collection of in-depth articles and tutorials written by experts to build a strong foundational understanding.",
    link: "/learn",
    image: "https://picsum.photos/seed/learn-feature/400/300",
    imageHint: "person learning"
  },
  {
    icon: <ToyBrick className="w-10 h-10 text-primary" />,
    title: "Kids Zone",
    description: "A fun and safe place for young learners to explore, play, and grow with interactive games for learning languages and math.",
    link: "/kids-zone",
    image: "https://picsum.photos/seed/kids-zone-feature/400/300",
    imageHint: "kids playing"
  },
];

const upcomingFeatures = [
  {
    icon: <Video className="w-10 h-10 text-muted-foreground" />,
    title: "Live Classes",
    description: "Join interactive live sessions with expert educators. Ask questions, clear your doubts in real-time, and learn alongside peers in a structured classroom environment.",
  },
  {
    icon: <MessagesSquare className="w-10 h-10 text-muted-foreground" />,
    title: "Doubt Solving",
    description: "Never get stuck on a question again. Get instant, 24/7 solutions to your academic doubts from our powerful AI tutor and a supportive community.",
  },
  {
    icon: <Sparkles className="w-10 h-10 text-muted-foreground" />,
    title: "Advanced AI Analytics",
    description: "Receive deeper insights into your performance. Our next-gen AI will provide question-level analysis, time management feedback, and predictive scoring.",
  },
];


export default function FeaturesClientPage() {
  return (
    <>
       <section className="relative w-full py-20 md:py-28 lg:py-36 text-white bg-hero-gradient">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg wave-text">
             <span>Powerful</span> <span>Features,</span> <span>Unbeatable</span> <span>Results</span>
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto drop-shadow-md">
            Our platform is packed with cutting-edge tools designed to help you excel in your exams and beyond. Explore what makes DeshExam the ultimate learning companion.
          </p>
        </div>
      </section>

      <div className="bg-background">
        <div className="container py-12 md:py-16">
            <section id="current-features">
                 <h2 className="font-headline text-3xl font-bold tracking-tighter text-center mb-10">
                  Available Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {currentFeatures.map((feature) => (
                    <Card key={feature.title} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow bg-card-gradient text-white">
                        <CardHeader className="p-0 relative h-48">
                            <Image
                                src={feature.image}
                                alt={feature.title}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover"
                                data-ai-hint={feature.imageHint}
                            />
                        </CardHeader>
                        <CardContent className="flex-grow p-4">
                            <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug">{feature.title}</CardTitle>
                            <p className="text-sm text-primary-foreground/70 line-clamp-4">
                                {feature.description}
                            </p>
                        </CardContent>
                         <CardFooter className="p-4 pt-0">
                            <Button asChild className="w-full bg-quiz-button-gradient text-white">
                            <Link href={feature.link}>Explore</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
            </section>

            <section id="upcoming-features" className="mt-24">
            <h2 className="font-headline text-3xl font-bold tracking-tighter text-center mb-10">
                Coming Soon
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingFeatures.map((feature) => (
                        <Card key={feature.title} className="h-full bg-card/50 border-dashed relative overflow-hidden flex flex-col">
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
                            <CardContent className="text-center text-muted-foreground/70 px-6 pb-8 flex-grow">
                                <p>{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </>
  );
}
