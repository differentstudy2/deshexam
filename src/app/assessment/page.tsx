import React from 'react';
import { getAssessments } from '@/lib/firebase/assessment';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { PracticeSet, Quiz, MockTest, ExamPaper } from '@/lib/assessment-types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Target, BookOpen, Trophy, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Assessment Center | Practice, Quizzes, Mock Tests | DeshExam',
  description: 'Boost your exam preparation with our comprehensive Assessment Center. Access thousands of verified practice sets, interactive quizzes, full-length mock tests, and official previous year papers.',
  keywords: ['exam preparation', 'mock tests', 'practice questions', 'previous year papers', 'online quizzes', 'DeshExam', 'competitive exams', 'assessment center', 'test series'],
  openGraph: {
    title: 'Assessment Center | Master Your Exams | DeshExam',
    description: 'Boost your exam preparation with our comprehensive Assessment Center. Access thousands of verified practice sets, interactive quizzes, full-length mock tests, and official previous year papers.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assessment`,
    siteName: 'DeshExam',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-assessment.png`,
        width: 1200,
        height: 630,
        alt: 'DeshExam Assessment Center',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assessment Center | Master Your Exams | DeshExam',
    description: 'Access thousands of verified practice sets, interactive quizzes, full-length mock tests, and official previous year papers.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-assessment.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assessment`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function AssessmentHubPage() {
  // Fetch a preview of all assessment types (in production, we'd limit this or use a specific "featured" query)
  // Since getAssessments returns all, we just slice the first 4-8.
  const practiceSets = await getAssessments('practiceSets') as PracticeSet[];
  const quizzes = await getAssessments('quizzes') as Quiz[];
  const mockTests = await getAssessments('mockTests') as MockTest[];
  const examPapers = await getAssessments('examPapers') as ExamPaper[];

  const publishedPracticeSets = practiceSets.filter(a => a.status === 'Published').slice(0, 4);
  const publishedQuizzes = quizzes.filter(a => a.status === 'Published').slice(0, 4);
  const publishedMockTests = mockTests.filter(a => a.status === 'Published').slice(0, 4);
  const publishedExams = examPapers.filter(a => a.status === 'Published').slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#00a651] mix-blend-multiply opacity-20"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00a651] rounded-full blur-3xl opacity-30"></div>
        
        <div className="container max-w-6xl mx-auto relative z-10 text-center space-y-8">
          <Badge className="bg-[#00a651]/20 text-[#00a651] hover:bg-[#00a651]/30 border-0 px-4 py-1.5 text-sm mb-4">
            New & Improved Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Master Your Exams with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#00a651]">
              DeshExam Assessments
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Access thousands of verified practice sets, interactive quizzes, full-length mock tests, and official previous year papers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="bg-[#00a651] hover:bg-[#009045] text-white px-8 rounded-full h-14 text-lg w-full sm:w-auto" asChild>
              <Link href="/practice">Start Practicing</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-0 px-8 rounded-full h-14 text-lg w-full sm:w-auto backdrop-blur-md" asChild>
              <Link href="/mock-tests">Take a Mock Test</Link>
            </Button>
          </div>

          {/* Search Bar Preview */}
          <div className="max-w-2xl mx-auto mt-12 bg-white rounded-full p-2 flex items-center shadow-2xl shadow-black/20">
            <Search className="w-6 h-6 text-slate-400 ml-4" />
            <input 
              type="text" 
              placeholder="Search for subjects, chapters, or exams..." 
              className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-900 px-4 text-lg"
              disabled // Just a visual element for now, or you can make it interactive
            />
            <Button className="bg-slate-900 hover:bg-slate-800 rounded-full px-8 h-12">Search</Button>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 py-16 space-y-24">
        
        {/* Practice Sets Row */}
        {publishedPracticeSets.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Target className="w-8 h-8 text-[#00a651]" /> Featured Practice Sets
                </h2>
                <p className="text-slate-500 mt-2 text-lg">Topic-wise casual practice to build your foundation.</p>
              </div>
              <Button variant="ghost" className="text-[#00a651] hover:text-[#009045] hover:bg-green-50 hidden sm:flex" asChild>
                <Link href="/practice">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {publishedPracticeSets.map(p => (
                <AssessmentCard key={p.id} assessment={p} type="Practice" href={`/practice/${p.slug || p.id}`} />
              ))}
            </div>
          </section>
        )}

        {/* Quizzes Row */}
        {publishedQuizzes.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Trophy className="w-8 h-8 text-purple-500" /> Interactive Quizzes
                </h2>
                <p className="text-slate-500 mt-2 text-lg">Timed challenges to test your speed and accuracy.</p>
              </div>
              <Button variant="ghost" className="text-purple-600 hover:bg-purple-50 hidden sm:flex" asChild>
                <Link href="/quiz">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {publishedQuizzes.map(q => (
                <AssessmentCard key={q.id} assessment={q} type="Quiz" href={`/quiz/${q.slug}`} />
              ))}
            </div>
          </section>
        )}

        {/* Mock Tests Row */}
        {publishedMockTests.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-blue-500" /> Full-Length Mock Tests
                </h2>
                <p className="text-slate-500 mt-2 text-lg">Simulate real exam environments with negative marking.</p>
              </div>
              <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 hidden sm:flex" asChild>
                <Link href="/mock-tests">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {publishedMockTests.map(m => (
                <AssessmentCard key={m.id} assessment={m} type="Mock Test" href={`/mock-tests/${m.slug}`} />
              ))}
            </div>
          </section>
        )}

        {/* Exam Papers Row */}
        {publishedExams.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <BookOpen className="w-8 h-8 text-orange-500" /> Previous Year Papers
                </h2>
                <p className="text-slate-500 mt-2 text-lg">Official past papers verified by our expert team.</p>
              </div>
              <Button variant="ghost" className="text-orange-600 hover:bg-orange-50 hidden sm:flex" asChild>
                <Link href="/exams">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {publishedExams.map(e => (
                <AssessmentCard key={e.id} assessment={e} type="Exam" href={`/exams/${e.slug}`} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={cn("inline-block font-semibold rounded-full", className)}>{children}</span>;
}
