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
  ClipboardList
} from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "DeshExam | One Stop Learning Platform",
  description: "Premium educational platform offering mock tests, trending courses, and book collections.",
};

const smartFeatures = [
  { icon: <MonitorPlay className="w-6 h-6 text-[#00a651]" />, title: "লাইভ ক্লাস (Live Class)" },
  { icon: <FileText className="w-6 h-6 text-red-600" />, title: "স্মার্ট পিডিএফ (Smart PDF)" },
  { icon: <ClipboardList className="w-6 h-6 text-[#00a651]" />, title: "মডেল টেস্ট (Model Test)" },
  { icon: <FileQuestion className="w-6 h-6 text-blue-500" />, title: "প্রশ্নব্যাংক (Question Bank)", badge: "New" },
  { icon: <BookOpen className="w-6 h-6 text-purple-600" />, title: "বই ও লেকচার (Books & Lectures)" },
  { icon: <CheckCircle2 className="w-6 h-6 text-[#00a651]" />, title: "সমাধান (Solution)" },
  { icon: <PlayCircle className="w-6 h-6 text-red-500" />, title: "ভিডিও (Video)" },
  { icon: <FileText className="w-6 h-6 text-red-700" />, title: "ম্যাগাজিন (Magazine)" },
  { icon: <HelpCircle className="w-6 h-6 text-blue-600" />, title: "সাজেশন (Suggestion)", badge: "New" },
  { icon: <GraduationCap className="w-6 h-6 text-blue-700" />, title: "কোর্স (Course)" },
  { icon: <Users className="w-6 h-6 text-red-500" />, title: "শিক্ষক (Teachers)" },
  { icon: <HelpCircle className="w-6 h-6 text-cyan-600" />, title: "FAQs" },
  { icon: <ClipboardList className="w-6 h-6 text-[#00a651]" />, title: "স্টাডি প্ল্যান (Study Plan)" },
  { icon: <CheckCircle2 className="w-6 h-6 text-[#00a651]" />, title: "সফলতা (Success)" },
  { icon: <FileText className="w-6 h-6 text-blue-600" />, title: "নোটিশ (Notice)" },
];

const trendingCourses = [
  {
    title: "Basic Accounting Course",
    instructor: "Md. Hasan Mahmud",
    rating: 4.8,
    reviews: 120,
    students: "12,000+",
    price: "₹ 1000",
    image: "https://picsum.photos/seed/course1/400/250"
  },
  {
    title: "English Grammar Mastery",
    instructor: "Sarah Rahman",
    rating: 4.9,
    reviews: 250,
    students: "15,000+",
    price: "₹ 1500",
    image: "https://picsum.photos/seed/course2/400/250"
  },
  {
    title: "Advanced Mathematics",
    instructor: "Dr. Ahmed",
    rating: 4.7,
    reviews: 80,
    students: "8,000+",
    price: "₹ 2000",
    image: "https://picsum.photos/seed/course3/400/250"
  },
  {
    title: "Physics for HSC",
    instructor: "Prof. Kabir",
    rating: 4.6,
    reviews: 95,
    students: "10,000+",
    price: "₹ 1200",
    image: "https://picsum.photos/seed/course4/400/250"
  }
];

