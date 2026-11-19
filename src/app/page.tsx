import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  PlayCircle,
  HelpCircle,
  Users,
  Star,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  MonitorPlay,
  ClipboardList,
  Timer,
  Activity,
  Trophy,
  Target,
  Sparkles,
  BookMarked,
  Brain,
  Baby,
  Languages,
  MessageSquare,
  Landmark,
  Stethoscope,
  Briefcase,
  ArrowRight,
  Crown
} from "lucide-react";
import type { Metadata } from 'next';
import { getSearchActionSchema, getOrganizationSchema, getFAQSchema } from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: "DeshExam - Best Online Learning Platform & Mock Test App",
  description: "DeshExam is the ultimate online educational platform featuring 2M+ questions, 100K+ contents, model tests, live classes, trending courses, and book collections for HSC, SSC, Admission, and Job preparations.",
  keywords: ["online learning platform", "mock test", "question bank", "live classes", "exam preparation", "DeshExam", "HSC preparation", "SSC preparation", "university admission", "job preparation"],
  openGraph: {
    title: "DeshExam - Best Online Learning Platform & Mock Test App",
    description: "Prepare for SSC, HSC, Admission & Job exams with DeshExam. Get access to 2M+ questions, live classes, model tests, and trending courses.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
    siteName: "DeshExam",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/image/logo.png`,
        width: 1200,
        height: 630,
        alt: "DeshExam - One Stop Learning Platform",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeshExam - Best Online Learning Platform & Mock Test App",
    description: "Prepare for SSC, HSC, Admission & Job exams with DeshExam. Get access to 2M+ questions, live classes, model tests, and trending courses.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/image/logo.png`],
  },
};

const smartFeatures = [
  { icon: <MonitorPlay className="w-6 h-6 text-[#00a651]" />, title: "Live Class", desc: "Learn live from expert teachers", href: "/course" },
  { icon: <FileText className="w-6 h-6 text-red-600" />, title: "Smart PDF", desc: "Read PDFs and study materials", href: "/documents" },
  { icon: <ClipboardList className="w-6 h-6 text-[#00a651]" />, title: "Model Test", desc: "Realistic exam simulations with timers", href: "/mock-tests" },
  { icon: <FileQuestion className="w-6 h-6 text-blue-500" />, title: "Question Bank", desc: "Practise from 2M+ questions", badge: "New", href: "/practice-questions" },
  { icon: <BookOpen className="w-6 h-6 text-purple-600" />, title: "Books & Lectures", desc: "Books and lecture notes in one place", href: "/book" },
  { icon: <CheckCircle2 className="w-6 h-6 text-[#00a651]" />, title: "Solution", desc: "Step-by-step textbook solutions", href: "/textbook-solutions" },
  { icon: <PlayCircle className="w-6 h-6 text-red-500" />, title: "Video", desc: "Educational videos and lectures", href: "/videos" },
  { icon: <FileText className="w-6 h-6 text-red-700" />, title: "Magazine", desc: "Reading material and magazines", href: "/blog" },
  { icon: <HelpCircle className="w-6 h-6 text-blue-600" />, title: "Suggestion", desc: "Exam suggestions and short notes", badge: "New", href: "/exams" },
  { icon: <GraduationCap className="w-6 h-6 text-blue-700" />, title: "Course", desc: "Structured courses for every exam", href: "/course" },
  { icon: <Users className="w-6 h-6 text-red-500" />, title: "Teachers", desc: "Learn from experienced teachers", href: "/about" },
  { icon: <HelpCircle className="w-6 h-6 text-cyan-600" />, title: "FAQs", desc: "Answers to common questions", href: "/faqs" },
  { icon: <ClipboardList className="w-6 h-6 text-[#00a651]" />, title: "Study Plan", desc: "A study plan that fits your exam", href: "/learn" },
  { icon: <CheckCircle2 className="w-6 h-6 text-[#00a651]" />, title: "Success", desc: "Track your success and milestones", href: "/leaderboard" },
  { icon: <FileText className="w-6 h-6 text-blue-600" />, title: "Notice", desc: "Latest exam notices and updates", href: "/news" },
];

