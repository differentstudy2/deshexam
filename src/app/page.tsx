import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BookMarked
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
    url: "https://deshexam.com",
    siteName: "DeshExam",
    images: [
      {
        url: "https://deshexam.com/image/logo.png",
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
    images: ["https://deshexam.com/image/logo.png"],
  },
};

const smartFeatures = [
  { icon: <MonitorPlay className="w-6 h-6 text-[#00a651]" />, title: "Live Class" },
  { icon: <FileText className="w-6 h-6 text-red-600" />, title: "Smart PDF" },
  { icon: <ClipboardList className="w-6 h-6 text-[#00a651]" />, title: "Model Test" },
  { icon: <FileQuestion className="w-6 h-6 text-blue-500" />, title: "Question Bank", badge: "New" },
  { icon: <BookOpen className="w-6 h-6 text-purple-600" />, title: "Books & Lectures" },
  { icon: <CheckCircle2 className="w-6 h-6 text-[#00a651]" />, title: "Solution" },
  { icon: <PlayCircle className="w-6 h-6 text-red-500" />, title: "Video" },
  { icon: <FileText className="w-6 h-6 text-red-700" />, title: "Magazine" },
  { icon: <HelpCircle className="w-6 h-6 text-blue-600" />, title: "Suggestion", badge: "New" },
  { icon: <GraduationCap className="w-6 h-6 text-blue-700" />, title: "Course" },
  { icon: <Users className="w-6 h-6 text-red-500" />, title: "Teachers" },
  { icon: <HelpCircle className="w-6 h-6 text-cyan-600" />, title: "FAQs" },
  { icon: <ClipboardList className="w-6 h-6 text-[#00a651]" />, title: "Study Plan" },
  { icon: <CheckCircle2 className="w-6 h-6 text-[#00a651]" />, title: "Success" },
  { icon: <FileText className="w-6 h-6 text-blue-600" />, title: "Notice" },
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
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&q=80"
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

export default function Home() {
  const schemas = [
    getSearchActionSchema(),
    getOrganizationSchema(),
    getFAQSchema([
      { q: "What is DeshExam?", a: "DeshExam is the ultimate online educational platform featuring 2M+ questions, live classes, model tests, and study materials for HSC, SSC, Admission, and Job preparations in Bangladesh." },
      { q: "Are there mock tests available?", a: "Yes, DeshExam offers extensive mock tests and a massive question bank to help you prepare effectively." },
      { q: "Is DeshExam suitable for Job Preparation?", a: "Absolutely! DeshExam provides comprehensive materials, questions, and model tests specifically designed for BCS, Primary, Bank, and other Govt. Job exams." }
    ])
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      {/* Hero Section */}
      <section className="relative w-full bg-[#0f172a] pt-24 pb-32 overflow-hidden">
        {/* Animated Indian Flag Wave Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#FF9933]/15 via-white/5 to-[#12D000]/15 bg-[length:200%_200%] animate-gradient-x"></div>
        
        {/* Floating Tricolor Clouds/Shapes for Wave Effect */}
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#FF9933]/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-white/5 rounded-[100%] blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-[#12D000]/20 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
        
        <div className="container relative z-10 px-4 mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase mb-4 flex justify-center items-center">
            <span className="drop-shadow-lg">
                <span className="text-[#FF9933]">DESH</span> <span className="text-[rgb(18,208,0)]">EXAM</span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#00a651] mb-12">The Largest Online Learning Platform in India</p>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-12 relative z-10">
            <div className="flex items-center gap-4 text-white bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-4 rounded-3xl hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 shadow-2xl">
              <div className="bg-gradient-to-br from-green-400 to-[#00a651] p-4 rounded-full shadow-lg border border-white/20">
                <FileQuestion className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200">2M+</h3>
                <p className="text-xs md:text-sm font-semibold text-blue-100 uppercase tracking-widest mt-0.5">Questions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-white bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-4 rounded-3xl hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 shadow-2xl">
              <div className="bg-gradient-to-br from-[#FF9933] to-orange-500 p-4 rounded-full shadow-lg border border-white/20">
                <Users className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-100">6M+</h3>
                <p className="text-xs md:text-sm font-semibold text-blue-100 uppercase tracking-widest mt-0.5">Students</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-white bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-4 rounded-3xl hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 shadow-2xl">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-full shadow-lg border border-white/20">
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

      {/* Smart Features */}
      <section className="py-12 md:py-20 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#00a651] inline-block border-b-2 border-[#00a651] pb-2">Smart Features</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {smartFeatures.map((feature, idx) => (
            <Card key={idx} className="relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
              {feature.badge && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                  {feature.badge}
                </div>
              )}
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-gray-50 dark:bg-slate-900 rounded-lg shrink-0 shadow-sm border border-gray-100 dark:border-slate-700">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base">{feature.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Package Price */}
      <section className="py-12 bg-white dark:bg-transparent border-y border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#00a651] mb-6">Package Price</h2>
            <Tabs defaultValue="monthly" className="w-[200px] mx-auto">
              <TabsList className="grid w-full grid-cols-2 rounded-full border border-gray-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 h-auto">
                <TabsTrigger value="monthly" className="rounded-full py-2 data-[state=active]:bg-[#00a651] data-[state=active]:text-white">Monthly</TabsTrigger>
                <TabsTrigger value="yearly" className="rounded-full py-2 data-[state=active]:bg-[#00a651] data-[state=active]:text-white">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-gray-700 dark:text-gray-200 text-center">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Package</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Price</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody className="text-center font-medium">
                <tr className="border-b dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 dark:text-white">S-BASIC</td>
                  <td className="px-6 py-4">
                    <span className="line-through text-red-500 mr-2">100₹</span>
                    <span className="text-gray-900 dark:text-white">50₹</span>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" className="bg-[#00a651] hover:bg-green-700">Purchase</Button>
                  </td>
                </tr>
                <tr className="border-b dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 dark:text-white">S-PLUS</td>
                  <td className="px-6 py-4">
                    <span className="line-through text-red-500 mr-2">250₹</span>
                    <span className="text-gray-900 dark:text-white">100₹</span>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" className="bg-[#00a651] hover:bg-green-700">Purchase</Button>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 dark:text-white">S-PRO</td>
                  <td className="px-6 py-4">
                    <span className="line-through text-red-500 mr-2">400₹</span>
                    <span className="text-gray-900 dark:text-white">200₹</span>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" className="bg-[#00a651] hover:bg-green-700">Purchase</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center mt-6">
             <Button variant="outline" className="text-[#00a651] border-[#00a651] hover:bg-green-50">View Package Plan</Button>
          </div>
        </div>
      </section>

      {/* Mock Tests & Quizzes */}
      <section className="py-12 md:py-20 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#00a651] flex items-center gap-2">
              <Target className="w-8 h-8" /> Mock Tests & Quizzes
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Assess your preparation with realistic model tests</p>
          </div>
          <div className="flex flex-wrap gap-2">
             <Badge variant="outline" className="bg-[#00a651] text-white border-none cursor-pointer px-4 py-1 text-xs">All Exams</Badge>
             <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-slate-800 text-[#00a651] border-none hover:bg-green-100 cursor-pointer px-4 py-1 text-xs">BCS</Badge>
             <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-slate-800 text-[#00a651] border-none hover:bg-green-100 cursor-pointer px-4 py-1 text-xs">Admission</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockTestsData.map((test, idx) => (
            <Card key={idx} className="group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 relative">
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
                <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-3 min-h-[2.75rem] leading-snug">{test.title}</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg">
                    <FileQuestion className="w-4 h-4 text-blue-500" /> {test.questions} Qs
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg">
                    <Timer className="w-4 h-4 text-orange-500" /> {test.time}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-slate-700">
                  <span className="font-bold text-xl text-[#00a651]">{test.price}</span>
                  <Button size="sm" className="bg-[#00a651] hover:bg-green-700 shadow-md hover:shadow-lg transition-all text-xs h-8 px-4 rounded-full">Enroll Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
             <Button variant="outline" className="border-[#00a651] text-[#00a651] hover:bg-[#00a651] hover:text-white rounded-full px-8 py-2 h-auto text-sm font-semibold transition-colors">View All Tests</Button>
        </div>
      </section>

      {/* Trending Courses */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-transparent border-t border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#00a651]">Trending Courses</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Explore our most popular courses</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-[#00a651] text-white border-none hover:bg-[#00a651] cursor-pointer">All</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">SSC</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">HSC / Alim</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">Admission</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">Job Preparation</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">Medical</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCourses.map((course, idx) => (
            <Card key={idx} className="group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 relative">
              <div className="relative h-40 w-full overflow-hidden">
                <Image src={course.image} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Badge className="absolute top-3 right-3 bg-pink-500 hover:bg-pink-600 border-none text-[10px] px-2 shadow-md">Best Seller</Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-3 min-h-[2.75rem] leading-snug">{course.title}</h3>
                
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{course.rating} <span className="text-gray-400 text-xs font-normal">({course.reviews})</span></span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-gray-50 dark:bg-slate-900/50 p-1.5 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-[#00a651]" /> {course.students}
                  </div>
                </div>
                
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> By {course.instructor}
                </p>

                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-lg text-[#00a651]">{course.price}</span>
                  <Button size="sm" variant="outline" className="text-xs h-8 px-4 border-[#00a651] text-[#00a651] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors">Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
             <Button className="bg-[#00a651] hover:bg-green-700 rounded-full px-8 py-2 h-auto text-sm font-semibold shadow-md hover:shadow-lg transition-all">Explore All Courses</Button>
        </div>
        </div>
      </section>

      {/* Book Collection */}
      <section className="py-12 md:py-20 bg-white dark:bg-transparent border-t border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#00a651] flex items-center gap-2">
                <BookMarked className="w-8 h-8" /> Book Collection
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Collect your necessary exam preparation books</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-[#00a651] text-white border-none hover:bg-[#00a651] cursor-pointer">All</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">SSC</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">HSC / Alim</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">Admission</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">Job Preparation</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] dark:bg-[#00a651]/10 text-[#00a651] border-none hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer">Medical</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookCollection.map((book, idx) => (
              <Card key={idx} className="group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 relative">
                <div className="relative h-60 w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 p-6 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[#00a651]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-full h-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-md overflow-hidden group-hover:scale-105 transition-transform duration-500">
                     <Image src={book.image} alt={book.title} fill className="object-cover" />
                  </div>
                </div>
                <CardContent className="p-5 bg-white dark:bg-slate-800">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-3 min-h-[2.75rem] leading-snug">{book.title}</h3>
                  
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{book.rating} <span className="text-gray-400 text-xs font-normal">({book.reviews})</span></span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#00a651]" /> {book.author}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="line-through text-gray-400 text-[10px] decoration-red-500">{book.oldPrice}</span>
                      <span className="font-extrabold text-[#00a651] text-lg leading-none">{book.price}</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-8 px-4 border-[#00a651] text-[#00a651] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors">Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
             <Button variant="outline" className="border-[#00a651] text-[#00a651] hover:bg-[#00a651] hover:text-white rounded-full px-8 py-2 h-auto text-sm font-semibold transition-colors">Explore Library</Button>
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="py-12 md:py-20 container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-sm">📅 May 30, 2024</span>
          </div>
          <Link href="#" className="text-blue-500 text-sm font-medium hover:underline flex items-center gap-1">
            Top Contributors <span className="text-xs">↗</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topContributors.map((user, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-slate-700 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6 text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image src={user.image} alt={user.name} fill className="object-cover rounded-full border-2 border-[#00a651] shadow-sm p-1 dark:border-teal-500" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate">{user.name}</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4">{user.role}</p>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] text-left mb-4 bg-gray-50 dark:bg-slate-900 p-2 rounded-md">
                  <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-gray-400">Questions</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{user.questions}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 items-center border-l border-gray-200 dark:border-slate-700">
                     <span className="text-gray-400">Answers</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{user.answers}</span>
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

      {/* Explicit Legal Links for Google Cloud Verification */}
      <div className="container mx-auto px-4 max-w-6xl py-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800">
        <a href="https://deshexam.com/privacy" className="hover:underline mx-2">Privacy Policy</a>
        <span>|</span>
        <a href="https://deshexam.com/terms" className="hover:underline mx-2">Terms of Service</a>
      </div>
    </div>
  );
}
