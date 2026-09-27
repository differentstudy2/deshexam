'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Award, Sparkles, FileText, Book, Trophy, ArrowRight } from 'lucide-react';

const assessmentTypes = [
  {
    title: "Practice Sets",
    description: "Create casual practice collections mapped directly to your Question Bank.",
    icon: <Award className="w-8 h-8 text-green-500" />,
    href: "/admin/assessment-center/practice-sets",
    color: "bg-green-50"
  },
  {
    title: "Quizzes",
    description: "Build timed, graded quizzes with specific passing scores and attempt limits.",
    icon: <Sparkles className="w-8 h-8 text-purple-500" />,
    href: "/admin/assessment-center/quizzes",
    color: "bg-purple-50"
  },
  {
    title: "Mock Tests",
    description: "Configure strict exam simulations with negative marking and total marks.",
    icon: <FileText className="w-8 h-8 text-blue-500" />,
    href: "/admin/assessment-center/mock-tests",
    color: "bg-blue-50"
  },
  {
    title: "Previous Year Papers",
    description: "Upload and verify official previous year exam papers with PDF solutions.",
    icon: <Book className="w-8 h-8 text-orange-500" />,
    href: "/admin/assessment-center/exams",
    color: "bg-orange-50"
  },
  {
    title: "Daily Challenges",
    description: "Set up engaging daily mini-tests to keep students active on the platform.",
    icon: <Trophy className="w-8 h-8 text-yellow-500" />,
    href: "/admin/assessment-center/daily-challenges",
    color: "bg-yellow-50"
  }
];

export default function AssessmentCenterDashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Assessment Center</h1>
        <p className="text-slate-500">
          Manage all interactive tests, quizzes, and exams from one unified dashboard. 
          All assessments are built using the central Question Bank.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessmentTypes.map((type, idx) => (
          <Card key={idx} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className={`p-3 rounded-lg ${type.color}`}>
                {type.icon}
              </div>
              <div className="space-y-1">
                <CardTitle>{type.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <CardDescription className="text-sm text-slate-600 mb-6 line-clamp-2">
                {type.description}
              </CardDescription>
              <Button asChild variant="outline" className="w-full mt-auto group">
                <Link href={type.href}>
                  Manage {type.title} 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