const examCategories = [
  { icon: <Landmark className="w-7 h-7 text-[#d4af37]" />, title: "BCS", desc: "Preliminary and written preparation for BCS exams", href: "/exams" },
  { icon: <GraduationCap className="w-7 h-7 text-[#00a651]" />, title: "HSC / Alim", desc: "HSC and Alim preparation with model tests", href: "/exams" },
  { icon: <BookOpen className="w-7 h-7 text-teal-600" />, title: "SSC / Dakhil", desc: "SSC and Dakhil preparation with question bank", href: "/exams" },
  { icon: <Target className="w-7 h-7 text-[#d4af37]" />, title: "Admission", desc: "University and medical admission preparation", href: "/exams" },
  { icon: <Stethoscope className="w-7 h-7 text-red-500" />, title: "Medical", desc: "Medical admission crash courses and tests", href: "/exams" },
  { icon: <Briefcase className="w-7 h-7 text-blue-600" />, title: "Bank & Job", desc: "Bank, Primary and other Govt. job preparation", href: "/exams" },
];

const howItWorks = [
  { step: "01", icon: <Target className="w-6 h-6 text-white" />, title: "Choose your exam", desc: "Pick BCS, HSC, SSC, Admission or a job exam and see its tests, courses and books.", href: "/exams", cta: "Browse exams" },
  { step: "02", icon: <ClipboardList className="w-6 h-6 text-white" />, title: "Take mock tests", desc: "Attempt realistic model tests with timers and get instant results.", href: "/mock-tests", cta: "Start a mock test" },
  { step: "03", icon: <Activity className="w-6 h-6 text-white" />, title: "Track your progress", desc: "Follow your performance on the dashboard and improve with the AI learning path.", href: "/dashboard", cta: "View dashboard" },
];

const pricingPlans = [
  {
    name: "S-BASIC",
    price: "₹50",
    oldPrice: "₹100",
    tagline: "Start your preparation",
    features: ["Mock tests and model tests", "Question bank access", "Previous year papers"],
    popular: false,
  },
  {
    name: "S-PLUS",
    price: "₹100",
    oldPrice: "₹250",
    tagline: "For serious aspirants",
    features: ["Everything in S-BASIC", "Live classes", "Textbook solutions", "Video lectures"],
    popular: false,
  },
  {
    name: "S-PRO",
    price: "₹200",
    oldPrice: "₹400",
    tagline: "Complete preparation",
    features: ["Everything in S-PLUS", "AI learning path and analytics", "Books and study materials", "Community Q&A and leaderboard"],
    popular: true,
  },
];

const kidsLanguages = [
  { title: "Bengali", desc: "Learn Bengali letters and words", href: "/kids-zone/learning-bengali" },
  { title: "Hindi", desc: "Learn Hindi letters and words", href: "/kids-zone/learning-hindi" },
  { title: "English", desc: "Learn English letters and words", href: "/kids-zone/learning-english" },
  { title: "Arabic", desc: "Learn Arabic letters and words", href: "/kids-zone/learning-arabic" },
  { title: "Urdu", desc: "Learn Urdu letters and words", href: "/kids-zone/learning-urdu" },
  { title: "Math Games", desc: "Fun games to learn basic math", href: "/kids-zone/learning-games" },
  { title: "Fun Quizzes", desc: "Quizzes that make learning fun", href: "/kids-zone/fun-quizzes" },
];