const bookCollection = [
  {
    title: "বিগত বছরের প্রশ্ন সমাধান (SSC)",
    author: "DeshExam",
    rating: 4.5,
    reviews: 45,
    price: "₹ 150",
    oldPrice: "₹ 200",
    image: "https://picsum.photos/seed/book1/300/400"
  },
  {
    title: "মডেল টেস্ট পেপারস (HSC)",
    author: "DeshExam",
    rating: 4.8,
    reviews: 112,
    price: "₹ 250",
    oldPrice: "₹ 300",
    image: "https://picsum.photos/seed/book2/300/400"
  },
  {
    title: "Admission Guide - English",
    author: "DeshExam",
    rating: 4.9,
    reviews: 300,
    price: "₹ 350",
    oldPrice: "₹ 400",
    image: "https://picsum.photos/seed/book3/300/400"
  },
  {
    title: "Admission Guide - Physics",
    author: "DeshExam",
    rating: 4.7,
    reviews: 150,
    price: "₹ 300",
    oldPrice: "₹ 350",
    image: "https://picsum.photos/seed/book4/300/400"
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
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative w-full bg-[#0f172a] pt-24 pb-32 overflow-hidden">
        {/* Abstract Clouds/Shapes in background (simulated with absolute divs) */}
        <div className="absolute top-10 left-10 w-32 h-16 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute top-20 right-20 w-40 h-20 bg-white/5 rounded-full blur-xl"></div>
        
        <div className="container relative z-10 px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">DeshExam</h1>
          <p className="text-lg md:text-xl text-[#00a651] mb-12">One Stop Learning Platform</p>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-blue-600 p-3 rounded-full">
                <FileQuestion className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-xl md:text-2xl font-bold">2M+</h3>
                <p className="text-sm text-gray-300">Questions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <div className="bg-blue-500 p-3 rounded-full">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-xl md:text-2xl font-bold">6M+</h3>
                <p className="text-sm text-gray-300">Students</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <div className="bg-blue-400 p-3 rounded-full">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-xl md:text-2xl font-bold">100K+</h3>
                <p className="text-sm text-gray-300">Contents</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120 C300,0 900,0 1200,120 L1200,120 L0,120 Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* Smart Features */}
      <section className="py-12 md:py-20 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#00a651] inline-block border-b-2 border-[#00a651] pb-2">স্মার্ট ফিচারস</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {smartFeatures.map((feature, idx) => (
            <Card key={idx} className="relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              {feature.badge && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                  {feature.badge}
                </div>
              )}
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-lg shrink-0 shadow-sm border border-gray-100">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">{feature.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Package Price */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#00a651] mb-6">Package Price</h2>
            <Tabs defaultValue="monthly" className="w-[200px] mx-auto">
              <TabsList className="grid w-full grid-cols-2 rounded-full border border-gray-200 p-1 bg-white h-auto">
                <TabsTrigger value="monthly" className="rounded-full py-2 data-[state=active]:bg-[#00a651] data-[state=active]:text-white">Monthly</TabsTrigger>
                <TabsTrigger value="yearly" className="rounded-full py-2 data-[state=active]:bg-[#00a651] data-[state=active]:text-white">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-[#e8f5e9] text-gray-700 text-center">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Package</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Price</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="text-center font-medium">
                <tr className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4">S-BASIC</td>
                  <td className="px-6 py-4">
                    <span className="line-through text-red-500 mr-2">100₹</span>
                    <span className="text-gray-900">50₹</span>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" className="bg-[#00a651] hover:bg-green-700">Purchase</Button>
                  </td>
                </tr>
                <tr className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4">S-PLUS</td>
                  <td className="px-6 py-4">
                    <span className="line-through text-red-500 mr-2">250₹</span>
                    <span className="text-gray-900">100₹</span>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" className="bg-[#00a651] hover:bg-green-700">Purchase</Button>
                  </td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-4">S-PRO</td>
                  <td className="px-6 py-4">
                    <span className="line-through text-red-500 mr-2">400₹</span>
                    <span className="text-gray-900">200₹</span>
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

      {/* Trending Courses */}
      <section className="py-12 md:py-20 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#00a651]">ট্রেন্ডিং কোর্স</h2>
            <p className="text-gray-500 text-sm mt-1">সবচেয়ে জনপ্রিয় কোর্সগুলো ঘুরে দেখুন</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-[#00a651] text-white border-none hover:bg-[#00a651] cursor-pointer">All</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">SSC</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">HSC / Alim</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">Admission</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">Job Preparation</Badge>
            <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">Medical</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCourses.map((course, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-md">
              <div className="relative h-40 w-full">
                <Image src={course.image} alt={course.title} fill className="object-cover" />
                <Badge className="absolute top-2 right-2 bg-pink-500 hover:bg-pink-600 border-none text-[10px]">Popular</Badge>
              </div>
              <CardContent className="p-4 bg-white">
                <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem] leading-tight text-sm">{course.title}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(course.rating) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500">({course.reviews})</span>
                </div>
                <div className="text-[11px] text-gray-500 mb-1 flex items-center gap-1 border-b border-gray-100 pb-2">
                  <Users className="w-3 h-3 text-[#00a651]" /> {course.students} Students
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-[#00a651] text-sm">{course.price}</span>
                  <Button size="sm" variant="outline" className="text-[10px] h-7 px-2 border-[#00a651] text-[#00a651] hover:bg-green-50 rounded-full">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
         <div className="text-center mt-8">
             <Button className="bg-[#00a651] hover:bg-green-700">View All Courses</Button>
          </div>
      </section>

      {/* Book Collection */}
      <section className="py-12 md:py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#00a651]">বই কালেকশন</h2>
              <p className="text-gray-500 text-sm mt-1">আপনার প্রয়োজনীয় বইগুলো সংগ্রহ করুন</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-[#00a651] text-white border-none hover:bg-[#00a651] cursor-pointer">All</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">SSC</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">HSC / Alim</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">Admission</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">Job Preparation</Badge>
              <Badge variant="outline" className="bg-[#e8f5e9] text-[#00a651] border-none hover:bg-green-200 cursor-pointer">Medical</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookCollection.map((book, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-md">
                <div className="relative h-60 w-full bg-gray-50 p-4 flex items-center justify-center">
                  <div className="relative w-full h-full shadow-lg rounded-sm overflow-hidden">
                     <Image src={book.image} alt={book.title} fill className="object-cover" />
                  </div>
                </div>
                <CardContent className="p-4 bg-white">
                  <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem] leading-tight text-sm">{book.title}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(book.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">({book.reviews})</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3 border-b border-gray-100 pb-2 flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#00a651]" /> {book.author}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-col">
                      <span className="line-through text-red-500 text-[10px]">{book.oldPrice}</span>
                      <span className="font-bold text-[#00a651] text-sm">{book.price}</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2 border-[#00a651] text-[#00a651] hover:bg-green-50 rounded-full">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
             <Button className="bg-[#00a651] hover:bg-green-700">View All Books</Button>
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="py-12 md:py-20 container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-semibold text-sm">📅 May 30, 2024</span>
          </div>
          <Link href="#" className="text-blue-500 text-sm font-medium hover:underline flex items-center gap-1">
            Top Contributors <span className="text-xs">↗</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topContributors.map((user, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image src={user.image} alt={user.name} fill className="object-cover rounded-full border-2 border-[#00a651] shadow-sm p-1" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm truncate">{user.name}</h3>
                <p className="text-[10px] text-gray-500 mb-4">{user.role}</p>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] text-left mb-4 bg-gray-50 p-2 rounded-md">
                  <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-gray-400">Questions</span>
                    <span className="font-semibold text-gray-700">{user.questions}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 items-center border-l border-gray-200">
                     <span className="text-gray-400">Answers</span>
                    <span className="font-semibold text-gray-700">{user.answers}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-1.5 bg-[#e8f5e9] text-[#00a651] py-1.5 px-3 rounded-full text-xs font-semibold mx-auto w-max">
                   <Star className="w-3 h-3 fill-current" /> {user.points} Points
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
