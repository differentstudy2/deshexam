
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import Link from "next/link";

export default function BengaliReadingPage() {
  return (
    <div className="bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-bengali">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Bengali
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-lime-600">
            পড়ার অভ্যাস (Reading)
          </h1>
          <p className="text-lg text-lime-700/80 mt-4 max-w-2xl mx-auto">
            Practice reading Bengali with short stories and passages.
          </p>
        </header>
        <Card className="max-w-2xl mx-auto text-center p-8 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardContent>
                <BookOpenCheck className="w-16 h-16 mx-auto text-lime-400 mb-4"/>
                <h3 className="text-2xl font-bold text-slate-800">Coming Soon!</h3>
                <p className="text-muted-foreground mt-2">
                    A library of fun stories and reading exercises is on its way. Check back soon!
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