const trendingCourses = [
  {
    title: "BCS Preliminary Complete Preparation",
    instructor: "Md. Hasan Mahmud (BCS Cadre)",
    rating: 4.9,
    reviews: 1250,
    students: "25,000+",
    price: "₹ 1500",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&q=80"
  },
  {
    title: "HSC English 2nd Paper Masterclass",
    instructor: "Sarah Rahman",
    rating: 4.8,
    reviews: 850,
    students: "18,000+",
    price: "₹ 1000",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&q=80"
  },
  {
    title: "Medical Admission Crash Course",
    instructor: "Dr. Ahmed & Team",
    rating: 4.9,
    reviews: 2100,
    students: "12,000+",
    price: "₹ 3000",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80"
  },
  {
    title: "Bank Job Math Magic Course",
    instructor: "Prof. Kabir",
    rating: 4.7,
    reviews: 650,
    students: "9,000+",
    price: "₹ 1200",
    image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500&q=80"
  }
];

const mockTestsData = [
  {
    title: "46th BCS Preliminary Mega Model Test",
    category: "BCS",
    questions: 100,
    time: "120 Min",
    difficulty: "Hard",
    enrolled: "5.2k+",
    price: "₹ 50",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80"
  },
  {
    title: "HSC Physics Final Quiz Contest",
    category: "HSC / Alim",
    questions: 50,
    time: "60 Min",
    difficulty: "Medium",
    enrolled: "12k+",
    price: "Free",
    image: "https://images.unsplash.com/photo-1632571401005-458e9d244591?w=500&q=80"
  },
  {
    title: "Primary Assistant Teacher Exam - Set A",
    category: "Job Preparation",
    questions: 80,
    time: "90 Min",
    difficulty: "Medium",
    enrolled: "8.5k+",
    price: "₹ 30",
    image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=500&q=80"
  },
  {
    title: "DU Ka-Unit Admission Mock Test",
    category: "Admission",
    questions: 100,
    time: "100 Min",
    difficulty: "Hard",
    enrolled: "15k+",
    price: "₹ 100",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80"
  }
];

const bookCollection = [
  {
    title: "45th BCS Question Bank Solution",
    author: "DeshExam Publication",
    rating: 4.8,
    reviews: 445,
    price: "₹ 250",
    oldPrice: "₹ 300",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80"
  },
  {
    title: "HSC Physics 1st Paper Note",
    author: "DeshExam Academics",
    rating: 4.9,
    reviews: 812,
    price: "₹ 150",
    oldPrice: "₹ 200",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80"
  },
  {
    title: "DU Admission Master Guide",
    author: "DeshExam University Team",
    rating: 4.7,
    reviews: 630,
    price: "₹ 450",
    oldPrice: "₹ 600",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80"
  },
  {
    title: "Primary Teacher Exam Suggestion",
    author: "DeshExam Job Prep",
    rating: 4.6,
    reviews: 350,
    price: "₹ 120",
    oldPrice: "₹ 180",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80"
  }
];

const topContributors = [
  {
    name: "Abdur Rahman Jibon",
    role: "Student",
    questions: 150,
    answers: 300,
    points: "15,000",
    image: "https://picsum.photos/seed/user1/100/100"
  },
  {
    name: "Mehedi Hasan Niloy",
    role: "Teacher",
    questions: 50,
    answers: 500,
    points: "25,000",
    image: "https://picsum.photos/seed/user2/100/100"
  },
  {
    name: "Nusrat Jahan",
    role: "Student",
    questions: 200,
    answers: 150,
    points: "12,000",
    image: "https://picsum.photos/seed/user3/100/100"
  },
  {
    name: "Al Amin Islam",
    role: "Student",
    questions: 100,
    answers: 250,
    points: "18,000",
    image: "https://picsum.photos/seed/user4/100/100"
  }
];

const faqs = [
  { q: "What is DeshExam?", a: "DeshExam is the ultimate online educational platform featuring 2M+ questions, live classes, model tests, and study materials for HSC, SSC, Admission, and Job preparations in Bangladesh." },
  { q: "Are there mock tests available?", a: "Yes, DeshExam offers extensive mock tests and a massive question bank to help you prepare effectively." },
  { q: "Is DeshExam suitable for Job Preparation?", a: "Absolutely! DeshExam provides comprehensive materials, questions, and model tests specifically designed for BCS, Primary, Bank, and other Govt. Job exams." }
];

