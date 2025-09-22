
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BrainCircuit,
  ClipboardCheck,
  FileText,
  Rocket,
  Star,
  Trophy,
  BarChart,
  Users,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: <ClipboardCheck className="w-8 h-8 text-primary" />,
    title: "Mock Tests",
    description: "Distraction-free interface with timer and instant scoring.",
    link: "/mock-tests",
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: "AI Learning Path",
    description: "Personalized study plans based on your test results.",
    link: "/learning-path",
  },
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: "Solved Textbooks",
    description: "AI-powered summaries and solutions for textbook pages.",
    link: "/textbook-solver",
  },
  {
    icon: <Trophy className="w-8 h-8 text-primary" />,
    title: "Leaderboards",
    description: "Compete with others and climb the ranks.",
    link: "/leaderboard",
  },
];

const whyChooseUs = [
    {
        icon: <BarChart className="w-10 h-10 text-primary" />,
        title: "Comprehensive Analytics",
        description: "Get detailed insights into your performance to identify strengths and weaknesses."
    },
    {
        icon: <Users className="w-10 h-10 text-primary" />,
        title: "Expert-Crafted Content",
        description: "Our tests and materials are created by subject-matter experts for top-quality preparation."
    },
    {
        icon: <TrendingUp className="w-10 h-10 text-primary" />,
        title: "Proven Results",
        description: "Join thousands of successful students who have achieved their exam goals with DeshExam."
    }
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Medical Aspirant, NEET",
    quote:
      "DeshExam's mock tests were a game-changer for my NEET preparation. The AI analysis of my weak areas was incredibly accurate and helped me focus my study time effectively.",
    avatar: "/avatars/01.png",
  },
  {
    name: "Rahul Verma",
    role: "Engineering Student, JEE",
    quote:
      "The solved textbook feature is amazing! It's like having a personal tutor available 24/7. It made understanding complex physics problems so much easier.",
    avatar: "/avatars/02.png",
  },
  {
    name: "Anjali Singh",
    role: "UPSC Aspirant",
    quote:
      "I love the variety of quizzes available on DeshExam. It makes learning fun and competitive. The leaderboard is a great motivator to keep improving.",
    avatar: "/avatars/03.png",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full pt-20 pb-12 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 z-0">
           <Image
            src="https://picsum.photos/seed/hero/1920/1080"
            alt="Students studying diligently in a modern, well-lit library"
            fill
            className="object-cover"
            data-ai-hint="students library"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Unlock Your Potential <br className="hidden md:block" /> with DeshExam
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Master your competitive exam preparation for NEET, JEE, UPSC, and more with our mock tests, quizzes, and personalized AI-powered learning paths.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/mock-tests">Start a Mock Test</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/quizzes">Explore Free Quizzes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Key Features
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything You Need to Succeed
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              From realistic mock tests simulating exam conditions to AI-driven insights that target your weak spots, our platform is meticulously designed to give you a competitive edge.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="flex flex-col items-center text-center">
                  {feature.icon}
                  <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

       <section id="why-us" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
             <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Why Choose DeshExam?
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
              A Smarter Way to Prepare
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We blend expert content with intelligent technology to create a learning experience that is both effective and engaging.
            </p>
          </div>
           <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-1 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
            {whyChooseUs.map((reason) => (
              <div key={reason.title} className="grid gap-4 text-center">
                <div className="flex justify-center">{reason.icon}</div>
                <h3 className="text-xl font-bold font-headline">{reason.title}</h3>
                <p className="text-muted-foreground">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12">
            Loved by Learners Across India
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="flex flex-col justify-between">
                <CardContent className="pt-6">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic">
                    "{testimonial.quote}"
                  </blockquote>
                </CardContent>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Image
                      src={`https://picsum.photos/seed/${testimonial.name.replace(/\s/g, '')}/40/40`}
                      alt={`Profile picture of ${testimonial.name}`}
                      width={40}
                      height={40}
                      className="rounded-full"
                      data-ai-hint="person face"
                    />
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {testimonial.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Start Your Journey?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of students who are already acing their exams with
              DeshExam.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <Button asChild size="lg" className="w-full">
              <Link href="/sign-up">Sign Up for Free</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Get started with free quizzes and a sample mock test.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
