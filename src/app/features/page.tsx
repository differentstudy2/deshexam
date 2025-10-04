
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Explore the powerful features of DeshExam, including realistic mock tests, AI-powered learning paths, solved textbooks, quizzes, leaderboards, and more, all designed to help you succeed.',
  keywords: ['deshexam features', 'mock tests', 'ai learning path', 'solved textbooks', 'online quizzes', 'leaderboards'],
};

const currentFeatures = [
  {
    icon: <ClipboardCheck className="w-10 h-10 text-primary" />,
    title: "Mock Tests",
    description: "Experience real exam conditions with our full-length mock tests. Each test features a distraction-free interface, a countdown timer, and instant scoring to accurately simulate the pressure and format of your actual exam.",
    link: "/mock-tests",
  },
  {
    icon: <BrainCircuit className="w-10 h-10 text-primary" />,
    title: "AI Learning Path",
    description: "Transform your weaknesses into strengths. Our advanced AI analyzes your mock test performance to create a personalized study plan, highlighting specific topics and recommending resources to help you improve efficiently.",
    link: "/learning-path",
  },
  {
    icon: <FileText className="w-10 h-10 text-primary" />,
    title: "Solved Textbooks",
    description: "Stuck on a difficult textbook problem? Just upload a photo of the page. Our AI provides detailed summaries, in-depth explanations of complex concepts, and step-by-step solutions to the problems on the page.",
    link: "/textbook-solver",
  },
  {
    icon: <Trophy className="w-10 h-10 text-primary" />,
    title: "Leaderboards",
    description: "Fuel your competitive spirit! See how you stack up against other aspirants nationwide. Our dynamic leaderboards track scores and ranks, motivating you to climb higher and achieve your best performance.",
    link: "/leaderboard",
  },
   {
    icon: <Rocket className="w-10 h-10 text-primary" />,
    title: "Quizzes",
    description: "Sharpen your knowledge with our extensive library of quizzes covering a wide range of subjects and difficulty levels. Perfect for quick revisions, topic-specific practice, and making learning engaging and fun.",
    link: "/quizzes",
  },
  {
    icon: <Star className="w-10 h-10 text-primary" />,
    title: "Learn Articles",
    description: "Dive deep into complex subjects with our curated collection of in-depth articles, tutorials, and study guides. Written by experts, these resources are designed to build a strong foundational understanding of key topics.",
    link: "/learn",
  },
  {
    icon: <ToyBrick className="w-10 h-10 text-primary" />,
    title: "Kids Zone",
    description: "A fun and safe place for young learners to explore, play, and grow with interactive games for learning languages and math.",
    link: "/kids-zone",
  },
];

const upcomingFeatures = [
  {
    icon: <Video className="w-10 h-10 text-muted-foreground" />,
    title: "Live Classes",
    description: "Join interactive live sessions with expert educators. Ask questions, clear your doubts in real-time, and learn alongside peers in a structured, engaging classroom environment.",
  },
  {
    icon: <MessagesSquare className="w-10 h-10 text-muted-foreground" />,
    title: "Doubt Solving",
    description: "Never get stuck on a question again. Get instant, 24/7 solutions to your academic doubts from our powerful AI tutor and a supportive community of fellow learners and experts.",
  },
  {
    icon: <Sparkles className="w-10 h-10 text-muted-foreground" />,
    title: "Advanced AI Analytics",
    description: "Receive deeper insights into your performance. Our next-gen AI will provide question-level analysis, time management feedback, and predictive scoring to refine your exam strategy.",
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {currentFeatures.map((feature) => (
                <Link href={feature.link} key={feature.title} className="block group">
                    <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/50 flex flex-col">
                        <CardHeader className="flex flex-col items-center text-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                {feature.icon}
                            </div>
                            <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground px-6 pb-8 flex-grow">
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
  );
}