export default function Home() {
  const schemas = [
    getSearchActionSchema(),
    getOrganizationSchema(),
    getFAQSchema(faqs)
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-b from-[#042f2e] via-[#0b3b39] to-[#042f2e] pt-20 md:pt-24 pb-28 md:pb-32 overflow-hidden">
        {/* Premium gold spotlight */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.22),transparent_70%)]"></div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(45,212,191,0.18),transparent_70%)]"></div>
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#d4af37]/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-white/5 rounded-[100%] blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-[#2dd4bf]/20 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <div className="container relative z-10 px-4 mx-auto text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-amber-300 border border-amber-300/40 bg-white/5 backdrop-blur rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4" /> SSC • HSC • BCS • Admission • Job
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase mb-4 flex justify-center items-center">
            <span className="drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#d4af37] to-amber-400">DESH</span> <span className="text-white">EXAM</span>
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-amber-200/90 font-medium mb-8">The Largest Online Learning Platform in Bangladesh</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link href="/mock-tests" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-[#d4af37] px-8 py-3.5 text-sm font-bold text-[#042f2e] shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all min-h-[48px]">Get Started</Link>
            <Link href="/mock-tests" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-amber-300/40 bg-white/5 backdrop-blur px-8 py-3.5 text-sm font-bold text-amber-100 hover:bg-white/10 transition-all min-h-[48px]">Explore Mock Tests</Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-12 relative z-10">
            <div className="flex items-center gap-4 text-white bg-white/10 backdrop-blur-lg border border-amber-200/25 px-6 py-4 rounded-3xl w-full max-w-sm sm:max-w-none sm:w-auto hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 shadow-2xl">
              <div className="bg-gradient-to-br from-green-400 to-[#00a651] p-4 rounded-full shadow-lg border border-white/20">
                <FileQuestion className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200">2M+</h3>
                <p className="text-xs md:text-sm font-semibold text-blue-100 uppercase tracking-widest mt-0.5">Questions</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white bg-white/10 backdrop-blur-lg border border-amber-200/25 px-6 py-4 rounded-3xl w-full max-w-sm sm:max-w-none sm:w-auto hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 shadow-2xl">
              <div className="bg-gradient-to-br from-amber-300 to-[#d4af37] p-4 rounded-full shadow-lg border border-white/20">
                <Users className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-100">6M+</h3>
                <p className="text-xs md:text-sm font-semibold text-blue-100 uppercase tracking-widest mt-0.5">Students</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white bg-white/10 backdrop-blur-lg border border-amber-200/25 px-6 py-4 rounded-3xl w-full max-w-sm sm:max-w-none sm:w-auto hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 shadow-2xl">
              <div className="bg-gradient-to-br from-teal-400 to-[#0f766e] p-4 rounded-full shadow-lg border border-white/20">
                <BookOpen className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">100K+</h3>
                <p className="text-xs md:text-sm font-semibold text-blue-100 uppercase tracking-widest mt-0.5">Contents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Curved Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120 C300,0 900,0 1200,120 L1200,120 L0,120 Z" className="fill-slate-50 dark:fill-[#0f172a]"></path>
          </svg>
        </div>
      </section>

      {/* Exams by Category */}
      <section className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">Exams</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Prepare for your exam</h2>
          <div className="w-16 h-1 bg-[#d4af37] rounded-full mx-auto mt-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4 max-w-2xl mx-auto">Choose your exam to find its mock tests, courses, question bank and books.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {examCategories.map((exam, idx) => (
            <Link key={idx} href={exam.href} className="group">
              <Card className="h-full rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#d4af37]/60 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-400/10 border border-amber-100 dark:border-amber-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {exam.icon}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{exam.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{exam.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#00a651] group-hover:gap-2 transition-all">Explore <ArrowRight className="w-4 h-4" /></span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 bg-white dark:bg-transparent border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Start in three simple steps</h2>
            <div className="w-16 h-1 bg-[#d4af37] rounded-full mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {howItWorks.map((item, idx) => (
              <Card key={idx} className="relative rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d4af37] to-[#00a651]"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0b3b39] to-[#0f766e] flex items-center justify-center shadow-md">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-amber-200 dark:text-amber-400/40">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{item.desc}</p>
                  <Link href={item.href} className="inline-flex items-center gap-1 text-sm font-semibold text-[#00a651] hover:gap-2 transition-all">{item.cta} <ArrowRight className="w-4 h-4" /></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Features */}
      <section className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">DeshExam</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Smart Features</h2>
          <div className="w-16 h-1 bg-[#d4af37] rounded-full mx-auto mt-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4 max-w-2xl mx-auto">Everything you need for exam preparation, in one app.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {smartFeatures.map((feature, idx) => (
            <Link key={idx} href={feature.href} className="group">
              <Card className="relative h-full overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#d4af37]/60 transition-all duration-300">
                {feature.badge && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                    {feature.badge}
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl shrink-0 shadow-sm border border-slate-100 dark:border-slate-700 w-max mb-3 group-hover:bg-amber-50 dark:group-hover:bg-amber-400/10 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Learning Path */}
      <section className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#042f2e] via-[#0b3b39] to-[#042f2e] px-6 py-10 md:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.22),transparent_70%)] pointer-events-none"></div>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#d4af37]/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-amber-300 border border-amber-300/40 bg-white/5 rounded-full px-4 py-1.5 mb-4">
                <Brain className="w-4 h-4" /> AI Learning Path
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">A study plan made for you</h2>
              <p className="text-teal-100/90 text-sm md:text-base mb-6">Get a personalised study plan based on your performance, with in-depth articles and tutorials that build a strong foundation for your exam.</p>
              <ul className="space-y-3 mb-8">
                {["Personalised study plan for your exam", "Performance analytics after every test", "In-depth articles and tutorials"].map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white">
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37] shrink-0" /> {point}
                  </li>
                ))}
              </ul>
              <Link href="/learn" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-[#d4af37] px-8 py-3.5 text-sm font-bold text-[#042f2e] shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all min-h-[48px]">Start Learning <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/10 backdrop-blur border border-amber-200/25 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-[#d4af37] flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5 text-[#042f2e]" /></div>
                  <h3 className="font-bold text-white">Personalised plan</h3>
                </div>
                <p className="text-sm text-teal-100/80">Your plan adapts to how you perform in mock tests and quizzes.</p>
              </div>
              <div className="bg-white/10 backdrop-blur border border-amber-200/25 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-[#0f766e] flex items-center justify-center shrink-0"><Activity className="w-5 h-5 text-white" /></div>
                  <h3 className="font-bold text-white">Performance analytics</h3>
                </div>
                <p className="text-sm text-teal-100/80">See your strengths and weak areas after every test.</p>
              </div>
              <div className="bg-white/10 backdrop-blur border border-amber-200/25 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-[#00a651] flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-white" /></div>
                  <h3 className="font-bold text-white">Articles and tutorials</h3>
                </div>
                <p className="text-sm text-teal-100/80">Learn concepts with curated articles and tutorials.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mock Tests & Quizzes */}
      <section className="py-12 md:py-16 bg-white dark:bg-transparent border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">Mock Tests</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-8 h-8 text-[#d4af37]" /> Mock Tests &amp; Quizzes
              </h2>
              <div className="w-16 h-1 bg-[#d4af37] rounded-full mt-4"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4">Assess your preparation with realistic model tests</p>
            </div>
            <div className="flex flex-wrap gap-2">
               <Link href="/mock-tests"><Badge className="bg-[#00a651] hover:bg-green-700 text-white border-none cursor-pointer px-4 py-1.5 text-xs">All Exams</Badge></Link>
               <Link href="/mock-tests"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-slate-800 text-[#00a651] border-none hover:bg-green-100 cursor-pointer px-4 py-1.5 text-xs">BCS</Badge></Link>
               <Link href="/mock-tests"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-slate-800 text-[#00a651] border-none hover:bg-green-100 cursor-pointer px-4 py-1.5 text-xs">Admission</Badge></Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTestsData.map((test, idx) => (
              <Card key={idx} className="group overflow-hidden rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 relative shadow-sm">
                <div className="absolute top-3 right-3 z-10">
                   <Badge className={`${test.difficulty === 'Hard' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-[10px] border-none px-2 shadow-md`}>
                     {test.difficulty}
                   </Badge>
                </div>
                <div className="relative h-40 w-full overflow-hidden">
                  <Image src={test.image} alt={test.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white text-[10px] px-2">{test.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-3 min-h-[2.75rem] leading-snug">{test.title}</h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                      <FileQuestion className="w-4 h-4 text-blue-500" /> {test.questions} Qs
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                      <Timer className="w-4 h-4 text-orange-500" /> {test.time}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#00a651]" /> {test.enrolled} enrolled</p>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-xl text-[#00a651]">{test.price}</span>
                    <Link href="/mock-tests" className="inline-flex items-center justify-center bg-[#00a651] hover:bg-green-700 shadow-md hover:shadow-lg transition-all text-xs font-semibold text-white h-10 px-5 rounded-full min-h-[40px]">Enroll Now</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
               <Link href="/mock-tests" className="inline-flex items-center justify-center border border-[#00a651] text-[#00a651] hover:bg-[#00a651] hover:text-white rounded-full px-8 py-3 h-auto min-h-[48px] text-sm font-semibold transition-colors">View All Tests</Link>
          </div>
        </div>
      </section>

      {/* Trending Courses */}
      <section className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">Courses</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Trending Courses</h2>
            <div className="w-16 h-1 bg-[#d4af37] rounded-full mt-4"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4">Explore our most popular courses</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/course"><Badge className="bg-[#00a651] hover:bg-green-700 text-white border-none cursor-pointer px-3 py-1.5">All</Badge></Link>
            <Link href="/course"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">SSC</Badge></Link>
            <Link href="/course"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">HSC / Alim</Badge></Link>
            <Link href="/course"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">Admission</Badge></Link>
            <Link href="/course"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">Job Preparation</Badge></Link>
            <Link href="/course"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">Medical</Badge></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCourses.map((course, idx) => (
            <Card key={idx} className="group overflow-hidden rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 relative shadow-sm">
              <div className="relative h-40 w-full overflow-hidden">
                <Image src={course.image} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Badge className="absolute top-3 right-3 bg-[#d4af37] hover:bg-amber-400 text-[#042f2e] border-none text-[10px] font-bold px-2 shadow-md">Best Seller</Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-3 min-h-[2.75rem] leading-snug">{course.title}</h3>

                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{course.rating} <span className="text-slate-400 text-xs font-normal">({course.reviews})</span></span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-[#00a651]" /> {course.students}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> By {course.instructor}
                </p>

                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-lg text-[#00a651]">{course.price}</span>
                  <Link href="/course" className="inline-flex items-center justify-center text-xs font-semibold h-10 px-5 border border-[#00a651] text-[#00a651] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors min-h-[40px]">Details</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
             <Link href="/course" className="inline-flex items-center justify-center bg-[#00a651] hover:bg-green-700 rounded-full px-8 py-3 h-auto min-h-[48px] text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all">Explore All Courses</Link>
        </div>
      </section>

      {/* Kids Zone */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-amber-50/70 via-white to-white dark:from-slate-900 dark:via-transparent dark:to-transparent border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-400/30 bg-white dark:bg-slate-800 rounded-full px-4 py-1.5 mb-4">
                <Baby className="w-4 h-4" /> Kids Zone
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">Learning is fun for kids</h2>
              <div className="w-16 h-1 bg-[#d4af37] rounded-full mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-6">A safe and exciting world of interactive games, fun quizzes and engaging activities that make learning languages and math an adventure for children.</p>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 text-slate-700 dark:text-slate-300"><Languages className="w-3.5 h-3.5 text-[#00a651]" /> 5 languages</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 text-slate-700 dark:text-slate-300"><PlayCircle className="w-3.5 h-3.5 text-red-500" /> Learning games</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 text-slate-700 dark:text-slate-300"><FileQuestion className="w-3.5 h-3.5 text-blue-500" /> Fun quizzes</span>
              </div>
              <Link href="/kids-zone" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-[#d4af37] px-8 py-3.5 text-sm font-bold text-[#042f2e] shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all min-h-[48px]">Enter Kids Zone <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {kidsLanguages.map((lang, idx) => (
                <Link key={idx} href={lang.href} className="group">
                  <Card className="h-full rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#d4af37]/60 transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-400/10 border border-amber-100 dark:border-amber-400/20 flex items-center justify-center mb-3">
                        <Languages className="w-5 h-5 text-[#d4af37]" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{lang.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{lang.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Package Price</h2>
          <div className="w-16 h-1 bg-[#d4af37] rounded-full mx-auto mt-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4 max-w-2xl mx-auto">Choose the package that fits your preparation. Upgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className={`relative rounded-3xl overflow-hidden flex flex-col ${plan.popular ? "border-2 border-[#d4af37] bg-white dark:bg-slate-800 shadow-2xl shadow-amber-500/10 md:-translate-y-2" : "border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"} hover:shadow-xl transition-all duration-300`}>
              {plan.popular && (
                <div className="bg-gradient-to-r from-amber-400 to-[#d4af37] text-[#042f2e] text-xs font-extrabold tracking-widest uppercase text-center py-2.5 flex items-center justify-center gap-1.5">
                  <Crown className="w-4 h-4" /> Most Popular
                </div>
              )}
              <CardContent className="p-6 md:p-8 flex flex-col flex-1">
                <h3 className="font-extrabold text-lg tracking-wide text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{plan.tagline}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="line-through text-red-500 text-lg">{plan.oldPrice}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-[#00a651] shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold min-h-[48px] transition-all ${plan.popular ? "bg-gradient-to-r from-amber-400 to-[#d4af37] text-[#042f2e] shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5" : "bg-[#00a651] hover:bg-green-700 text-white shadow-md hover:shadow-lg"}`}>Purchase</Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Looking for the full plans and Pass Pro? See all plans on the <Link href="/pricing" className="font-semibold text-[#00a651] hover:underline">Pricing page</Link>.
        </p>
      </section>

      {/* Book Collection */}
      <section className="py-12 md:py-16 bg-white dark:bg-transparent border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">Library</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <BookMarked className="w-8 h-8 text-[#d4af37]" /> Book Collection
              </h2>
              <div className="w-16 h-1 bg-[#d4af37] rounded-full mt-4"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4">Collect your necessary exam preparation books</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/book"><Badge className="bg-[#00a651] hover:bg-green-700 text-white border-none cursor-pointer px-3 py-1.5">All</Badge></Link>
              <Link href="/book"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">SSC</Badge></Link>
              <Link href="/book"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">HSC / Alim</Badge></Link>
              <Link href="/book"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">Admission</Badge></Link>
              <Link href="/book"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">Job Preparation</Badge></Link>
              <Link href="/book"><Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer px-3 py-1.5">Medical</Badge></Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookCollection.map((book, idx) => (
              <Card key={idx} className="group overflow-hidden rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 relative shadow-sm">
                <div className="relative h-60 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-6 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[#00a651]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-full h-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-md overflow-hidden group-hover:scale-105 transition-transform duration-500">
                     <Image src={book.image} alt={book.title} fill className="object-cover" />
                  </div>
                </div>
                <CardContent className="p-5 bg-white dark:bg-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-3 min-h-[2.75rem] leading-snug">{book.title}</h3>

                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{book.rating} <span className="text-slate-400 text-xs font-normal">({book.reviews})</span></span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#00a651]" /> {book.author}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="line-through text-slate-400 text-[10px] decoration-red-500">{book.oldPrice}</span>
                      <span className="font-extrabold text-[#00a651] text-lg leading-none">{book.price}</span>
                    </div>
                    <Link href="/book" className="inline-flex items-center justify-center text-xs font-semibold h-10 px-5 border border-[#00a651] text-[#00a651] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors min-h-[40px]">Details</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
             <Link href="/book" className="inline-flex items-center justify-center border border-[#00a651] text-[#00a651] hover:bg-[#00a651] hover:text-white rounded-full px-8 py-3 h-auto min-h-[48px] text-sm font-semibold transition-colors">Explore Library</Link>
          </div>
        </div>
      </section>

      {/* Community & Leaderboard */}
      <section className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">Community</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Learn together, grow together</h2>
          <div className="w-16 h-1 bg-[#d4af37] rounded-full mx-auto mt-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4 max-w-2xl mx-auto">Ask questions, help others and earn points on the leaderboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 md:p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] dark:bg-[#00a651]/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-[#00a651]" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">Community Q&amp;A</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Stuck on a question? Ask the community, get answers from students and teachers, and help others by answering their questions.</p>
              <Link href="/questions" className="inline-flex items-center gap-1 text-sm font-semibold text-[#00a651] hover:gap-2 transition-all">Ask a question <ArrowRight className="w-4 h-4" /></Link>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 md:p-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-[#d4af37]" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">Leaderboard</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Earn points for questions and answers, climb the leaderboard and see how you rank against other students.</p>
              <Link href="/leaderboard" className="inline-flex items-center gap-1 text-sm font-semibold text-[#00a651] hover:gap-2 transition-all">View leaderboard <ArrowRight className="w-4 h-4" /></Link>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#d4af37]" /> Top Contributors
          </h3>
          <Link href="/leaderboard" className="text-[#00a651] text-sm font-semibold hover:underline inline-flex items-center gap-1">
            See full leaderboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topContributors.map((user, idx) => (
            <Card key={idx} className="overflow-hidden rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6 text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image src={user.image} alt={user.name} fill className="object-cover rounded-full border-2 border-[#00a651] shadow-sm p-1 dark:border-teal-500" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{user.name}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">{user.role}</p>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-left mb-4 bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                  <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-slate-400">Questions</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user.questions}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 items-center border-l border-slate-200 dark:border-slate-700">
                     <span className="text-slate-400">Answers</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user.answers}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] py-1.5 px-3 rounded-full text-xs font-semibold mx-auto w-max">
                   <Star className="w-3 h-3 fill-current" /> {user.points} Points
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-white dark:bg-transparent border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Frequently asked questions</h2>
            <div className="w-16 h-1 bg-[#d4af37] rounded-full mx-auto mt-4"></div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm open:shadow-md transition-shadow">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 min-h-[56px]">
                  <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{faq.q}</span>
                  <span className="text-[#d4af37] font-extrabold text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Still have a question? Visit the <Link href="/faqs" className="font-semibold text-[#00a651] hover:underline">FAQ page</Link>.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#042f2e] via-[#0b3b39] to-[#042f2e] px-6 py-12 md:p-14 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.25),transparent_70%)] pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#2dd4bf]/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">Ready to start your preparation?</h2>
            <p className="text-amber-200/90 text-sm md:text-base max-w-2xl mx-auto mb-8">Join 6M+ students preparing for SSC, HSC, BCS, Admission and job exams with DeshExam.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/mock-tests" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-[#d4af37] px-8 py-3.5 text-sm font-bold text-[#042f2e] shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all min-h-[48px]">Take a Free Mock Test</Link>
              <Link href="/pricing" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-amber-300/40 bg-white/5 backdrop-blur px-8 py-3.5 text-sm font-bold text-amber-100 hover:bg-white/10 transition-all min-h-[48px]">View Premium Plans</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explicit Legal Links for Google Cloud Verification */}
      <div className="container mx-auto px-4 max-w-6xl py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
        <Link href="/privacy" className="hover:underline mx-2">Privacy Policy</Link>
        <span>|</span>
        <Link href="/terms" className="hover:underline mx-2">Terms of Service</Link>
      </div>
    </div>
  );
}
